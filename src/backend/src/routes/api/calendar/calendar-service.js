import mongoose from "mongoose";

import logger from "#logger";
import AppError from "#errors";
import Calendar from "./calendar-schema";

import * as OrganizationService from "../organization-service";
import * as UserService from "../user-service";

import { createId, difference } from "../../utils/common";

const ACTION = UserService.ACTION;

/// A calendar contains metadata in addition to timeblocks. Each user can add
/// their own timeblocks to the calendar. If the calendar is owned by an
/// organization, then its members can also add timeblocks to the calendars, IN
/// ADDITION to the users in the schema.
///
/// To be clear, there are two groups of users, individuals and organization
/// members, adding their times to the timeblocks. Admins, editors, and owners
/// of the calendar can edit the settings of the calendar, including removing
/// the timeblocks of other users.

/// RBAC based permission for the calendar, there are roughly three categories of
/// access for a calendar. Calendars owned by organizations have additional
/// permission checks for members of the organization in addition to its
/// indvidual calendar checks. It goes without saying that write access of any
/// kind means read access.
///
/// For instance, a calendar not owned by an org allows
///   owner: calendar modifications (settings and all timeblocks)
///   users (not pending): can modify their own timeblocks
///   users (pending): read access
/// A calendar owned by an organization is the same, but its members also get
/// permission checks and inheritance from the organization itself,
///   editors and admin: calendar modifications (settings and all timeblocks)
///   members: users can modify their own timeblocks
///   everyone: read access
/// Of course, a public calendar can be read by everyone.
const ACCESS = Object.freeze({
  WRITE: "WRITE",
  TIMEBLOCKS: "TIMEBLOCKS",
  READ: "READ",
});

function getAccessRoles(access) {
  switch (access) {
    case ACCESS.WRITE:
      return ["admin", "editor"];
    case ACCESS.TIMEBLOCKS:
      return ["admin", "editor", "member"];
    case ACCESS.READ:
      return ["admin", "editor", "member", "pending"];
    default:
      return [];
  }
}

/// Retrieves a calendar with the given `id` for a user based on the `access`.
/// This can be used to get the calendar as well as run checks for writing .
/// The returned calendar DOES NOT contain timeblocks of users for performance
/// reasons. Use getTimeblocks(id, userid) for that.
export async function getCalendar(id, userid, access) {
  // PERF: We use an aggregate pipeline to find the calendar and also the role
  // of the user inside an organization if the calendar is owned by an
  // organization. This saves us from an extra database call to query for
  // permissions from the organization collection.
  const [calendar] = await Calendar.aggregate([
    { $match: { _id: id } },
    {
      $lookup: {
        from: "organizations",
        localField: "owner._id",
        foreignField: "_id",
        let: { isOrg: "$owner.isOrg" },
        pipeline: [
          // Run only if calendar is owned by organization, this also
          // makes individual calendars slightly faster as a side benefit,
          // I believe we still eat the cost of using a $lookup though
          { $match: { $expr: { $eq: ["$$isOrg", true] } } },
          // Join only the data about the member
          {
            $project: {
              member: {
                $arrayElemAt: [
                  "$members",
                  { $indexOfArray: ["$members", { $eq: ["$members._id", userid] }] },
                ],
              },
            },
          },
        ],
        as: "org",
      },
    },
    { $project: { timeblocks: 0 } },
  ]);
  if (!calendar) {
    logger.info(`User ${userid} accessed nonexistant calendar ${id}`);
    throw new AppError.forbidden();
  }

  // Owner can always read from or write to the calendar
  if (!calendar.isOrg && userid === calendar.owner_id) {
    return calendar;
  } else if (calendar.isOrg && org.member) {
    // For organizations, check if the user has required roles
    if (getAccessRoles(access).includes(org.member.role)) {
      return calendar;
    }
  }

  // Add extra conditions for non-org members based on access mode
  if (access === ACCESS.READ) {
    // Public calendars can be read by anyone and users (pending or
    // non-pending) can always read the calendar
    if (calendar.public || calendar.users.some((u) => u._id === userid)) {
      return calendar;
    }
  } else if (access === ACCESS.TIMEBLOCKS) {
    // Non pending users can always write to their own timeblocks
    if (calendar.users.some((u) => u._id === userid && !u.isPending)) {
      return calendar;
    }
  }

  logger.info(`User ${userid} accessed forbidden calendar ${id}`);
  throw new AppError.forbidden();
}

/// Creates a calendar with the parameters in the given body.  When an User
/// creating the calendar, they becomes its owner. When a User creates the
/// calendar on behalf of an Organization, the Organization becomes the owner of
/// the calendar. The user must have sufficient privileges "owner", "admin", or
/// "editor" in order to be able to create a calendar.
export async function createCalendar(body, netid) {
  const {
    owner = { id: netid, isOrg: false },
    name = "untitled",
    location = "",
    public: isPublic = false,
    shareLink = false,
    description = "",
    meetingTime = { start: null, end: null },
    timeblocks = [],
  } = body;

  const calendar = new Calendar({
    _id: createId(owner.id),
    owner: { _id: owner.id, isOrg: owner.isOrg },
    name: name,
    location: location,
    public: isPublic,
    shareLink: shareLink,
    created: new Date().getTime(),
    modified: new Date().getTime(),
    description: description,
    links: [],
    meetingTime: meetingTime,
    timeblocks: timeblocks,
    users: [],
  });

  if (owner.isOrg && !OrganizationService.canCreateCalendar(owner.id, netid)) {
    throw new AppError.forbidden();
  }

  logger.info(`User ${netid} created a calendar for ${JSON.stringify(owner)}`);
  await mongoose.connection.transaction(async () => {
    const cal = await calendar.save();
    if (owner.isOrg) {
      await OrganizationService.addCalendar(owner.id, id);
    } else {
      await UserService.addCalendar(owner.id, id, ACTION.CREATE);
    }
    return cal;
  });
}

/// Deletes a calendar. The User must either be the owner or an admin, editor,
/// or owner of an Organization in order to delete the calendar.
export async function deleteCalendar(id, userid) {
  const cal = getCalendar(id, userid, ACCESS.WRITE);
  const users = cal.users.map((u) => u._id);
  logger.info(`User ${userid} deleting calendar ${id}`);
  await mongoose.connection.transaction(async () => {
    if (cal.owner.isOrg) {
      await OrganizationService.removeCalendar(cal.owner._id, id);
    }
    await UserService.removeCalendar(users.concat(userid), id);
    await cal.deleteOne();
  });
}

/// Modifies simple settings of a calendar. The User must either be the owner or
/// an admin, editor, or owner of an Organization in order to modify settings.
export async function patchSettings(id, settings, userid) {
  await getCalendar(id, userid, ACCESS.WRITE);
  logger.info(`User ${userid} applying ${JSON.stringify(settings)} to calendar ${id}`);
  return await Calendar.findByIdAndUpdate(id, settings, { returnDocument: "after" });
}

export async function patchTimeblocks(id, patch, userid) {
  const { operation, timeblocks } = patch;
  await getGetCalendar(id, userid, ACCESS.TIMEBLOCKS);

  logger.info(`User ${userid} applied ${operation} to timeblocks of calendar ${id}`);
  switch (patch.operation) {
    case "SET":
      return await Calendar.findOneAndUpdate(
        { _id: id, "timeblocks._id": userid },
        { $set: { "timeblocks.$.blocks": timeblocks } },
        { returnDocument: "after" },
      );
    case "ADD":
      return await Calendar.findOneAndUpdate(
        { _id: id, "timeblocks._id": userid },
        { $push: { "timeblocks.$.blocks": { $each: timeblocks } } },
        { returnDocument: "after" },
      );
    case "SUB":
      return await Calendar.findOneAndUpdate(
        { _id: id, "timeblocks._id": userid },
        { $pull: { "timeblocks.$.blocks": { $in: timeblocks } } },
        { returnDocument: "after" },
      );
  }
}

// TODO: we might want to consider checking if members actually exist in the
// system LDAP or whatever. A worthwhile discussion is if we want to enable
// adding users who don't exist in the database yet.
export async function shareCalendar(id, users, userid) {
  const cal = await getCalendar(id, userid, ACCESS.WRITE);
  const members = difference(
    users,
    cal.users.map((u) => u._id),
  );
  const memberIds = members.map((i) => ({ _id: i, isPending: true }));
  if (memberIds.length === 0) return cal;

  logger.info(`User ${userid} shared calendar ${id} with users ${members.toString()}`);
  return await mongoose.connection.transaction(async () => {
    await UserService.addCalendar(members, id, ACTION.SHARE);
    return await Calendar.findByIdAndUpdate(
      id,
      { $push: { users: { $each: memberIds } } },
      { returnDocument: "after" },
    );
  });
}

export async function unshareCalendar(id, users, userid) {
  const _cal = await getCalendar(id, userid, ACCESS.WRITE);
  const rem = [...new Set(users)];

  logger.info(`User ${userid} unshared calendar ${id} with users ${rem.toString()}`);
  return await mongoose.connection.transaction(async () => {
    await UserService.removeCalendar(rem, id);
    return await Calendar.findByIdAndUpdate(
      id,
      { $pull: { users: { _id: { $in: rem } } } },
      { returnDocument: "after" },
    );
  });
}

export async function joinCalendar(id, isSharelink, userid) {
  const cal = await getCalendar(id, userid, ACCESS.READ);
  const user = cal.users.find((u) => u._id === userid);
  if (!user) {
    throw new AppError.forbidden();
  }

  if (isSharelink && cal.shareLink === false) {
    throw new AppError.badRequest("ShareLink disabled, request is invalid");
  }

  // User is already in the users list, so just do nothing
  if (user && !user.isPending) {
    logger.info(`User ${userid} is already in calendar ${id}`);
    return cal;
  }

  logger.info(`User ${userid} accepted invite to calendar ${id}`);
  mongoose.connection.transaction(async () => {
    UserService.addCalendar(userid, id, ACTION.ACCEPT);
    await Calendar.findOneAndUpdate(
      { _id: id, "users._id": userid },
      { $set: { "users.$.isPending": false } },
      { returnDocument: "after" },
    );
  });
}

export async function leaveCalendar(id, userid) {
  const cal = await getCalendar(id, userid, ACCESS.READ);
  const user = cal.users.find((u) => u._id === userid);
  if (cal.owner._id === userid) {
    throw new AppError.badRequest("You cannot leave the calendar when you are the owner");
  } else if (!user) {
    logger.info(`User ${id} attempted to leave calendar ${i} as a non-member`);
    throw new AppError.forbidden();
  }

  logger.info(`User ${userid} left calendar ${id}`);
  mongoose.connection.transaction(async () => {
    await UserService.leaveCalendar(userid, id);
    return await Calendar.findByIdAndUpdate(
      id,
      { $pull: { users: { _id: userid } } },
      { returnDocument: "after" },
    );
  });
}

/// Transfers the calendar to another owner. There are four cases
///   individual to individual
///   individual to org
///   org to individual
///   org to org
/// All settings of the calendar is preserved when the transfer is done, this
/// means you must manually unshare the calendar and remove the timeblocks.
export async function setOwner(id, owner, userid) {
  const cal = await getCalendar(id, userid, ACCESS.WRITE);
  logger.info(`User ${userid} transferring ownership of calendar ${id} to User ${owner}`);
  mongoose.connection.transaction(async () => {
    if (owner.isOrg) {
      OrganizationService.addCalendar(owner._id, id);
    } else {
      UserService.addCalendar(owner._id, id, ACTION.CREATE);
    }

    if (cal.owner.isOrg) {
      OrganizationService.removeCalendar(cal.owner._id, id);
    } else {
      UserService.removeCalendar(cal.owner._id, id);
    }

    return await Calendar.findByIdAndUpdate(
      id,
      { $set: { owner: owner } },
      { returnDocument: "after" },
    );
  });
}

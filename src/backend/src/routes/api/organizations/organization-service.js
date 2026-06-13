import mongoose from "mongoose";

import logger from "#logger";
import AppError from "#errors";
import Organization from "./organization-schema";
import Calendar from "./calendar-schema";

import * as UserService from "../user-service";

import { createId, difference } from "../../utils/common";

const ACTION = UserService.ACTION;

/// An organization provides a way to manage multiple calendars and also allow
/// other users to manage calendars as well. Users follow a simple RBAC
/// permission system with the following roles
///
///   owner: all permissions
///   admin: can edit organization settings and organization calendars
///   member: can edit organization calendars (limited to their own timeblocks)
///   viewer: can view all organization calendars
///   pending: an invited member who becomes a viewer once they accept
///
/// To get more members, you use the shareOrganization endpoint. Once the member
/// accepts, they become a viewer and you can promote them to any of the higher
/// roles. Note that each Calendar can also be shared to have viewers outside
/// of your organization.

/// Gets an organization and the user's role in the organization given an
/// organization id. Handles permission checks as well.
///   writing = false: any member can view the organization
///   writing = true: only admins and owner can edit the organization
/// Note that only the can delete an organization, but this check must
/// be be performed outside of this function.
export async function getOrganization(id, userid, writing) {
  const org = await Organization.findById(id);
  if (org === null) {
    throw new AppError.forbidden();
  }
  logger.info(`Checking user ${userid} permissions in org ${id} with writing = ${writing}`);
  const role = org.members.find((m) => m._id === userid);
  // Member is not owner and is also not in the org
  if (!userid === org.owner && role == null) {
    throw new AppError.forbidden();
  }
  // Member is an admin or owner and so cannot write
  if (writing && (userid !== org.owner || role !== "admin")) {
    throw new AppError.forbidden();
  }
  return { org: org, role: role };
}

/// Gets the role of a user within an Organization, this is used for permission
/// checks to see if a user is allowed to perform some action within an
/// organization that is not necessarily related to organization management.
///
/// For example, calendar creation will use to see if a member can modify or
/// create a calendar. Since that is the case, we really don't care if the
/// organization doesn't exist, just whether the user has privileges.
/// This allows us to keep our permission checks fast.
export async function getUserRole(id, userid) {
  const org = await Organization.findOne(
    { _id: id, "members._id": userid },
    { "members.$": 1, owner: 1 },
  );
  // Throw error regardless of permission denied or organization not
  // found. Caller did not ask for information about the organization so we do
  // not have be specific with our errors.
  if (org === null) {
    throw new AppError.forbidden();
  }
  return userid === owner ? "owner" : org?.members[0]?.role;
}

export async function canCreateCalendar(id, userid) {
  const role = await service.getUserRole(id, userid);
  return role === "admin" || role === "editor" || role === "owner";
}

export async function createOrganization(name, userid) {
  const org = new Organization({
    _id: createId(userid),
    name: name || "unnamed organization",
    owner: userid,
    created: new Date().getTime(),
    calendars: [],
    members: [],
  });

  mongoose.connection.transaction(async () => {
    await UserService.addOrganization(userid, org._id, ACTION.CREATE);
    return await org.save();
  });
}

export async function deleteOrganization(id, userid) {
  const { org, role } = getOrganization(id, userid, true);
  if (role !== "owner") {
    throw new AppError.forbidden();
  }
  mongoose.connection.transaction(async () => {
    await UserService.removeOrganization(org.members.concat(userid), id);
    await Calendar.deleteMany({ _id: { $in: org.calendars } });
    await org.deleteOne();
  });
}

// TODO: we might want to consider checking if members actually exist in the
// system LDAP or whatever. A worthwhile discussion is if we want to enable
// adding users who don't exist in the database yet.
export async function shareOrganization(id, users, userid) {
  const { org, _role } = await getOrganization(id, userid, true);
  const members = difference(
    users,
    org.members.map((u) => u._id),
  );
  const memberIds = members.map((i) => ({ _id: i, role: "pending" }));
  if (memberIds.length === 0) return org;

  logger.info(`Sharing organization ${id} with users ${members.toString()}`);
  return await mongoose.connection.transaction(async () => {
    await UserService.addOrganization(members, ACTION.SHARE);
    return await Organization.findByIdAndUpdate(
      id,
      { $push: { members: { $each: memberIds } } },
      { returnDocument: "after" },
    );
  });
}

export async function joinOrganization(id, userid) {
  const { _org, role } = getOrganization(id, userid, false);
  if (role !== "pending") {
    throw new AppError.badRequest("You are already a member");
  }

  logger.info(`User ${id} accepted invite to organization ${id}`);
  return await mongoose.connection.transaction(async () => {
    await UserService.addOrganization(userid, id, ACTION.ACCEPT);
    return await Organization.findOneAndUpdateOne(
      { _id: id, "members._id": userid },
      { $set: { "members.$.role": "member" } },
      { returnDocument: "after" },
    );
  });
}

export async function leaveOrganization(id, userid) {
  const { _org, role } = getOrganization(id, userid, false);
  logger.info(`User ${userid} is leaving the organization ${id}`);
  if (role === "owner") {
    throw new AppError.badRequest("You cannot leave as the owner, please transfer ownership first");
  }

  logger.info(`Removing user ${userid} with role ${role} from organization ${id}`);
  return await mongoose.connection.transaction(async () => {
    await UserService.removeOrganization(userid, id);
    return await Organization.findByIdAndUpdate(
      id,
      { $pull: { members: { _id: userid } } },
      { returnDocument: "after" },
    );
  });
}

export async function addCalendar(id, calid) {
  logger.info(`Adding calendar ${calid} to organization ${id}`);
  await Organization.updateOne({ _id: id }, { $push: { calendars: { _id: calid } } });
}

export async function removeCalendar(id, calid) {
  logger.info(`Removing calendar ${calid} from organization ${id}`);
  await Organization.updateOne({ _id: id }, { $pull: { calendars: { _id: calid } } });
}

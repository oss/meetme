import logger from "#logger";
import AppError from "#errors";

import User from "./user-schema.js";

/// A user is the most basic unit in this system. Users can be in an
/// organization, in which case they inherit all calendars owned by the
/// organiztaion, and they can also have individual calendars of their own.
///
/// Users can edit calendars only if they are the only, but they can contribute
/// timeblocks if they are users of a calendar or if they are in an organization
/// with a role of 'member' or above.

/// Action to be performed on a group of users when adding either a `Calendar`
/// or `Organization`. This helps centralize handling of adding properties to
/// a user. Note that the life cycle of how something is added is as follows
///
///   CREATE: the owner has the calendar or organization added to their schema
///   SHARE: the owner can share the object with other users
///   ACCEPT: the other users can only view the object until they accept
///
/// Once the user accepts, the status of the object switches from pending to
/// notpending, and they are now allowed more permissions. Deleting is simpler
/// as we can just remove the object, instead of checking beforehand if it
/// exists first before setting or creating the object.
export const ACTION = Object.freeze({
  SHARE: "SHARE",
  CREATE: "CREATE",
  ACCEPT: "ACCEPT",
});

/// Gets information about the given user. Limited information is returned if
/// the requested `userid` is not the caller. That is
///
///   isSelf = true: return only the alias and name
///   isSelf = false: return all information
///
/// If no user is found throw 404 error, otherwise return the modified User
export async function getUser(userid, isSelf) {
  logger.info(`Fetching user data for ${userid} with isSelf = ${isSelf}`);
  const user = await User.findById(userid).select(isSelf ? {} : { alias: 1, name: 1 });
  if (user === null) {
    throw new AppError.notFound();
  }
  return user;
}

/// Sets the alias of the given `userid`.
/// Returns the User after modification
export async function setAlias(userid, alias) {
  logger.info(`Seting user ${userid} alias from ${user.alias} to ${alias}`);
  return await User.findByIdAndUpdate(userid, { alias: alias }, { returnDocument: "after" });
}

/// Updates the last login field of the `userid`.
/// Returns the User after modification
export async function updateLastLogin(userid) {
  return await User.findByIdAndUpdate(
    userid,
    { last_signin: new Date().getTime() },
    { returnDocument: "after" },
  );
}

/// Adds the given calendar to the given users. How the calendar is added is
/// based on `action`. See `Action` at the top of this file. If `action` is
///
///   ACTION.CREATE: calendar is added to `users[0]` with pending = false
///   ACTION.ACCEPT: set calendar pending = false for `users[0]`
///   ACTION.SHARE: calendar is added to all of `users` with pending = true
///
/// No return value
export async function addCalendar(users, cal, action) {
  if (action === ACTION.CREATE) {
    logger.info(`Creating calendar ${cal._id} for user ${users}`);
    await User.updateOne(
      { _id: { $in: users } },
      { $push: { calendars: { _id: cal._id, isPending: false } } },
    );
  } else if (action === ACTION.ACCEPT) {
    logger.info(`Accepting calendar ${cal._id} for user ${users}`);
    await User.updateOne(
      { _id: users, "calendars._id": cal._id },
      { $set: { "calendars.$.isPending": false } },
    );
  } else if (action === ACTION.SHARE) {
    logger.info(`Adding calendar ${cal._id} to users ${users.toString()}`);
    await User.updateMany(
      { _id: { $in: users } },
      { $push: { calendars: { _id: cal._id, isPending: true } } },
    );
  }
}

/// Removes the given calendar from all of the given `users`. This removes both
/// pending and non-pending calendars and can be used to decline a calendar
/// invite or to leave a calendar as a member.
/// No return value.
export async function removeCalendar(users, cal) {
  logger.info(`Removing calendar ${cal._id} from users ${users.toString()}`);
  if (Array.isArray(users)) {
    await User.updateMany({ _id: { $in: users } }, { $pull: { calendars: { _id: cal._id } } });
  } else {
    await User.updateOne({ _id: users }, { $pull: { calendars: { _id: cal._id } } });
  }
}

/// Adds the given organization to the given users. How the organization is added is
/// based on `action`. See `Action` at the top of this file. If `action` is
///
///   ACTION.CREATE: organization is added to `users[0]` with pending = false
///   ACTION.ACCEPT: set organization pending = false for `users[0]`
///   ACTION.SHARE: organization is added to all of `users` with pending = true
///
/// No return value
export async function addOrganization(users, org, action) {
  if (action === ACTION.CREATE) {
    logger.info(`Creating organization ${org._id} for user ${users}`);
    await User.updateOne(
      { _id: users },
      { $push: { organizations: { _id: org._id, isPending: false } } },
    );
  } else if (action === ACTION.ACCEPT) {
    logger.info(`Accepting organization ${org._id} for user ${users}`);
    await User.updateOne(
      { _id: users, "organizations._id": org._id },
      { $set: { "organizations.$.isPending": false } },
    );
  } else if (action === ACTION.SHARE) {
    logger.info(`Adding organization ${org._id} to users ${users.toString()}`);
    await User.updateMany(
      { _id: { $in: users } },
      { $push: { organizations: { _id: org._id, isPending: true } } },
    );
  }
}

/// Removes the given organization from all of the given `users`. This removes
/// both pending and non-pending organizations and can be used to decline an
/// organization invite or to leave an organization as a member. Also removes
/// all calendars held by the organization.
/// No return value.
export async function removeOrganization(users, org) {
  logger.info(`Removing organization ${org._id} from users ${users.toString()}`);
  if (Array.isArray(users)) {
    await User.updateMany(
      { _id: { $in: users } },
      {
        $pull: {
          organizations: { _id: org._id },
          calendars: { $in: org.calendars },
        },
      },
    );
  } else {
    await User.updateOne(
      { _id: users },
      {
        $pull: {
          organizations: { _id: org._id },
          calendars: { $in: org.calendars },
        },
      },
    );
  }
}

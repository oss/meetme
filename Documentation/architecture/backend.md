# Backend

There are four main documents the backend is concerned with

1. Calendar Meta
2. Calendar Main
3. Organization
4. User

As you can see, the calendar information is broken up between meta and
main. These can all be found in their respective schema files.

## Calendar Meta

The meta contains frequently accessed information on the calendar such as its
owner, description, sharelink, and location.

## Calendar Main

Main contains information on users, pending users, timeblocks, and is used for
managing information about calendars shared between users. The split was a
historical decision to reduce the size of meta, which is more frequently
accessed, for performance reasons.

## Organization

Organizations are a group of users who manage a calendar. Users of the
Organization are grouped into four categories in order of privileges

1. admin, can manage users and calendars
2. editor, can manage calendars
3. member, can create calendars for themselves
4. viewer, can only view calendars

The owner naturally has all privileges.

## User

Represents a user, linked to a netid. A user can be in an organization and own
calendars.

# Calendars, Organizations, and Users

The most basic unit the backend is concerned with is the Calendar. A calendar
can be owned by either an individual user or an organization.

* When owned by single user, all operations on the calendar is permitted if the user is owner.
* When owned by an organization, operations depend on the privilege level given to the user.
* Note that for an organization, only the owner can transfer ownership or delete the organization.

A user can be invited to an organization via sharing. Similarly, a viewer can
be invited to a calendar via sharing or through a sharelink. Note that a viewer
in a calendar can only view that specific calendar whereas a viewer in an
organization can view all calendars owned by the organization.

# File structure

* `calendar/`: calendar related apis
* `organization/`: organization related apis
* `user/`: user related apis
* `auth/`: authentication which is required for most apis, verifies a user's netid
* `integrations/`: integrations with third party calendars
* `security/`: certificates and such
* `settings/`: TODO

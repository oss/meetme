## Student

1. created
1. not created

## Individual Calendar

1. owner
1. member
1. viewer
1. pendingUser

### Tests

1. Creating a Calendar
   - owner must equal session netid
2. Invite Users
   - has privs
     - owner
   - has no privs
     - member
     - viewer
     - pendingUser
     - non-affiliated user
3. Fetch metadata
   - has privs
     - owner
     - member
     - viewer
     - pendingUser
   - has no privs
     - non-affiliated user
4. Fetch maindata
   - has privs
     - owner
     - member
     - viewer
   - has no privs
     - pendingUser
     - non-affiliated user
5. Adding/Deleting Timeblocks
   - has privs
   - member
   - owner
   - has no privs
     - pendingUser
     - non-affiliated user
6. Delete cal
   - has privs
     - owner
   - has no privs
     - member
     - viewer
     - pendingUser
     - non-affiliated user
7. Fetch memberlist
   - has privs
     - owner
     - member
     - viewer
   - has no privs
     - pendingUser
     - non-affiliated user
8. Fetch links
   - has privs
     - owner
     - member
     - viewer
   - has no privs
     - pendingUser
     - non-affiliated user
9. Leave calendar
   - has privs
     - member
     - viewer
   - has no privs
     - owner
     - pendingUser
     - non-affiliated user
10. Set meeting time
    - has privs
      - owner
    - has no privs
      - member
      - viewer
      - pendingUser
      - non-affiliated user
11. accept/decline invites
    - has privs
      - pendingUser
    - has no privs
      - owner
      - member
      - viewer
      - non-affiliated user
12. revoke invites
    - has privs
      - owner
    - has no privs
      - member
      - viewer
      - pendingUser
      - non-affiliated user

## Org Calendar

1. org owner
1. org admin
1. org editor
1. org member
1. org viewer
1. org pendingMember
1. member
1. viewer
1. pendingUser

## Organization

1. org owner
1. org admin
1. org editor
1. org member
1. org viewer
1. org pendingMember

### Tests

1. Creating an org
   - owner is netid of session
2. Inviting Users
   - has privs
     - owner
   - has no privs
     - member
     - pendingUser
3. Fetch Data
   - has privs
     - owner
     - member
     - admins
   - has no privs
     - pendingUser
4. Deleting Users
   - has privs
     - owner
     - admins
   - has no privs
     - pendingUser
     - member
5. Adding Calendars
   - has privs
     - owner
     - admins
   - has no privs
     - pendingUsers
     - member
6. Deleting Calendars
   - has privs
     - owner
     - admins
   - has no privs
     - pendingUsers
     - member
7. Revoking Invites
   - has privs
     - owner
   - has no privs
     - member
     - pendingUser

## User

1. NetID
2. Name
3. Meetings
4. Orgs

- ### Tests

1. Creating a User
2. Changing an Alias
3. Accepting invites
   - calendar
   - org
4. Declining invites
   - calendar
   - org

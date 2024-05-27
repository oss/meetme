---
search:
  exclude: true
---
| path | request | description | payload | 
| --------- | ------- | ----------- | ------- | 
| / | GET | get general information about instance | none | hash=abc
| /logout | GET | logs user out and redirects back to | none | hash=abc
| /Shibboleth.sso/Metadata | GET | metadata endpoint for shibboleth sso | none | hash=abc
| /user/me | GET | get all information about signed in user | none | hash=abc
| /user/alias | PATCH | changes preferred/displayed name | none | hash=abc
| /user/:netid | GET | get public information about a specific netid | none | hash=abc
| /login | GET | initiate login for shibboleth | none | hash=3c0650f976665e14eb96fc6ede8dcde7f19cfffd
| /login | POST | callback url for shibboleth | shibboleth response body | hash=3c0650f976665e14eb96fc6ede8dcde7f19cfffd
| /whoami | GET | get info about currently signed in user | none | hash=abc
| /org | POST | create an organization | none | hash=abc
| /org/:organization_id | GET | fetch organization information | none | hash=abc
| /org/:organization_id | DELETE | delete an organization | none | hash=abc
| /org/:organization_id/share | PATCH | share an org with specified users | {new_users: ["netid1","netid2"]} | hash=abc
| /org/:organization_id/accept | PATCH | accept org invitation | none | hash=abc
| /org/:organization_id/decline | PATCH | decline org invitation | none | hash=abc
| /org/:organization_id/leave | DELETE | leave an organization | none | hash=abc
| /org/:organization_id/memberlist | GET | fetches all members which are part of the specified organization | none | hash=abc
| /cal | POST | create a calendar | owner: {  type: 'owner type',  id: 'owner id' }, timeblocks: [{ start: int, end: int }] | hash=abc
| /cal/:calendar_id | DELETE | delete calendar | none | hash=abc
| /cal/:calendar_id/meta | GET | fetches calendar metadata | none | hash=abc
| /cal/:calendar_id/main | GET | fetches calendar maindata | none | hash=abc
| /cal/:calendar_id/memberlist | GET | gets all members affiliated with a calendar | none | hash=abc
| /cal/:calendar_id/links | GET | fetches all the links associated with a calendar | none | hash=abc
| /cal/:calendar_id/meet_time | GET | gets the time of a meeting | none | hash=abc
| /cal/:calendar_id/meet_time | PATCH | sets the time of a meeting | {start: int, end: int} | hash=abc
| /cal/:calendar_id/meetme | POST | aggregates all available times | {timeZone: String} | currently this is hardcoded to US-East hash=abc
| /cal/:calendar_id/meetme/me | POST | gets the user's available times | {timeZone: String} | hash=abc
| /cal/:calendar_id/name | PATCH | changes calendar's name | {new_name: String} | hash=abc
| /cal/:calendar_id/name | GET | gets calendar's name | none | hash=abc
| /cal/:calendar_id/owner | PATCH | changes calendar's owner | {new_owner: {id: String, owner_type: String}} | hash=abc
| /cal/:calendar_id/share | PATCH | invites users to calendar | {new_users: ["netids"]} | hash=abc
| /cal/:calendar_id/share | DELETE | removes users from calendar | {target_users: ["netids"]} | hash=abc
| /cal/:calendar_id/accept | PATCH | accepts calendar invite | none | hash=abc
| /cal/:calendar_id/decline | PATCH | decline calendar invite | none | hash=abc
| /cal/:calendar_id/leave | PATCH | leave the specified calendar | none | hash=abc
| /cal/:calendar_id/timeblocks | PATCH | changes the calendar's timeblocks | {operation: String, timeblocks:[{start: int, end: int}]} | hash=abc
| /cal/:calendar_id/timeblocks | GET | gets the calendar's timeblocks | none | hash=abc
| /cal/:calendar_id/me | PATCH | changes the user's available times | {mode: String, timeblocks: [{start: int, end: int}]} | hash=abc
| /cal/:calendar_id/location | PATCH | changes the calendar's location | {location: String} | hash=abc
| /cal/:calendar_id/location | GET | gets the calendar's location | none | hash=abc

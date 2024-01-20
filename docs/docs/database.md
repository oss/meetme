# Database overview

## Collections

### organizations

```json
{
    "_id": "7ebadaacc531bf4e15a39bbddd7c332b135d5b22fabb1c65905d04350b4a53b7",
    "calendars": [],
    "admins": [],
    "editors": [],
    "members": [ {" _id": "netid2" } ],
    "viewers": [],
    "pendingMembers": [ { "_id": "netid3" } ],
    "name": "Org 1",
    "owner": "netid1",
    "__v": 3
  }
```

### users

```json
{
  "_id": "netid3",
  "name": { "middle": null },
    "calendars": [
      {
        "_id": "98605792cdbc192bf95b7611283c7c90114856b50b1529f87625db422b8b6342"
      },
      {
        "_id": "89a58fd7a7a5b15843f84d3e998800a1933221a9e5a5a4303ce99fd9cf47812d"
      }
    ],
    "organizations": [
      {
        "_id": "63b6fe5e7e5c6126eb84dcebaaf352b647c724f3a9eb5858a605bfbed26ee8c2"
      }
    ],
    "pendingCalendars": [],
    "pendingOrganizations": [
      {
        "_id: '7ebadaacc531bf4e15a39bbddd7c332b135d5b22fabb1c65905d04350b4a53b7"
      }
    ],
    "alias": "netid3",
    "last_signin": 1705594132665,
    "account_created": 1705594132601,
    "__v": 0
  }
```


module.exports = async function watch_orgs(socket_io_srv, mongoClient) {
  const collection = mongoClient.db('meetme').collection('users');
  const changeStream = collection.watch(
    [
      { $match: { operationType: 'update' } },
      {
        $addFields: {
          doc: { $objectToArray: '$updateDescription.updatedFields' },
        },
      },
    ],
    { fullDocument: 'updateLookup' }
  );
  changeStream.on('change', (next) => {
    console.log('change in users');
    const updatedFields = {};
    next.doc.forEach((field) => {
      updatedFields[field['k'].split('.')[0]] = 1;
    });
    console.log(JSON.stringify(next));
    if (
      updatedFields['pendingCalendars'] == 1 ||
      updatedFields['pendingOrganizations'] == 1
    ) {
      // if pending orgs update
      socket_io_srv.emit('pending_invitation_update');
      return;
    }
  });
};
// {
//     "_id": {
//       "_data": "82641A0FE3000000012B022C0100296E5A10044311D50878FD4B1DB52CB7DD79AA9AC0463C5F6964003C6E6574696433000004"
//     },
//     "operationType": "update",
//     "clusterTime": {
//       "$timestamp": "7213095220819263489"
//     },
//     "wallTime": "2023-03-21T20:13:23.150Z",
//     "fullDocument": {
//       "_id": "netid3",
//       "name": {
//         "first": null,
//         "middle": null,
//         "last": null
//       },
//       "calendars": [],
//       "organizations": [],
//       "pendingCalendars": [],
//       "pendingOrganizations": [
//         {
//           "_id": "0ccc304e3e212f5d9518f972722d8009f588f3abb3d25835d6a0b16b9189662e"
//         },
//         {
//           "_id": "372c10366ca41a4bb134d6010afbe0bf036ae1aea874022d3aaeef698b2c40bd"
//         },
//         {
//           "_id": "d8be067ea6566b69e7ec90614b6933890e2a51dc0c358c08014d31ef9591d629"
//         },
//         {
//           "_id": "3b1136fa7512ff453cfac607aab23c309b9c493aba24e917d43e771622e3ac99"
//         }
//       ],
//       "alias": "netid3",
//       "last_signin": -1,
//       "account_created": 1678472798836,
//       "__v": 0
//     },
//     "ns": {
//       "db": "meetme",
//       "coll": "users"
//     },
//     "documentKey": {
//       "_id": "netid3"
//     },
//     "updateDescription": {
//       "updatedFields": {
//         "pendingOrganizations.3": {
//           "_id": "3b1136fa7512ff453cfac607aab23c309b9c493aba24e917d43e771622e3ac99"
//         }
//       },
//       "removedFields": [],
//       "truncatedArrays": []
//     },
//     "doc": [
//       {
//         "k": "pendingOrganizations.3",
//         "v": {
//           "_id": "3b1136fa7512ff453cfac607aab23c309b9c493aba24e917d43e771622e3ac99"
//         }
//       }
//     ]
//   }

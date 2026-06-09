module.exports = async function watch_orgs(socket_io_srv, mongoClient) {
  const collection = mongoClient.db('meetme').collection('organizations');
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
    console.log(next);
    socket_io_srv.local.emit('org_update', next.fullDocument);
  });
};

/*
{
  _id: {
    _data: '8262B8E462000000012B022C0100296E5A1004AEA31E278DE24BC8987EA8BAEEAD2DF2463C5F6964003C6E6574696432000004'
  },
  operationType: 'update',
  clusterTime: new Timestamp({ t: 1656284258, i: 1 }),
  ns: { db: 'meetme', coll: 'users' },
  documentKey: { _id: 'netid2' },
  updateDescription: {
    updatedFields: { last_signin: 1656284258764 },
    removedFields: [],
    truncatedArrays: []
  }
}
*/

module.exports = async function watch_cal_main(socket_io_srv, mongoClient) {
  const collection = mongoClient.db('meetme').collection('calendar_mains');
  const changeStream = collection.watch(
    [
      { $match: { operationType: 'update' } },
      {
        $addFields: {
          doc: { $objectToArray: '$updateDescription.updatedFields' },
        },
      },
      { $match: { 'doc.0.k': { $regex: /users.\d+.times/ } } },
    ],
    { fullDocument: 'updateLookup' }
  );
  changeStream.on('change', (next) => {
    const user_index = /(\d+)/.exec(next.doc[0].k)[1];
    const netid_of_changed = next.fullDocument.users[0]._id;
    //console.log(next.fullDocument)
    socket_io_srv.local
      .to(next.documentKey._id)
      .emit(next.documentKey._id, netid_of_changed, 'timeline');
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

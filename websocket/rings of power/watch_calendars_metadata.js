module.exports = async function watch_cal_meta(socket_io_srv, mongoClient) {
  const collection = mongoClient.db('meetme').collection('calendar_metas');
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
    console.log(next.fullDocument);
    console.log('METADATA UPDATED');
    socket_io_srv.local.to(next.fullDocument._id).emit(
      'calendar_metadata_updated',
      next.fullDocument._id
    );
  });
};

/* 
 {
    _id: '222d35104e07e53965ec56f86a6558d7cf78db4331d7f04aec55fe274bf206ec',
    owner: { owner_type: 'individual', _id: 'netid1' },
    descritpion: [],
    name: 'PhysicsMeet',
    location: 'Hill Center, Busch',
    public: false,
    __v: 0
  }
*/

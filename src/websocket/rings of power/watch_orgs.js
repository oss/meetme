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
    console.log(JSON.stringify(next));
    socket_io_srv.emit('org_update', next.fullDocument);
  });
};

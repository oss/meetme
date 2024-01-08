module.exports = async function meetme_socket(socket_io_srv, mongoClient) {
  const collection = mongoClient.db('meetme').collection('calendar_mains');
  const changeStream = collection.watch([
    { $match: { operationType: 'update' } },
    {
      $addFields: {
        doc: { $objectToArray: '$updateDescription.updatedFields' },
      },
    },
    { $match: { 'doc.0.k': { $regex: /users.\d+.times/ } } },
  ]);

  changeStream.on('change', (next) => {
    console.log('meetme update for cal ' + next.documentKey._id);
    socket_io_srv.local
      .to(next.documentKey._id)
      .emit(next.documentKey._id, 'update', 'meetme');
  });
};

/*
{
  _id: {
    _data: '8262D9C72C000000012B022C0100296E5A10040666F717E61A4884A87C56A5E6CC3FFF463C5F6964003C33373065646461616634626263656433336162643737313337616665386562303636373661643236386562373237333332396131653636323234316462643235000004'
  },
  operationType: 'update',
  clusterTime: new Timestamp({ t: 1658439468, i: 1 }),
  ns: { db: 'meetme', coll: 'calendar_mains' },
  documentKey: {
    _id: '370eddaaf4bbced33abd77137afe8eb06676ad268eb7273329a1e662241dbd25'
  },
  updateDescription: {
    updatedFields: { 'users.0.times': [Array] },
    removedFields: [],
    truncatedArrays: []
  }
}
*/

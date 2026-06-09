module.exports = async function watch_cal_memberlist(
  socket_io_srv,
  mongoClient
) {
  const collection = mongoClient.db('meetme').collection('users');
  //there is probably a better way to do this
  const changeStream = collection.watch([
    { $match: { operationType: 'update' } },
    {
      $addFields: {
        doc: {
          $cond: {
            if: {
              $and: [
                {
                  $eq: [
                    { $type: '$updateDescription.updatedFields.calendars' },
                    'array',
                  ],
                },
              ],
            },
            then: {
              k: 'calendars.0',
              v: '$updateDescription.updatedFields.calendars',
            }, //this is first time creating calendar -> edge case, formated as calendar: [array]
            else: { $objectToArray: '$updateDescription.updatedFields' }, //every time after calendar -> normal, formated as calendar.index: {object}
          },
        },
      },
    },
    {
      $match: {
        $and: [
          { 'doc.0.k': 'pendingCalendars' },
          { 'doc.1.k': { $regex: /calendars\.\d+/ } },
        ],
      },
    },
  ]);

  changeStream.on('change', (next) => {
    console.log(
      next.documentKey._id + ' joined calendar with id ' + next.doc[1].v._id
    );
    //console.log(JSON.stringify(next));
    socket_io_srv.local
      .to(next.doc[1].v._id)
      .emit(next.doc[1].v._id, 'update', 'memberlist');
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

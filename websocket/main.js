const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/mongo-adapter');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const watch_meetme = require('./rings of power/watch_meetme');
const watch_cal_memberlist = require('./rings of power/watch_cal_memberlist');
const watch_orgs = require('./rings of power/watch_orgs');
const watch_user = require('./rings of power/watch_user');

// create new server with path /sauron
const io = new Server({ path: '/sauron' });

// mongodb client to get info from db
const mongoClient = new MongoClient(process.env.MONGO_URL, {
  useUnifiedTopology: true,
});

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

// async function for promise-based behavior
const main = async () => {
  await mongoClient.connect(); // connect to to the db server

  const mongoCollection = mongoClient.db('meetme').collection('mongo_events'); // get collection

  await mongoCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 3600, background: true }
  ); // ???? mongo stores it in asending order?

  io.adapter(
    createAdapter(mongoCollection, {
      addCreatedAtField: true,
    })
  ); // ?????

  // middleware function: gets executed once for every incoming connection
  io.use(async (socket, next) => {
    const res = await (
      await fetch(process.env.API_URL + '/whoami', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          cookie: socket.handshake.auth.cookie_string,
        },
      })
    ).json();
    console.log(res);

    // clients are not actually connected when this middleware function gets executed so we call next() instead of disconnect()
    // next() executes the next middleware function. If its the last middleware function, the client conencts to server ?
    // if next is sent with error message, then connection will be refused and client will recieve connect_error event
    if (res.Status !== 'ok') {
      next(new Error('unauthorized'));
      socket.disconnect();
    } else {
      socket.netid = res.user.uid;
      next();
    }
  });
  // when client connects, do the async function
  // process.env holds all the environment variables for this process
  io.on('connection', (socket) => {
    // socket is the communication endpoint for the server

    socket.emit('socket service', process.env.HOSTNAME);

    // socket only emits the listen message to client with specific netid
    socket.join(socket.netid);
    socket.emit('listen', socket.netid);

    // so when client emits join cal(when calendarLoader.js is opened), do this
    socket.on('join cal', async (calid) => {
      const cal = await mongoClient
        .db('meetme')
        .collection('calendar_mains')
        .findOne({
          _id: calid,
          $or: [
            { 'owner._id': socket.netid },
            { 'owner.owner_type': 'organization' },
            { 'users._id': socket.netid },
            { 'viewers._id': socket.netid },
          ],
        });

      if (cal === null) {
        socket.emit('error', 'cannot find calendar');
        return;
      }
      if (cal.owner.owner_type === 'organization') {
        const org = await mongoClient
          .db('meetme')
          .collection('organizations')
          .findOne({
            _id: cal.owner._id,
            $or: [
              { owner: socket.netid },
              { 'admins._id': socket.netid },
              { 'members._id': socket.netid },
              { 'editors._id': socket.netid },
              { 'viewers._id': socket.netid },
            ],
          });
        if (org === null) {
          //not sure if this works either
          socket.emit('error', `cannot find calendar, organization is null orgID:${cal.owner._id}`);
          return;
        }
      }
      socket.join(calid);
      socket.emit('listen', calid);
    });

    socket.on('dashboard', () => {
      console.log('Connected to dashbaord');
      socket.emit('custom-message', 'message from websocket server', {
        status: 'connected',
      });
    });
  });

  await watch_meetme(io, mongoClient);
  await watch_cal_memberlist(io, mongoClient);

  await watch_user(io, mongoClient);
  // server starts listening for connections on port 3000
  io.listen(3000);
};

main();

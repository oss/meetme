import { io } from 'socket.io-client';
const s = io(process.env.API_URL, {
    path: '/sauron',
    auth: {
        cookie_string: document.cookie,
    },
    transports: ['websocket'],
    upgrade: false,
});

s.on('socket service', (server_id) => {
    console.log('connected to sauron server: ' + server_id);
});

s.on('listen', (listen_target_id) => {
    console.log('listening for updates for id: ' + listen_target_id);
});

s.on('error', function (err) {
    console.log('Socket.IO Error');
    console.log(err); // this is changed from your code in last comment
});

s.onAny((event, ...args) => {
    console.log(`got ${event}`);
});

/*
const connectionCountMap = {} //we use this to ensure we don't disconnect from a room when other sockets are listening
const trackEmitsList = new Set(['join cal'])
const emitWrapper = (...args) => {
    const operation = args[0]
    const trackingID = args[1]

    //not implemented but need this if we want to implement leaving a room to prevent leaving rooms when another component is listening
    //ex. join a calendar, then leave when we no longer have it
    return s.emit(...args)
}
const handler = {
    get(target, prop, receiver) {
        if (prop === 'emit') {
            return emitWrapper
        }
        return target[prop]
    },
};


const socketProxy = new Proxy(s, handler);
*/

export default s;

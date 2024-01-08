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

export const socket = s;

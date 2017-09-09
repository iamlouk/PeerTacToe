const utils = require('./utils.js');
const sessionMiddleware = require('./session.js');

const log = utils.log('users');


class User {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.socket = null;
        this.inGame = false;
    }

    setSocket(socket){
        this.socket = socket;
    }

    startGame(){
        if (this.inGame)
            return log.warn('User.startGame() but user was not ready');

        this.inGame = true;
        this.socket.leave('updates-room');
    }

    endGame(){
        if (!this.inGame)
            return log.warn('User.endGame() but user was not in a game');

        this.inGame = false;
        this.socket.join('updates-room');
    }

    disconnect(reason){
        if (this.socket && this.socket.connected)
            this.socket.disconnect(true);

        delete users.connected[this.id];
    }
}

let users = module.exports = ({

    io: null,
    connected: Object.create(null), // Key = user.id, Value = user

    init: function(io){
        this.io = io;

        io.use((socket, next) => sessionMiddleware(socket.request, socket.request.res, next));

        io.on('connection', (socket) => {
            if (!socket.request.session.valid) {
                socket.disconnect(true);
                log.warn('invalid socket connected');
                return;
            }

            this.establishSocket(socket);
        });


        return this;
    },

    establishSocket: function(socket){
        let session = socket.request.session;
        let id = session.userId;
        let username = session.username;
        let ip = socket.handshake.address;

        if (!id) {
            log.warn('no id/username for socket', JSON.stringify(session));
            session.destroy();
            socket.disconnect(true);
            return;
        }
        if (this.connected[id] || session.connectedBySocket) {
            log.warn('id/username \''+id+'\' allready connected with socket');
            socket.disconnect(true);
            if (this.connected[id]) this.connected[id].disconnect();
            return;
        }

        socket.on('hello', (timestamp, ack) => {
            let now = Date.now();
            log.verb('ping: ' + (now - timestamp) + 'ms');
            ack([timestamp, now]);
        });

        socket.emit('login', { id, username }, (ok) => {
            if (!ok)
                return socket.disconnect(true);

            session.connectedBySocket = true;
            let user = this.connected[id] = new User(id, username);
            user.setSocket(socket);
            log.verb('user acceptet: id=' + id);

            socket.on('signal', (reciverId, signaldata, ack) => this.signaling(user, reciverId, signaldata, ack));

            socket.on('disconnect', (reason) => {
                user.disconnect(reason);
                this.io.to('updates-room').emit('users:leave', [ { id: id, name: username } ]);
                session.connectedBySocket = false;
                log.verb('socket/user disconnect: id=' + id + '; reason="' + reason + '"');
            });

            socket.emit('users:all', this.getUsersReadyToPlay());
            this.io.to('updates-room').emit('users:join', [ { id: id, name: username } ]);
            socket.join('updates-room');

            this.setupGame(user, socket);

        });
    },

    setupGame: function(sender, socket){

        socket.on('game:invite', (reciverId, myrole, yourrole, ack) => {
            if (typeof ack !== 'function') return;

            let reciver = this.connected[reciverId];
            if (!reciver || reciver.socket == null)
                return ack({ err: 'reciver does not exist or is not connected' });

            if (sender.inGame || reciver.inGame)
                return ack({ err: 'wrong states' });

            reciver.socket.emit('game:invitation', { id: sender.id, name: sender.name, myrole, yourrole }, (res) => {
                if (res.acceptet === true) {
                    sender.startGame();
                    reciver.startGame();
                    this.io.to('updates-room').emit('users:leave', [
                         { id: sender.id, name: sender.name },
                         { id: reciver.id, name: reciver.name }
                    ]);
                }
                ack(res);
            });
        });

        socket.on('game:leave', () => {
            sender.socket.emit('users:all', users.getUsersReadyToPlay());
            this.io.to('updates-room').emit('users:join', [
                { id: sender.id, name: sender.name }
            ]);
            sender.endGame();
        });

    },

    getUsersReadyToPlay: function(){
        return Object
            .values(this.connected)
            .filter((user) => !user.inGame)
            .map((user) => ({ id: user.id, name: user.name }));
    },

    signaling: function(sender, reciverId, signaldata, ack){
        let reciver = this.connected[reciverId];
        if (!reciver) {
            if (typeof ack == 'function') ack({ err: 'reciver does not exist' });
            return;
        }
        // log.verb('#signal: ' + sender.id + ' -> ' + reciver.id);
        reciver.socket.emit('signal', sender.id, signaldata, typeof ack == 'function' ? (response) => ack(response) : undefined);
    },

});

const canvas = require('./canvas.js');
const { Board } = require('./board.js');
const { consts, EventEmitter } = require('./utils.js');
const { LocalPlayer, RemotePlayer } = require('./player.js');

const ui = require('./ui/ui.js');

if (!SimplePeer.WEBRTC_SUPPORT) {
    console.warn('Your Browser does not support WebRTC :(');
}

class Game extends EventEmitter {
    constructor(localUser, peerUser) {
        super();

        this.localUser = localUser;
        this.peerUser = peerUser;
        this.itsTurnOf = null;
        ui.updateLocal({ role: localUser.role });

        if (localUser.role == consts.ROLE_X) {
            this.xPlayer = new LocalPlayer(localUser.id, consts.ROLE_X, canvas);
            this.oPlayer = new RemotePlayer(peerUser.id, consts.ROLE_O, this);
        } else /*(localUser.role == consts.ROLE_O)*/ {
            this.oPlayer = new LocalPlayer(localUser.id, consts.ROLE_O, canvas);
            this.xPlayer = new RemotePlayer(peerUser.id, consts.ROLE_X, this);
        }

        this.xPlayer.setOpponent(this.oPlayer);
        this.oPlayer.setOpponent(this.xPlayer);

        this.board = new Board(consts.BOARD_SIZE);

        this.board.on('change', (tiles) => tiles.forEach(tile => canvas.drawTile(tile)));
        this.board.on('gameover', (winner, tiles) => {
            if (winner) {
                console.info('Game Over! - Winner: ', winner);
                tiles.forEach((tile) => canvas.highlight(tile.x, tile.y));
            } else {
                console.info('Game Over! - Tie');
            }

            this.emit('gameover');
        });

        this.board.on('turn', (prevPlayer, nextPlayer) => {
            this.itsTurnOf = nextPlayer.role;
            ui.updateCurrentUser({ role: this.itsTurnOf });
        });

        peerUser.emitter.on('played', ([x, y]) => this.emit('peer:played', x, y));


        ui.updatePeer(peerUser);
    }

    start(){
        ui.users.hide();

        canvas.clear();

        this.itsTurnOf = consts.ROLE_X;
        ui.updateCurrentUser({ role: this.itsTurnOf });
        this.xPlayer.itsYourTurn(this.board);

    }

    restart(){
        this.board.reset();
        this.start();
    }

    quit(){
        ui.updatePeer({});
        ui.users.show();
        app.inGame = false;
        canvas.clear();
    }

    peerPlayed(x, y){
        this.peerUser.conn.send(JSON.stringify(['played', x, y]));
    }


}

const app = module.exports = ({

    socket: io(window.location.origin, { reconnection: false }),

    user: { id: null, name: null, role: null },
    peer: { id: null, name: null, role: null, conn: null, emitter: new EventEmitter() },

    game: null,

    inGame: false,
    establishing: true,

    init: function(){
        this.socket.on('login', ({ id, username }, ack) => {
            this.user.id = id;
            this.user.name = username;
            this.establishing = false;

            ui.updateLocal(this.user);

            ack(true);
        });

        this.socket.on('signal', (senderId, data, ack) => {
            if (this.peer.id !== senderId) {
                console.error('bad state');
                return ack({ err: 'bad state' });
            }
            this.peer.conn.signal(data);
        });

        this.socket.on('users:all', (data) => ui.users.updateAll(data.filter(({ id }) => id != this.user.id)));
        this.socket.on('users:join', (data) => ui.users.add(data.filter(({ id }) => id != this.user.id)));
        this.socket.on('users:leave', (data) => ui.users.remove(data.filter(({ id }) => id != this.user.id)));

        ui.on('invite-user', (peerId) => {
            if (this.inGame || this.establishing)
                throw new Error();


            let myrole = Math.random() > 0.5 ? consts.ROLE_X : consts.ROLE_O;
            let peerrole = myrole == consts.ROLE_X ? consts.ROLE_O : consts.ROLE_X;

            this.establishing = true;
            ui.popup.playAgainst(peerId, (ok) => {
                if (!ok) {
                    this.establishing = false;
                    this.inGame = true;
                    ui.popup.close();
                }

                ui.popup.waiting();
                this.socket.emit('game:invite', peerId, myrole, peerrole, (res) => {
                   if (res.acceptet === true) {
                       this.establishConnection(peerId, myrole, peerrole);
                       return;
                   }


                   ui.error('User denied', (response.err || 'reason unkown').toString(), () => {
                       this.establishing = false;
                       this.inGame = false;
                   });
                });
            });
        });
        this.socket.on('game:invitation', (data, ack) => {
            if (this.inGame || this.establishing)
                throw new Error();

            let peerId = data.id;
            let peerName = data.name;
            let peerrole = data.myrole;
            let myrole = data.yourrole;

            this.establishing = true;
            ui.popup.playAgainst(peerId, (ok) => {
                if (!ok) {
                    ack({ acceptet: false, err: this.user.id + ' does not want to play against you' });
                    this.establishing = false;
                    this.inGame = false;
                    return;
                }

                ui.popup.waiting();
                ack({ acceptet: true });
                this.establishConnection(peerId, myrole, peerrole);
            });
        });


        ui.on('btn-quit', () => {
            if (!this.inGame)
                throw new Error();

            console.info('You quited game');
            this.sendToPeer('quit');
            this.game.quit();
        });

        ui.on('btn-restart', () => {
            if (!this.inGame)
                throw new Error();

            console.info('You restarted game');
            this.sendToPeer('restart');
            this.game.restart();
        });

        this.peer.emitter.on('ping', ([t1]) => this.sendToPeer('pong', t1, Date.now()));
        this.peer.emitter.on('pong', ([t1, t2]) => console.info('Peer ping: ' + (Date.now() - t1) + 'ms'));
        this.peer.emitter.on('restart', () => {
            console.info('Peer restarted game');
            this.game.restart();
        });
        this.peer.emitter.on('quit', () => {
            console.info('Peer quited game');
            this.game.quit();
        });


        this.socket.on('disconnect', () => ui.error('Socket.IO Warning', 'Socket disconnected'));
        this.socket.on('error', (err) => ui.error('Socket.IO Error', err.message));
        this.socket.on('connect_error', (err) => ui.error('Socket.IO Connect Error', err.message));

        return this;
    },

    pingSocket: function(cb){
        this.socket.emit('hello', Date.now(), cb || (([t1, t2]) => console.info('Socket/Server ping: ' + (Date.now() - t1) + 'ms')));
        return this.socket.connected;
    },

    sendToPeer: function(evt, ...args){
        args.unshift(evt);
        this.peer.conn.send(JSON.stringify(args));
    },

    pingPeer: function(){ this.sendToPeer('ping', Date.now()); },


    establishConnection: function(peerId, myrole, peerrole){
        this.peer.id = peerId;
        this.peer.role = peerrole;
        this.user.role = myrole;

        this.establishing = true;

        if (this.peer.conn || this.game)
            throw new Error();

        if (myrole != consts.ROLE_X && myrole != consts.ROLE_O) throw new Error();
        if (myrole == consts.ROLE_X && peerrole != consts.ROLE_O) throw new Error();
        if (myrole == consts.ROLE_O && peerrole != consts.ROLE_X) throw new Error();

        this.game = new Game(this.user, this.peer);

        this.peer.conn = new SimplePeer({ initiator: myrole == consts.ROLE_X });

        this.peer.conn.on('signal', (data) => this.socket.emit('signal', peerId, data));
        this.peer.conn.on('error', (err) => ui.error('Peer Connection', err.message));

        this.peer.conn.on('close', () => {
            if (this.inGame) {
                ui.error('Peer Connection', 'closed unexpectedly');
                this.game.quit();
                this.game = null;
                this.peer.conn = null;
                this.inGame = false;
            }
        });

        this.peer.conn.on('connect', () => {
            ui.popup.close();
            this.establishing = false;
            this.inGame = true;
            this.game.start();
        });

        this.peer.conn.on('data', (data) => {
            data = JSON.parse(data);
            let evt = data.shift();
            this.peer.emitter.emit(evt, data);
        });

    }


}).init();

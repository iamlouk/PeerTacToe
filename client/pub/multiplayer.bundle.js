/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {


const consts = exports.consts = {
    ROLE_X: 'X',
    ROLE_O: 'O',

    COLOR_X: 'rgb(0, 194, 255)',
    COLOR_O: 'rgb(213, 35, 35)',

    BOARD_SIZE: 3
};


exports.parseURLQuery = () => window.location.search
    .substr(1)
    .split('&')
    .map(pair => pair.split('='))
    .reduce((obj, pair) => {
        obj[pair.shift()] = window.unescape(pair.join('='));
        return obj;
    }, {});


exports.EventEmitter = class EventEmitter {

    constructor() {
        this._events = Object.create(null);
    }

    on(event, fn) {
        if (this._events[event])
            this._events[event].push(fn);
        else
            this._events[event] = [ fn ];
    }

    emit(event, ...args) {
        let fns = this._events[event];
        if (fns) fns.forEach(fn => fn.apply(this, args));
    }

    once(event, _fn) {
        let fn = (...args) => {
            let index = this._events[event].indexOf(fn);
            if (index < 0) throw new Error();

            this._events[event].splice(index, 1);
            _fn.apply(this, args);
        };
        this.on(event, fn);
    }

};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const { consts, EventEmitter } = __webpack_require__(0);

class Canvas extends EventEmitter {

    constructor($canvas, size){
        super();

        this.$canvas = $canvas;

        this.width = $canvas.width = $canvas.offsetWidth;
        this.height = $canvas.height = $canvas.offsetHeight;
        this.ctx = $canvas.getContext('2d');

        this.$canvas.addEventListener('click', (event) =>
            this.emit('click', this.processCords(event.pageX, event.pageY)), false);

        /*this.$canvas.addEventListener('mousemove', (event) => {
            let { x, y } = this.processCords(event.pageX, event.pageY);
            this.highlight(x, y);
        });*/

        this.size = size;
        this.tileSize = this.width / this.size;
    }

    processCords(x, y) {
        x -= this.$canvas.offsetLeft + this.$canvas.offsetParent.offsetLeft;
        y -= this.$canvas.offsetTop + this.$canvas.offsetParent.offsetTop;

        x = Math.floor(x / this.tileSize);
        y = Math.floor(y / this.tileSize);

        return { x, y };
    }

    draw(board) {
        this.clear();
        this.drawGrid();
        for (let x = 0; x < this.size; x++){
            for (let y = 0; y < this.size; y++){
                let tile = board.matrix[x][y];
                this.drawTile(tile);
            }
        }
    }

    drawTile(tile) {
        let x = tile.x * this.tileSize;
        let y = tile.y * this.tileSize;

        this.ctx.clearRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
        this.ctx.lineWidth = 5;
        if (tile.state === consts.ROLE_X) {
            this.ctx.strokeStyle = consts.COLOR_X;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 10, y + 10);
            this.ctx.lineTo(x + this.tileSize - 10, y + this.tileSize - 10);
            this.ctx.moveTo(x + this.tileSize - 10, y + 10);
            this.ctx.lineTo(x + 10, y + this.tileSize - 10);
            this.ctx.stroke();
        } else if (tile.state === consts.ROLE_O) {
            this.ctx.strokeStyle = consts.COLOR_O;
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize * 0.4, 0, 2 * Math.PI, false);
            this.ctx.stroke();
        } else if (tile.state === null) {
            // ....
        } else {
            throw new Error();
        }
    }

    drawGrid() {
        if (!this.size) throw new Error('invalid size to draw grid');

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgb(100, 100, 100)';
        this.ctx.beginPath();
        for (let x = 0; x < this.width; x += this.tileSize){
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        for (let y = 0; y < this.height; y += this.tileSize){
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
    }

    highlight(x, y) {
        x = x * this.tileSize + 2;
        y = y * this.tileSize + 2;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = Canvas.COLOR_HIGHLIGHT;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + this.tileSize - 4, y);
        this.ctx.lineTo(x + this.tileSize - 4, y + this.tileSize - 4);
        this.ctx.lineTo(x, y + this.tileSize - 4);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

}

Canvas.COLOR_HIGHLIGHT = 'rgb(135, 195, 59)';

const canvas = new Canvas(document.querySelector('#board-canvas'), consts.BOARD_SIZE);
canvas.Canvas = Canvas;
canvas.drawGrid();

// console.log(canvas);

module.exports = canvas;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const { consts, EventEmitter } = __webpack_require__(0);

class Tile {
    constructor(state, x, y) {
        this.state = state;
        this.x = x;
        this.y = y;
    }

    isEmpty() { return this.state === null; }
    isX()     { return this.state === consts.ROLE_X; }
    isO()     { return this.state === consts.ROLE_O; }
    is(state) { return this.state === state; }

}

class Board extends EventEmitter {
    constructor(size) {
        super();

        this.size = size;
        this.matrix = [];
        for (let x = 0; x < size; x++) {
            this.matrix[x] = [];
            for (let y = 0; y < size; y++) {
                this.matrix[x][y] = new Tile(null, x, y);
            }
        }

        this.traversals = this.getTraversals();
    }

    isEmpty(x, y)   { return this.matrix[x][y].state === null; }
    isX(x, y)       { return this.matrix[x][y].state === consts.ROLE_X; }
    isO(x, y)       { return this.matrix[x][y].state === consts.ROLE_O; }
    is(x, y, state) { return this.matrix[x][y].state === state; }

    make(x, y, state) {
        let tile = this.matrix[x][y];
        tile.state = state;
        this.emit('change', [ tile ]);
    }

    reset(){
        for (let rows of this.matrix) {
            for (let tile of rows) {
                tile.state = null;
            }
        }
        // this.emit('change', this.matrix.reduce((flat, row) => flat.concat(row), []));
    }

    getTraversals(){
        let traversals = [];

        for (let x = 0; x < this.size; x++) {
            let traversal = [];
            traversal.vec = { x: 0, y: 1 };
            for (let y = 0; y < this.size; y++) {
                traversal.push(this.matrix[x][y]);
            }
            traversals.push(traversal);
        }

        for (let y = 0; y < this.size; y++) {
            let traversal = [];
            traversal.vec = { x: 1, y: 0 };
            for (let x = 0; x < this.size; x++) {
                traversal.push(this.matrix[x][y]);
            }
            traversals.push(traversal);
        }

        {
            let vec = { x: 1, y: 1 }, traversal = [];
            let x = 0, y = 0;
            traversal.vec = vec;
            while (this.isInBounds(x, y)) {
                traversal.push(this.matrix[x][y]);
                x += vec.x;
                y += vec.y;
            }
            traversals.push(traversal);
        }

        {
            let vec = { x: -1, y: 1 }, traversal = [];
            let x = 2, y = 0;
            traversal.vec = vec;
            while (this.isInBounds(x, y)) {
                traversal.push(this.matrix[x][y]);
                x += vec.x;
                y += vec.y;
            }
            traversals.push(traversal);
        }

        return traversals;
    }

    getWinner(){
        for (let traversal of this.traversals) {
            let xinrow = [], oinrow = [];
            for (let tile of traversal) {
                if (this.isX(tile.x, tile.y)) {
                    xinrow.push(tile);
                    oinrow.length = 0;
                    if (xinrow.length === 3) {
                        return { winner: consts.ROLE_X, tiles: xinrow };
                    }
                } else if (this.isO(tile.x, tile.y)) {
                    xinrow.length = 0;
                    oinrow.push(tile);
                    if (oinrow.length === 3) {
                        return { winner: consts.ROLE_O, tiles: oinrow };
                    }
                } else {
                    xinrow.length = 0;
                    oinrow.length = 0;
                }
            }
        }
        return { winner: null, tiles: [] };
    }

    isGameOver(){
        for (let x = 0; x < this.size; x++)
            for (let y = 0; y < this.size; y++)
                if (this.isEmpty(x, y))
                    return false;

        return true;
    }

    isInBounds(x, y){ return (x >= 0 && x < this.size) && (y >= 0 && y < this.size); }

    turnWasMade(player){
        let { winner, tiles } = this.getWinner();
        if (winner !== null) {
            this.emit('gameover', winner, tiles);
            return;
        }
        if (this.isGameOver()) {
            this.emit('gameover', null, []);
            return;
        }

        let nextPlayer = player.opponent;
        this.emit('turn', player, nextPlayer);
        nextPlayer.itsYourTurn(this);
    }

}

module.exports = { Tile, Board };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const { consts } = __webpack_require__(0);

class Player {
    constructor(id, role){
        if (role !== consts.ROLE_X && role !== consts.ROLE_O)
            throw new Error();

        this.id = id;
        this.role = role;
        this.itsMyTurn = false;
        this.opponent = null;
    }

    setOpponent(player){
        if (player.role == this.role) throw new Error();

        this.opponent = player;
    }

    makeTurn(board, x, y){
        if (!this.itsMyTurn) throw new Error('its not your turn');
        if (!board.isEmpty(x, y)) throw new Error('tile not empty');

        // console.info('Player#' + this.role + ' played!');

        board.make(x, y, this.role);
        this.itsMyTurn = false;
        this.opponent.opponentPlayed(board, x, y);
        board.turnWasMade(this, this.opponent);
    }

    opponentPlayed(board, x, y){
        board.make(x, y, this.opponent.role);
    }

    itsYourTurn(board){
        this.itsMyTurn = true;
    }
}

class LocalPlayer extends Player {
    constructor(id, role, clickable){
        super(id, role);
        this.clickable = clickable;
    }

    itsYourTurn(board){
        super.itsYourTurn(board);

        let onClick = ({x, y}) => {
            if (board.isInBounds(x, y) && board.isEmpty(x, y)) {
                super.makeTurn(board, x, y);
            } else {
                this.clickable.once('click', onClick);
            }
        };
        this.clickable.once('click', onClick);
    }
}

class RemotePlayer extends Player {
    constructor(id, role, game){
        super(id, role);
        this.game = game;
    }

    itsYourTurn(board){
        super.itsYourTurn(board);
        this.game.once('peer:played', (x, y) => super.makeTurn(board, x, y));
    }

    opponentPlayed(board, x, y){
        super.opponentPlayed(board, x, y);
        this.game.peerPlayed(x, y);
    }
}

module.exports = { Player, LocalPlayer, RemotePlayer };


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(1);
const { Board } = __webpack_require__(2);
const { consts, EventEmitter } = __webpack_require__(0);
const { LocalPlayer, RemotePlayer } = __webpack_require__(3);

const ui = __webpack_require__(5);

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


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {


const { EventEmitter, consts } = __webpack_require__(0);

const ui = new EventEmitter();

const popup = __webpack_require__(6);
ui.popup = popup;
ui.error = (title, msg, callback) => {
    console.warn(title, msg);
    popup.error(title, msg, callback);
};

document.querySelector('#btn-restart').addEventListener('click', (event) => ui.emit('btn-restart', event), false);
document.querySelector('#btn-quit').addEventListener('click', (event) => ui.emit('btn-quit', event), false);

ui.updateLocal = ({ id, name, role }) => {
    if (id)
        document.querySelector('#your-id').innerText = id;
    if (role)
        document.querySelector('#your-color').style.backgroundColor = role == consts.ROLE_X ? consts.COLOR_X : consts.COLOR_O;
};

ui.updatePeer = ({ id, name, role }) => {
    if (id)
        document.querySelector('#opponent-id').innerText = id;
    else
        document.querySelector('#opponent-id').innerText = '???';
    if (role)
        document.querySelector('#opponent-color').style.backgroundColor = role == consts.ROLE_X ? consts.COLOR_X : consts.COLOR_O;
    else
        document.querySelector('#opponent-color').style.backgroundColor = 'white';
};

ui.updateCurrentUser = ({ role }) => {
    document.querySelector('#current-player').style.backgroundColor = role == consts.ROLE_X ? consts.COLOR_X : consts.COLOR_O;
};



ui.users = ({

    $users: document.querySelector('#user-overview'),
    $usersList: document.querySelector('#user-list'),

    updateAll: function(users){
        while (this.$usersList.hasChildNodes())
            this.$usersList.removeChild(this.$usersList.lastChild);

        this.add(users);
    },
    add: function(users){
        users.forEach(({ id }) => {
           let li = document.createElement('li');
           li.id = 'user-id-' + id;
           li.innerText = id;
           li.dataset.id = id;

           li.addEventListener('click', (target) => ui.emit('invite-user', id, target), false);

           this.$usersList.append(li);
        });
    },
    remove: function(users){
        users.forEach(({ id }) => {
            let $li = this.$usersList.querySelector('#user-id-' + id);
            this.$usersList.remove($li);
        });
    },

    hide: function(){
        this.$users.style.display = 'none';
    },

    show: function(){
        this.$users.style.display = 'block';
    }

});






module.exports = ui;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = ({

    $popup: document.querySelector('#popup'),
    $container: document.querySelector('.container'),
    isOpen: false,

    clearContent: function(){
        while (this.$popup.hasChildNodes())
            this.$popup.removeChild(this.$popup.lastChild);
    },

    show: function(){
        if (this.isOpen) return;

        this.isOpen = true;
        this.$popup.classList.remove('hidden');
        this.$container.classList.add('hidden');
    },

    close: function(){
        if (!this.isOpen) return;

        this.isOpen = false;
        this.$popup.classList.add('hidden');
        this.$container.classList.remove('hidden');
        this.clearContent();
    },

    playAgainst: function(id, callback){
        this.clearContent();

        let $msg = document.createElement('span');
        $msg.innerHTML = 'Do you want to play against <span class="some-id">' + id + '</span>?';

        let $yesBtn = document.createElement('button');
        $yesBtn.innerText = 'Yes';

        let $noBtn = document.createElement('button');
        $noBtn.innerText = 'No';

        this.$popup.append($msg);
        this.$popup.append(document.createElement('br'));
        this.$popup.append(document.createElement('br'));
        this.$popup.append($yesBtn);
        this.$popup.append($noBtn);

        $yesBtn.onclick = () => callback(true);
        $noBtn.onclick = () => callback(false);

        this.show();
    },

    waiting: function(){
        this.clearContent();

        let $msg = document.createElement('span');
        $msg.innerText = 'Waiting...';

        this.$popup.append($msg);
        this.show();
    },

    error: function(title, msg, callback){
        this.clearContent();

        let $title = document.createElement('h2');
        $title.innerText = title;
        $title.style.color = 'rgb(214, 48, 18)';

        let $msg = document.createElement('span');
        $msg.innerText = msg;

        let $btn = document.createElement('button');
        $btn.innerText = 'Ok';
        $btn.onclick = () => {
            this.close();
            if (callback) callback();
        };

        this.$popup.append($title);
        this.$popup.append($msg);
        this.$popup.append(document.createElement('br'));
        this.$popup.append(document.createElement('br'));
        this.$popup.append($btn);
        this.show();
    },



});


/***/ })
/******/ ]);
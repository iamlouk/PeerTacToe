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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
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
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const canvas = __webpack_require__(1);
const { Board } = __webpack_require__(2);
const { LocalPlayer, RoboPlayer } = __webpack_require__(8);
const { consts } = __webpack_require__(0);

const board = new Board(consts.BOARD_SIZE);
board.on('change', (tiles) => tiles.forEach(tile => canvas.drawTile(tile)));
board.on('gameover', (winner, tiles) => {
    if (winner) {
        console.info('Game Over! - Winner: ', winner);
        tiles.forEach((tile) => canvas.highlight(tile.x, tile.y));
    } else {
        console.info('Game Over! - Tie');
    }
});

board.on('turn', (prevPlayer, nextPlayer) => {
    updateCurrent(nextPlayer);
});

let player, robo;

const $currentPlayer = document.querySelector('#current-player');
let updateCurrent = (player) => {
    $currentPlayer.style.backgroundColor = player.role == consts.ROLE_X ? consts.COLOR_X : consts.COLOR_O;
};

let restartGame = () => {
    board.reset();
    canvas.clear();

    let isX = confirm('Do you want to be X?');

    player = new LocalPlayer('local', isX ? consts.ROLE_X : consts.ROLE_O, canvas);
    robo = new RoboPlayer('robo', !isX ? consts.ROLE_X : consts.ROLE_O);

    player.setOpponent(robo);
    robo.setOpponent(player);

    if (isX) {
        updateCurrent(player);
        player.itsYourTurn(board);
    } else {
        updateCurrent(robo);
        robo.itsYourTurn(board);
    }
};

document.querySelector('#btn-new-game').addEventListener('click', restartGame, false);

restartGame();


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

const { Player, LocalPlayer } = __webpack_require__(3);

exports.RoboPlayer = class RoboPlayer extends Player {

    itsYourTurn(board){
        super.itsYourTurn(board);

        for (let traversal of board.traversals) {
            let empty = [], self = [], other = [];
            traversal.forEach((tile) => {
                if (tile.is(this.role)) {
                    self.push(tile);
                } else if (tile.isEmpty()) {
                    empty.push(tile);
                } else {
                    other.push(tile);
                }
            });

            if (self.length == 2 && empty.length == 1) {
                return super.makeTurn(board, empty[0].x, empty[0].y);
            }
        }

        for (let traversal of board.traversals) {
            let empty = [], self = [], other = [];
            traversal.forEach((tile) => {
                if (tile.is(this.role)) {
                    self.push(tile);
                } else if (tile.isEmpty()) {
                    empty.push(tile);
                } else {
                    other.push(tile);
                }
            });

            if (other.length == 2 && empty.length == 1) {
                return super.makeTurn(board, empty[0].x, empty[0].y);
            }
        }

        for (let traversal of board.traversals) {
            let empty = [], self = [], other = [];
            traversal.forEach((tile) => {
                if (tile.is(this.role)) {
                    self.push(tile);
                } else if (tile.isEmpty()) {
                    empty.push(tile);
                } else {
                    other.push(tile);
                }
            });

            if (empty.length == 2 && self.length == 1) {
                return super.makeTurn(board, empty[0].x, empty[0].y);
            }
        }

        for (let traversal of board.traversals) {
            let empty = [], self = [], other = [];
            traversal.forEach((tile) => {
                if (tile.is(this.role)) {
                    self.push(tile);
                } else if (tile.isEmpty()) {
                    empty.push(tile);
                } else {
                    other.push(tile);
                }
            });

            if (empty.length == 2 && other.length == 1) {
                return super.makeTurn(board, empty[0].x, empty[0].y);
            }
        }

        if (board.isEmpty(1, 1)) {
            return super.makeTurn(board, 1, 1);
        }

        for (let row of board.matrix) {
            for (let tile of row) {
                if (tile.isEmpty()) {
                    return super.makeTurn(board, tile.x, tile.y);
                }
            }
        }

        throw new Error();
    }

};

exports.LocalPlayer = LocalPlayer;


/***/ })
/******/ ]);
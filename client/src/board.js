const { consts, EventEmitter } = require('./utils.js');

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

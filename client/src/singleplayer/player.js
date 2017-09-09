const { Player, LocalPlayer } = require('../player.js');

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

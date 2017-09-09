const { consts } = require('./utils.js');

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

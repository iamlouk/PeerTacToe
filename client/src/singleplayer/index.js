const canvas = require('../canvas.js');
const { Board } = require('../board.js');
const { LocalPlayer, RoboPlayer } = require('./player.js');
const { consts } = require('../utils.js');

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

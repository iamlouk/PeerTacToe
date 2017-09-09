const { consts, EventEmitter } = require('./utils.js');

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

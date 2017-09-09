
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

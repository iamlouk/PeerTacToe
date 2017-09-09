require('colors');

const Log = function(file, lvl){
	this.file = (utils.leftpad(file) + ' | ').gray;
	this.write = console.log.bind(console);
};
Log.level = 0;
Log.prototype = {

	verb: function(msg, data){
		if (Log.level > 0) return;
		this.write(utils.getFormatedTime().bgWhite + ' ' + 'VERB: '.magenta + this.file + msg + (data != null ? ': '.grey + data : ''));
	},

	log: function(msg, data){
		if (Log.level > 1) return;
		this.write(utils.getFormatedTime().bgWhite + ' ' + 'LOG:  '.green + this.file + msg + (data != null ? ': '.grey + data : ''));
	},

	info: function(msg, data){
		if (Log.level > 2) return;
		this.write(utils.getFormatedTime().bgWhite + ' ' + 'INFO: '.cyan + this.file + msg + (data != null ? ': '.grey + data : ''));
	},

	warn: function(msg, data){
		if (Log.level > 3) return;
		this.write(utils.getFormatedTime().bgWhite + ' ' + 'WARN: '.yellow + this.file + msg + (data != null ? ': '.grey + data : ''));
	},

	err: function(msg, data){
		if (Log.level > 4) return;
		this.write(utils.getFormatedTime().bgWhite + ' ' + 'ERR:  '.red + this.file + msg + (data != null ? ': '.grey + data : ''));
	}

};

let utils = {

	log: (file, loglevel = 0) => new Log(file, loglevel),

	setLoglevel: (lvl) => Log.level = lvl,

	randomId: (len = 25) => {
		let id = '';
		while (id.length < len) {
			id += Math.random().toString(36).substr(2, 16)
		}
		return id.substr(0, len);
	},

	leftpad: (str, len = 10) => {
		while (str.length < len) {
			str = ' ' + str;
		}
		return str;
	},

	getFormatedTime: () => {
		let date = new Date();
		let s = date.getSeconds().toString();
		if (s.length == 1) s = '0' + s;
		let m = date.getMinutes().toString();
		if (m.length == 1) m = '0' + m;
		let h = date.getHours().toString();
		if (h.length == 1) h = '0' + h;
		return (h + ':' + m + ':' + s);
	}

};

module.exports = utils;

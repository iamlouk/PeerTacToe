
const { EventEmitter, consts } = require('../utils.js');

const ui = new EventEmitter();

const popup = require('./popup.js');
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

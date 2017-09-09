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

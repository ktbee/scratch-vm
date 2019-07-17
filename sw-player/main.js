const Player = require('./js/player');

window.onload = function () {
    const swPlayer = new Player(document.getElementById('scratch-stage'));
    swPlayer.init();
};

const wsUrl = 'wss://ws.volleyballturnier.emanuelhiebeler.me';
const wsUrlLocal = 'ws://localhost:8080';

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const game = JSON.parse(event.data).game;
    console.log(game);
    const team1Name = document.getElementById('team1Name');
    const team1Score = document.getElementById('team1Score');
    const team2Name = document.getElementById('team2Name');
    const team2Score = document.getElementById('team2Score');
        const status = document.getElementById('status');

    team1Name.textContent = game.team1.name;
    team1Score.textContent = game.team1Score;
    team2Name.textContent = game.team2.name;
    team2Score.textContent = game.team2Score;
    status.textContent = "status " + game.status;
};

ws.onclose = () => {
    console.log('Disconnected from server');
};
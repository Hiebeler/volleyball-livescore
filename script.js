const wsUrl = 'wss://ws.volleyballturnier.emanuelhiebeler.me';
const wsUrlLocal = 'ws://localhost:8080';

let ws;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectInterval;

// DOM Elements
const team1Name = document.getElementById('team1Name');
const team1Score = document.getElementById('team1Score');
const team2Name = document.getElementById('team2Name');
const team2Score = document.getElementById('team2Score');
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
const connectionStatus = document.getElementById('connectionStatus');
const connectionText = document.getElementById('connectionText');
const connectionLoader = document.getElementById('connectionLoader');

// Previous scores for animation
let previousTeam1Score = 0;
let previousTeam2Score = 0;

function connect() {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Verbunden mit Server');
        updateConnectionStatus('connected', 'Verbunden');
        reconnectAttempts = 0;
        clearInterval(reconnectInterval);
        
        // Add connection success animation
        connectionStatus.style.transform = 'scale(1.1)';
        setTimeout(() => {
            connectionStatus.style.transform = 'scale(1)';
        }, 200);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const game = data.game;
            console.log('Spieldaten erhalten:', game);
            
            updateGameData(game);
        } catch (error) {
            console.error('Fehler beim Parsen der Daten:', error);
        }
    };

    ws.onclose = () => {
        console.log('Verbindung getrennt');
        updateConnectionStatus('disconnected', 'Getrennt');
        
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            
            setTimeout(() => {
                console.log(`Wiederverbindungsversuch ${reconnectAttempts}/${maxReconnectAttempts}`);
                connect();
            }, delay);
        } else {
            updateConnectionStatus('disconnected', 'Verbindung verloren');
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket Fehler:', error);
        updateConnectionStatus('disconnected', 'Fehler');
    };
}

function updateConnectionStatus(status, text) {
    connectionStatus.className = `connection-status ${status}`;
    connectionText.textContent = text;
    
    if (status === 'connected') {
        connectionLoader.style.display = 'none';
    } else {
        connectionLoader.style.display = 'inline-block';
    }
}

function updateGameData(game) {
    // Update team names with animation
    updateTeamName(team1Name, game.team1.name || 'Team 1');
    updateTeamName(team2Name, game.team2.name || 'Team 2');
    
    // Update scores with enhanced animation
    updateScore(team1Score, game.team1Score, previousTeam1Score);
    updateScore(team2Score, game.team2Score, previousTeam2Score);
    
    // Store previous scores
    previousTeam1Score = game.team1Score;
    previousTeam2Score = game.team2Score;
    
    // Update status
    updateGameStatus(game.status);
}

function updateTeamName(element, newName) {
    if (element.textContent !== newName) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.textContent = newName;
            element.style.transform = 'scale(1.1)';
            element.style.opacity = '1';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }, 150);
    }
}

function updateScore(element, newScore, previousScore) {
    if (newScore !== previousScore) {
        // Enhanced animation
        element.style.transform = 'scale(0.8) rotate(-5deg)';
        element.style.opacity = '0.7';
        
        setTimeout(() => {
            element.textContent = newScore;
            element.classList.add('updated');
            element.style.transform = 'scale(1.3) rotate(0deg)';
            element.style.opacity = '1';
            
            // Add particle effect
            createScoreParticles(element);
            
            // Add side effect based on which team scored
            createSideEffect(element, newScore > previousScore);
            
            setTimeout(() => {
                element.classList.remove('updated');
                element.style.transform = 'scale(1)';
            }, 800);
        }, 200);
    }
}

function createScoreParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = '#ffd700';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.boxShadow = '0 0 10px #ffd700';
        
        document.body.appendChild(particle);
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(1)', opacity: 1, offset: 0.3 },
            { transform: 'scale(0)', opacity: 0, left: endX + 'px', top: endY + 'px' }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            document.body.removeChild(particle);
        };
    }
}

function createSideEffect(element, isIncrease) {
    const rect = element.getBoundingClientRect();
    const isTeam1 = element.id === 'team1Score';
    
    // Determine which side to show the effect
    const side = isTeam1 ? 'left' : 'right';
    const startX = isTeam1 ? rect.left - 50 : rect.right + 50;
    const endX = isTeam1 ? rect.left - 150 : rect.right + 150;
    const centerY = rect.top + rect.height / 2;
    
    // Create side effect element
    const sideEffect = document.createElement('div');
    sideEffect.style.position = 'fixed';
    sideEffect.style.left = startX + 'px';
    sideEffect.style.top = centerY + 'px';
    sideEffect.style.width = '100px';
    sideEffect.style.height = '100px';
    sideEffect.style.background = isIncrease ? 
        'radial-gradient(circle, #2ed573 0%, #7bed9f 50%, transparent 100%)' :
        'radial-gradient(circle, #ff4757 0%, #ff6b7a 50%, transparent 100%)';
    sideEffect.style.borderRadius = '50%';
    sideEffect.style.pointerEvents = 'none';
    sideEffect.style.zIndex = '1000';
    sideEffect.style.boxShadow = isIncrease ? 
        '0 0 30px rgba(46, 213, 115, 0.8)' :
        '0 0 30px rgba(255, 71, 87, 0.8)';
    
    document.body.appendChild(sideEffect);
    
    // Animate the side effect
    sideEffect.animate([
        { 
            transform: 'scale(0) rotate(0deg)', 
            opacity: 0,
            left: startX + 'px'
        },
        { 
            transform: 'scale(1.5) rotate(180deg)', 
            opacity: 1,
            left: startX + 'px',
            offset: 0.3
        },
        { 
            transform: 'scale(2) rotate(360deg)', 
            opacity: 0.8,
            left: endX + 'px',
            offset: 0.7
        },
        { 
            transform: 'scale(0) rotate(720deg)', 
            opacity: 0,
            left: endX + 'px'
        }
    ], {
        duration: 1200,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
        document.body.removeChild(sideEffect);
    };
    
    // Add directional arrow effect
    createDirectionalArrow(element, isIncrease, side);
}

function createDirectionalArrow(element, isIncrease, side) {
    const rect = element.getBoundingClientRect();
    const isTeam1 = element.id === 'team1Score';
    
    const arrowX = isTeam1 ? rect.left - 80 : rect.right + 80;
    const centerY = rect.top + rect.height / 2;
    
    const arrow = document.createElement('div');
    arrow.style.position = 'fixed';
    arrow.style.left = arrowX + 'px';
    arrow.style.top = centerY + 'px';
    arrow.style.width = '60px';
    arrow.style.height = '60px';
    arrow.style.background = isIncrease ? '#2ed573' : '#ff4757';
    arrow.style.borderRadius = '50%';
    arrow.style.pointerEvents = 'none';
    arrow.style.zIndex = '1001';
    arrow.style.display = 'flex';
    arrow.style.alignItems = 'center';
    arrow.style.justifyContent = 'center';
    arrow.style.fontSize = '24px';
    arrow.style.color = 'white';
    arrow.style.fontWeight = 'bold';
    arrow.style.boxShadow = isIncrease ? 
        '0 0 20px rgba(46, 213, 115, 0.8)' :
        '0 0 20px rgba(255, 71, 87, 0.8)';
    
    // Add arrow symbol
    arrow.innerHTML = isIncrease ? '↗' : '↘';
    
    document.body.appendChild(arrow);
    
    // Animate the arrow
    arrow.animate([
        { 
            transform: 'scale(0) rotate(0deg)', 
            opacity: 0
        },
        { 
            transform: 'scale(1.2) rotate(360deg)', 
            opacity: 1,
            offset: 0.5
        },
        { 
            transform: 'scale(0) rotate(720deg)', 
            opacity: 0
        }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
        document.body.removeChild(arrow);
    };
}

function updateGameStatus(status) {
    status.className = 'status';
    
    // Add status change animation
    status.style.transform = 'scale(0.9)';
    status.style.opacity = '0.7';
    
    setTimeout(() => {
        switch(status.toLowerCase()) {
            case 'live':
            case 'active':
                status.classList.add('live');
                statusText.textContent = 'LIVE';
                break;
            case 'paused':
            case 'timeout':
                status.classList.add('paused');
                statusText.textContent = 'PAUSE';
                break;
            case 'finished':
            case 'ended':
                status.classList.add('finished');
                statusText.textContent = 'BEENDET';
                break;
            default:
                statusText.textContent = status || 'Unbekannt';
        }
        
        status.style.transform = 'scale(1.1)';
        status.style.opacity = '1';
        
        setTimeout(() => {
            status.style.transform = 'scale(1)';
        }, 300);
    }, 150);
}

// Initialize connection
connect();

// Add some visual feedback for score changes
function addScoreChangeEffect(element) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

// Auto-reconnect on page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ws.readyState === WebSocket.CLOSED) {
        console.log('Seite wieder sichtbar - versuche Wiederverbindung');
        connect();
    }
});

// Add some ambient animations
setInterval(() => {
    const teams = document.querySelectorAll('.team');
    teams.forEach((team, index) => {
        if (Math.random() < 0.1) { // 10% chance every interval
            team.style.transform = 'translateY(-2px)';
            setTimeout(() => {
                team.style.transform = 'translateY(0)';
            }, 200);
        }
    });
}, 3000);
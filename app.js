// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4xxMq4__FZbbWm1hD7af21GBnWB4PRVE",
  authDomain: "database-51873.firebaseapp.com",
  databaseURL: "https://database-51873-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "database-51873",
  storageBucket: "database-51873.firebasestorage.app",
  messagingSenderId: "955956842074",
  appId: "1:955956842074:web:3d4ca84bbb77f98e3ad263",
  measurementId: "G-EQ9GTVBNJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let gameId = "room123"; // Für den Prototyp fest, später dynamisch per URL
let myPlayerKey = "";
let currentScore = 0;

// 1. SPIEL BEITRETEN
window.joinGame = function() {
    const name = document.getElementById('username').value;
    if(!name) return alert("Name fehlt!");

    const playerRef = ref(db, `games/${gameId}/players`);
    const newPlayerRef = push(playerRef);
    myPlayerKey = newPlayerRef.key;

    set(newPlayerRef, {
        name: name,
        score: 0,
        challengesDone: []
    });

    document.getElementById('display-name').innerText = name;
    listenToGame();
    
    // Wechsel zum Spiel-Screen
    document.getElementById('screen-lobby').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    generateInitialCards();
};

// 2. ECHTZEIT-UPDATES (Leaderboard & Status)
function listenToGame() {
    const gameRef = ref(db, `games/${gameId}`);
    onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Leaderboard aktualisieren
        const list = document.getElementById('player-list');
        list.innerHTML = "";
        for (let key in data.players) {
            const p = data.players[key];
            const li = document.createElement('li');
            li.innerText = `${p.name}: ${p.score} Pkt.`;
            list.appendChild(li);
        }
    });
}

// 3. PUNKTE BEI SWIPE AKTUALISIEREN
window.swipe = function(index, success) {
    const card = gameState.cards[index];
    let pointsChange = 0;
    
    if(success) {
        pointsChange = card.type === 'easy' ? 5 : (card.type === 'medium' ? 10 : 20);
        // Challenge in Firebase speichern für Veto-Check später
        const doneRef = ref(db, `games/${gameId}/players/${myPlayerKey}/challengesDone`);
        push(doneRef, { text: card.text, timestamp: Date.now() });
    } else {
        pointsChange = -2;
    }
    
    currentScore += pointsChange;
    
    // Score in Firebase synchronisieren
    update(ref(db, `games/${gameId}/players/${myPlayerKey}`), {
        score: currentScore
    });

    document.getElementById('display-score').innerText = currentScore + " Pkt.";
    
    // Neue Karte nachrücken
    gameState.cards[index].text = getRand(card.type);
    renderCards();
};

// Funktion: Wechselt in den Veto-Modus
window.startVetoPhase = function() {
    const vetoList = document.getElementById('veto-list');
    const gameRef = ref(db, `games/${gameId}/players`);
    
    // Alle Spieler und ihre erledigten Challenges laden
    onValue(gameRef, (snapshot) => {
        const players = snapshot.val();
        vetoList.innerHTML = ""; // Reset
        
        for (let pKey in players) {
            const player = players[pKey];
            if (player.challengesDone) {
                const section = document.createElement('div');
                section.innerHTML = `<h3>${player.name} hat erledigt:</h3>`;
                
                Object.keys(player.challengesDone).forEach(cKey => {
                    const challenge = player.challengesDone[cKey];
                    const vetoCount = challenge.vetos ? Object.keys(challenge.vetos).length : 0;
                    
                    const item = document.createElement('div');
                    item.className = "veto-item";
                    item.innerHTML = `
                        <p>${challenge.text} (Vetos: ${vetoCount})</p>
                        <button onclick="castVeto('${pKey}', '${cKey}')">Veto einlegen!</button>
                    `;
                    section.appendChild(item);
                });
                vetoList.appendChild(section);
            }
        }
    });

    document.getElementById('screen-game').classList.remove('active');
    document.getElementById('screen-veto').classList.add('active');
};

// Funktion: Ein Veto für eine bestimmte Challenge abgeben
window.castVeto = function(playerKey, challengeKey) {
    const vetoRef = ref(db, `games/${gameId}/players/${playerKey}/challengesDone/${challengeKey}/vetos/${myPlayerKey}`);
    set(vetoRef, true); // Markiert, dass du ein Veto gegeben hast
};

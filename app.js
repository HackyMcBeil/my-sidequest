import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// DEINE FIREBASE KONFIGURATION HIER EINFÜGEN
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  databaseURL: "https://DEIN_PROJEKT-default-rtdb.firebaseio.com",
  projectId: "DEIN_PROJEKT",
  storageBucket: "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

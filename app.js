// 1. Firebase SDKs importieren
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// 2. Deine Konfiguration (URL ist bereits drin)
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

// 3. Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 4. Spiel-Variablen
let gameId = "room123"; 
let myPlayerKey = "";
let currentScore = 0;

// CHALLENGES DATENBANK
const CHALLENGES = {
    easy: [
        "Berühre unauffällig dreimal dein linkes Ohr.",
        "Sage in einem Satz das Wort 'Gurkensalat'.",
        "Trinke dein Glas in einem Zug leer.",
        "Stelle eine belanglose Frage über das Wetter.",
        "Gähne einmal laut und deutlich.",
        "Rücke deinen Stuhl zwei Mal hintereinander zurecht.",
        "Putze deine Brille (oder reibe dir die Augen).",
        "Schau kurz auf dein Handy und kichere leise.",
        "Streichle dir nachdenklich über das Kinn.",
        "Verändere deine Sitzposition sehr auffällig."
    ],
    medium: [
        "Laufe einmal grundlos im Kreis durch den Raum.",
        "Tausche mit jemandem (unauffällig) den Platz.",
        "Flüstere eine Nachricht an deinen Nachbarn.",
        "Lache laut über einen Witz, der nicht lustig war.",
        "Benutze das Wort 'fabelhaft' in einem Satz.",
        "Behaupte, du hättest eine Spinne gesehen.",
        "Frage nach der Uhrzeit, trotz Handy in der Hand.",
        "Summe für 10 Sekunden ein bekanntes Lied.",
        "Trinke aus dem Glas einer anderen Person.",
        "Wiederhole das letzte Wort des Vorredners als Frage."
    ],
    hard: [
        "Zieh ein Kleidungsstück falsch herum an.",
        "Behaupte, du hättest ein Klopfen an der Tür gehört.",
        "Mache 5 Liegestütze mitten im Raum.",
        "Verlange, dass alle kurz aufstehen und sich setzen.",
        "Sprich für 2 Minuten mit einem Akzent.",
        "Halte eine 30-sekündige Rede über Wasser.",
        "Setz dich für eine Minute auf den Boden.",
        "Tu so, als hättest du extremen Schluckauf.",
        "Gib jemandem ein übertriebenes High-Five.",
        "Behaupte, ein bekanntes Gesicht im Fenster zu sehen."
    ]
};

let gameState = { cards: [] };

// HILFSFUNKTIONEN
function getRand(lvl) {
    const list = CHALLENGES[lvl];
    return list[Math.floor(Math.random() * list.length)];
}

window.onload = function() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-howto').classList.add('active');
};

window.closeHowTo = function() {
    document.getElementById('screen-howto').classList.remove('active');
    document.getElementById('screen-lobby').classList.add('active');
};

// 5. SPIEL-LOGIK
window.joinGame = function() {
    const name = document.getElementById('username').value;
    if(!name) return alert("Name fehlt!");

    const playerRef = ref(db, `games/${gameId}/players`);
    const newPlayerRef = push(playerRef);
    myPlayerKey = newPlayerRef.key;

    set(newPlayerRef, {
        name: name,
        score: 0
    });

    document.getElementById('display-name').innerText = name;
    listenToGame();
    
    document.getElementById('screen-lobby').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    generateInitialCards();
};

function generateInitialCards() {
    gameState.cards = [
        { id: 1, type: 'easy', text: getRand('easy') },
        { id: 2, type: 'easy', text: getRand('easy') },
        { id: 3, type: 'medium', text: getRand('medium') },
        { id: 4, type: 'medium', text: getRand('medium') },
        { id: 5, type: 'hard', text: getRand('hard') },
        { id: 6, type: 'hard', text: getRand('hard') }
    ];
    renderCards();
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = "";
    gameState.cards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card ${card.type}`;
        div.innerHTML = `
            <small>${card.type.toUpperCase()}</small>
            <p>${card.text}</p>
            <div class="card-actions">
                <button class="btn-skip" onclick="swipe(${index}, false)">Löschen (-2)</button>
                <button class="btn-done" onclick="swipe(${index}, true)">Erledigt!</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.swipe = function(index, success) {
    const card = gameState.cards[index];
    let pts = 0;
    if(success) {
        pts = card.type === 'easy' ? 5 : (card.type === 'medium' ? 10 : 20);
        const doneRef = ref(db, `games/${gameId}/players/${myPlayerKey}/challengesDone`);
        push(doneRef, { text: card.text, type: card.type });
    } else {
        pts = -2;
    }
    currentScore += pts;
    update(ref(db, `games/${gameId}/players/${myPlayerKey}`), { score: currentScore });
    document.getElementById('display-score').innerText = currentScore + " Pkt.";
    gameState.cards[index].text = getRand(card.type);
    renderCards();
};

function listenToGame() {
    onValue(ref(db, `games/${gameId}/players`), (snapshot) => {
        const players = snapshot.val();
        const list = document.getElementById('player-list');
        if(!list) return;
        list.innerHTML = "";
        for (let key in players) {
            const li = document.createElement('li');
            li.innerText = `${players[key].name}: ${players[key].score} Pkt.`;
            list.appendChild(li);
        }
    });
}

// VETO LOGIK
window.startVetoPhase = function() {
    const vetoList = document.getElementById('veto-list');
    onValue(ref(db, `games/${gameId}/players`), (snapshot) => {
        const players = snapshot.val();
        vetoList.innerHTML = "";
        for (let pKey in players) {
            const player = players[pKey];
            if (player.challengesDone) {
                const sec = document.createElement('div');
                sec.innerHTML = `<h3>${player.name}</h3>`;
                Object.keys(player.challengesDone).forEach(cKey => {
                    const c = player.challengesDone[cKey];
                    const vCount = c.vetos ? Object.keys(c.vetos).length : 0;
                    const item = document.createElement('div');
                    item.className = "veto-item";
                    item.innerHTML = `<p>${c.text} (${vCount} Vetos)</p>
                        <button onclick="castVeto('${pKey}', '${cKey}')">Veto!</button>`;
                    sec.appendChild(item);
                });
                vetoList.appendChild(sec);
            }
        }
    });
    document.getElementById('screen-game').classList.remove('active');
    document.getElementById('screen-veto').classList.add('active');
};

window.castVeto = function(pKey, cKey) {
    set(ref(db, `games/${gameId}/players/${pKey}/challengesDone/${cKey}/vetos/${myPlayerKey}`), true);
};

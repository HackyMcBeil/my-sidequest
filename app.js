// Beispiel-Datenbank der Challenges
const CHALLENGES = {
    easy: [
        "Berühre dreimal dein linkes Ohr.",
        "Sage in einem Satz das Wort 'Gurkensalat'.",
        "Trinke dein Glas in einem Zug leer.",
        "Stelle eine Frage über das Wetter."
    ],
    medium: [
        "Laufe einmal grundlos im Kreis.",
        "Tausche mit jemandem (unauffällig) den Platz.",
        "Flüstere eine Nachricht an deinen Nachbarn.",
        "Lache laut über einen Witz, der nicht lustig war."
    ],
    hard: [
        "Zieh ein Kleidungsstück falsch herum an.",
        "Behaupte, du hättest gerade ein Klopfen an der Tür gehört.",
        "Mache 5 Liegestütze mitten im Raum.",
        "Verlange, dass alle kurz aufstehen und sich setzen."
    ]
};

let gameState = {
    user: { name: "", score: 0, done: [] },
    cards: []
};

// Initialisierung: 2 Leicht, 2 Mittel, 2 Schwer
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

function getRand(lvl) {
    const list = CHALLENGES[lvl];
    return list[Math.floor(Math.random() * list.length)];
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
    if(success) {
        let pts = card.type === 'easy' ? 5 : (card.type === 'medium' ? 10 : 20);
        gameState.user.score += pts;
        gameState.user.done.push(card.text);
    } else {
        gameState.user.score -= 2;
    }
    
    // Neue Karte nachrücken
    gameState.cards[index].text = getRand(card.type);
    
    document.getElementById('display-score').innerText = gameState.user.score + " Pkt.";
    renderCards();
};

window.joinGame = function() {
    const name = document.getElementById('username').value;
    if(!name) return alert("Name fehlt!");
    gameState.user.name = name;
    document.getElementById('display-name').innerText = name;
    
    // Wechsel zum Spiel (In echter App erst nach Host-Start)
    document.getElementById('screen-lobby').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    generateInitialCards();
};

window.requestEnd = function() {
    alert("Beenden-Anfrage gesendet (Warte auf 50% der Spieler...)");
    // Hier würde der Firebase-Trigger stehen
};

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

// 4. Spiel-Variablen & Raum-Logik
const urlParams = new URLSearchParams(window.location.search);
let gameId = urlParams.get('room'); 

// Falls kein Raum in der URL ist, erstelle einen neuen Code
if (!gameId) {
    gameId = Math.random().toString(36).substring(2, 8);
}

let myPlayerKey = "";
let currentScore = 0;

// LINK KOPIEREN FUNKTION
window.copyRoomLink = function() {
    const roomLink = window.location.origin + window.location.pathname + "?room=" + gameId;
    navigator.clipboard.writeText(roomLink).then(() => {
        alert("Link kopiert! Schicke ihn deinen Freunden.");
    });
};

// CHALLENGES DATENBANK (Stelle sicher, dass alle Kategorien existieren!)
const CHALLENGES = {
    easy: [
        "Berühre unauffällig dreimal dein linkes Ohr.",
        "Sage in einem Satz das Wort 'Gurkensalat'.",
        "Trinke dein Glas in einem Zug leer."
        // ... hier deine restlichen 100 leichten Aufgaben
    ],
    medium: [
        "Laufe einmal grundlos im Kreis.",
        "Summe ein Lied für 10 Sekunden."
        // ... hier deine 100 mittleren Aufgaben
    ],
    hard: [
        "Mache 5 Liegestütze.",
        "Sprich 2 Minuten mit Akzent."
        // ... hier deine 100 schweren Aufgaben
    ]
};

let gameState = { cards: [] };

// Diese Funktion muss angepasst werden, damit der Link in der Lobby erscheint
window.onload = function() {
    const lobbyStatus = document.getElementById('lobby-status');
    if (lobbyStatus) {
        const linkBox = document.createElement('div');
        linkBox.style = "background: #eee; padding: 10px; border-radius: 8px; margin-bottom: 15px;";
        linkBox.innerHTML = `
            <small>Raum-Code: <strong>${gameId}</strong></small><br>
            <button onclick="copyRoomLink()" style="font-size: 0.8em; padding: 5px 10px;">🔗 Link kopieren</button>
        `;
        lobbyStatus.prepend(linkBox);
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-howto').classList.add('active');
};


// CHALLENGES DATENBANK
const CHALLENGES = {
    easy: [
    "Berühre unauffällig dreimal dein linkes Ohr.",
    "Sage in einem Satz das Wort 'Gurkensalat'.",
    "Trinke dein Glas in einem Zug leer.",
    "Stelle eine belanglose Frage über das Wetter.",
    "Gähne einmal laut und deutlich.",
    "Rücke deinen Stuhl zwei Mal hintereinander zurecht.",
    "Putze deine Brille oder reibe dir intensiv die Augen.",
    "Schau kurz auf dein Handy und kichere leise.",
    "Streichle dir nachdenklich über das Kinn.",
    "Verändere deine Sitzposition sehr auffällig.",
    "Summe für 5 Sekunden eine Melodie leise vor dich hin.",
    "Überprüfe unauffällig, ob dein Atem riecht.",
    "Frage in die Runde: 'Hat jemand mal ein Taschentuch?'",
    "Tippe fünfmal mit dem Fuß im Takt auf den Boden.",
    "Schau auf deine Uhr (oder dein Handy) und schüttle kurz den Kopf.",
    "Ordne die Gegenstände vor dir auf dem Tisch symmetrisch an.",
    "Fahre dir mit der Hand durch die Haare.",
    "Verschränke die Arme und atme tief aus.",
    "Frage jemanden: 'Wann hast du eigentlich Geburtstag?'",
    "Nimm einen Schluck und sage danach leise 'Ahhh'.",
    "Kratze dich am Ellenbogen.",
    "Schau für 10 Sekunden konzentriert an die Decke.",
    "Putze unauffällig mit dem Finger über dein Display.",
    "Lockere deinen Nacken durch Kreisen des Kopfes.",
    "Suche in deiner Tasche nach etwas, das gar nicht da ist.",
    "Zähle laut bis drei, bevor du etwas sagst.",
    "Benutze das Wort 'tatsächlich' zweimal in einem Satz.",
    "Stelle dein Getränk auf die andere Seite von dir.",
    "Strecke deine Beine einmal lang unter dem Tisch aus.",
    "Lies das Etikett einer Flasche sehr aufmerksam durch.",
    "Räusper dich zwei Mal kurz hintereinander.",
    "Zupfe an deinem Ärmel herum.",
    "Frage: 'Ist es hier eigentlich gerade wärmer geworden?'",
    "Halte dein Handy kurz ans Ohr, als würdest du etwas hören.",
    "Wippe für 20 Sekunden leicht mit dem Oberkörper.",
    "Überprüfe, ob deine Schnürsenkel (oder Schuhe) fest sitzen.",
    "Lächle eine Person im Raum grundlos an.",
    "Trommle mit zwei Fingern kurz auf den Tisch.",
    "Sage: 'Interessant...' zu einer Aussage, die gar nicht wichtig war.",
    "Zähle die Fenster im Raum (unauffällig).",
    "Berühre mit der Zungenspitze deine Oberlippe.",
    "Tu so, als hättest du einen Krümel auf deinem Oberteil.",
    "Vergleiche die Füllhöhe von zwei Getränken im Raum.",
    "Schüttle dein Handy kurz, als würde der Empfang schlecht sein.",
    "Frage: 'Habt ihr das auch gerade gehört?'",
    "Puste eine imaginäre Fluse von deiner Schulter.",
    "Verstelle deine Stimme für ein einziges Wort.",
    "Halte inne und schau für 5 Sekunden ins Leere.",
    "Stelle sicher, dass dein Stuhl genau 90 Grad zum Tisch steht.",
    "Knete kurz dein Ohrläppchen.",
    "Sag das Wort 'Logischerweise' in einem Gespräch.",
    "Wische dir über die Stirn, als hättest du geschwitzt.",
    "Spiel kurz mit deinem Ring oder einer Uhr.",
    "Frage: 'Was war nochmal das Thema gerade?'",
    "Klopfe dir unauffällig den Staub von der Hose.",
    "Schau auf deine Handfläche, als hättest du dir was notiert.",
    "Atme einmal sehr hörbar durch die Nase ein.",
    "Sage: 'Muss ja, ne?'",
    "Zupfe an deiner Socke oder rücke sie zurecht.",
    "Stelle dein Glas genau auf den Abdruck, den es hinterlassen hat.",
    "Guck kurz hinter dich, als hätte dich jemand gerufen.",
    "Lobe das Design von irgendetwas im Raum (z.B. eine Lampe).",
    "Knacke mit einem Fingergelenk.",
    "Sperre dein Handy kurz und entsperre es sofort wieder.",
    "Rücke dein Glas 1cm nach links.",
    "Frage jemanden: 'Ist das neu?' (zeige auf ein Kleidungsstück).",
    "Summe den ersten Ton von 'Alle meine Entchen'.",
    "Wische dir imaginären Schweiß von der Oberlippe.",
    "Sage: 'Klassiker!' zu einer völlig normalen Situation.",
    "Guck für 5 Sekunden aus dem Fenster.",
    "Reibe deine Handflächen aneinander.",
    "Prüfe, ob dein Geldbeutel noch in der Tasche ist.",
    "Nimm dein Glas mit der linken Hand (wenn du Rechtshänder bist).",
    "Sage: 'Man kennt es.'",
    "Kratze dich kurz am Kinn.",
    "Schlage die Beine dreimal anders herum übereinander.",
    "Frage: 'Hat jemand Hunger?'",
    "Spiele kurz mit einem Stift oder Feuerzeug.",
    "Rieche kurz an deinem Getränk.",
    "Nicke drei Mal, während jemand anderes redet.",
    "Zieh deine Augenbrauen kurz hoch.",
    "Sage: 'Wie dem auch sei...'",
    "Klopf dir auf die Wangen, um wach zu werden.",
    "Prüfe dein Spiegelbild in einem Fenster oder Display.",
    "Streichle über die Tischkante.",
    "Sage: 'Verrückt eigentlich.'",
    "Zähle die Personen im Raum laut bis 3.",
    "Suche nach einem imaginären Fleck auf dem Boden.",
    "Halte dein Glas für 10 Sekunden fest, ohne zu trinken.",
    "Schau kurz auf deine Fingernägel.",
    "Sage das Wort 'quasi' in einem Satz.",
    "Bewege deine Zehen in den Schuhen (sichtbar).",
    "Frage: 'Geht's euch gut?'",
    "Stütze deinen Kopf für 10 Sekunden auf beide Hände.",
    "Säubere unauffällig eine Stelle auf dem Tisch mit dem Finger.",
    "Sage: 'Schwierig.'",
    "Rieche an deinem Ärmel.",
    "Strecke kurz einen Arm nach oben aus.",
    "Klopfe dreimal leise auf dein Knie.",
    "Sage: 'Kann man machen.'"
],
    medium: [
    "Laufe einmal grundlos im Kreis durch den Raum.",
    "Tausche mit jemandem (unauffällig) den Platz.",
    "Flüstere eine völlig belanglose Nachricht an deinen Nachbarn.",
    "Lache laut über einen Witz, der gar nicht lustig war.",
    "Benutze das Wort 'fabelhaft' dreimal innerhalb von zwei Minuten.",
    "Behaupte, du hättest gerade eine Spinne an der Wand gesehen.",
    "Frage jemanden nach der Uhrzeit, obwohl du dein Handy offen in der Hand hast.",
    "Summe für 10 Sekunden ein bekanntes Lied (z.B. Happy Birthday).",
    "Trinke aus dem Glas einer anderen Person (vorher fragen oder unauffällig).",
    "Wiederhole das letzte Wort, das dein Vorredner gesagt hat, als Frage.",
    "Steh auf, geh zum Fenster, schau raus und komm kopfschüttelnd zurück.",
    "Behaupte, du hättest ein leichtes Pfeifen im Ohr und frag, ob es jemand hört.",
    "Erkläre jemandem für eine Minute ein Hobby, das du gar nicht hast.",
    "Benutze beim Sprechen eine offensichtliche Redewendung falsch.",
    "Stelle dein Getränk auf den Boden statt auf den Tisch.",
    "Fang plötzlich an zu klatschen, weil du 'eine Mücke' fangen wolltest.",
    "Frage in die Runde: 'Riecht es hier nach verbranntem Toast?'",
    "Mach ein Selfie, auf dem man deutlich jemanden im Hintergrund sieht.",
    "Erzähle eine Geschichte, die mittendrin aufhört, und sag 'Ach, egal'.",
    "Verlange von jemandem ein High-Five für eine völlig normale Aussage.",
    "Setz dir für zwei Minuten eine Kapuze oder eine Sonnenbrille auf.",
    "Stelle dein Handy auf volle Lautstärke und lass einen Benachrichtigungston abspielen.",
    "Frage: 'Glaubt ihr eigentlich an Geister?'",
    "Behaupte, du hättest gerade ein Déjà-vu und erzähle, was 'als nächstes passiert'.",
    "Sprich für eine Minute nur in sehr kurzen Sätzen (maximal 3 Wörter).",
    "Frag jemanden: 'Hast du das gerade wirklich so gesagt?' und guck irritiert.",
    "Verteile drei Komplimente an drei verschiedene Personen innerhalb einer Minute.",
    "Trinke dein Getränk mit dem Strohhalm, falls vorhanden, sehr laut leer.",
    "Zitiere eine Songzeile mitten in einem normalen Gespräch.",
    "Halte eine brennende Kerze oder eine Lampe für 10 Sekunden an.",
    "Frag in die Runde: 'Was ist eigentlich euer Lieblings-Dinosaurier?'",
    "Tu so, als hättest du einen Krampf im Fuß und dehne ihn theatralisch.",
    "Erkläre kurz die Vorteile von Leitungswasser gegenüber Mineralwasser.",
    "Sage zu jemandem: 'Du erinnerst mich total an einen jungen [Promi-Name].'",
    "Putze unaufgefordert mit einer Serviette einen kleinen Fleck vom Tisch.",
    "Nimm dein Handy und sag: 'Oh, das muss ich kurz notieren', und tippe wild.",
    "Verändere deine Stimme für einen kompletten Satz (tiefer oder höher).",
    "Frage: 'Hat hier jemand zufällig ein Kartenspiel dabei?'",
    "Singe die ersten drei Wörter eines Werbe-Jingles.",
    "Frag jemanden, ob er/sie dir kurz beim 'Entknoten' einer Kette/eines Bandes hilft.",
    "Behaupte, du hättest heute Nacht von einer der anwesenden Personen geträumt.",
    "Verabschiede dich von jemandem, obwohl du gar nicht gehst.",
    "Sage: 'Ich habe heute irgendwie so viel Energie' und hüpfe einmal.",
    "Frag nach einem Glas Wasser, obwohl du noch ein volles Getränk hast.",
    "Lies die Zutatenliste eines Snacks laut vor.",
    "Behaupte, du hättest heute schon 4 Liter Wasser getrunken.",
    "Frage: 'Was war eigentlich euer erstes Haustier?'",
    "Guck jemanden für 10 Sekunden ununterbrochen an, während er redet.",
    "Sage plötzlich: 'Stopp! Habt ihr das gesehen?' und zeig in eine leere Ecke.",
    "Stelle dein Glas auf den Kopf (wenn es leer ist).",
    "Frag: 'Was ist eigentlich der Unterschied zwischen einem Krokodil und einem Alligator?'",
    "Benutze das Wort 'Antiquiert' in einem Satz.",
    "Sage: 'Ich glaube, ich muss mal wieder zum Friseur', während du deine Haare prüfst.",
    "Lobe die Akustik im Raum.",
    "Frage jemanden nach seinem Sternzeichen und sag 'Ah, dachte ich mir'.",
    "Gib jemandem einen fiktiven Spitznamen und benutze ihn zweimal.",
    "Halte dein Getränk mit beiden Händen fest, wie eine warme Tasse Tee.",
    "Frag: 'Wer von euch würde bei einer Zombie-Apokalypse am längsten überleben?'",
    "Sage: 'Das erinnert mich an eine Szene aus [Filmname]'.",
    "Reibe dir die Hände und sag 'So, jetzt wird's ernst'.",
    "Balanciere einen Gegenstand (Löffel/Stift) kurz auf deinem Finger.",
    "Frag jemanden nach einer Empfehlung für eine Serie, die du schon kennst.",
    "Sage: 'Ich habe heute einen Glückspfennig gefunden'.",
    "Huste drei Mal im selben Rhythmus.",
    "Frage: 'Findet ihr auch, dass [Name] heute besonders strahlt?'",
    "Erzähle kurz von deiner 'Lieblings-App', die völlig nutzlos ist.",
    "Behaupte, du hättest mal einen Promi im Supermarkt getroffen.",
    "Frage: 'Ist das hier eigentlich echtes Holz?' (tippe auf den Tisch).",
    "Sage: 'Ich überlege, mir ein Tattoo von einer Ananas stechen zu lassen'.",
    "Schlage vor, ein kurzes Gruppenfoto zu machen.",
    "Frag: 'Hat jemand von euch mal ein Instrument gespielt?'",
    "Sage: 'Das ist so typisch [dein eigener Vorname]!'",
    "Tu so, als hättest du vergessen, wie ein einfaches Wort heißt (z.B. 'Gabel').",
    "Behaupte, du hättest heute Morgen ein Eichhörnchen gerettet.",
    "Frage: 'Was ist eigentlich euer Lieblings-Monat?'",
    "Sage: 'Ich glaube, mein kleiner Zeh ist eingeschlafen'.",
    "Frag jemanden: 'Würdest du eher 100 Enten-große Pferde bekämpfen oder eine Pferde-große Ente?'",
    "Mache eine kurze Dehnübung für den Rücken.",
    "Sage: 'In diesem Licht siehst du aus wie...'",
    "Frag: 'Wer hat eigentlich die Pizza bestellt?' (auch wenn es keine gibt).",
    "Behaupte, du hättest heute ein neues Wort gelernt und nenne es.",
    "Frag: 'Glaubt ihr, es wird morgen regnen?'",
    "Sage: 'Ich wollte schon immer mal nach Island'.",
    "Tippe mit dem Rhythmus eines Liedes gegen dein Glas.",
    "Frag: 'Hat jemand ein Kaugummi für mich?'",
    "Sage: 'Ich glaube, ich werde heute früh schlafen gehen'.",
    "Frage nach dem WLAN-Passwort, obwohl du mobiles Netz hast.",
    "Sage: 'Das ist eine interessante Farbkombination', während du auf jemanden schaust.",
    "Behaupte, du könntest deine Ohren wackeln (und versuche es erfolglos).",
    "Frag: 'Was war euer peinlichster Moment in der Schule?'",
    "Sage: 'Ich überlege, Vegetarier zu werden – für 24 Stunden'.",
    "Frag jemanden nach der Bedeutung seines Namens.",
    "Sage: 'Ich fühle mich heute so... blau'.",
    "Tu so, als würdest du ein Fernseher-Programm umschalten (mit einer imaginären Fernbedienung).",
    "Frag: 'Was ist das beste Geschenk, das ihr je bekommen habt?'",
    "Sage: 'Ich habe heute irgendwie einen Ohrwurm von den Schlümpfen'.",
    "Erzähle, dass du mal einen Wettbewerb gewonnen hast (erfinde einen).",
    "Frag: 'Wusstet ihr, dass Delfine mit einem offenen Auge schlafen?'",
    "Sage: 'Irgendwie schmeckt dieses Getränk heute besonders... nass'.",
    "Frage in die Runde: 'Soll ich mir einen Schnurrbart wachsen lassen?'"
]
    hard: [
    "Zieh ein Kleidungsstück (z.B. Socke oder Pulli) falsch herum an und warte, bis es jemandem auffällt.",
    "Behaupte steif und fest, du hättest gerade ein lautes Klopfen an der Tür gehört (obwohl niemand da ist).",
    "Mache 5 Liegestütze oder 10 Kniebeugen mitten im Raum ohne Erklärung.",
    "Verlange, dass alle Anwesenden kurz aufstehen und sich einmal im Kreis drehen, bevor du weitersprichst.",
    "Sprich für die nächsten 2 Minuten mit einem deutlichen Akzent (z.B. Französisch, Sächsisch oder US-Englisch).",
    "Halte eine 30-sekündige, leidenschaftliche Rede darüber, warum Wasser eigentlich nass ist.",
    "Setz dich für eine volle Minute auf den Boden statt auf deinen Stuhl, während du normal weiterredest.",
    "Tu so, als hättest du einen extremen, unkontrollierbaren Schluckauf für mindestens 30 Sekunden.",
    "Gib jemandem ein sehr langes, übertriebenes High-Five und halte die Hand danach noch 5 Sekunden fest.",
    "Behaupte, du hättest gerade ein bekanntes Gesicht im Fenster gesehen und schau panisch hinaus.",
    "Behaupte, du hättest dein Handy verloren, während du es gerade benutzt oder in der Hand hältst.",
    "Fang an, ein imaginäres Instrument (z.B. Luftgitarre) für 15 Sekunden sehr intensiv zu spielen.",
    "Frage jemanden völlig ernst: 'Glaubst du, wir sind in einer Simulation?' und diskutiere kurz darüber.",
    "Sage für 2 Minuten nach jedem Satz das Wort 'Over' (wie im Funkverkehr).",
    "Stelle dich für eine Minute in eine Ecke des Raumes und schaue die Wand an.",
    "Behaupte, du hättest gerade eine Textnachricht von einem Geist bekommen.",
    "Versuche, jemandem im Raum eine Versicherung für seinen Stuhl zu verkaufen.",
    "Trage für 5 Minuten deine Schuhe an den Händen oder tausche sie mit den Schuhen von jemand anderem.",
    "Sing den Refrain eines aktuellen Pop-Songs laut und ohne Musikbegleitung.",
    "Verkünde laut: 'Ich habe eine wichtige Durchsage!' und lies dann einen Wikipedia-Artikel über Brot vor.",
    "Frage eine fremde Person (oder jemanden im Raum), ob du ein Foto von ihren Schuhen machen darfst.",
    "Behaupte, du hättest deinen Namen vergessen und frage die anderen, wie du heißt.",
    "Mache ein sehr langsames Kompliment an ein Objekt im Raum (z.B. eine Gabel).",
    "Flüstere für eine Minute alles, was du sagst, egal wie laut die anderen sind.",
    "Tu so, als würdest du mit einer unsichtbaren Person auf dem freien Platz neben dir streiten.",
    "Behaupte, du seist ein Zeitreisender aus dem Jahr 1920 und wundere dich über die Handys.",
    "Versuche, die ganze Gruppe dazu zu bringen, gemeinsam 'Alle meine Entchen' zu singen.",
    "Setz dir einen Kochtopf oder eine Schüssel als Hut auf und trage sie für 2 Minuten.",
    "Verkünde, dass du ab jetzt nur noch in Reimen sprichst (und versuche es für 1 Minute).",
    "Behaupte, du hättest eine Allergie gegen das Wort 'und' und zucke jedes Mal zusammen, wenn es fällt.",
    "Frage jemanden im Raum, ob er/sie deine Hand für 30 Sekunden halten kann, weil du 'Angst' hast.",
    "Erzähle eine dramatische Geschichte darüber, wie du fast von einem Toaster entführt wurdest.",
    "Mache eine dramatische Zeitlupen-Bewegung, wenn du dein Glas zum Mund führst.",
    "Frage jemanden: 'Darf ich mal an deinem Haar riechen?' (und tu es unauffällig).",
    "Verlange, dass dich alle für die nächsten 2 Minuten mit 'Eure Majestät' ansprechen.",
    "Behaupte, du hättest die Fähigkeit, die Zukunft aus Kaffeesatz oder Chips-Krümeln zu lesen.",
    "Tu so, als hättest du einen unsichtbaren Hund an der Leine und stell ihn allen vor.",
    "Sage: 'Ich spüre eine Erschütterung der Macht' und leg dein Ohr auf den Boden.",
    "Frage in die Runde: 'Wusstet ihr, dass ich eigentlich ein Spion bin?' und guck dich misstrauisch um.",
    "Mache ein Tiergeräusch (z.B. lautes Wiehern oder Bellen) in einer Gesprächspause.",
    "Behaupte, du hättest vergessen, wie man sich hinsetzt, und bitte jemanden um Hilfe.",
    "Starte eine La-Ola-Welle im Raum.",
    "Frage jemanden: 'Was würdest du tun, wenn ich jetzt dieses Glas exen würde?' (und tu es dann).",
    "Behaupte, du hättest gerade eine telepathische Nachricht von der Katze des Nachbarn erhalten.",
    "Versuche, die Gruppe davon zu überzeugen, dass der Mond eigentlich aus Käse besteht.",
    "Mache ein sehr ernstes Gesicht und sage: 'Wir müssen über die Pinguine reden.'",
    "Binde dir eine Serviette als Krawatte um und trage sie den Rest des Spiels.",
    "Frage: 'Hat hier jemand meine unsichtbare Brille gesehen?'",
    "Tu so, als würdest du in deinem Glas ein kleines Lebewesen retten.",
    "Sprich für eine Minute nur in Fragen.",
    "Behaupte, du könntest Chinesisch (oder eine andere Sprache) und sag ein paar völlig erfundene Sätze.",
    "Frage jemanden: 'Kannst du mir helfen, meine Aura zu reinigen?'",
    "Tanze für 15 Sekunden ohne Musik in der Mitte des Raumes.",
    "Behaupte, dein Stuhl hätte dich gerade gebissen.",
    "Frage: 'Warum schauen mich alle so an?' (obwohl dich niemand anschaut).",
    "Stelle eine Kerze oder Lampe aus und behaupte, du hättest Angst im Dunkeln.",
    "Sage: 'Ich glaube, ich verwandle mich langsam in einen Werwolf' und schau auf deine Hände.",
    "Versuche, jemandem deinen 'Schatten' für 5 Euro zu verkaufen.",
    "Frage die Runde: 'Soll ich meine Haare grün färben? Stimmt jetzt ab!'",
    "Lies die Rückseite deiner Socken laut vor (oder tu so als ob).",
    "Behaupte, du hättest eine Phobie vor dem Wort 'Sidequest'.",
    "Sage: 'Ich höre Farben und sehe Töne' und schau verwirrt auf dein Getränk.",
    "Frage: 'Darf ich deine Knie taufen?'",
    "Mache ein Geräusch wie eine Kaffeemaschine, wenn du dich bewegst.",
    "Behaupte, du hättest das Rad erfunden.",
    "Frage jemanden: 'Was war dein Name nochmal? Ich kenne dich nur als [erfundener Name].'",
    "Tu so, als würdest du einen unsichtbaren Hut ziehen, wenn jemand den Raum betritt.",
    "Versuche, einen Löffel auf deiner Nase zu balancieren für 10 Sekunden.",
    "Behaupte, du seist der verloren geglaubte König von einem kleinen Land.",
    "Frage: 'Kann mir jemand beibringen, wie man atmet?'",
    "Sage: 'Das ist mein Territorium!' und markiere deinen Platz mit Servietten.",
    "Mache eine 10-sekündige Pause mitten in einem Satz und starr jemanden an.",
    "Behaupte, du hättest gerade eine Vision vom Weltuntergang gehabt.",
    "Frage jemanden: 'Bist du ein Agent von der Regierung?'",
    "Summe die Titelmelodie von 'Star Wars' sehr laut während du trinkst.",
    "Behaupte, du hättest Angst vor runden Objekten.",
    "Versuche, ein ernstes Gespräch über die Rechte von Gartenzwergen zu führen.",
    "Sage: 'Ich glaube, mein linker Arm gehört eigentlich jemand anderem'.",
    "Frage: 'Hat jemand eine Schaufel? Ich muss etwas vergraben.'",
    "Tu so, als würdest du ein Interview mit einer Zimmerpflanze führen.",
    "Behaupte, du könntest durch Wände gehen (und versuche es vorsichtig an einer Tür).",
    "Frage: 'Wie viele Kalorien hat eigentlich diese Luft hier?'",
    "Mache ein Geräusch wie ein Formel-1-Auto, wenn du aufstehst.",
    "Behaupte, du hättest die Fähigkeit, mit Elektrogeräten zu sprechen.",
    "Frage jemanden: 'Darf ich dein Gesicht als Leinwand benutzen?'",
    "Sage: 'Ich fühle mich heute so... majestätisch' und schreite durch den Raum.",
    "Tu so, als würdest du eine unsichtbare Fliege mit Stäbchen fangen.",
    "Behaupte, du hättest einen siebten Sinn für das Alter von Käse.",
    "Frage: 'Wer von euch hat meinen imaginären Freund beleidigt?'",
    "Mache eine dramatische Ohnmacht (sanft auf den Stuhl sinken).",
    "Behaupte, du hättest gerade das Internet gelöscht.",
    "Frage: 'Sind wir schon da?' alle 2 Minuten für insgesamt 3 Mal.",
    "Tu so, als hättest du eine Fernbedienung für die anderen Leute im Raum.",
    "Behaupte, du hättest Angst vor deinem eigenen Schatten.",
    "Frage jemanden: 'Kann ich mir deine Socken für 5 Minuten ausleihen?'",
    "Sage: 'Ich glaube, ich habe gerade meine letzte Gehirnzelle verloren'.",
    "Versuche, jemanden im Raum zu hypnotisieren.",
    "Behaupte, du seist allergisch gegen Sauerstoff.",
    "Frage: 'Ist das hier die Selbsthilfegruppe für Sidequest-Süchtige?'",
    "Mache ein Selfie mit einem Keks oder einem Stück Brot."
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
    
    // Wir zeigen immer die 6 Karten des Stapels
    gameState.cards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card ${card.type}`;
        
        // Punkte berechnen für die Anzeige
        const plusPts = card.type === 'easy' ? '+5' : (card.type === 'medium' ? '+10' : '+20');
        const minusPts = '-2';

        div.innerHTML = `
            <div class="card-text">${card.text}</div>
            <div class="card-ui">
                <div class="ui-element">
                    <span class="symbol-x">✕</span>
                    <span class="points-label">${minusPts}</span>
                </div>
                <div class="ui-element">
                    <span class="symbol-check">✓</span>
                    <span class="points-label">${plusPts}</span>
                </div>
            </div>
        `;

        // Swipe-Logik via Klick (für den Prototyp einfacher als Touch-Gesten)
        div.onclick = (e) => {
            // Wenn man links klickt = löschen, rechts = erledigt
            const rect = div.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) {
                swipe(index, false); // Links
            } else {
                swipe(index, true); // Rechts
            }
        };

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

window.showFinalResult = function() {
    const finalLeaderboard = document.getElementById('final-leaderboard');
    const winnerBanner = document.getElementById('winner-banner');
    const gameRef = ref(db, `games/${gameId}/players`);

    onValue(gameRef, (snapshot) => {
        const players = snapshot.val();
        let results = [];
        let totalPlayers = Object.keys(players).length;

        for (let pKey in players) {
            let player = players[pKey];
            let adjustedScore = 0;
            let invalidCount = 0;

            // Jede erledigte Challenge prüfen
            if (player.challengesDone) {
                Object.values(player.challengesDone).forEach(c => {
                    let vetoCount = c.vetos ? Object.keys(c.vetos).length : 0;
                    
                    // VETO-REGEL: Wenn mehr als 50% der ANDEREN Spieler Veto rufen
                    // (Wir rechnen hier mit 50% der Gesamtspieler als Richtwert)
                    if (vetoCount >= (totalPlayers / 2)) {
                        invalidCount++;
                    } else {
                        // Punkte nur addieren, wenn kein Veto erfolgreich war
                        let pts = c.type === 'easy' ? 5 : (c.type === 'medium' ? 10 : 20);
                        adjustedScore += pts;
                    }
                });
            }

            // Minuspunkte für gelöschte Karten (optional, falls getrackt)
            // Hier nutzen wir der Einfachheit halber den bereinigten Score
            results.push({ 
                name: player.name, 
                score: adjustedScore, 
                invalid: invalidCount 
            });
        }

        // Sortieren nach Score (höchster zuerst)
        results.sort((a, b) => b.score - a.score);

        // Anzeige bauen
        finalLeaderboard.innerHTML = "";
        results.forEach((res, index) => {
            const div = document.createElement('div');
            div.className = "final-rank-item";
            div.innerHTML = `
                <span>${index + 1}. ${res.name} ${index === 0 ? '👑' : ''}</span>
                <span>${res.score} Pkt. <small>(${res.invalid} Vetos)</small></span>
            `;
            finalLeaderboard.appendChild(div);
        });

        // Gewinner-Banner & Wetteinsatz
        const bet = document.getElementById('bet-input').value || "Ehre";
        winnerBanner.innerText = `${results[0].name} gewinnt: ${bet}!`;
    }, { onlyOnce: true });

    document.getElementById('screen-veto').classList.remove('active');
    document.getElementById('screen-final').classList.add('active');
};

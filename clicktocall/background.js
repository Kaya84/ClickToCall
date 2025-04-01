//Imposto come variabili globali perchè così non serve ogni volta ricaricare
let numeroDiTelefono;
let lavoroAgile;

chrome.storage.sync.get(["numeroDiTelefono", "lavoroAgile"], (data) => {
    if (chrome.runtime.lastError) {
        console.err(chrome.runtime.lastError);
        return;
    }
    //imposto le variabili utili
    numeroDiTelefono = data.numeroDiTelefono;
    lavoroAgile = data.lavoroAgile;
    //Se l'utente dichiara di essere in lavoro agile antepongo il 99 al numero di telefono
    if (lavoroAgile) {
        numeroDiTelefono = "99" + numeroDiTelefono;
    }

});

// Crea l'elemento del menu contestuale
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "apriEtichetta",
        title: "Componi numero di telefono (interno non ancora configurato!!!!)",
        contexts: ["selection"],
        enabled: false
    });

    // Controlla lo stato iniziale e aggiorna l'elemento
    aggiornaMenuContestuale();

});

// Funzione per aggiornare il menu contestuale
function aggiornaMenuContestuale() {
    chrome.storage.sync.get(["numeroDiTelefono", "lavoroAgile"], (data) => {
        // Imposta il titolo e abilita/disabilita il menu in base al valore di numeroDiTelefono
        if (data.numeroDiTelefono) {
            const nuovoTitolo = data.numeroDiTelefono.trim() === ""
                 ? "Componi numero di telefono (interno non ancora configurato!!!!)"
                 : "Componi numero di telefono";

            chrome.contextMenus.update("apriEtichetta", {
                title: nuovoTitolo,
                enabled: data.numeroDiTelefono.trim() !== ""
            });
        }
    });
}

// Gestisci il clic sul menu contestuale
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "apriEtichetta" && info.selectionText) {
        var  selection = info.selectionText;

		selection = selection.replace("(+39)","").replace("(0039)","");

        // Crea l'URL usando numeroDiTelefono e la selezione (indipendentemente dal tipo)
        const url = `https://intranet4.sede.comune.rovereto.tn.it/zimbra_ctc/chiama/${numeroDiTelefono}/${encodeURIComponent(selection)}`;

		chrome.windows.create({
		  url: url,
		  type: "popup",
		  width: 600,
		  height: 500
		});

    }
});
// Ascolta modifiche al valore numeroDiTelefono e aggiorna il menu contestuale
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes.numeroDiTelefono) {
        aggiornaMenuContestuale();
    }
});

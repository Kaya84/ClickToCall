//Script specifico per ZIMBRA
const regex = /[\d\+\(][ \d\-\+\.\(\)\/]{6,45}\d\b/g;
//numero interno del chiamante
let numeroDiTelefono;
let lavoroAgile;
let modern;

function parseContacts(target, interno, lavoroAgile) {
    // Seleziona la tabella con l'ID specificato
    const table = document.getElementById(target);

    if (table) {
        // Seleziona tutte le celle (td) della tabella
        const tableCells = table.querySelectorAll("td");

        tableCells.forEach(cell => {
            // Cerca tutte le occorrenze corrispondenti alla regex
            const matches = cell.textContent.match(regex);

            if (matches) {
                // Sostituisce ogni occorrenza con un link
                let updatedContent = cell.textContent;

                matches.forEach(match => {
                    const link = `<a href="https://intranet4.sede.comune.rovereto.tn.it/zimbra_ctc/chiama/${interno}/${encodeURIComponent(match)}" target="_blank">${match}</a>`;
                    updatedContent = updatedContent.replace(match, link);
                });

                // Aggiorna il contenuto HTML della cella
                cell.innerHTML = updatedContent;
            }
        });
    } else {
        console.log("Tabella con ID " + target + " non trovata.");
    }
}


//Nel lauyout modern girano già in formato callto basta mettere a posto il link
function parseContactsModern() {
    // Seleziona la tabella con l'ID specificato
    const links = document.querySelectorAll('.zimbra-client_contacts_card a[href^="tel:"]');
    links.forEach(link => {
		
		const callToNumber = link.getAttribute("href").replace("tel:", "");
		const url = `https://intranet4.sede.comune.rovereto.tn.it/zimbra_ctc/chiama/${numeroDiTelefono}/${encodeURIComponent(callToNumber)}`;

            link.setAttribute("href", url);
            link.setAttribute("onclick", `window.open('${url}', '_blank', 'width=800,height=600,top=100,left=100,noopener,noreferrer'); return false;`);
	});

}

function zimbra() {
    //Colonna elenco contatti base
    const targetId = "zv__CNS-main";
    //Colonna elenco contatti da ricerca
    const targetId2 = "zv__CNS-SR-1";

     findId = false;
     findId2 = false;

    // Funzione per inizializzare il MutationObserver
    const observeClassChanges = (targetElement) => {
        const observer = new MutationObserver((mutationsList) => {
            console.log("MUTAZIONE!");
            parseContacts("ZmContactSplitView_1_details",numeroDiTelefono, false);
            parseContacts("ZmContactSplitView_2_details",numeroDiTelefono, false);

        });

        // Configurazione per osservare gli attributi
        const config = {
            attributes: true, // Osserva le modifiche agli attributi
            attributeFilter: ["class"], // Limita l'osservazione solo agli attributi "class"
            subtree: true, // Osserva tutti i discendenti
        };

        // Avvia l'osservazione
        observer.observe(targetElement, config);
        console.log(`Observer attivato su "${targetId}" per modifiche al parametro "class".`);
    };

    // Controlla se il div con ID "zv__CNS-main" è già presente nel DOM
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        observeClassChanges(targetElement);
    } else {
        // Se il div non è ancora presente, usa un observer per aspettare che venga aggiunto
        const waitObserver = new MutationObserver(() => {
            const dynamicElement = document.getElementById(targetId);
            if (dynamicElement) {
                if (!findId) {

                    console.log(`Elemento con ID "${targetId}" trovato.`);
                    // waitObserver.disconnect(); // Ferma l'osservazione del DOM principale
                    observeClassChanges(dynamicElement); // Avvia l'osservazione per le classi
					parseContacts("ZmContactSplitView_1_details",numeroDiTelefono, false);               
				}
                findId = true;

            }
            const dynamicElement2 = document.getElementById(targetId2);
            if (dynamicElement2) {
                if (!findId2) {
                    console.log(`Elemento con ID "${targetId}" trovato.`);
                    //  waitObserver.disconnect(); // Ferma l'osservazione del DOM principale
                    observeClassChanges(dynamicElement2); // Avvia l'osservazione per le classi
                    parseContacts("ZmContactSplitView_2_details",numeroDiTelefono, false);
                }
                findId2 = true;

            }
			//Se ho trovato 
            if (findId && findId2) {
                waitObserver.disconnect(); // Ferma l'osservazione del DOM principale
				console.log("Dsattivato observer principale");
            }
        });

        // Configurazione per osservare l'intero documento
        waitObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log(`In attesa dell'elemento con ID "${targetId}"...`);
    }

}

/*
Metodo apposito per gestire i link di tipo tel dentro zimbra con interfaccia modern
Mette un observer su tutto il document.
Se un div prende una  classe  valore zimbra-client_contacts_selected allora chiama il Metodo
per sostituire i link di tipo tel
*/
function zimbraModern() {
	// Options for the observer (which mutations to observe)
	const config = { attributes: true, childList: true, subtree: true };

	// Callback function to execute when mutations are observed
	const callback = (mutationList, observer) => {
	  for (const mutation of mutationList) {
		if ( mutation.attributeName &&  mutation.attributeName.includes("class")){
			  console.log(`The ${mutation.target.className} attribute was modified.`);
			  if (mutation.target.className.includes("zimbra-client_contacts_selected")){
					console.log("Ok cambiate la classe in selected quindi dovrebbe funzionare");
					parseContactsModern();
			  }
		}
	  }
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(document, config);
}

//Verifico se sto usando il client modern
//Se uso il client modern devo gestire il callto
//Poi eseguo lo script dopo 4 secondi circa dalla chiamata, per dare tempo ai div di formarsi
chrome.storage.sync.get(["numeroDiTelefono", "lavoroAgile", "modern"], (data) => {
    if (chrome.runtime.lastError) {
        console.err(chrome.runtime.lastError);
        return;
    }
	//imposto le variabili utili
    numeroDiTelefono = data.numeroDiTelefono;
    lavoroAgile = data.lavoroAgile;
	modern = data.modern;
	//Se l'utente dichiara di essere in lavoro agile antepongo il 99 al numero di telefono
	if (lavoroAgile){
		numeroDiTelefono	 = "99" + numeroDiTelefono;
	}
    console.log("Entro nel main check");
    if (modern) {
        //sto usando lil client modern quindi attendo 4 secondi ed avvio
        console.log("Avvio con Client Modern");
        setTimeout(zimbraModern, 4000);
    } else {
        //Non ho zimlet e uso il client web classico, attendo 4 secondi
        console.log("Avvio con Client Classico");
        setTimeout(zimbra, 4000);

    }
});

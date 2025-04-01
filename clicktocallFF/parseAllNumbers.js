const regex = /(\((00|\+)39\)|(00|\+)39)?[\d\+\(][ \d\.\(\)\/\-]{6,15}(?![a-zA-Z])\d\b/g;


//numero interno del chiamante
let numeroDiTelefono;
let lavoroAgile;
let enabled;

function replaceInElement(element, regex, replace) {
    //document.removeEventListener('DOMNodeInserted', nodeInsertedCallBack, false);
    window.removeEventListener('load', nodeInsertedCallBack);
    for (let i = element.childNodes.length; i-- > 0; ) {
        let child = element.childNodes[i];
        if (child.nodeType == 1) { // ELEMENT_NODE
            let tag = child.nodeName.toLowerCase();
            if (tag !== 'style' && tag !== 'script' && tag !== 'a' && tag !== 'input' && tag !== 'textarea') {
                replaceInElement(child, regex, replace);
            }
        } else if (child.nodeType == 3) { // TEXT_NODE
            replaceInText(child, regex, replace);
        }
    }
    window.addEventListener('load', nodeInsertedCallBack);

}

function replaceInText(text, regex, replace) {
    let match;
    let matches = [];
    while (match = regex.exec(text.data)) {
        matches.push(match);
    }
    for (let i = matches.length; i-- > 0; ) {
        match = matches[i];
        text.splitText(match.index);
        text.nextSibling.splitText(match[0].length);
        text.parentNode.replaceChild(replace(match), text.nextSibling);

    }
}

function parsePage() {
    replaceInElement(document.body, regex, replaceInElementCallBack);
    console.log("giro");
}

function nodeInsertedCallBack(event) {
    replaceInElement(event.target, regex, replaceInElementCallBack);
}

function replaceInElementCallBack(match) {
	//Verifico se l'utente ha messo il flag a "lavoro agile " nel caso antempongo il 99 al numero chiamante
	x = match[0].replace(/[\/\-.]/g, '');
	x= x.replace("0039","");
	url =  lavoroAgile ? `https://intranet4.sede.comune.rovereto.tn.it/zimbra_ctc/chiama/99${numeroDiTelefono}/${x}` : `https://intranet4.sede.comune.rovereto.tn.it/zimbra_ctc/chiama/${numeroDiTelefono}/${x}`;
    let link = document.createElement('a');
    link.setAttribute("href", url);
    link.setAttribute("onclick", `window.open('${url}', '_blank', 'width=800,height=600,top=100,left=100,noopener,noreferrer'); return false;`);

    link.style.textDecoration = 'underline';
    link.appendChild(document.createTextNode(match[0]));
    return link;
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.updateData) {
        location.reload();
        parsePage();
    }
    if (request.isEnabled || !request.isEnabled) {
        enabled = request.isEnabled;
        location.reload();
        parsePage();
    }
});

//Abilito il sistema unicamente se è valorizzato
browser.storage.sync.get(["numeroDiTelefono", "lavoroAgile", "parser"], function (data) {
    if (data.parser) {
        console.log("data.parser: " + data.parser);
        numeroDiTelefono = data.numeroDiTelefono;
        lavoroAgile = data.lavoroAgile || false;

        //eseguo lo script un secondo dopo che è tutto aviato
        setTimeout(parsePage, 1000);
    }
});

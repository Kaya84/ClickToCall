console.log("Entro nello script parseTelCallto");
//Modifico tutti gli url che iniziano con Tel: oppure con Callto: e li sostituisco con dei link al nostro clicktocall
if (document.readyState !== 'complete') {
    window.addEventListener('load', afterWindowLoaded);
} else {
    afterWindowLoaded();
}

function afterWindowLoaded() {

    chrome.storage.sync.get(["numeroDiTelefono", "lavoroAgile", "telAndCallto"], function (data) {

        if (data.telAndCallto) {
			
            var numeroDiTelefono = data.numeroDiTelefono || "";
            const lavoroAgile = data.lavoroAgile || false;

            const links = document.querySelectorAll('a[href^="callto:"], a[href^="tel:"], a[href^="Tel:"]');
			

			links.forEach(link => {

                var callToNumber = link.getAttribute("href").replace("callto:", "").replace("tel:", "").replace("Tel:", "");
				callToNumber = callToNumber.replace("(+39)","").replace("(0039)","").replace("+39","");
                const prefisso = lavoroAgile ? "99" : "";
                numeroDiTelefono = prefisso + numeroDiTelefono;

                // Verifica se il testo selezionato è un numero

                // Crea l'URL usando numeroDiTelefono e la selezione (indipendentemente dal tipo)
                const url =  `https://intranet4.sede.comune.rovereto.tn.it/zimbra_ctc/chiama/${numeroDiTelefono}/${callToNumber}`;

                link.setAttribute("href", url);
                link.setAttribute("onclick", `window.open('${url}', '_blank', 'width=800,height=600,top=100,left=100,noopener,noreferrer'); return false;`);

            });
        }
    });
}

// Recupera gli elementi HTML
const inputNumeroDiTelefono = document.getElementById("numeroDiTelefono");
const checkboxLavoroAgile = document.getElementById("lavoroAgile");
const checkboxParser = document.getElementById("parser");
const checkboxTelAndCallto = document.getElementById("telAndCallto");
const checkboxmodern = document.getElementById("modern");
const btnSalva = document.getElementById("salvaButton");


const toggleStatusButton = document.getElementById("toggleStatusButton");
const statusInfo = document.getElementById("statusInfo");

// Carica i valori salvati quando il popup si apre
document.addEventListener("DOMContentLoaded", () => {
  browser.storage.sync.get(["numeroDiTelefono", "lavoroAgile", "parser","telAndCallto","modern"], (data) => {
    inputNumeroDiTelefono.value = data.numeroDiTelefono || "";
    checkboxLavoroAgile.checked = data.lavoroAgile || false;
    checkboxParser.checked = data.parser || false;
    checkboxTelAndCallto.checked = data.telAndCallto || false;
    checkboxmodern.checked = data.modern || false;
  });
});

// Salva i valori quando si clicca su "Salva"
btnSalva.addEventListener("click", () => {
  const numeroDiTelefono = inputNumeroDiTelefono.value.trim();
  const lavoroAgile = checkboxLavoroAgile.checked;
  const telAndCallto = checkboxTelAndCallto.checked;
  const parser = checkboxParser.checked;
  const modern = checkboxmodern.checked;

  browser.storage.sync.set({ numeroDiTelefono, lavoroAgile, parser, telAndCallto, modern }, () => {
    alert("Dati salvati correttamente!");
  });
});

function getHostname(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.hostname;
}

function getFullUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.origin + a.pathname;
}

// Mostra lo stato attuale della pagina corrente
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentUrl = getFullUrl(tabs[0].url);

  browser.storage.sync.get({ excludedUrls: [] }, (data) => {
    const excludedUrls = data.excludedUrls;
    const isExcluded = excludedUrls.includes(currentUrl);

    statusInfo.textContent = isExcluded
      ? "Il plugin è DISATTIVATO su questa pagina."
      : "Il plugin è ATTIVO su questa pagina.";

	if (isExcluded){      
		statusInfo.classList.remove('active');
		statusInfo.classList.add('inactive');
	}else {
		statusInfo.classList.remove('inactive');
		statusInfo.classList.add('active');	
	}
	  
    toggleStatusButton.textContent = isExcluded
      ? "Attiva il plugin per questa pagina"
      : "Disattiva il plugin per questa pagina";

    toggleStatusButton.onclick = () => {
      const updatedList = isExcluded
        ? excludedUrls.filter(url => url !== currentUrl)
        : [...excludedUrls, currentUrl];

      browser.storage.sync.set({ excludedUrls: updatedList }, () => {
        location.reload(); // ricarica il popup per aggiornare stato
      });
	      browser.tabs.reload(tabs[0].id);

    };
  });
});

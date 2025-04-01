// Recupera gli elementi HTML
const inputNumeroDiTelefono = document.getElementById("numeroDiTelefono");
const checkboxLavoroAgile = document.getElementById("lavoroAgile");
const checkboxParser = document.getElementById("parser");
const checkboxTelAndCallto = document.getElementById("telAndCallto");
const checkboxmodern = document.getElementById("modern");
const btnSalva = document.getElementById("salvaButton");

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

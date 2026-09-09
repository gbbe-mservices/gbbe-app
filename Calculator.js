<label for="montant">Montant de l'achat (€) :</label>
<input type="number" id="montant" min="0" step="0.01" style="width: 150px; margin-left: 10px;"/>

<label style="margin-left: 20px;">
  <input type="checkbox" id="avecFrais" />
  Paiement avec frais (montant inchangé)
</label>

<div style="margin-top: 10px; font-weight: bold;">
  Montant à recevoir : <span id="resultat">0.00 €</span>
</div>

<script>
  const montantInput = document.getElementById('montant');
  const fraisCheckbox = document.getElementById('avecFrais');
  const resultatSpan = document.getElementById('resultat');

  function calculerMontant() {
    let montant = parseFloat(montantInput.value);
    if (isNaN(montant) || montant < 0) montant = 0;

    if (fraisCheckbox.checked) {
      // Montant intact si case cochée
      resultatSpan.textContent = montant.toFixed(2) + ' €';
    } else {
      // Ajout de 1% de frais si case non cochée
      const totalAvecFrais = montant + (montant * 0.01);
      resultatSpan.textContent = totalAvecFrais.toFixed(2) + ' €';
    }
  }

  montantInput.addEventListener('input', calculerMontant);
  fraisCheckbox.addEventListener('change', calculerMontant);
</script>

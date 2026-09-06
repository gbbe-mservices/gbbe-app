document.addEventListener('DOMContentLoaded', () => {
  // Sélection des éléments du calculateur
  const amountInput = document.getElementById('transfer-amount');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptFee = document.getElementById('receipt-fee');
  const receiptTotal = document.getElementById('receipt-total');

  const FEE_PERCENT = 0.01; // Taux de frais de 1%

  // Fonction de formatage des montants
  function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  // Calcul dynamique
  function updateCalculations() {
    const val = parseFloat(amountInput.value);

    if (isNaN(val) || val <= 0) {
      receiptAmount.textContent = '0 FCFA';
      receiptFee.textContent = '0 FCFA';
      receiptTotal.textContent = '0 FCFA';
      return;
    }

    const fee = Math.round(val * FEE_PERCENT);
    const total = val + fee;

    receiptAmount.textContent = formatMoney(val);
    receiptFee.textContent = formatMoney(fee);
    receiptTotal.textContent = formatMoney(total);
  }

  if (amountInput) {
    amountInput.addEventListener('input', updateCalculations);
  }

  // Gestion de la sélection visuelle des cartes d'opérateurs
  const setupSelector = (selectorId) => {
    const container = document.getElementById(selectorId);
    if (!container) return;

    const cards = container.querySelectorAll('.op-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  };

  setupSelector('source-selector');
  setupSelector('dest-selector');
});

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('transfer-amount');
  const feeCheckbox = document.getElementById('include-fees');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptFee = document.getElementById('receipt-fee');
  const receiptTotal = document.getElementById('receipt-total');
  const payBtn = id => document.getElementById('btn-pay') || document.querySelector('.pay-btn');
  const form = document.querySelector('form');

  const FEE_PERCENT = 0.01; // 1%

  function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  function updateCalculations() {
    const rawVal = parseFloat(amountInput.value);

    if (isNaN(rawVal) || rawVal <= 0) {
      receiptAmount.textContent = '0 FCFA';
      receiptFee.textContent = '0 FCFA';
      receiptTotal.textContent = '0 FCFA';
      return;
    }

    let fee = 0;
    let netAmount = 0;
    let totalDebit = 0;

    if (feeCheckbox && feeCheckbox.checked) {
      // FRAIS INCLUS : Le client paie le montant exact saisi.
      // Les frais sont déduits du montant reçu.
      totalDebit = rawVal;
      fee = Math.round(rawVal * FEE_PERCENT);
      netAmount = rawVal - fee;

      receiptAmount.textContent = ${formatMoney(netAmount)} (Montant net);
      receiptFee.textContent = ${formatMoney(fee)} (Déduits);
      receiptTotal.textContent = formatMoney(totalDebit);
    } else {
      // FRAIS NON INCLUS : Les frais s'ajoutent au total à débiter.
      netAmount = rawVal;
      fee = Math.round(rawVal * FEE_PERCENT);
      totalDebit = rawVal + fee;

      receiptAmount.textContent = formatMoney(netAmount);
      receiptFee.textContent = formatMoney(fee);
      receiptTotal.textContent = formatMoney(totalDebit);
    }
  }

  // Écouteurs d'événements pour le calculateur
  if (amountInput) amountInput.addEventListener('input', updateCalculations);
  if (feeCheckbox) feeCheckbox.addEventListener('change', updateCalculations);

  // Empêcher le rechargement de page au clic sur "Payer maintenant"
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Empêche le rechargement
      
      const amount = amountInput.value;
      if (!amount || amount <= 0) {
        alert('Veuillez saisir un montant valide.');
        return;
      }

      // Exemple d'action : Message de confirmation (ou redirection)
      alert(Paiement initié avec succès !\nTotal à débiter : ${receiptTotal.textContent});
    });
  }

  // Sélecteur dynamique d'opérateurs
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

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('transfer-amount');
  const feeCheckbox = document.getElementById('include-fees');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptFee = document.getElementById('receipt-fee');
  const receiptTotal = document.getElementById('receipt-total');
  const payBtn = document.getElementById('btn-pay');
  const form = document.querySelector('.checkout-form') || document.querySelector('form');

  const FEE_PERCENT = 0.01; // 1%

  function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  function updateCalculations() {
    if (!amountInput) return;
    
    const rawVal = parseFloat(amountInput.value);

    if (isNaN(rawVal) || rawVal <= 0) {
      if (receiptAmount) receiptAmount.textContent = '0 FCFA';
      if (receiptFee) receiptFee.textContent = '0 FCFA';
      if (receiptTotal) receiptTotal.textContent = '0 FCFA';
      return;
    }

    let fee = Math.round(rawVal * FEE_PERCENT);
    let netAmount = 0;
    let totalDebit = 0;

    if (feeCheckbox && feeCheckbox.checked) {
      // Frais inclus dans le montant saisi : Le client est débité du montant exact saisi
      totalDebit = rawVal;
      netAmount = rawVal - fee;

      if (receiptAmount) receiptAmount.textContent = formatMoney(netAmount);
      if (receiptFee) receiptFee.textContent = formatMoney(fee);
      if (receiptTotal) receiptTotal.textContent = formatMoney(totalDebit);
    } else {
      // Frais NON inclus : Les frais s'ajoutent au-dessus
      netAmount = rawVal;
      totalDebit = rawVal + fee;

      if (receiptAmount) receiptAmount.textContent = formatMoney(netAmount);
      if (receiptFee) receiptFee.textContent = formatMoney(fee);
      if (receiptTotal) receiptTotal.textContent = formatMoney(totalDebit);
    }
  }

  // Écoute de la saisie du montant et de la case à cocher
  if (amountInput) {
    amountInput.addEventListener('input', updateCalculations);
    amountInput.addEventListener('keyup', updateCalculations);
  }

  if (feeCheckbox) {
    feeCheckbox.addEventListener('change', updateCalculations);
  }

  // Gestion du bouton Payer (pour éviter le rechargement de page)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const amount = amountInput ? amountInput.value : 0;
      if (!amount || amount <= 0) {
        alert('Veuillez saisir un montant valide.');
        return;
      }

      alert(Paiement initié !\nTotal à débiter : ${receiptTotal.textContent});
    });
  }

  // Sélection dynamique des cartes d'opérateurs
  const setupSelector = (selectorId) => {
    const container = document.getElementById(selectorId);
    if (!container) return;

    const cards = container.querySelectorAll('.op-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
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

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('transfer-amount');
  const feeCheckbox = document.getElementById('include-fees');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptFee = document.getElementById('receipt-fee');
  const receiptTotal = document.getElementById('receipt-total');

  const FEE_PERCENT = 0.01; // 1%

  function formatMoney(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  function updateCalculations() {
    const val = parseFloat(amountInput.value);

    if (isNaN(val) || val <= 0) {
      receiptAmount.textContent = '0 FCFA';
      receiptFee.textContent = '0 FCFA';
      receiptTotal.textContent = '0 FCFA';
      return;
    }

    // Calcul des frais
    const fee = Math.round(val * FEE_PERCENT);
    
    // Si la case est cochée, on ajoute les frais, sinon le total = le montant saisi
    const total = feeCheckbox.checked ? (val + fee) : val;

    receiptAmount.textContent = formatMoney(val);
    receiptFee.textContent = feeCheckbox.checked ? formatMoney(fee) : '0 FCFA (Inclus/Offerts)';
    receiptTotal.textContent = formatMoney(total);
  }

  if (amountInput) {
    amountInput.addEventListener('input', updateCalculations);
  }

  if (feeCheckbox) {
    feeCheckbox.addEventListener('change', updateCalculations);
  }

  // Sélecteur d'opérateurs
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

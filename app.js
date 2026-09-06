document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('transfer-amount');
  const feeCheckbox = document.getElementById('include-fees');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptFee = document.getElementById('receipt-fee');
  const receiptTotal = document.getElementById('receipt-total');

  const FEE_RATE = 0.01; // 1%

  function formatFCFA(val) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  }

  function calculate() {
    if (!amountInput) return;
    const value = parseFloat(amountInput.value);

    if (isNaN(value) || value <= 0) {
      if (receiptAmount) receiptAmount.textContent = '0 FCFA';
      if (receiptFee) receiptFee.textContent = '0 FCFA';
      if (receiptTotal) receiptTotal.textContent = '0 FCFA';
      return;
    }

    const fee = Math.round(value * FEE_RATE);

    if (feeCheckbox && feeCheckbox.checked) {
      // Frais inclus : Le montant débité reste égal à la valeur saisie
      const net = value - fee;
      if (receiptAmount) receiptAmount.textContent = formatFCFA(net);
      if (receiptFee) receiptFee.textContent = formatFCFA(fee);
      if (receiptTotal) receiptTotal.textContent = formatFCFA(value);
    } else {
      // Frais non inclus : Les frais s'ajoutent au total
      const total = value + fee;
      if (receiptAmount) receiptAmount.textContent = formatFCFA(value);
      if (receiptFee) receiptFee.textContent = formatFCFA(fee);
      if (receiptTotal) receiptTotal.textContent = formatFCFA(total);
    }
  }

  if (amountInput) {
    amountInput.addEventListener('input', calculate);
    amountInput.addEventListener('change', calculate);
  }

  if (feeCheckbox) {
    feeCheckbox.addEventListener('change', calculate);
  }

  // Intercepter le formulaire
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = amountInput ? amountInput.value : 0;
      if (!val || val <= 0) {
        alert('Veuillez entrer un montant valide.');
        return;
      }
      alert(Transaction validée !\nTotal à débiter : ${receiptTotal.textContent});
    });
  }

  // Sélection cartes opérateurs
  const setupOpSelectors = (id) => {
    const group = document.getElementById(id);
    if (!group) return;
    const cards = group.querySelectorAll('.op-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  };

  setupOpSelectors('source-selector');
  setupOpSelectors('dest-selector');
});

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('transfer-amount');
  const feeCheckbox = document.getElementById('include-fees');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptTotal = document.getElementById('receipt-total');
  
  const btnContinue = document.getElementById('btn-continue');
  const confirmModal = document.getElementById('confirm-modal');
  const btnCancel = document.getElementById('btn-cancel');
  const btnConfirm = document.getElementById('btn-confirm');

  const modalAmount = document.getElementById('modal-amount');

  // URL du lien Wave Merchant ou deep link de paiement
  // Remplacez par votre lien Wave direct si vous en possédez un
  const WAVE_PAYMENT_URL = 'https://wave.com/pay'; 

  const FEE_RATE = 0.01; // 1%

  function formatFCFA(val) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' Fcfa';
  }

  function calculate() {
    const rawVal = parseFloat(amountInput.value);

    if (isNaN(rawVal) || rawVal <= 0) {
      receiptAmount.textContent = '0 Fcfa';
      receiptTotal.textContent = '0 Fcfa';
      return;
    }

    const fee = Math.round(rawVal * FEE_RATE);

    if (feeCheckbox.checked) {
      const net = rawVal - fee;
      receiptAmount.textContent = formatFCFA(net);
      receiptTotal.textContent = formatFCFA(rawVal);
    } else {
      const total = rawVal + fee;
      receiptAmount.textContent = formatFCFA(rawVal);
      receiptTotal.textContent = formatFCFA(total);
    }
  }

  amountInput.addEventListener('input', calculate);
  feeCheckbox.addEventListener('change', calculate);

  // Ouverture de la modale
  btnContinue.addEventListener('click', () => {
    const val = parseFloat(amountInput.value);
    if (isNaN(val) || val < 250) {
      alert('Veuillez saisir un montant valide (minimum 250 FCFA).');
      return;
    }

    modalAmount.textContent = formatFCFA(val);
    confirmModal.classList.add('active');
  });

  // Annuler
  btnCancel.addEventListener('click', () => {
    confirmModal.classList.remove('active');
  });

  // Redirection vers Wave
  btnConfirm.addEventListener('click', () => {
    btnConfirm.textContent = 'Redirection...';
    btnConfirm.disabled = true;

    setTimeout(() => {
      window.location.href = WAVE_PAYMENT_URL;
    }, 600);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const sourceNet = document.getElementById('source-network');
  const sourceNum = document.getElementById('source-number');
  const destNet = document.getElementById('dest-network');
  const destNum = document.getElementById('dest-number');

  const amountInput = document.getElementById('transfer-amount');
  const feeCheckbox = document.getElementById('include-fees');

  const summarySrcNet = document.getElementById('summary-src-net');
  const summaryDstNet = document.getElementById('summary-dst-net');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptFee = document.getElementById('receipt-fee');
  const receiptTotal = document.getElementById('receipt-total');

  const btnContinue = document.getElementById('btn-continue');
  const confirmModal = document.getElementById('confirm-modal');
  const btnCancel = document.getElementById('btn-cancel');
  const btnConfirm = document.getElementById('btn-confirm');

  const modalAmount = document.getElementById('modal-amount');
  const modalSrc = document.getElementById('modal-src');
  const modalDst = document.getElementById('modal-dst');
  const modalDstNum = document.getElementById('modal-dst-num');

  const FEE_RATE = 0.01; // 1%

  function formatFCFA(val) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' Fcfa';
  }

  function calculate() {
    // Mettre à jour l'affichage des réseaux
    summarySrcNet.textContent = sourceNet.value;
    summaryDstNet.textContent = destNet.value;

    const rawVal = parseFloat(amountInput.value);

    if (isNaN(rawVal) || rawVal <= 0) {
      receiptAmount.textContent = '0 Fcfa';
      receiptFee.textContent = '0 Fcfa';
      receiptTotal.textContent = '0 Fcfa';
      return;
    }

    const fee = Math.round(rawVal * FEE_RATE);

    if (feeCheckbox.checked) {
      // Cas : Frais pris en charge par l'utilisateur
      // Le destinataire reçoit EXACTEMENT le montant saisi
      // Le total débiter = Montant saisi + 1%
      receiptAmount.textContent = formatFCFA(rawVal);
      receiptFee.textContent = formatFCFA(fee);
      receiptTotal.textContent = formatFCFA(rawVal + fee);
    } else {
      // Cas : Frais déduits du montant transféré
      // Le total débiter = Montant saisi
      // Le destinataire reçoit = Montant saisi - 1%
      const net = Math.max(0, rawVal - fee);
      receiptAmount.textContent = formatFCFA(net);
      receiptFee.textContent = formatFCFA(fee);
      receiptTotal.textContent = formatFCFA(rawVal);
    }
  }

  // Écouteurs d'événements
  sourceNet.addEventListener('change', calculate);
  destNet.addEventListener('change', calculate);
  amountInput.addEventListener('input', calculate);
  feeCheckbox.addEventListener('change', calculate);

  // Validation avant modale
  btnContinue.addEventListener('click', () => {
    const val = parseFloat(amountInput.value);
    
    if (!sourceNum.value.trim()) {
      alert('Veuillez entrer le numéro de téléphone source.');
      return;
    }

    if (!destNum.value.trim()) {
      alert('Veuillez entrer le numéro du destinataire.');
      return;
    }

    if (isNaN(val) || val < 250) {
      alert('Veuillez saisir un montant valide (minimum 250 FCFA).');
      return;
    }

    // Remplir la modale
    modalAmount.textContent = formatFCFA(val);
    modalSrc.textContent = sourceNet.value;
    modalDst.textContent = destNet.value;
    modalDstNum.textContent = destNum.value.trim();

    confirmModal.classList.add('active');
  });

  btnCancel.addEventListener('click', () => {
    confirmModal.classList.remove('active');
  });

  btnConfirm.addEventListener('click', () => {
    btnConfirm.textContent = 'Redirection...';
    btnConfirm.disabled = true;

    // Définition de la redirection selon le réseau source sélectionné
    let redirectUrl = 'https://wave.com/pay';
    if (sourceNet.value === 'Orange') redirectUrl = 'https://orange-money.ci';
    if (sourceNet.value === 'MTN') redirectUrl = 'https://momo.mtn.ci';

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 600);
  });
});

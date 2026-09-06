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
  
  // Modale Standard
  const confirmModal = document.getElementById('confirm-modal');
  const btnCancel = document.getElementById('btn-cancel');
  const btnConfirm = document.getElementById('btn-confirm');
  const modalAmount = document.getElementById('modal-amount');
  const modalSrc = document.getElementById('modal-src');
  const modalDst = document.getElementById('modal-dst');
  const modalDstNum = document.getElementById('modal-dst-num');

  // Modale Orange Money
  const orangeModal = document.getElementById('orange-modal');
  const btnOrangeCancel = document.getElementById('btn-orange-cancel');
  const btnOrangeConfirm = document.getElementById('btn-orange-confirm');
  const omOtpInput = document.getElementById('om-otp-code');

  // URL Marchand Wave officielle
  const WAVE_MERCHANT_URL = 'https://pay.wave.com/m/M_ci_OrrWOYxbonu6/c/ci/';

  const FEE_RATE = 0.01; // 1%

  function formatFCFA(val) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' Fcfa';
  }

  function calculate() {
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
      // Frais à la charge de l'utilisateur : le destinataire reçoit 100% du montant saisi
      receiptAmount.textContent = formatFCFA(rawVal);
      receiptFee.textContent = formatFCFA(fee);
      receiptTotal.textContent = formatFCFA(rawVal + fee);
    } else {
      // Frais déduits du montant transféré
      const net = Math.max(0, rawVal - fee);
      receiptAmount.textContent = formatFCFA(net);
      receiptFee.textContent = formatFCFA(fee);
      receiptTotal.textContent = formatFCFA(rawVal);
    }
  }

  // Écouteurs sur les sélecteurs et champs
  sourceNet.addEventListener('change', calculate);
  destNet.addEventListener('change', calculate);
  amountInput.addEventListener('input', calculate);
  feeCheckbox.addEventListener('change', calculate);

  // Clic sur "Procéder au paiement"
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

    // Aiguillage selon le réseau source sélectionné
    if (sourceNet.value === 'Orange') {
      // Afficher la modale dédiée à Orange Money avec la procédure OTP
      omOtpInput.value = '';
      orangeModal.classList.add('active');
    } else {
      // Afficher la modale standard (Wave / MTN / Moov)
      modalAmount.textContent = formatFCFA(val);
      modalSrc.textContent = sourceNet.value;
      modalDst.textContent = destNet.value;
      modalDstNum.textContent = destNum.value.trim();
      confirmModal.classList.add('active');
    }
  });

  // Fermeture des modales
  btnCancel.addEventListener('click', () => {
    confirmModal.classList.remove('active');
  });

  btnOrangeCancel.addEventListener('click', () => {
    orangeModal.classList.remove('active');
  });

  // Action de confirmation pour Wave / MTN / Moov
  btnConfirm.addEventListener('click', () => {
    btnConfirm.textContent = 'Redirection...';
    btnConfirm.disabled = true;

    setTimeout(() => {
      if (sourceNet.value === 'Wave') {
        window.location.href = WAVE_MERCHANT_URL;
      } else {
        alert('Redirection en cours vers le guichet sécurisé ' + sourceNet.value + '...');
        confirmModal.classList.remove('active');
        btnConfirm.textContent = 'Confirmer & Payer';
        btnConfirm.disabled = false;
      }
    }, 600);
  });

  // Validation du paiement Orange Money avec Code OTP
  btnOrangeConfirm.addEventListener('click', () => {
    const otp = omOtpInput.value.trim();

    if (!otp || otp.length < 4) {
      alert('Veuillez entrer un code d\'autorisation valide (4 à 6 chiffres).');
      return;
    }

    btnOrangeConfirm.textContent = 'Traitement...';
    btnOrangeConfirm.disabled = true;

    setTimeout(() => {
      alert('Paiement Orange Money initié avec succès pour le code ' + otp + ' !');
      orangeModal.classList.remove('active');
      btnOrangeConfirm.textContent = 'Valider le paiement';
      btnOrangeConfirm.disabled = false;
    }, 1200);
  });
});

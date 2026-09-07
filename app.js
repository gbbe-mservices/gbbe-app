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

  const WAVE_MERCHANT_URL = 'https://pay.wave.com/m/M_ci_OrrWOYxbonu6/c/ci/';
  const FEE_RATE = 0.01;

  // Table des préfixes CI (Plan 10 chiffres)
  const PREFIXES = {
    Orange: ['07', '08', '09', '17', '18', '19', '47', '48', '49', '57', '58', '59', '67', '68', '69', '77', '78', '79', '87', '88', '89', '97', '98'],
    MTN: ['04', '05', '06', '14', '15', '16', '44', '45', '46', '54', '55', '56', '64', '65', '66', '74', '75', '76', '84', '85', '86', '94', '95', '96'],
    Moov: ['01', '02', '03', '11', '12', '13', '41', '42', '43', '51', '52', '53', '61', '62', '63', '71', '72', '73', '81', '82', '83', '91', '92', '93']
  };

  function formatFCFA(val) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' Fcfa';
  }

  // Nettoyage du numéro de téléphone (enlève espaces, indicatif +225)
  function cleanPhoneNumber(phone) {
    let clean = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (clean.startsWith('225') && clean.length === 13) {
      clean = clean.substring(3);
    }
    return clean;
  }

  // Validation du numéro selon le réseau
  function validateNetworkNumber(network, phone) {
    const cleanPhone = cleanPhoneNumber(phone);

    if (cleanPhone.length !== 10) {
      return { valid: false, message: Le numéro ${phone} doit comporter exactement 10 chiffres. };
    }

    if (network === 'Wave') {
      // Wave prend tous les numéros valides en Côte d'Ivoire
      const allPrefixes = [...PREFIXES.Orange, ...PREFIXES.MTN, ...PREFIXES.Moov];
      const pref = cleanPhone.substring(0, 2);
      if (!allPrefixes.includes(pref)) {
        return { valid: false, message: Le numéro ${phone} n'est pas un numéro valide en Côte d'Ivoire. };
      }
      return { valid: true };
    }

    const validPrefixes = PREFIXES[network] || [];
    const prefix = cleanPhone.substring(0, 2);

    if (!validPrefixes.includes(prefix)) {
      return { 
        valid: false, 
        message: Le numéro ${phone} ne correspond pas au réseau ${network}. Veuillez saisir un numéro ${network} valide. 
      };
    }

    return { valid: true };
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
      receiptAmount.textContent = formatFCFA(rawVal);
      receiptFee.textContent = formatFCFA(fee);
      receiptTotal.textContent = formatFCFA(rawVal + fee);
    } else {
      const net = Math.max(0, rawVal - fee);
      receiptAmount.textContent = formatFCFA(net);
      receiptFee.textContent = formatFCFA(fee);
      receiptTotal.textContent = formatFCFA(rawVal);
    }
  }

  sourceNet.addEventListener('change', calculate);
  destNet.addEventListener('change', calculate);
  amountInput.addEventListener('input', calculate);
  feeCheckbox.addEventListener('change', calculate);

  // Soumission et Contrôle de cohérence
  btnContinue.addEventListener('click', () => {
    const val = parseFloat(amountInput.value);
    const srcPhone = sourceNum.value.trim();
    const dstPhone = destNum.value.trim();

    if (!srcPhone) {
      alert('Veuillez entrer le numéro de téléphone source.');
      return;
    }

    if (!dstPhone) {
      alert('Veuillez entrer le numéro du destinataire.');
      return;
    }

    // Contrôle numéro Source
    const srcCheck = validateNetworkNumber(sourceNet.value, srcPhone);
    if (!srcCheck.valid) {
      alert('Erreur Réseau Source : ' + srcCheck.message);
      sourceNum.focus();
      return;
    }

    // Contrôle numéro Destination
    const dstCheck = validateNetworkNumber(destNet.value, dstPhone);
    if (!dstCheck.valid) {
      alert('Erreur Réseau Destination : ' + dstCheck.message);
      destNum.focus();
      return;
    }

    if (isNaN(val) || val < 250) {
      alert('Veuillez saisir un montant valide (minimum 250 FCFA).');
      return;
    }

    // Si tout est valide
    if (sourceNet.value === 'Orange') {
      omOtpInput.value = '';
      orangeModal.classList.add('active');
    } else {
      modalAmount.textContent = formatFCFA(val);
      modalSrc.textContent = sourceNet.value;
      modalDst.textContent = destNet.value;
      modalDstNum.textContent = cleanPhoneNumber(dstPhone);
      confirmModal.classList.add('active');
    }
  });

  btnCancel.addEventListener('click', () => {
    confirmModal.classList.remove('active');
  });

  btnOrangeCancel.addEventListener('click', () => {
    orangeModal.classList.remove('active');
  });

  btnConfirm.addEventListener('click', () => {
    btnConfirm.textContent = 'Redirection...';
    btnConfirm.disabled = true;

    setTimeout(() => {
      if (sourceNet.value === 'Wave') {
        window.location.href = WAVE_MERCHANT_URL;
      } else {
        alert('Redirection vers le guichet de paiement ' + sourceNet.value);
        confirmModal.classList.remove('active');
        btnConfirm.textContent = 'Confirmer & Payer';
        btnConfirm.disabled = false;
      }
    }, 600);
  });

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

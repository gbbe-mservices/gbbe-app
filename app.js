document.addEventListener('DOMContentLoaded', function () {
  // Sélection des éléments HTML
  var sourceNet = document.getElementById('source-network');
  var sourceNum = document.getElementById('source-number');
  var destNet = document.getElementById('dest-network');
  var destNum = document.getElementById('dest-number');

  var amountInput = document.getElementById('transfer-amount');
  var feeCheckbox = document.getElementById('include-fees');

  var summarySrcNet = document.getElementById('summary-src-net');
  var summaryDstNet = document.getElementById('summary-dst-net');
  var receiptAmount = document.getElementById('receipt-amount');
  var receiptFee = document.getElementById('receipt-fee');
  var receiptTotal = document.getElementById('receipt-total');

  var btnContinue = document.getElementById('btn-continue');

  // Modales
  var confirmModal = document.getElementById('confirm-modal');
  var btnCancel = document.getElementById('btn-cancel');
  var btnConfirm = document.getElementById('btn-confirm');
  var modalAmount = document.getElementById('modal-amount');
  var modalSrc = document.getElementById('modal-src');
  var modalDst = document.getElementById('modal-dst');
  var modalDstNum = document.getElementById('modal-dst-num');

  var orangeModal = document.getElementById('orange-modal');
  var btnOrangeCancel = document.getElementById('btn-orange-cancel');
  var btnOrangeConfirm = document.getElementById('btn-orange-confirm');
  var omOtpInput = document.getElementById('om-otp-code');

  // Nouveau lien marchand Wave mis à jour
  var WAVE_MERCHANT_URL = 'https://pay.wave.com/m/M_ci_QJOfA_vl3LNC/c/ci/';

  // Préfixes des opérateurs CI (10 chiffres)
  var PREFIXES = {
    Orange: ['07', '08', '09', '17', '18', '19', '47', '48', '49', '57', '58', '59', '67', '68', '69', '77', '78', '79', '87', '88', '89', '97', '98'],
    MTN: ['04', '05', '06', '14', '15', '16', '44', '45', '46', '54', '55', '56', '64', '65', '66', '74', '75', '76', '84', '85', '86', '94', '95', '96'],
    Moov: ['01', '02', '03', '11', '12', '13', '41', '42', '43', '51', '52', '53', '61', '62', '63', '71', '72', '73', '81', '82', '83', '91', '92', '93']
  };

  function formatFCFA(val) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  }

  function cleanPhone(phone) {
    var cleaned = (phone || '').toString().replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (cleaned.indexOf('225') === 0 && cleaned.length === 13) {
      cleaned = cleaned.substring(3);
    }
    return cleaned;
  }

  function validateNumber(network, rawPhone) {
    var phone = cleanPhone(rawPhone);

    if (phone.length !== 10) {
      return { valid: false, msg: 'Le numéro "' + rawPhone + '" doit comporter 10 chiffres.' };
    }

    if (network === 'Wave') {
      var allPref = PREFIXES.Orange.concat(PREFIXES.MTN, PREFIXES.Moov);
      if (allPref.indexOf(phone.substring(0, 2)) === -1) {
        return { valid: false, msg: 'Le numéro "' + rawPhone + '" n\'est pas un numéro valide en Côte d\'Ivoire.' };
      }
      return { valid: true };
    }

    var allowed = PREFIXES[network] || [];
    var prefix = phone.substring(0, 2);

    if (allowed.indexOf(prefix) === -1) {
      return { valid: false, msg: 'Le numéro "' + rawPhone + '" ne correspond pas au réseau ' + network + '.' };
    }

    return { valid: true };
  }

  function calculate() {
    if (summarySrcNet) summarySrcNet.textContent = sourceNet ? sourceNet.value : '';
    if (summaryDstNet) summaryDstNet.textContent = destNet ? destNet.value : '';

    var val = parseFloat(amountInput ? amountInput.value : 0);
    if (isNaN(val) || val <= 0) {
      if (receiptAmount) receiptAmount.textContent = '0 FCFA';
      if (receiptFee) receiptFee.textContent = '0 FCFA';
      if (receiptTotal) receiptTotal.textContent = '0 FCFA';
      return;
    }

    var fee = Math.round(val * 0.01);
    var isChecked = feeCheckbox ? feeCheckbox.checked : false;

    if (isChecked) {
      if (receiptAmount) receiptAmount.textContent = formatFCFA(val);
      if (receiptFee) receiptFee.textContent = formatFCFA(fee);
      if (receiptTotal) receiptTotal.textContent = formatFCFA(val + fee);
    } else {
      var net = Math.max(0, val - fee);
      if (receiptAmount) receiptAmount.textContent = formatFCFA(net);
      if (receiptFee) receiptFee.textContent = formatFCFA(fee);
      if (receiptTotal) receiptTotal.textContent = formatFCFA(val);
    }
  }

  // Écouteurs d'événements
  if (sourceNet) sourceNet.addEventListener('change', calculate);
  if (destNet) destNet.addEventListener('change', calculate);
  if (amountInput) amountInput.addEventListener('input', calculate);
  if (feeCheckbox) feeCheckbox.addEventListener('change', calculate);

  calculate();

  // Soumission
  if (btnContinue) {
    btnContinue.addEventListener('click', function () {
      var val = parseFloat(amountInput ? amountInput.value : 0);
      var srcPhoneRaw = sourceNum ? sourceNum.value.trim() : '';
      var dstPhoneRaw = destNum ? destNum.value.trim() : '';
      var currentSrcNet = sourceNet ? sourceNet.value : '';
      var currentDstNet = destNet ? destNet.value : '';

      if (!srcPhoneRaw) {
        alert('Veuillez entrer le numéro source.');
        if (sourceNum) sourceNum.focus();
        return;
      }

      if (!dstPhoneRaw) {
        alert('Veuillez entrer le numéro destinataire.');
        if (destNum) destNum.focus();
        return;
      }

      var checkSrc = validateNumber(currentSrcNet, srcPhoneRaw);
      if (!checkSrc.valid) {
        alert('Erreur Réseau Source :\n' + checkSrc.msg);
        if (sourceNum) sourceNum.focus();
        return;
      }

      var checkDst = validateNumber(currentDstNet, dstPhoneRaw);
      if (!checkDst.valid) {
        alert('Erreur Réseau Destination :\n' + checkDst.msg);
        if (destNum) destNum.focus();
        return;
      }

      if (isNaN(val) || val < 250) {
        alert('Le montant minimum est de 250 FCFA.');
        if (amountInput) amountInput.focus();
        return;
      }

      if (currentSrcNet === 'Orange') {
        if (omOtpInput) omOtpInput.value = '';
        if (orangeModal) orangeModal.classList.add('active');
      } else {
        if (modalAmount) modalAmount.textContent = formatFCFA(val);
        if (modalSrc) modalSrc.textContent = currentSrcNet;
        if (modalDst) modalDst.textContent = currentDstNet;
        if (modalDstNum) modalDstNum.textContent = cleanPhone(dstPhoneRaw);
        if (confirmModal) confirmModal.classList.add('active');
      }
    });
  }

  // Fermetures modales
  if (btnCancel) {
    btnCancel.addEventListener('click', function () {
      if (confirmModal) confirmModal.classList.remove('active');
    });
  }

  if (btnOrangeCancel) {
    btnOrangeCancel.addEventListener('click', function () {
      if (orangeModal) orangeModal.classList.remove('active');
    });
  }

  // Confirmation Wave / MTN / Moov
  if (btnConfirm) {
    btnConfirm.addEventListener('click', function () {
      btnConfirm.textContent = 'Redirection...';
      btnConfirm.disabled = true;

      setTimeout(function () {
        if (sourceNet && sourceNet.value === 'Wave') {
          window.location.href = WAVE_MERCHANT_URL;
        } else {
          alert('Redirection vers ' + (sourceNet ? sourceNet.value : ''));
          if (confirmModal) confirmModal.classList.remove('active');
          btnConfirm.textContent = 'Confirmer & Payer';
          btnConfirm.disabled = false;
        }
      }, 400);
    });
  }

  // Confirmation OTP Orange
  if (btnOrangeConfirm) {
    btnOrangeConfirm.addEventListener('click', function () {
      var otp = omOtpInput ? omOtpInput.value.trim() : '';

      if (!otp || otp.length < 4) {
        alert('Veuillez entrer un code OTP valide à 4 ou 6 chiffres.');
        if (omOtpInput) omOtpInput.focus();
        return;
      }

      btnOrangeConfirm.textContent = 'Traitement...';
      btnOrangeConfirm.disabled = true;

      setTimeout(function () {
        alert('Code OTP ' + otp + ' pris en compte avec succès.');
        if (orangeModal) orangeModal.classList.remove('active');
        btnOrangeConfirm.textContent = 'Valider le paiement';
        btnOrangeConfirm.disabled = false;
      }, 800);
    });
  }
});

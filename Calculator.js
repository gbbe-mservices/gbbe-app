const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_QJOfA_vl3LNC/c/ci/";

document.addEventListener('DOMContentLoaded', () => {
  const sourceNet = document.getElementById('sourceNet');
  const payBtn = document.getElementById('payButton');
  const amountInput = document.getElementById('txAmount');
  const feesToggle = document.getElementById('payFeesToggle');

  if (sourceNet) {
    sourceNet.addEventListener('change', () => {
      updateUI();
      calculateTotal();
    });
  }

  if (amountInput) {
    amountInput.addEventListener('input', calculateTotal);
  }

  if (feesToggle) {
    feesToggle.addEventListener('change', calculateTotal);
  }

  if (payBtn) {
    payBtn.addEventListener('click', processTransaction);
  }

  calculateTotal();
});

function updateUI() {
  const source = document.getElementById('sourceNet').value;
  const btn = document.getElementById('payButton');

  if (source === 'wave') {
    btn.className = "w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-slate-950 bg-sky-400 hover:bg-sky-300 shadow-sky-400/20";
    btn.textContent = "Payer avec Wave 🌊";
  } else if (source === 'om') {
    btn.className = "w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-white bg-orange-500 hover:bg-orange-400 shadow-orange-500/20";
    btn.textContent = "Payer avec Orange Money 🟠";
  } else if (source === 'momo') {
    btn.className = "w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-yellow-400/20";
    btn.textContent = "Payer avec MTN MoMo 🟡";
  } else if (source === 'moov') {
    btn.className = "w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-white bg-blue-600 hover:bg-blue-500 shadow-blue-600/20";
    btn.textContent = "Payer avec Moov Money 🔵";
  }
}

function calculateTotal() {
  const amountInput = document.getElementById('txAmount');
  const feesToggle = document.getElementById('payFeesToggle');
  const feeDisplay = document.getElementById('feeDisplay');
  const totalDisplay = document.getElementById('totalDisplay');

  if (!amountInput || !feeDisplay || !totalDisplay) return;

  const rawVal = amountInput.value.trim();
  if (rawVal === "" || parseFloat(rawVal) <= 0) {
    feeDisplay.textContent = "0 FCFA";
    totalDisplay.textContent = "0 FCFA";
    return;
  }

  const amount = parseFloat(rawVal);
  let total = amount;
  let text = "0 FCFA";

  if (feesToggle.checked) {
    // Si coché : Ajout des frais (1% min 100 FCFA)
    const fees = Math.max(100, Math.round(amount * 0.01));
    total = amount + fees;
    text = "+" + fees.toLocaleString('fr-FR') + " FCFA (+1%)";
  } else {
    // Sinon : Réduction de 1%
    const discount = Math.round(amount * 0.01);
    total = amount - discount;
    text = "-" + discount.toLocaleString('fr-FR') + " FCFA (-1%)";
  }

  feeDisplay.textContent = text;
  totalDisplay.textContent = total.toLocaleString('fr-FR') + " FCFA";
}

function checkNetworkPrefix(network, phone) {
  if (!phone || phone.length !== 10) return false;
  const p = phone.substring(0, 2);

  if (network === 'om') return ['07', '08', '09'].includes(p);
  if (network === 'momo') return p === '05';
  if (network === 'moov') return ['01', '02'].includes(p);
  if (network === 'wave') return ['01', '02', '05', '07', '08', '09'].includes(p);
  return true;
}

function processTransaction() {
  const sourceNet = document.getElementById('sourceNet').value;
  const sourcePhone = document.getElementById('sourcePhone').value.trim();
  const destNet = document.getElementById('destNet').value;
  const destPhone = document.getElementById('destPhone').value.trim();
  const amount = document.getElementById('txAmount').value;

  const sourceErr = document.getElementById('sourceError');
  const destErr = document.getElementById('destError');

  sourceErr.classList.add('hidden');
  destErr.classList.add('hidden');

  let hasError = false;

  if (!checkNetworkPrefix(sourceNet, sourcePhone)) {
    sourceErr.textContent = ⚠️ Le numéro saisi ne correspond pas au réseau ${sourceNet.toUpperCase()}.;
    sourceErr.classList.remove('hidden');
    hasError = true;
  }

  if (!checkNetworkPrefix(destNet, destPhone)) {
    destErr.textContent = `⚠️ Le numéro saisi ne correspond pas au réseau ${destNet.toUpperCase()}.`;
    destErr.classList.remove('hidden');
    hasError = true;
  }

  if (!amount || amount < 250) {
    alert("Veuillez saisir un montant d'au moins 250 FCFA.");
    return;
  }

  if (hasError) return;

  if (sourceNet === 'wave') {
    window.location.href = WAVE_PAYMENT_URL;
  } else {
    alert(`Transaction de ${amount} FCFA enregistrée.\nRedirection vers le guichet de paiement ${sourceNet.toUpperCase()}...)`;
  }
}

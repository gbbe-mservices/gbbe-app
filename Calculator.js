const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_QJOfA_vl3LNC/c/ci/";

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  const sourceNet = document.getElementById('sourceNet');
  const payBtn = document.getElementById('payButton');
  const amountInput = document.getElementById('txAmount');

  // Écouteur pour la modification du montant (clavier + flèches)
  if (amountInput) {
    amountInput.addEventListener('input', calculateTotal);
    amountInput.addEventListener('keyup', calculateTotal);
    amountInput.addEventListener('change', calculateTotal);
  }

  // Écouteur pour la modification du réseau
  if (sourceNet) {
    sourceNet.addEventListener('change', () => {
      updateCalculatorUI();
      calculateTotal();
    });
  }

  // Écouteur pour le bouton de paiement
  if (payBtn) {
    payBtn.addEventListener('click', handlePaymentSubmit);
  }

  // Calcul initial
  calculateTotal();
});

// Calcul dynamique des frais et du montant total
function calculateTotal() {
  const amountInput = document.getElementById('txAmount');
  const feeDisplay = document.getElementById('feeDisplay');
  const totalDisplay = document.getElementById('totalDisplay');

  if (!amountInput || !feeDisplay || !totalDisplay) return;

  const amount = parseFloat(amountInput.value) || 0;
  
  let fees = 0;
  if (amount > 0) {
    // Règle de frais : 1% du montant avec un minimum de 100 FCFA
    fees = Math.max(100, Math.round(amount * 0.01));
  }

  const total = amount + fees;

  feeDisplay.textContent = fees.toLocaleString('fr-FR') + " FCFA";
  totalDisplay.textContent = total.toLocaleString('fr-FR') + " FCFA";
}

// Adaptation visuelle du bouton selon l'opérateur
function updateCalculatorUI() {
  const source = document.getElementById('sourceNet').value;
  const btn = document.getElementById('payButton');

  if (!btn) return;

  if (source === 'wave') {
    btn.className = "w-full py-4 rounded-xl font-bold text-base transition-all shadow-md bg-sky-400 hover:bg-sky-500 text-slate-950";
    btn.textContent = "Payer avec Wave 🌊";
  } else if (source === 'om') {
    btn.className = "w-full py-4 rounded-xl font-bold text-base transition-all shadow-md bg-orange-500 hover:bg-orange-600 text-white";
    btn.textContent = "Payer avec Orange Money 🟠";
  } else if (source === 'momo') {
    btn.className = "w-full py-4 rounded-xl font-bold text-base transition-all shadow-md bg-yellow-400 hover:bg-yellow-500 text-slate-950";
    btn.textContent = "Payer avec MTN MoMo 🟡";
  } else if (source === 'moov') {
    btn.className = "w-full py-4 rounded-xl font-bold text-base transition-all shadow-md bg-blue-600 hover:bg-blue-700 text-white";
    btn.textContent = "Payer avec Moov Money 🔵";
  }
}

// Vérification des préfixes réseau CI
function checkNetworkPrefix(network, phone) {
  if (!phone || phone.length !== 10) return false;
  const prefix = phone.substring(0, 2);

  if (network === 'om') return ['07', '08', '09'].includes(prefix);
  if (network === 'momo') return prefix === '05';
  if (network === 'moov') return ['01', '02'].includes(prefix);
  if (network === 'wave') return ['01', '02', '05', '07', '08', '09'].includes(prefix);
  return true;
}

// Soumission et validation de la transaction
function handlePaymentSubmit() {
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
    sourceErr.textContent = ⚠️ Numéro invalide pour le réseau ${sourceNet.toUpperCase()}.;
    sourceErr.classList.remove('hidden');
    hasError = true;
  }

  if (!checkNetworkPrefix(destNet, destPhone)) {
    destErr.textContent = ⚠️ Numéro invalide pour le réseau ${destNet.toUpperCase()}.;
    destErr.classList.remove('hidden');
    hasError = true;
  }

  if (!amount || amount < 250) {
    alert("Veuillez entrer un montant d'au moins 250 FCFA.");
    return;
  }

  if (hasError) return;

  if (sourceNet === 'wave') {
    window.location.href = WAVE_PAYMENT_URL;
  } else {
    alert(Transaction de ${amount} FCFA initialisée.\nRedirection vers le guichet ${sourceNet.toUpperCase()}...);
  }
}

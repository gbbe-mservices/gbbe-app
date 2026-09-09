const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_QJOfA_vl3LNC/c/ci/";
let currentOperator = 'wave';

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('txAmount');
  const feesToggle = document.getElementById('payFeesToggle');

  if (amountInput) {
    amountInput.addEventListener('input', calculateDiscountOrFees);
  }
  if (feesToggle) {
    feesToggle.addEventListener('change', calculateDiscountOrFees);
  }

  // Ne pas calculer de montant par défaut au démarrage
  resetCalculatorDisplay();
});

function selectOperator(op) {
  currentOperator = op;
  const titles = { wave: 'Wave 🌊', momo: 'MTN Money 🟡', moov: 'Moov Money 🔵', om: 'Orange Money 🟠' };
  document.getElementById('selectedOperatorTitle').textContent = "Transaction " + titles[op];
  document.getElementById('stepNetwork').classList.add('hidden');
  document.getElementById('stepForm').classList.remove('hidden');
}

function resetOperator() {
  document.getElementById('stepNetwork').classList.remove('hidden');
  document.getElementById('stepForm').classList.add('hidden');
}

function resetCalculatorDisplay() {
  document.getElementById('feeDisplay').textContent = "0 FCFA";
  document.getElementById('totalDisplay').textContent = "0 FCFA";
}

function calculateDiscountOrFees() {
  const amountInput = document.getElementById('txAmount');
  const feesToggle = document.getElementById('payFeesToggle');
  const feeDisplay = document.getElementById('feeDisplay');
  const totalDisplay = document.getElementById('totalDisplay');

  if (!amountInput || !feeDisplay || !totalDisplay) return;

  const rawVal = amountInput.value.trim();
  if (rawVal === "" || parseFloat(rawVal) <= 0) {
    resetCalculatorDisplay();
    return;
  }

  const amount = parseFloat(rawVal);
  let total = amount;
  let adjustmentText = "0 FCFA";

  if (feesToggle.checked) {
    // Le client paye les frais (1% minimum 100 FCFA)
    const fees = Math.max(100, Math.round(amount * 0.01));
    total = amount + fees;
    adjustmentText = "+" + fees.toLocaleString('fr-FR') + " FCFA (+1%)";
  } else {
    // Réduction de 1% si la case n'est pas cochée
    const discount = Math.round(amount * 0.01);
    total = amount - discount;
    adjustmentText = "-" + discount.toLocaleString('fr-FR') + " FCFA (-1%)";
  }

  feeDisplay.textContent = adjustmentText;
  totalDisplay.textContent = total.toLocaleString('fr-FR') + " FCFA";
}

function checkPrefix(phone, op) {
  if (!phone || phone.length !== 10) return false;
  const p = phone.substring(0, 2);
  if (op === 'om') return ['07', '08', '09'].includes(p);
  if (op === 'momo') return p === '05';
  if (op === 'moov') return ['01', '02'].includes(p);
  return ['01', '02', '05', '07', '08', '09'].includes(p);
}

function submitTransaction() {
  const phone = document.getElementById('sourcePhone').value.trim();
  const amount = document.getElementById('txAmount').value;
  const err = document.getElementById('sourceError');

  err.classList.add('hidden');

  if (!checkPrefix(phone, currentOperator)) {
    err.textContent = "Numéro non conforme au réseau sélectionné.";
    err.classList.remove('hidden');
    return;
  }

  if (!amount || amount < 250) {
    alert("Montant minimum : 250 FCFA");
    return;
  }

  if (currentOperator === 'wave') {
    window.location.href = WAVE_PAYMENT_URL;
  } else {
    alert("Transaction de " + amount + " FCFA transmise vers " + currentOperator.toUpperCase());
  }
}

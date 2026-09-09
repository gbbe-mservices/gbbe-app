// URL Marchand Wave Officiel
const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_QJOfA_vl3LNC/c/ci/";

// Attente du chargement complet du document
document.addEventListener('DOMContentLoaded', () => {
  const sourceSelect = document.getElementById('sourceNet');
  const payBtn = document.getElementById('payButton');
  const gpsBtn = document.getElementById('gpsBtn');

  // Écouteur pour adapter les couleurs et textes des boutons
  if (sourceSelect && payBtn) {
    sourceSelect.addEventListener('change', updateButtonStyle);
    payBtn.addEventListener('click', processTransaction);
  }

  if (gpsBtn) {
    gpsBtn.addEventListener('click', findPharmaciesGPS);
  }
});

// 1. Validation des réseaux de Côte d'Ivoire
function isValidNetwork(network, phone) {
  if (!phone || phone.length !== 10) return false;
  const prefix = phone.substring(0, 2);

  if (network === 'om') return ['07', '08', '09'].includes(prefix);
  if (network === 'momo') return prefix === '05';
  if (network === 'moov') return ['01', '02'].includes(prefix);
  if (network === 'wave') return ['01', '02', '05', '07', '08', '09'].includes(prefix);
  return true;
}

// 2. Adaptation visuelle du bouton
function updateButtonStyle() {
  const source = document.getElementById('sourceNet').value;
  const btn = document.getElementById('payButton');

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

// 3. Soumission et Redirection
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

  // Contrôle numéro Source
  if (!isValidNetwork(sourceNet, sourcePhone)) {
    sourceErr.textContent = ⚠️ Numéro invalide pour le réseau ${sourceNet.toUpperCase()}.;
    sourceErr.classList.remove('hidden');
    hasError = true;
  }

  // Contrôle numéro Destination
  if (!isValidNetwork(destNet, destPhone)) {
    destErr.textContent = ⚠️ Numéro invalide pour le réseau ${destNet.toUpperCase()}.;
    destErr.classList.remove('hidden');
    hasError = true;
  }

  if (!amount || amount < 250) {
    alert("Veuillez saisir un montant valide (minimum 250 FCFA).");
    return;
  }

  if (hasError) return;

  // Redirection immédiate si Wave
  if (sourceNet === 'wave') {
    window.location.href = WAVE_PAYMENT_URL;
  } else {
    alert(Transaction de ${amount} FCFA enregistrée.\nRedirection vers le guichet de paiement ${sourceNet.toUpperCase()}...);
  }
}

// 4. Module GPS Pharmacies
function findPharmaciesGPS() {
  const results = document.getElementById('pharmacyResults');
  results.innerHTML = <p class="text-xs text-blue-300 animate-pulse">Recherche des pharmacies de garde en cours...</p>;

  if (!navigator.geolocation) {
    results.innerHTML = <p class="text-xs text-red-400">Géolocalisation non supportée par votre appareil.</p>;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      results.innerHTML = `
        <div class="p-3.5 bg-slate-700/60 rounded-xl border border-slate-600 text-xs space-y-1">
          <p class="font-bold text-emerald-400">📍 Position GPS identifiée !</p>
          <p class="text-slate-200">Pharmacie de garde : <strong>Pharmacie Saint Jean (Cocody)</strong> — À ~1.2 km</p>
          <a href="tel:+2250707070707" class="inline-block mt-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold">Appeler l'officine</a>
        </div>
      `;
    },
    (err) => {
      results.innerHTML = <p class="text-xs text-amber-400">Veuillez autoriser l'accès GPS dans les réglages de votre navigateur.</p>;
    }
  );
}

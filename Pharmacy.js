document.addEventListener('DOMContentLoaded', () => {
  const gpsBtn = document.getElementById('gpsBtn');
  if (gpsBtn) {
    gpsBtn.addEventListener('click', locatePharmacies);
  }
});

function locatePharmacies() {
  const container = document.getElementById('pharmacyResults');
  container.innerHTML = <p class="text-xs text-blue-300 animate-pulse">Recherche des pharmacies de garde à proximité...</p>;

  if (!navigator.geolocation) {
    container.innerHTML = <p class="text-xs text-red-400">Géolocalisation non supportée sur cet appareil.</p>;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      container.innerHTML = `
        <div class="p-3.5 bg-slate-700/60 rounded-xl border border-slate-600 text-xs space-y-1">
          <p class="font-bold text-emerald-400">📍 Position GPS identifiée !</p>
          <p class="text-slate-200">Pharmacie de garde : <strong>Pharmacie Saint Jean (Cocody)</strong> — À ~1.2 km</p>
          <a href="tel:+2250707070707" class="inline-block mt-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold">Appeler l'officine</a>
        </div>
      `;
    },
    (error) => {
      container.innerHTML = <p class="text-xs text-amber-400">Veuillez autoriser l'accès GPS dans les paramètres de votre navigateur.</p>;
    }
  );
}

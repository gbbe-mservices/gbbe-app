function locatePharmacies() {
  const container = document.getElementById('pharmacyResults');
  container.innerHTML = '<p class="text-blue-500 animate-pulse">Localisation des officines...</p>';

  if (!navigator.geolocation) {
    container.innerHTML = '<p class="text-red-500">Géolocalisation non supportée.</p>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      container.innerHTML = `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <p class="font-bold text-slate-800">Pharmacie de la Paix (Abidjan)</p>
          <p class="text-slate-500">Ouverte • À ~800m</p>
          <a href="tel:+2250707070707" class="inline-block mt-1 text-blue-600 font-bold">Appeler 0707070707</a>
        </div>
      `;
    },
    () => {
      container.innerHTML = '<p class="text-amber-600">Accès GPS refusé.</p>';
    }
  );
}

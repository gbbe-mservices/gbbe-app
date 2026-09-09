// Liste complète des pharmacies affichées automatiquement sans GPS
const ALL_PHARMACIES = [
  { name: "Pharmacie Avenir Santé (ex- K Boilot)", location: "Agnibilékrou — Face Grande Mosquée Dioulakro", phone: "0140744920" },
  { name: "Pharmacie Du Marché", location: "Abengourou — Place du grand marché à côté de Telecel", phone: "2735913009" },
  { name: "Pharmacie Providence (Nvl)", location: "Abengourou — Quartier Plateau face station Petroci", phone: "2735900900" },
  { name: "Pharmacie Ste Famille", location: "Abengourou — Près Hôtel le Royaume", phone: "0708188204" },
  { name: "Pharmacie Saint Jean", location: "Abidjan (Cocody) — Boulevard de France", phone: "0707070701" },
  { name: "Pharmacie du Boulevard", location: "Abidjan (Plateau) — Avenue Chardy", phone: "0707070702" },
  { name: "Pharmacie des Grâces", location: "Abidjan (Yopougon) — Face SOTRA", phone: "0707070703" }
];

document.addEventListener('DOMContentLoaded', () => {
  displayPharmacies(ALL_PHARMACIES);
});

function displayPharmacies(list) {
  const container = document.getElementById('pharmacyResults');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400 text-center py-2">Aucune pharmacie trouvée.</p>';
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
      <div>
        <p class="font-bold text-slate-800 text-xs">${p.name}</p>
        <p class="text-[11px] text-slate-500">${p.location}</p>
        <p class="text-[11px] font-semibold text-blue-600 mt-0.5">${p.phone}</p>
      </div>
      <a href="tel:${p.phone}" class="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl font-bold text-xs shrink-0 flex items-center justify-center">
        📞
      </a>
    </div>
  `).join('');
}

function filterPharmacies() {
  const query = document.getElementById('pharmacySearch').value.toLowerCase().trim();
  const filtered = ALL_PHARMACIES.filter(p => 
    p.name.toLowerCase().includes(query) || p.location.toLowerCase().includes(query)
  );
  displayPharmacies(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  // Sélection des éléments HTML
  const amountInput = document.querySelector('input[type="number"]');
  const receiptAmount = document.querySelector('.receipt-row:nth-child(1) .val');
  const receiptFees = document.querySelector('.receipt-row:nth-child(2) .val');
  const receiptTotal = document.querySelector('.val-total');

  // Taux de frais de service (1%)
  const FEE_RATE = 0.01;

  // Fonction de formatage des montants (ex: 5 000 FCFA)
  function formatFCFA(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  // Fonction de calcul et mise à jour du reçu
  function calculateTotal() {
    const rawValue = parseFloat(amountInput.value);

    if (isNaN(rawValue) || rawValue <= 0) {
      receiptAmount.textContent = '0 FCFA';
      receiptFees.textContent = '0 FCFA';
      receiptTotal.textContent = '0 FCFA';
      return;
    }

    const fees = Math.round(rawValue * FEE_RATE);
    const total = rawValue + fees;

    receiptAmount.textContent = formatFCFA(rawValue);
    receiptFees.textContent = formatFCFA(fees);
    receiptTotal.textContent = formatFCFA(total);
  }

  // Écoute de la saisie dans le champ du montant
  if (amountInput) {
    amountInput.addEventListener('input', calculateTotal);
  }

  // Gestion des clics sur les cartes d'opérateurs
  const opGroups = document.querySelectorAll('.operator-selector');
  opGroups.forEach(group => {
    const cards = group.querySelectorAll('.op-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  });
});
function varnoStevilo(vrednost, privzeto = 0) {
  const stevilka = Number(vrednost);
  return Number.isFinite(stevilka) ? stevilka : privzeto;
}

export function normalizirajDelezOgrevanja(vrednost) {
  const delez = varnoStevilo(vrednost, 0);
  if (delez < 0) return 0;
  if (delez > 1) return 1;
  return Number(delez.toFixed(4));
}

export function razdeliOgrevanjePoSobah(znesek, sobe = []) {
  const ciljniZnesek = Math.max(0, varnoStevilo(znesek, 0));
  const veljavneSobe = (sobe ?? []).filter((s) => s?.id);

  if (veljavneSobe.length === 0) return new Map();
  if (ciljniZnesek === 0) {
    return new Map(veljavneSobe.map((s) => [s.id, 0]));
  }

  const razdelitev = veljavneSobe.map((soba) => {
    const delez = normalizirajDelezOgrevanja(soba.faktor_ogrevanja);
    const strosek = Number((ciljniZnesek * delez).toFixed(2));
    return [soba.id, strosek];
  });

  return new Map(razdelitev);
}

// Backward-compat: obstoječa koda še vedno uporablja staro ime.
export const normalizirajFaktorOgrevanja = normalizirajDelezOgrevanja;

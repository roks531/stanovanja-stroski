function varnoStevilo(vrednost, privzeto = 0) {
  const stevilka = Number(vrednost);
  return Number.isFinite(stevilka) ? stevilka : privzeto;
}

export function normalizirajFaktorOgrevanja(vrednost) {
  const faktor = varnoStevilo(vrednost, 1);
  return faktor >= 0 ? faktor : 1;
}

export function razdeliOgrevanjePoSobah(znesek, sobe = []) {
  const ciljniZnesek = Math.max(0, varnoStevilo(znesek, 0));
  const ciljCenti = Math.round(ciljniZnesek * 100);
  const veljavneSobe = (sobe ?? []).filter((s) => s?.id);

  if (veljavneSobe.length === 0) return new Map();
  if (ciljCenti === 0) {
    return new Map(veljavneSobe.map((s) => [s.id, 0]));
  }

  const utezi = veljavneSobe.map((soba) => ({
    id: soba.id,
    utez: normalizirajFaktorOgrevanja(soba.faktor_ogrevanja)
  }));

  let vsotaUtezi = utezi.reduce((acc, soba) => acc + soba.utez, 0);
  if (vsotaUtezi <= 0) {
    utezi.forEach((soba) => {
      soba.utez = 1;
    });
    vsotaUtezi = utezi.length;
  }

  const razrez = utezi.map((soba) => {
    const suroviCenti = (ciljCenti * soba.utez) / vsotaUtezi;
    const celiCenti = Math.floor(suroviCenti);
    return {
      id: soba.id,
      celiCenti,
      ostanek: suroviCenti - celiCenti
    };
  });

  const porabljeniCenti = razrez.reduce((acc, soba) => acc + soba.celiCenti, 0);
  const manjkajociCenti = ciljCenti - porabljeniCenti;

  if (manjkajociCenti > 0) {
    razrez
      .sort((a, b) => {
        if (b.ostanek !== a.ostanek) return b.ostanek - a.ostanek;
        return String(a.id).localeCompare(String(b.id), 'sl');
      })
      .forEach((soba, index) => {
        if (index < manjkajociCenti) {
          soba.celiCenti += 1;
        }
      });
  }

  return new Map(razrez.map((soba) => [soba.id, Number((soba.celiCenti / 100).toFixed(2))]));
}

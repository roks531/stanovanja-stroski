// Oddaja obračuna ustvari plačilo; placano pomeni poznejšo potrditev administratorja.
export function pripraviPregledOddaje({ sobe, uporabniki, placila, mesec, leto }) {
  const obdobje = Number(leto) * 12 + Number(mesec) - 1;
  const placilaPoKljucu = new Map(placila
    .filter((p) => Number(p.mesec) === Number(mesec) && Number(p.leto) === Number(leto))
    .map((p) => [`${p.soba_id}|${p.uporabnik_id}`, p]));
  const uporabnikiPoId = new Map(uporabniki.map((u) => [u.id, u]));
  const placilaPoSobi = new Map();
  for (const placilo of placilaPoKljucu.values()) {
    const seznam = placilaPoSobi.get(placilo.soba_id) ?? [];
    seznam.push(placilo);
    placilaPoSobi.set(placilo.soba_id, seznam);
  }
  const najemnikiPoSobi = new Map();
  for (const u of uporabniki) {
    if (!u.aktiven || u.admin || !u.soba_id) continue;
    const seznam = najemnikiPoSobi.get(u.soba_id) ?? [];
    seznam.push(u);
    najemnikiPoSobi.set(u.soba_id, seznam);
  }
  return sobe.flatMap((soba) => {
    const najemniki = najemnikiPoSobi.get(soba.id) ?? [];
    const kandidati = new Map(najemniki.map((u) => [u.id, {
      u, uporabnikId: u.id, placilo: placilaPoKljucu.get(`${soba.id}|${u.id}`)
    }]));
    // Saved submissions belong to their original room and tenant, regardless of
    // the tenant's current activity or room assignment.
    for (const placilo of placilaPoSobi.get(soba.id) ?? []) {
      kandidati.set(placilo.uporabnik_id, {
        u: uporabnikiPoId.get(placilo.uporabnik_id),
        uporabnikId: placilo.uporabnik_id,
        placilo
      });
    }
    return (kandidati.size ? [...kandidati.values()] : [{}]).map(({ u, uporabnikId = '', placilo }) => {
      const oddano = Boolean(placilo);
      const zacetek = u?.uporabnik_od?.match(/^(\d{4})-(\d{2})/);
      const konec = u?.uporabnik_do?.match(/^(\d{4})-(\d{2})/);
      // Enako kot pri oddaji najemnika: prvi obračun je mesec po vselitvi.
      const predZacetkom = zacetek && obdobje <= Number(zacetek[1]) * 12 + Number(zacetek[2]) - 1;
      const poKoncu = konec && obdobje > Number(konec[1]) * 12 + Number(konec[2]) - 1;
      const razlog = !u ? 'Brez aktivnega najemnika' : soba.aktivna === false ? 'Neaktivna soba'
        : predZacetkom ? 'Pred prvim obračunom' : poKoncu ? 'Po koncu najema' : '';
      return {
        id: `${soba.id}|${uporabnikId}`,
        soba_id: soba.id,
        uporabnik_id: uporabnikId,
        soba: soba.ime_sobe,
        tip_hise: soba.tip_hise,
        najemnik: u ? `${u.ime ?? ''} ${u.priimek ?? ''}`.trim() || u.email || 'Najemnik brez imena' : oddano ? 'Nekdanji najemnik' : 'Brez aktivnega najemnika',
        status: oddano ? 'oddano' : razlog ? 'ni_potrebno' : 'manjka',
        placano: oddano ? Boolean(placilo.placano) : null,
        datum_oddaje: placilo?.datum_izracuna ?? null,
        razlog: oddano ? '' : razlog
      };
    });
  }).sort((a, b) => {
    const vrstniRed = { manjka: 0, oddano: 1, ni_potrebno: 2 };
    return vrstniRed[a.status] - vrstniRed[b.status] || String(a.soba).localeCompare(String(b.soba), 'sl', { numeric: true }) || a.najemnik.localeCompare(b.najemnik, 'sl');
  });
}

export function pripraviPregledOddajeZaMesece({ meseci, leto, ...podatki }) {
  return [...new Set(meseci)].flatMap((mesec) =>
    pripraviPregledOddaje({ ...podatki, mesec, leto }).map((vrstica) => ({
      ...vrstica,
      id: `${vrstica.id}|${leto}|${mesec}`,
      mesec,
      leto
    }))
  ).sort((a, b) => {
    const vrstniRed = { manjka: 0, oddano: 1, ni_potrebno: 2 };
    return vrstniRed[a.status] - vrstniRed[b.status]
      || String(a.soba).localeCompare(String(b.soba), 'sl', { numeric: true })
      || a.najemnik.localeCompare(b.najemnik, 'sl')
      || b.mesec - a.mesec;
  });
}

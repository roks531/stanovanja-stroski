import { razdeliOgrevanjePoSobah } from './ogrevanje.js';

const obdobje = (v) => Number(v.leto) * 12 + Number(v.mesec);
const denar = (v) => Number(Number(v).toFixed(2));

// Enaka izhodišča kot pri najemnikovem vnosu: predaja, prejšnji odčitek,
// cene in ogrevanje za mesec pred obračunom.
export function pripraviStevceRocnegaObracuna(vnos, podatki) {
  const soba = podatki.sobe?.find((s) => s.id === vnos.soba_id);
  const najemnik = podatki.uporabniki?.find((u) => u.id === vnos.uporabnik_id);
  const cilj = obdobje(vnos);
  const odcitki = (podatki.odcitki ?? []).filter((o) => o.soba_id === vnos.soba_id);
  const obstojeci = odcitki.find((o) => obdobje(o) === cilj);
  const prejsnji = odcitki.filter((o) => obdobje(o) < cilj).sort((a, b) => obdobje(b) - obdobje(a))[0];
  const imaZgodovino = odcitki.some((o) => o.uporabnik_id === vnos.uporabnik_id && obdobje(o) < cilj);
  const datumCen = new Date(Date.UTC(Number(vnos.leto), Number(vnos.mesec) - 2, 1));
  const datum = Number.isNaN(datumCen.valueOf()) ? '' : datumCen.toISOString().slice(0, 10);
  const cena = (podatki.cene ?? []).filter((c) => c.tip_hise === soba?.tip_hise && c.velja_od <= datum)
    .sort((a, b) => b.velja_od.localeCompare(a.velja_od))[0];
  const ogrevanje = (podatki.ogrevanjeTipi ?? []).find((o) => o.tip_hise === soba?.tip_hise && obdobje(o) === cilj - 1);
  const imaVodo = Boolean(soba?.voda_stanje);
  return {
    soba, najemnik, obstojeci, imaVodo, cena, ogrevanje,
    prejsnje_stanje_elektrike: Number(obstojeci?.prejsnje_stanje_elektrike ?? (!imaZgodovino ? najemnik?.zacetno_stanje_elektrike : null) ?? prejsnji?.stanje_elektrike ?? 0),
    prejsnje_stanje_vode: imaVodo ? Number(obstojeci?.prejsnje_stanje_vode ?? (!imaZgodovino ? najemnik?.zacetno_stanje_vode : null) ?? prejsnji?.stanje_vode ?? 0) : null,
    privzetiStroski: {
      cena_elektrike: cena?.cena_elektrike ?? 0, cena_vode: cena?.cena_vode ?? 0,
      najemnina: soba?.najemnina ?? 0, strosek_skupni: soba?.strosek_skupni ?? 0,
      strosek_neta: soba?.nettv ?? soba?.strosek_neta ?? 0,
      strosek_tv: soba?.fiksni ?? soba?.strosek_tv ?? 0,
      strosek_ogrevanja: razdeliOgrevanjePoSobah(ogrevanje?.znesek, soba ? [soba] : []).get(soba?.id) ?? 0,
      strosek_vode: imaVodo ? 0 : soba?.voda ?? 0
    }
  };
}

export function izracunajStroskeStevcev(vnos, kontekst) {
  const elektrika = Number(vnos.stanje_elektrike) - kontekst.prejsnje_stanje_elektrike;
  const voda = kontekst.imaVodo ? Number((Number(vnos.stanje_vode) - kontekst.prejsnje_stanje_vode).toFixed(3)) : 0;
  return {
    poraba_elektrike: elektrika, poraba_vode: voda,
    strosek_elektrike: denar(Math.max(0, elektrika) * Number(vnos.cena_elektrike)),
    strosek_vode: kontekst.imaVodo ? denar(Math.max(0, voda) * Number(vnos.cena_vode)) : denar(kontekst.soba?.voda ?? 0)
  };
}

export function preveriStevceRocnegaObracuna(vnos, kontekst, podatki) {
  if (!kontekst.soba || !kontekst.najemnik || kontekst.najemnik.admin || kontekst.najemnik.soba_id !== vnos.soba_id) {
    throw new Error('Izberi sobo in njenega najemnika.');
  }
  if (kontekst.obstojeci?.uporabnik_id && kontekst.obstojeci.uporabnik_id !== vnos.uporabnik_id) {
    throw new Error('Odčitek za ta mesec pripada drugemu najemniku.');
  }
  if (!kontekst.cena) throw new Error('Za prejšnji mesec najprej nastavi cene elektrike in vode.');
  if (!kontekst.ogrevanje) throw new Error('Za prejšnji mesec najprej nastavi ogrevanje (tudi če je znesek 0).');
  for (const [polje, predhodno, naziv, korak] of [
    ['stanje_elektrike', kontekst.prejsnje_stanje_elektrike, 'elektrike', 1],
    ...(kontekst.imaVodo ? [['stanje_vode', kontekst.prejsnje_stanje_vode, 'vode', 0.001]] : [])
  ]) {
    const vrednost = vnos[polje];
    const n = Number(vrednost);
    if (vrednost === '' || vrednost == null || !Number.isFinite(n) || n < predhodno) {
      throw new Error(`Vnesi stanje ${naziv}, ki ni manjše od prejšnjega (${predhodno}).`);
    }
    if (Math.abs(n / korak - Math.round(n / korak)) > 0.00001) throw new Error(`Stanje ${naziv} ima preveč decimalnih mest.`);
  }
  const naslednji = (podatki.odcitki ?? []).filter((o) => o.soba_id === vnos.soba_id && o.uporabnik_id === vnos.uporabnik_id && obdobje(o) > obdobje(vnos))
    .sort((a, b) => obdobje(a) - obdobje(b))[0];
  if (naslednji && (Number(naslednji.prejsnje_stanje_elektrike) !== Number(vnos.stanje_elektrike) ||
    (kontekst.imaVodo && Number(naslednji.prejsnje_stanje_vode) !== Number(vnos.stanje_vode)))) {
    throw new Error('Poznejši odčitek že uporablja drugo začetno stanje. Najprej uskladi poznejše števce in obračune v pregledu števcev.');
  }
}

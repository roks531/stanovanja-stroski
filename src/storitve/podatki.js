import { supabase } from './supabase';
import { razdeliOgrevanjePoSobah } from './ogrevanje';

const KONTAKT_LASTNIK_EMAIL = 'lastnik@example.com';

function prejsnjiMesecLeto(datum = new Date()) {
  const d = new Date(datum);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return {
    mesec: d.getMonth() + 1,
    leto: d.getFullYear()
  };
}

function jeVeljavnoObdobje(mesec, leto) {
  return Number.isFinite(mesec) && Number.isFinite(leto) && mesec >= 1 && mesec <= 12 && leto >= 2024;
}

function sobaImaVodniStevec(soba) {
  const tipHise = String(soba?.tip_hise ?? '').toLowerCase();
  if (tipHise === 'velika') return true;
  if (tipHise === 'stara') return false;
  return Boolean(soba?.voda_stanje);
}

async function pridobiSoboOsnovno(sobaId) {
  const prviPoskus = await supabase
    .from('sobe')
    .select('id, tip_hise, voda_stanje, voda')
    .eq('id', sobaId)
    .maybeSingle();

  if (!prviPoskus.error) return prviPoskus.data;

  const sporocilo = String(prviPoskus.error?.message ?? '').toLowerCase();
  if (!(sporocilo.includes('column') && sporocilo.includes('voda'))) {
    throw new Error(prviPoskus.error.message);
  }

  const drugiPoskus = await supabase
    .from('sobe')
    .select('id, tip_hise, voda_stanje')
    .eq('id', sobaId)
    .maybeSingle();

  if (drugiPoskus.error) throw new Error(drugiPoskus.error.message);
  return { ...drugiPoskus.data, voda: 0 };
}

async function obstajaOgrevanjeZaTipObdobje(tipHise, mesec, leto) {
  const { data: zapis, error } = await supabase
    .from('ogrevanje_tipi')
    .select('id')
    .eq('tip_hise', tipHise)
    .eq('mesec', mesec)
    .eq('leto', leto)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(zapis?.id);
}

function napakaOgrevanjeNiPripravljeno(mesec, leto) {
  const obdobje = `${String(mesec).padStart(2, '0')}.${leto}`;
  return `Najemodajalec še ni izračunal stroška ogrevanja za ${obdobje}, poskusi ponovno jutri. Kontakt: ${KONTAKT_LASTNIK_EMAIL}`;
}

export async function pridobiNajemnikPodatke(uporabnikId) {
  const { data: uporabnik, error: napakaUporabnik } = await supabase
    .from('uporabniki')
    .select(
      `
      id,
      soba_id,
      sobe (*)
    `
    )
    .eq('id', uporabnikId)
    .single();

  if (napakaUporabnik) {
    throw new Error(napakaUporabnik.message);
  }

  const soba = uporabnik.sobe;
  if (!soba) {
    throw new Error('Uporabniku ni dodeljena soba.');
  }

  const [{ data: cene, error: napakaCene }, { data: placila, error: napakaPlacila }, { data: odcitki, error: napakaOdcitki }] = await Promise.all([
    supabase
      .from('cene')
      .select('*')
      .eq('tip_hise', soba.tip_hise)
      .order('velja_od', { ascending: false }),
    supabase
      .from('placila')
      .select('*')
      .eq('uporabnik_id', uporabnikId)
      .order('leto', { ascending: false })
      .order('mesec', { ascending: false }),
    supabase
      .from('odcitki')
      .select('*')
      .eq('soba_id', soba.id)
      .order('leto', { ascending: false })
      .order('mesec', { ascending: false })
      .limit(1)
  ]);

  if (napakaCene) throw new Error(napakaCene.message);
  if (napakaPlacila) throw new Error(napakaPlacila.message);
  if (napakaOdcitki) throw new Error(napakaOdcitki.message);

  const obdobjeZaVnos = prejsnjiMesecLeto();
  let strosekOgrevanja = Number(soba.strosek_ogrevanja ?? 0);
  let ogrevanjePripravljeno = false;

  const { data: ogrevanjePoTipu, error: napakaOgrevanjePoTipu } = await supabase
    .from('ogrevanje_tipi')
    .select('znesek, mesec, leto')
    .eq('tip_hise', soba.tip_hise)
    .eq('mesec', obdobjeZaVnos.mesec)
    .eq('leto', obdobjeZaVnos.leto)
    .maybeSingle();

  if (napakaOgrevanjePoTipu) throw new Error(napakaOgrevanjePoTipu.message);

  if (ogrevanjePoTipu?.znesek != null) {
    ogrevanjePripravljeno = true;
    const { data: sobeTipa, error: napakaSobeTipa } = await supabase
      .from('sobe')
      .select('id, faktor_ogrevanja')
      .eq('tip_hise', soba.tip_hise);

    if (napakaSobeTipa) throw new Error(napakaSobeTipa.message);

    const razdelitev = razdeliOgrevanjePoSobah(ogrevanjePoTipu.znesek, sobeTipa ?? []);
    strosekOgrevanja = Number(razdelitev.get(soba.id) ?? soba.strosek_ogrevanja ?? 0);
  } else {
    strosekOgrevanja = 0;
  }

  return {
    soba,
    cene,
    placila,
    zadnjiOdcitek: odcitki[0] ?? null,
    strosekOgrevanja,
    obdobjeZaVnos,
    ogrevanjePripravljeno,
    sporociloZaklepaOgrevanja: ogrevanjePripravljeno
      ? ''
      : napakaOgrevanjeNiPripravljeno(obdobjeZaVnos.mesec, obdobjeZaVnos.leto)
  };
}

export function izracunajTrenutniStrosek({ soba, cena, zadnjiOdcitek, strosekOgrevanja }) {
  if (!soba || !cena || !zadnjiOdcitek) {
    return null;
  }

  const prejsnjeStanjeElektrike =
    zadnjiOdcitek.prejsnje_stanje_elektrike == null ? 0 : Number(zadnjiOdcitek.prejsnje_stanje_elektrike);
  const trenutnoStanjeElektrike = Number(zadnjiOdcitek.stanje_elektrike ?? 0);
  const prejsnjeStanjeVode =
    zadnjiOdcitek.prejsnje_stanje_vode == null ? 0 : Number(zadnjiOdcitek.prejsnje_stanje_vode);
  const trenutnoStanjeVode =
    zadnjiOdcitek.stanje_vode == null ? null : Number(zadnjiOdcitek.stanje_vode);

  const imaVodniStevec = sobaImaVodniStevec(soba);
  const porabaElektrike = Math.max(0, trenutnoStanjeElektrike - prejsnjeStanjeElektrike);
  const porabaVode =
    imaVodniStevec && trenutnoStanjeVode != null
      ? Math.max(0, trenutnoStanjeVode - prejsnjeStanjeVode)
      : 0;

  const strosekElektrike = porabaElektrike * Number(cena.cena_elektrike ?? 0);
  const strosekVode = imaVodniStevec
    ? porabaVode * Number(cena.cena_vode ?? 0)
    : Number(soba.voda ?? 0);

  const najemnina = Number(soba.najemnina ?? 0);
  const strosekSkupni = Number(soba.strosek_skupni ?? 0);
  const strosekNeta = Number(soba.nettv ?? soba.strosek_neta ?? 0);
  const strosekTv = Number(soba.fiksni ?? soba.strosek_tv ?? 0);
  const strosekFiksni = Number(strosekTv.toFixed(2));
  const strosekNetTv = Number(strosekNeta.toFixed(2));

  const skupaj =
    najemnina +
    strosekSkupni +
    strosekNetTv +
    strosekFiksni +
    Number(strosekOgrevanja ?? 0) +
    strosekElektrike +
    strosekVode;

  return {
    najemnina,
    strosekSkupni,
    strosekNeta: strosekNetTv,
    strosekTv: strosekFiksni,
    strosekFiksni: Number((strosekNetTv + strosekFiksni).toFixed(2)),
    strosekOgrevanja: Number(strosekOgrevanja ?? 0),
    strosekElektrike: Number(strosekElektrike.toFixed(2)),
    strosekVode: Number(strosekVode.toFixed(2)),
    skupaj: Number(skupaj.toFixed(2))
  };
}

export async function shraniNajemnikovOdcitek(vrednosti, posodobil) {
  const sobaId = vrednosti.soba_id;
  const uporabnikId = vrednosti.uporabnik_id;
  const mesec = Number(vrednosti.mesec);
  const leto = Number(vrednosti.leto);
  const stanjeElektrike = Number(vrednosti.stanje_elektrike);
  const stanjeVode =
    vrednosti.stanje_vode === null || vrednosti.stanje_vode === undefined || vrednosti.stanje_vode === ''
      ? null
      : Number(vrednosti.stanje_vode);

  if (!sobaId) throw new Error('Soba ni določena.');
  if (!uporabnikId) throw new Error('Uporabnik ni določen.');
  if (!Number.isFinite(mesec) || mesec < 1 || mesec > 12) throw new Error('Mesec ni veljaven.');
  if (!Number.isFinite(leto) || leto < 2024) throw new Error('Leto ni veljavno.');
  if (!Number.isFinite(stanjeElektrike) || stanjeElektrike < 0) {
    throw new Error('Stanje elektrike mora biti 0 ali več.');
  }
  const soba = await pridobiSoboOsnovno(sobaId);
  if (!soba?.id || !soba?.tip_hise) {
    throw new Error('Soba ni določena.');
  }
  const imaVodniStevec = sobaImaVodniStevec(soba);
  const stanjeVodeZaShrambo = imaVodniStevec ? stanjeVode : null;
  if (imaVodniStevec && (stanjeVodeZaShrambo === null || !Number.isFinite(stanjeVodeZaShrambo) || stanjeVodeZaShrambo < 0)) {
    throw new Error('Stanje vode mora biti 0 ali več.');
  }

  const ogrevanjeJePripravljeno = await obstajaOgrevanjeZaTipObdobje(soba.tip_hise, mesec, leto);
  if (!ogrevanjeJePripravljeno) {
    throw new Error(napakaOgrevanjeNiPripravljeno(mesec, leto));
  }

  const { data: obstojeceObdobje, error: napakaObstojece } = await supabase
    .from('odcitki')
    .select('id, prejsnje_stanje_elektrike, prejsnje_stanje_vode')
    .eq('soba_id', sobaId)
    .eq('mesec', mesec)
    .eq('leto', leto)
    .maybeSingle();

  if (napakaObstojece) throw new Error(napakaObstojece.message);
  if (obstojeceObdobje?.id) {
    throw new Error('Za izbrano obdobje je odčitek že vnesen. Spremembo lahko uredi najemodajalec.');
  }

  const { data: vsiOdcitki, error: napakaVsi } = await supabase
    .from('odcitki')
    .select('mesec, leto, stanje_elektrike, stanje_vode')
    .eq('soba_id', sobaId)
    .order('leto', { ascending: false })
    .order('mesec', { ascending: false })
    .limit(60);

  if (napakaVsi) throw new Error(napakaVsi.message);

  const pretekli = (vsiOdcitki ?? []).find(
    (o) => o.leto < leto || (o.leto === leto && o.mesec < mesec)
  );

  const payload = {
    soba_id: sobaId,
    uporabnik_id: uporabnikId,
    mesec,
    leto,
    stanje_elektrike: stanjeElektrike,
    stanje_vode: stanjeVodeZaShrambo,
    prejsnje_stanje_elektrike: pretekli?.stanje_elektrike ?? 0,
    prejsnje_stanje_vode: stanjeVodeZaShrambo === null ? null : (pretekli?.stanje_vode ?? 0),
    posodobil: posodobil ?? null
  };

  const { data, error } = await supabase
    .from('odcitki')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function potrdiNajemnikovObracun(vrednosti, posodobil) {
  const sobaId = vrednosti.soba_id;
  const uporabnikId = vrednosti.uporabnik_id;
  const mesec = Number(vrednosti.mesec);
  const leto = Number(vrednosti.leto);

  if (!sobaId) throw new Error('Soba ni določena.');
  if (!uporabnikId) throw new Error('Uporabnik ni določen.');
  if (!Number.isFinite(mesec) || mesec < 1 || mesec > 12) throw new Error('Mesec ni veljaven.');
  if (!Number.isFinite(leto) || leto < 2024) throw new Error('Leto ni veljavno.');

  const { data: soba, error: napakaSoba } = await supabase
    .from('sobe')
    .select('*')
    .eq('id', sobaId)
    .maybeSingle();
  if (napakaSoba) throw new Error(napakaSoba.message);
  if (!soba) throw new Error('Soba ne obstaja.');

  const { data: odcitek, error: napakaOdcitek } = await supabase
    .from('odcitki')
    .select('*')
    .eq('soba_id', sobaId)
    .eq('mesec', mesec)
    .eq('leto', leto)
    .maybeSingle();
  if (napakaOdcitek) throw new Error(napakaOdcitek.message);
  if (!odcitek) {
    throw new Error('Najprej shrani stanje števcev za izbrano obdobje.');
  }

  const obdobjeDatum = `${leto}-${String(mesec).padStart(2, '0')}-01`;
  const { data: ceneTipa, error: napakaCene } = await supabase
    .from('cene')
    .select('*')
    .eq('tip_hise', soba.tip_hise)
    .lte('velja_od', obdobjeDatum)
    .order('velja_od', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (napakaCene) throw new Error(napakaCene.message);
  if (!ceneTipa) throw new Error('Za izbrano obdobje ni definirane cene elektrike/vode.');

  const { data: ogrevanjeTipa, error: napakaOgrevanje } = await supabase
    .from('ogrevanje_tipi')
    .select('znesek')
    .eq('tip_hise', soba.tip_hise)
    .eq('mesec', mesec)
    .eq('leto', leto)
    .maybeSingle();
  if (napakaOgrevanje) throw new Error(napakaOgrevanje.message);
  if (!ogrevanjeTipa) throw new Error(napakaOgrevanjeNiPripravljeno(mesec, leto));

  const { data: sobeTipa, error: napakaSobeTipa } = await supabase
    .from('sobe')
    .select('id, faktor_ogrevanja')
    .eq('tip_hise', soba.tip_hise);
  if (napakaSobeTipa) throw new Error(napakaSobeTipa.message);

  const razdelitevOgrevanja = razdeliOgrevanjePoSobah(ogrevanjeTipa.znesek, sobeTipa ?? []);
  const strosekOgrevanja = Number(razdelitevOgrevanja.get(sobaId) ?? 0);

  const porabaElektrike =
    odcitek.poraba_elektrike != null
      ? Number(odcitek.poraba_elektrike)
      : Math.max(0, Number(odcitek.stanje_elektrike ?? 0) - Number(odcitek.prejsnje_stanje_elektrike ?? 0));
  const porabaVode =
    odcitek.poraba_vode != null
      ? Number(odcitek.poraba_vode)
      : Math.max(0, Number(odcitek.stanje_vode ?? 0) - Number(odcitek.prejsnje_stanje_vode ?? 0));

  const strosekElektrike = Number((porabaElektrike * Number(ceneTipa.cena_elektrike ?? 0)).toFixed(2));
  const imaVodniStevec = sobaImaVodniStevec(soba);
  const strosekVode = imaVodniStevec
    ? Number((porabaVode * Number(ceneTipa.cena_vode ?? 0)).toFixed(2))
    : Number(Number(soba.voda ?? 0).toFixed(2));
  const najemnina = Number(soba.najemnina ?? 0);
  const strosekSkupni = Number(soba.strosek_skupni ?? 0);
  const strosekNeta = Number(soba.nettv ?? soba.strosek_neta ?? 0);
  const strosekTv = Number(soba.fiksni ?? soba.strosek_tv ?? 0);

  const skupniStrosek = Number(
    (
      najemnina +
      strosekSkupni +
      strosekNeta +
      strosekTv +
      strosekOgrevanja +
      strosekElektrike +
      strosekVode
    ).toFixed(2)
  );

  const { data: obstojeci, error: napakaObstojeci } = await supabase
    .from('placila')
    .select('id, placano, datum_placila')
    .eq('soba_id', sobaId)
    .eq('uporabnik_id', uporabnikId)
    .eq('mesec', mesec)
    .eq('leto', leto)
    .maybeSingle();
  if (napakaObstojeci) throw new Error(napakaObstojeci.message);
  if (obstojeci?.placano) {
    throw new Error('Obračun je že označen kot potrjen in ga ni mogoče potrditi ponovno.');
  }

  const payload = {
    soba_id: sobaId,
    uporabnik_id: uporabnikId,
    mesec,
    leto,
    najemnina,
    strosek_elektrike: strosekElektrike,
    strosek_vode: strosekVode,
    strosek_ogrevanja: strosekOgrevanja,
    strosek_neta: strosekNeta,
    strosek_tv: strosekTv,
    strosek_skupni: strosekSkupni,
    skupni_strosek: skupniStrosek,
    placano: false,
    datum_placila: null,
    posodobil: posodobil ?? null
  };

  if (obstojeci?.id) {
    const { data, error } = await supabase
      .from('placila')
      .update(payload)
      .eq('id', obstojeci.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('placila')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function shraniAdminOdcitekSobe(vrednosti, posodobil) {
  const sobaId = vrednosti.soba_id;
  const mesec = Number(vrednosti.mesec);
  const leto = Number(vrednosti.leto);
  const stanjeElektrike = Number(vrednosti.stanje_elektrike);
  const stanjeVodeRaw =
    vrednosti.stanje_vode === null || vrednosti.stanje_vode === undefined || vrednosti.stanje_vode === ''
      ? null
      : Number(vrednosti.stanje_vode);

  if (!sobaId) throw new Error('Soba ni določena.');
  if (!Number.isFinite(mesec) || mesec < 1 || mesec > 12) throw new Error('Mesec ni veljaven.');
  if (!Number.isFinite(leto) || leto < 2024) throw new Error('Leto ni veljavno.');
  if (!Number.isFinite(stanjeElektrike) || stanjeElektrike < 0) {
    throw new Error('Stanje elektrike mora biti 0 ali več.');
  }

  const soba = await pridobiSoboOsnovno(sobaId);
  if (!soba?.id || !soba?.tip_hise) {
    throw new Error('Soba ni določena.');
  }

  const imaVodniStevec = sobaImaVodniStevec(soba);
  const stanjeVode = imaVodniStevec ? stanjeVodeRaw : null;
  if (imaVodniStevec && (!Number.isFinite(stanjeVode) || stanjeVode < 0)) {
    throw new Error('Stanje vode mora biti 0 ali več.');
  }

  const { data: obstojeceObdobje, error: napakaObstojece } = await supabase
    .from('odcitki')
    .select('id, uporabnik_id')
    .eq('soba_id', sobaId)
    .eq('mesec', mesec)
    .eq('leto', leto)
    .maybeSingle();
  if (napakaObstojece) throw new Error(napakaObstojece.message);

  const { data: vsiOdcitki, error: napakaVsi } = await supabase
    .from('odcitki')
    .select('mesec, leto, stanje_elektrike, stanje_vode')
    .eq('soba_id', sobaId)
    .order('leto', { ascending: false })
    .order('mesec', { ascending: false })
    .limit(120);
  if (napakaVsi) throw new Error(napakaVsi.message);

  const pretekli = (vsiOdcitki ?? []).find(
    (o) => o.leto < leto || (o.leto === leto && o.mesec < mesec)
  );

  const prejsnjeStanjeElektrike = pretekli?.stanje_elektrike ?? 0;
  const prejsnjeStanjeVode = stanjeVode === null ? null : (pretekli?.stanje_vode ?? 0);

  let uporabnikId = obstojeceObdobje?.uporabnik_id ?? null;
  if (!uporabnikId) {
    const { data: najemnik, error: napakaNajemnik } = await supabase
      .from('uporabniki')
      .select('id')
      .eq('soba_id', sobaId)
      .eq('aktiven', true)
      .order('uporabnik_od', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (napakaNajemnik) throw new Error(napakaNajemnik.message);
    uporabnikId = najemnik?.id ?? null;
  }

  const payload = {
    soba_id: sobaId,
    uporabnik_id: uporabnikId,
    mesec,
    leto,
    stanje_elektrike: stanjeElektrike,
    stanje_vode: stanjeVode,
    prejsnje_stanje_elektrike: prejsnjeStanjeElektrike,
    prejsnje_stanje_vode: prejsnjeStanjeVode,
    posodobil: posodobil ?? null
  };

  if (obstojeceObdobje?.id) {
    const { data, error } = await supabase
      .from('odcitki')
      .update(payload)
      .eq('id', obstojeceObdobje.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from('odcitki')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function pripraviPrejsnjeObracunskoObdobje(vrednosti, posodobil) {
  const mesec = Number(vrednosti?.mesec);
  const leto = Number(vrednosti?.leto);
  const nastaviManjkajoceNaNulo = Boolean(vrednosti?.nastaviManjkajoceNaNulo);
  const zneski = vrednosti?.zneski ?? {};

  if (!jeVeljavnoObdobje(mesec, leto)) {
    throw new Error('Obdobje ni veljavno.');
  }

  const { data: sobe, error: napakaSobe } = await supabase
    .from('sobe')
    .select('tip_hise, aktivna');
  if (napakaSobe) throw new Error(napakaSobe.message);

  const tipiHise = Array.from(
    new Set(
      (sobe ?? [])
        .filter((s) => s?.tip_hise && s.aktivna !== false)
        .map((s) => s.tip_hise)
    )
  );

  if (tipiHise.length === 0) {
    return {
      tipiHise: [],
      manjkajociTipi: [],
      dodaniTipi: []
    };
  }

  const { data: obstojeci, error: napakaObstojeci } = await supabase
    .from('ogrevanje_tipi')
    .select('tip_hise')
    .eq('mesec', mesec)
    .eq('leto', leto)
    .in('tip_hise', tipiHise);

  if (napakaObstojeci) throw new Error(napakaObstojeci.message);

  const obstojeciTipi = new Set((obstojeci ?? []).map((o) => o.tip_hise));
  const manjkajociTipi = tipiHise.filter((tip) => !obstojeciTipi.has(tip));

  if (manjkajociTipi.length > 0 && !nastaviManjkajoceNaNulo) {
    return {
      tipiHise,
      manjkajociTipi,
      dodaniTipi: []
    };
  }

  if (manjkajociTipi.length > 0) {
    const vrsticeZaVnos = manjkajociTipi.map((tip) => ({
      tip_hise: tip,
      mesec,
      leto,
      znesek: Number(zneski[tip] ?? 0) || 0,
      opomba: 'Nastavljeno ob potrditvi obračunskega obdobja.',
      posodobil: posodobil ?? null
    }));

    const { error: napakaVnos } = await supabase
      .from('ogrevanje_tipi')
      .upsert(vrsticeZaVnos, { onConflict: 'tip_hise,mesec,leto' });

    if (napakaVnos) throw new Error(napakaVnos.message);
  }

  return {
    tipiHise,
    manjkajociTipi,
    dodaniTipi: manjkajociTipi
  };
}

export async function osveziSobeOgrevanjePoObdobju(vrednosti, posodobil) {
  const mesec = Number(vrednosti?.mesec);
  const leto = Number(vrednosti?.leto);

  if (!jeVeljavnoObdobje(mesec, leto)) {
    throw new Error('Obdobje ni veljavno.');
  }

  const { data: sobe, error: napakaSobe } = await supabase
    .from('sobe')
    .select('id, tip_hise, faktor_ogrevanja');
  if (napakaSobe) throw new Error(napakaSobe.message);

  const { data: ogrevanjeTipi, error: napakaOgrevanje } = await supabase
    .from('ogrevanje_tipi')
    .select('tip_hise, znesek')
    .eq('mesec', mesec)
    .eq('leto', leto);
  if (napakaOgrevanje) throw new Error(napakaOgrevanje.message);

  const znesekPoTipu = new Map((ogrevanjeTipi ?? []).map((zapis) => [zapis.tip_hise, Number(zapis.znesek ?? 0)]));
  const sobePoTipu = (sobe ?? []).reduce((acc, soba) => {
    if (!soba?.tip_hise || !soba?.id) return acc;
    if (!acc[soba.tip_hise]) acc[soba.tip_hise] = [];
    acc[soba.tip_hise].push(soba);
    return acc;
  }, {});

  const strosekPoSobi = new Map();
  Object.entries(sobePoTipu).forEach(([tipHise, sobeTipa]) => {
    const znesekTipa = Number(znesekPoTipu.get(tipHise) ?? 0);
    const razdelitev = razdeliOgrevanjePoSobah(znesekTipa, sobeTipa);
    sobeTipa.forEach((soba) => {
      strosekPoSobi.set(soba.id, Number(razdelitev.get(soba.id) ?? 0));
    });
  });

  const posodobitve = (sobe ?? []).map((soba) =>
    supabase
      .from('sobe')
      .update({
        strosek_ogrevanja: Number(strosekPoSobi.get(soba.id) ?? 0),
        posodobil: posodobil ?? null
      })
      .eq('id', soba.id)
  );

  const rezultati = await Promise.all(posodobitve);
  const napakaPosodobitve = rezultati.find((rezultat) => rezultat.error)?.error;
  if (napakaPosodobitve) throw new Error(napakaPosodobitve.message);

  return {
    steviloSob: (sobe ?? []).length
  };
}

export async function pridobiAdminPodatke() {
  const [uporabnikiRes, sobeRes, ceneRes, ogrevanjeTipiRes, odcitkiRes, placilaRes] = await Promise.all([
    supabase
      .from('uporabniki')
      .select('id, ime, priimek, email, telefon, aktiven, admin, soba_id, uporabnik_od, uporabnik_do, ustvarjeno_ob, posodobljeno_ob, posodobil, sobe(ime_sobe)')
      .order('uporabnik_od', { ascending: false }),
    supabase
      .from('sobe')
      .select('*')
      .order('ime_sobe', { ascending: true }),
    supabase
      .from('cene')
      .select('*')
      .order('velja_od', { ascending: false }),
    supabase
      .from('ogrevanje_tipi')
      .select('*')
      .order('leto', { ascending: false })
      .order('mesec', { ascending: false }),
    supabase
      .from('odcitki')
      .select('*')
      .order('leto', { ascending: false })
      .order('mesec', { ascending: false }),
    supabase
      .from('placila')
      .select('*')
      .order('leto', { ascending: false })
      .order('mesec', { ascending: false })
  ]);

  if (uporabnikiRes.error) throw new Error(uporabnikiRes.error.message);
  if (sobeRes.error) throw new Error(sobeRes.error.message);
  if (ceneRes.error) throw new Error(ceneRes.error.message);
  if (ogrevanjeTipiRes.error) throw new Error(ogrevanjeTipiRes.error.message);
  if (odcitkiRes.error) throw new Error(odcitkiRes.error.message);
  if (placilaRes.error) throw new Error(placilaRes.error.message);

  return {
    uporabniki: uporabnikiRes.data,
    sobe: sobeRes.data,
    cene: ceneRes.data,
    ogrevanjeTipi: ogrevanjeTipiRes.data,
    odcitki: odcitkiRes.data,
    placila: placilaRes.data
  };
}

export async function shraniAdminObracun(vrednosti, posodobil) {
  const odcitekId = vrednosti.id;
  if (!odcitekId) throw new Error('ID odčitka manjka.');

  const stanjeElektrike = Number(vrednosti.stanje_elektrike);
  const stanjeVode =
    vrednosti.stanje_vode === null || vrednosti.stanje_vode === undefined || vrednosti.stanje_vode === ''
      ? null
      : Number(vrednosti.stanje_vode);

  if (!Number.isFinite(stanjeElektrike) || stanjeElektrike < 0) {
    throw new Error('Stanje elektrike mora biti 0 ali več.');
  }
  if (stanjeVode !== null && (!Number.isFinite(stanjeVode) || stanjeVode < 0)) {
    throw new Error('Stanje vode mora biti 0 ali več.');
  }

  const { data: odcitek, error: odcitekNapaka } = await supabase
    .from('odcitki')
    .update({
      stanje_elektrike: stanjeElektrike,
      stanje_vode: stanjeVode,
      posodobil: posodobil ?? null
    })
    .eq('id', odcitekId)
    .select()
    .single();

  if (odcitekNapaka) throw new Error(odcitekNapaka.message);

  const stroski = vrednosti.stroski || {};
  const placano = Boolean(vrednosti.placano);
  const datumPlacila = placano
    ? (vrednosti.datum_placila || new Date().toISOString())
    : null;

  const payloadPlacilo = {
    soba_id: odcitek.soba_id,
    uporabnik_id: odcitek.uporabnik_id,
    mesec: odcitek.mesec,
    leto: odcitek.leto,
    najemnina: Number(stroski.najemnina ?? 0),
    strosek_skupni: Number(stroski.strosek_skupni ?? 0),
    strosek_elektrike: Number(stroski.strosek_elektrike ?? 0),
    strosek_vode: Number(stroski.strosek_vode ?? 0),
    strosek_ogrevanja: Number(stroski.strosek_ogrevanja ?? 0),
    strosek_neta: Number(stroski.strosek_neta ?? 0),
    strosek_tv: Number(stroski.strosek_tv ?? 0),
    skupni_strosek: Number(stroski.skupni_strosek ?? 0),
    placano,
    datum_placila: datumPlacila,
    posodobil: posodobil ?? null
  };

  let placilo = null;

  if (vrednosti.placilo_id) {
    const { data, error } = await supabase
      .from('placila')
      .update(payloadPlacilo)
      .eq('id', vrednosti.placilo_id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    placilo = data;
  } else if (odcitek.uporabnik_id) {
    const { data, error } = await supabase
      .from('placila')
      .upsert(payloadPlacilo, { onConflict: 'soba_id,uporabnik_id,mesec,leto' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    placilo = data;
  }

  return { odcitek, placilo };
}

export async function potrdiVsaOdprtaPlacila(placiloIds, posodobil) {
  if (!placiloIds || placiloIds.length === 0) return;
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('placila')
    .update({ placano: true, datum_placila: now, posodobil: posodobil ?? null })
    .in('id', placiloIds);
  if (error) throw new Error(error.message);
}

export async function dodajAliPosodobiUporabnika(vrednosti, posodobil) {
  const payload = {
    ...vrednosti,
    posodobil: posodobil ?? null
  };

  const { data, error } = await supabase.from('uporabniki').upsert(payload).select().single();

  if (error) throw new Error(error.message);

  return data;
}

export async function shraniUporabnikaZAuth(vrednosti, posodobil) {
  const payload = {
    ...vrednosti,
    posodobil: posodobil ?? null
  };

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Ni aktivne seje. Prosim odjavite se in se prijavite znova.');
  }

  let rezultat;

  try {
    rezultat = await supabase.functions.invoke('upravljanje-uporabnika', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: payload
    });
  } catch (err) {
    throw new Error(
      'Klic Edge Function ni uspel (mreza/CORS/deploy). Preveri ali je funkcija deployana: upravljanje-uporabnika.'
    );
  }

  const { data, error } = rezultat;

  if (error) {
    const sporocilo = error.message || 'Napaka pri klicu funkcije za uporabnika.';
    let podrobnaNapaka = '';
    let statusKoda = '';

    if (error.context) {
      try {
        statusKoda = error.context.status;
        const surovo = await error.context.text();

        if (surovo) {
          try {
            const teloNapake = JSON.parse(surovo);
            podrobnaNapaka = teloNapake?.napaka || teloNapake?.message || surovo;
          } catch {
            podrobnaNapaka = surovo;
          }
        }
      } catch {
        // fallback spodaj
      }
    }

    if (podrobnaNapaka) {
      throw new Error(`Edge Function ${statusKoda || '?'}: ${podrobnaNapaka}`);
    }

    if (sporocilo.toLowerCase().includes('failed to send a request')) {
      throw new Error('Edge Function ni dosegljiva. Preveri deploy funkcije upravljanje-uporabnika in CORS nastavitve.');
    }
    throw new Error(sporocilo);
  }

  if (data?.napaka) {
    throw new Error(data.napaka);
  }

  return data;
}

export async function shraniSobo(vrednosti, posodobil) {
  const payload = {
    ...vrednosti,
    posodobil: posodobil ?? null
  };

  const fallbackLegacy = (objekt) => {
    const { nettv, fiksni, voda, ...ostalo } = objekt;
    return {
      ...ostalo,
      ...(nettv !== undefined ? { strosek_neta: nettv } : {}),
      ...(fiksni !== undefined ? { strosek_tv: fiksni } : {})
    };
  };

  const jeNapakaZaradiNovegaImena = (error) => {
    const sporocilo = String(error?.message ?? '').toLowerCase();
    return sporocilo.includes('column') && (sporocilo.includes('nettv') || sporocilo.includes('fiksni') || sporocilo.includes('voda'));
  };

  if (vrednosti.id) {
    const { id, ...ostalo } = payload;
    const prviPoskus = await supabase
      .from('sobe')
      .update(ostalo)
      .eq('id', id)
      .select()
      .single();

    if (!prviPoskus.error) return prviPoskus.data;
    if (!jeNapakaZaradiNovegaImena(prviPoskus.error)) {
      throw new Error(prviPoskus.error.message);
    }

    const drugiPoskus = await supabase
      .from('sobe')
      .update(fallbackLegacy(ostalo))
      .eq('id', id)
      .select()
      .single();

    if (drugiPoskus.error) throw new Error(drugiPoskus.error.message);
    return drugiPoskus.data;
  }

  const prviPoskus = await supabase
    .from('sobe')
    .insert(payload)
    .select()
    .single();

  if (!prviPoskus.error) return prviPoskus.data;
  if (!jeNapakaZaradiNovegaImena(prviPoskus.error)) {
    throw new Error(prviPoskus.error.message);
  }

  const drugiPoskus = await supabase
    .from('sobe')
    .insert(fallbackLegacy(payload))
    .select()
    .single();

  if (drugiPoskus.error) throw new Error(drugiPoskus.error.message);
  return drugiPoskus.data;
}

export async function dodajCeno(vrednosti, posodobil) {
  if (vrednosti.id) {
    const { id, ...ostalo } = vrednosti;
    const { data, error } = await supabase
      .from('cene')
      .update({
        ...ostalo,
        posodobil: posodobil ?? null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  const { data, error } = await supabase
    .from('cene')
    .insert({
      ...vrednosti,
      posodobil: posodobil ?? null
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function shraniOgrevanjeTip(vrednosti, posodobil) {
  const payload = {
    ...vrednosti,
    mesec: Number(vrednosti.mesec),
    leto: Number(vrednosti.leto),
    znesek: Number(vrednosti.znesek),
    posodobil: posodobil ?? null
  };

  if (vrednosti.id) {
    const { id, ...ostalo } = payload;
    const { data, error } = await supabase
      .from('ogrevanje_tipi')
      .update(ostalo)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  const { data, error } = await supabase
    .from('ogrevanje_tipi')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

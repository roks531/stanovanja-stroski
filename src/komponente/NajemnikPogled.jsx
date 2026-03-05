/**
 * NajemnikPogled – pogled za najemnike (tenant view).
 *
 * Optimizirano za mobilne naprave.
 * Razdelek na 3 sekcije v stranskem meniju:
 *   0 – Pregled (aktualni mesečni stroški + vnos števcev)
 *   1 – Obračuni (potrjeni in odprti)
 *
 * Vizualni detajli:
 *   - EUR zneski v veliki pisavi (statistične kartice)
 *   - Statusne značke: kvadrataste (borderRadius: 4px)
 *   - Mobilno: vse stack navpično, gumbi full-width
 */
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import dayjs from 'dayjs';
import { useAvtentikacija } from '../kontekst/AvtentikacijaKontekst';
import AppLayout from './AppLayout';
import PregledSekcija from './najemniki/PregledSekcija';
import ObracuniSekcija from './najemniki/ObracuniSekcija';
import DialogPodrobnostiObracuna from './najemniki/DialogPodrobnostiObracuna';
import {
  izracunajTrenutniStrosek,
  pridobiNajemnikPodatke,
  shraniNajemnikovOdcitek,
  potrdiNajemnikovObracun,
} from '../storitve/podatki';

function denar(vrednost) {
  const znesek = Number(vrednost ?? 0);
  const varno = Number.isFinite(znesek) ? znesek : 0;
  const formatiran = new Intl.NumberFormat('sl-SI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(varno);
  return `${formatiran} €`;
}

function prejsnjiMesecLeto() {
  const d = dayjs().subtract(1, 'month');
  return {
    mesec: d.month() + 1,
    leto: d.year()
  };
}

function sobaImaVodniStevec(soba) {
  const tipHise = String(soba?.tip_hise ?? '').toLowerCase();
  if (tipHise === 'velika') return true;
  if (tipHise === 'stara') return false;
  return Boolean(soba?.voda_stanje);
}

export default function NajemnikPogled() {
  const { seja, profil, odjava } = useAvtentikacija();
  const [nalaganje, setNalaganje] = useState(true);
  const [napaka, setNapaka] = useState('');
  const [napakaStevec, setNapakaStevec] = useState('');
  const [uspehStevec, setUspehStevec] = useState('');
  const [shranjevanjeStevca, setShranjevanjeStevca] = useState(false);
  const [potrjevanjeObracuna, setPotrjevanjeObracuna] = useState(false);
  const [paket, setPaket] = useState(null);
  const [izbranRacunId, setIzbranRacunId] = useState(null);
  const [podrobnostiOdprte, setPodrobnostiOdprte] = useState(false);
  const [filterLeto, setFilterLeto] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stranRacunov, setStranRacunov] = useState(1);
  const privzetoObdobje = prejsnjiMesecLeto();
  const [vnosStevca, setVnosStevca] = useState({
    mesec: privzetoObdobje.mesec,
    leto: privzetoObdobje.leto,
    stanje_elektrike: '',
    stanje_vode: ''
  });

  useEffect(() => {
    let aktivno = true;

    async function nalozi() {
      setNalaganje(true);
      setNapaka('');
      try {
        const data = await pridobiNajemnikPodatke(seja.user.id);
        if (!aktivno) return;
        setPaket(data);
        setVnosStevca((prej) => ({
          ...prej,
          mesec: Number(data?.obdobjeZaVnos?.mesec ?? privzetoObdobje.mesec),
          leto: Number(data?.obdobjeZaVnos?.leto ?? privzetoObdobje.leto),
          stanje_elektrike:
            data?.zadnjiOdcitek?.stanje_elektrike != null
              ? String(data.zadnjiOdcitek.stanje_elektrike)
              : '',
          stanje_vode: sobaImaVodniStevec(data?.soba)
            ? data?.zadnjiOdcitek?.stanje_vode != null
              ? String(data.zadnjiOdcitek.stanje_vode)
              : ''
            : ''
        }));
      } catch (err) {
        if (!aktivno) return;
        setNapaka(err.message || 'Podatkov ni bilo mogoce naloziti.');
      } finally {
        if (aktivno) setNalaganje(false);
      }
    }

    nalozi();
    return () => {
      aktivno = false;
    };
  }, [seja.user.id]);

  const izbranaCena = useMemo(() => {
    const cene = paket?.cene ?? [];
    if (cene.length === 0) return null;
    return [...cene].sort((a, b) => dayjs(b.velja_od).valueOf() - dayjs(a.velja_od).valueOf())[0];
  }, [paket]);

  const trenutno = useMemo(() => {
    if (!paket) return null;
    return izracunajTrenutniStrosek({
      soba: paket.soba,
      cena: izbranaCena,
      zadnjiOdcitek: paket.zadnjiOdcitek,
      strosekOgrevanja: paket.strosekOgrevanja
    });
  }, [paket, izbranaCena]);

  const prijavljenNaziv =
    [profil?.ime, profil?.priimek].filter(Boolean).join(' ') || profil?.email || 'uporabnik';
  const sobaNaziv = paket?.soba?.ime_sobe || '-';
  const hisaNaziv = paket?.soba?.tip_hise || '-';
  const imaVodniStevec = sobaImaVodniStevec(paket?.soba);

  const predogledStevca = useMemo(() => {
    const prejsnjeElektrike = Number(paket?.zadnjiOdcitek?.stanje_elektrike ?? 0);
    const prejsnjeVode = Number(paket?.zadnjiOdcitek?.stanje_vode ?? 0);
    const novoElektrike =
      vnosStevca.stanje_elektrike === '' ? null : Number(vnosStevca.stanje_elektrike);
    const novoVode = vnosStevca.stanje_vode === '' ? null : Number(vnosStevca.stanje_vode);

    const napakeVnosa = [];
    if (novoElektrike === null || !Number.isFinite(novoElektrike)) {
      napakeVnosa.push('Vnesi novo stanje števca elektrike.');
    } else if (novoElektrike < prejsnjeElektrike) {
      napakeVnosa.push('Novo stanje elektrike ne sme biti manjše od prejšnjega.');
    }

    if (imaVodniStevec) {
      if (novoVode === null || !Number.isFinite(novoVode)) {
        napakeVnosa.push('Vnesi novo stanje števca vode.');
      } else if (novoVode < prejsnjeVode) {
        napakeVnosa.push('Novo stanje vode ne sme biti manjše od prejšnjega.');
      }
    }

    const porabaElektrike =
      novoElektrike !== null && Number.isFinite(novoElektrike)
        ? Math.max(0, novoElektrike - prejsnjeElektrike)
        : 0;
    const porabaVode =
      imaVodniStevec && novoVode !== null && Number.isFinite(novoVode)
        ? Math.max(0, novoVode - prejsnjeVode)
        : 0;

    const strosekElektrike = Number(
      (porabaElektrike * Number(izbranaCena?.cena_elektrike ?? 0)).toFixed(2)
    );
    const strosekVode = Number((porabaVode * Number(izbranaCena?.cena_vode ?? 0)).toFixed(2));

    return {
      prejsnjeElektrike,
      prejsnjeVode,
      novoElektrike,
      novoVode,
      porabaElektrike,
      porabaVode,
      strosekElektrike,
      strosekVode,
      veljavno: napakeVnosa.length === 0,
      napakeVnosa
    };
  }, [paket, izbranaCena, vnosStevca, imaVodniStevec]);

  const trenutniPrikaz = useMemo(() => {
    if (!paket?.soba || !izbranaCena) return null;

    const najemnina = Number(trenutno?.najemnina ?? paket.soba.najemnina ?? 0);
    const strosekSkupni = Number(trenutno?.strosekSkupni ?? paket.soba.strosek_skupni ?? 0);
    const strosekNeta = Number(trenutno?.strosekNeta ?? paket.soba.nettv ?? paket.soba.strosek_neta ?? 0);
    const strosekTv = Number(trenutno?.strosekTv ?? paket.soba.fiksni ?? paket.soba.strosek_tv ?? 0);
    const strosekOgrevanja = Number(trenutno?.strosekOgrevanja ?? paket.strosekOgrevanja ?? 0);

    const imaVnosElektrike =
      vnosStevca.stanje_elektrike !== '' && Number.isFinite(predogledStevca.novoElektrike);
    const imaVnosVode =
      imaVodniStevec && vnosStevca.stanje_vode !== '' && Number.isFinite(predogledStevca.novoVode);

    const osnovniStrosekVode = imaVodniStevec
      ? Number(trenutno?.strosekVode ?? 0)
      : Number(paket.soba.voda ?? 0);
    const strosekElektrike = imaVnosElektrike
      ? Number(predogledStevca.strosekElektrike ?? 0)
      : Number(trenutno?.strosekElektrike ?? 0);
    const strosekVode = imaVnosVode
      ? Number(predogledStevca.strosekVode ?? 0)
      : osnovniStrosekVode;

    const skupaj =
      najemnina +
      strosekSkupni +
      strosekNeta +
      strosekTv +
      strosekOgrevanja +
      strosekElektrike +
      strosekVode;

    return {
      najemnina,
      strosekSkupni,
      strosekNeta,
      strosekTv,
      strosekOgrevanja,
      strosekElektrike,
      strosekVode,
      skupaj: Number(skupaj.toFixed(2))
    };
  }, [paket, izbranaCena, trenutno, predogledStevca, vnosStevca, imaVodniStevec]);

  const vrsticePlacila = useMemo(
    () =>
      (paket?.placila ?? []).map((p) => ({
        id: p.id,
        obdobje: `${String(p.mesec).padStart(2, '0')}.${p.leto}`,
        mesec: Number(p.mesec),
        leto: Number(p.leto),
        najemnina: Number(p.najemnina ?? 0),
        strosek_elektrike: Number(p.strosek_elektrike ?? 0),
        strosek_vode: Number(p.strosek_vode ?? 0),
        strosek_ogrevanja: Number(p.strosek_ogrevanja ?? 0),
        strosek_neta: Number(p.strosek_neta ?? 0),
        strosek_tv: Number(p.strosek_tv ?? 0),
        strosek_skupni: Number(p.strosek_skupni ?? 0),
        skupni_strosek: denar(Number(p.skupni_strosek ?? 0)),
        placano_bool: Boolean(p.placano),
        placano: p.placano ? 'da' : 'ne',
        datum_izracuna: p.datum_izracuna ? dayjs(p.datum_izracuna).format('DD.MM.YYYY') : '-',
        datum_placila: p.datum_placila ? dayjs(p.datum_placila).format('DD.MM.YYYY') : '-'
      })),
    [paket]
  );

  useEffect(() => {
    if (vrsticePlacila.length === 0) {
      setIzbranRacunId(null);
      return;
    }
    if (!vrsticePlacila.some((r) => r.id === izbranRacunId)) {
      setIzbranRacunId(vrsticePlacila[0].id);
    }
  }, [vrsticePlacila, izbranRacunId]);

  const izbranRacun = useMemo(
    () => vrsticePlacila.find((r) => r.id === izbranRacunId) ?? null,
    [vrsticePlacila, izbranRacunId]
  );

  const skupniZnesekRacuna = (racun) =>
    denar(
      (racun?.najemnina ?? 0) +
        (racun?.strosek_skupni ?? 0) +
        (racun?.strosek_neta ?? 0) +
        (racun?.strosek_tv ?? 0) +
        (racun?.strosek_ogrevanja ?? 0) +
        (racun?.strosek_elektrike ?? 0) +
        (racun?.strosek_vode ?? 0)
    );

  const jeOgrevanjeZaklenjeno = paket?.ogrevanjePripravljeno === false;
  const sporociloZaklepaOgrevanja =
    paket?.sporociloZaklepaOgrevanja ||
    'Najemodajalec še ni izračunal stroška ogrevanja, poskusi ponovno jutri. Kontakt: lastnik@example.com';

  const letaRacunov = useMemo(
    () =>
      Array.from(new Set(vrsticePlacila.map((r) => r.leto)))
        .filter((leto) => Number.isFinite(leto))
        .sort((a, b) => b - a),
    [vrsticePlacila]
  );

  const racuniFiltrirani = useMemo(
    () =>
      vrsticePlacila.filter((racun) => {
        if (filterLeto && Number(racun.leto) !== Number(filterLeto)) return false;
        if (filterStatus === 'placano' && !racun.placano_bool) return false;
        if (filterStatus === 'odprto' && racun.placano_bool) return false;
        return true;
      }),
    [vrsticePlacila, filterLeto, filterStatus]
  );

  const karticNaStran = 6;
  const stStraniRacunov = Math.max(1, Math.ceil(racuniFiltrirani.length / karticNaStran));
  const racuniZaPrikaz = useMemo(() => {
    const od = (stranRacunov - 1) * karticNaStran;
    const doIndeks = od + karticNaStran;
    return racuniFiltrirani.slice(od, doIndeks);
  }, [racuniFiltrirani, stranRacunov]);

  useEffect(() => {
    setStranRacunov(1);
  }, [filterLeto, filterStatus]);

  useEffect(() => {
    if (stranRacunov > stStraniRacunov) {
      setStranRacunov(stStraniRacunov);
    }
  }, [stranRacunov, stStraniRacunov]);

  useEffect(() => {
    if (!izbranRacun && podrobnostiOdprte) {
      setPodrobnostiOdprte(false);
    }
  }, [izbranRacun, podrobnostiOdprte]);

  async function shraniStevce(e) {
    e.preventDefault();
    setNapakaStevec('');
    setUspehStevec('');

    if (!paket?.soba?.id) {
      setNapakaStevec('Soba ni določena.');
      return;
    }

    if (jeOgrevanjeZaklenjeno) {
      setNapakaStevec(sporociloZaklepaOgrevanja);
      return;
    }

    if (!predogledStevca.veljavno) {
      setNapakaStevec(predogledStevca.napakeVnosa[0] || 'Vnos ni veljaven.');
      return;
    }

    setShranjevanjeStevca(true);
    try {
      await shraniNajemnikovOdcitek(
        {
          soba_id: paket.soba.id,
          uporabnik_id: seja.user.id,
          mesec: Number(vnosStevca.mesec),
          leto: Number(vnosStevca.leto),
          stanje_elektrike: Number(vnosStevca.stanje_elektrike),
          stanje_vode: imaVodniStevec ? Number(vnosStevca.stanje_vode) : null
        },
        seja.user.id
      );

      const osvezeno = await pridobiNajemnikPodatke(seja.user.id);
      setPaket(osvezeno);
      setVnosStevca((prej) => ({
        ...prej,
        mesec: Number(osvezeno?.obdobjeZaVnos?.mesec ?? privzetoObdobje.mesec),
        leto: Number(osvezeno?.obdobjeZaVnos?.leto ?? privzetoObdobje.leto),
        stanje_elektrike:
          osvezeno?.zadnjiOdcitek?.stanje_elektrike != null
            ? String(osvezeno.zadnjiOdcitek.stanje_elektrike)
            : '',
        stanje_vode: sobaImaVodniStevec(osvezeno?.soba)
          ? osvezeno?.zadnjiOdcitek?.stanje_vode != null
            ? String(osvezeno.zadnjiOdcitek.stanje_vode)
            : ''
          : ''
      }));
      setUspehStevec('Stanje števcev je uspešno shranjeno. Zdaj klikni "Potrdi obračun".');
    } catch (err) {
      setNapakaStevec(err.message || 'Stanja števcev ni bilo mogoče shraniti.');
    } finally {
      setShranjevanjeStevca(false);
    }
  }

  async function potrdiObracun() {
    setNapakaStevec('');
    setUspehStevec('');

    if (!paket?.soba?.id) {
      setNapakaStevec('Soba ni določena.');
      return;
    }

    if (jeOgrevanjeZaklenjeno) {
      setNapakaStevec(sporociloZaklepaOgrevanja);
      return;
    }

    setPotrjevanjeObracuna(true);
    try {
      await potrdiNajemnikovObracun(
        {
          soba_id: paket.soba.id,
          uporabnik_id: seja.user.id,
          mesec: Number(vnosStevca.mesec),
          leto: Number(vnosStevca.leto)
        },
        seja.user.id
      );

      const osvezeno = await pridobiNajemnikPodatke(seja.user.id);
      setPaket(osvezeno);
      setUspehStevec('Obračun je potrjen in shranjen v evidenco obračunov.');
    } catch (err) {
      setNapakaStevec(err.message || 'Obračuna ni bilo mogoče potrditi.');
    } finally {
      setPotrjevanjeObracuna(false);
    }
  }

  // ── Navigacija najemnika (2 sekciji) ──────────────────
  const SEKCIJA_PREGLED = 0;
  const SEKCIJA_RACUNI  = 1;

  // Aktivna sekcija stranskega menija
  const [sekcija, setSekcija] = useState(SEKCIJA_PREGLED);

  const navigacijaNajemnik = [
    { id: SEKCIJA_PREGLED, label: 'Pregled & Vnos',  ikona: <DashboardOutlinedIcon /> },
    { id: SEKCIJA_RACUNI,  label: 'Obračuni',         ikona: <ReceiptOutlinedIcon /> },
  ];

  if (nalaganje) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f1f5f9',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Nalaganje podatkov...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <AppLayout
      navigacija={navigacijaNajemnik}
      aktivnaSekcija={sekcija}
      onSpremembaSekcije={setSekcija}
      naslov={prijavljenNaziv}
      podnaslov={`Soba ${sobaNaziv} · ${hisaNaziv}`}
      onOdjava={odjava}
      brandPodnaslov="Obračuni"
    >
      {/* ── Globalna napaka ── */}
      {napaka && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setNapaka('')}>
          {napaka}
        </Alert>
      )}

      {/* SEKCIJA 0 – PREGLED & VNOS ŠTEVCEV */}
      {sekcija === SEKCIJA_PREGLED && (
        <PregledSekcija
          prijavljenNaziv={prijavljenNaziv}
          sobaNaziv={sobaNaziv}
          hisaNaziv={hisaNaziv}
          izbranaCena={izbranaCena}
          imaVodniStevec={imaVodniStevec}
          denar={denar}
          trenutniPrikaz={trenutniPrikaz}
          vnosStevca={vnosStevca}
          jeOgrevanjeZaklenjeno={jeOgrevanjeZaklenjeno}
          sporociloZaklepaOgrevanja={sporociloZaklepaOgrevanja}
          predogledStevca={predogledStevca}
          setVnosStevca={setVnosStevca}
          napakaStevec={napakaStevec}
          uspehStevec={uspehStevec}
          shranjevanjeStevca={shranjevanjeStevca}
          potrjevanjeObracuna={potrjevanjeObracuna}
          shraniStevce={shraniStevce}
          potrdiObracun={potrdiObracun}
        />
      )}

      {/* SEKCIJA 1 – OBRAČUNI */}
      {sekcija === SEKCIJA_RACUNI && (
        <ObracuniSekcija
          vrsticePlacila={vrsticePlacila}
          racuniFiltrirani={racuniFiltrirani}
          racuniZaPrikaz={racuniZaPrikaz}
          stStraniRacunov={stStraniRacunov}
          stranRacunov={stranRacunov}
          setStranRacunov={setStranRacunov}
          karticNaStran={karticNaStran}
          filterLeto={filterLeto}
          setFilterLeto={setFilterLeto}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          letaRacunov={letaRacunov}
          setIzbranRacunId={setIzbranRacunId}
          setPodrobnostiOdprte={setPodrobnostiOdprte}
        />
      )}

      <DialogPodrobnostiObracuna
        podrobnostiOdprte={podrobnostiOdprte}
        setPodrobnostiOdprte={setPodrobnostiOdprte}
        izbranRacun={izbranRacun}
        denar={denar}
        skupniZnesekRacuna={skupniZnesekRacuna}
      />
    </AppLayout>
  );
}

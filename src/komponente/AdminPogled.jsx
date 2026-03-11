/**
 * AdminPogled – nadzorna plošča za administratorje.
 *
 * Navigacija je organizirana v levem stranskem meniju (AppLayout).
 * Vsaka sekcija je v ločenem bloku, prikazan/skrit glede na `tab` stanje.
 *
 * Sekcije:
 *   0 – Uporabniki
 *   1 – Sobe
 *   2 – Cene elektrike in vode
 *   3 – Ogrevanje
 *   4 – Obračuni najemnikov
 */
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
// Ikone za stranski meni
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import dayjs from 'dayjs';
import { useAvtentikacija } from '../kontekst/AvtentikacijaKontekst';
import AppLayout from './AppLayout';
import UporabnikiSekcija from './admin-pogled/UporabnikiSekcija';
import SobeSekcija from './admin-pogled/SobeSekcija';
import CeneStevciSekcija from './admin-pogled/CeneStevciSekcija';
import OgrevanjeSekcija from './admin-pogled/OgrevanjeSekcija';
import ObracuniSekcija from './admin-pogled/ObracuniSekcija';
import AdminDialogi from './admin-pogled/AdminDialogi';
import {
  stolpciUporabniki,
  tipiHise,
  zapomljiveBesede,
  imenaMesecov,
  prejsnjiMesecLeto,
  jePrvoObdobjeNovejse,
  daNe,
  sobaImaVodniStevec,
  stolpciSobe,
  stolpciCene,
  stolpciAdminStevci,
  stolpciOgrevanjeTipi,
  stolpciObracuni,
  kljucObracuna,
  normalizirajOznakoSobe,
  moznostiStrani,
  lokalizacijaMreze
} from './admin-pogled/konfiguracijaAdminMrez';
import { izvoziXlsxDatoteko } from '../storitve/izvozXlsx';
import { normalizirajFaktorOgrevanja, razdeliOgrevanjePoSobah } from '../storitve/ogrevanje';
import {
  shraniUporabnikaZAuth,
  dodajCeno,
  izbrisiCeno as izbrisiCenoStoritev,
  shraniSobo as shraniSoboStoritev,
  pridobiAdminPodatke,
  shraniOgrevanjeTip,
  shraniAdminObracun,
  potrdiVsaOdprtaPlacila,
  pripraviPrejsnjeObracunskoObdobje,
  osveziSobeOgrevanjePoObdobju,
  shraniAdminOdcitekSobe
} from '../storitve/podatki';

const KLJUC_ADMIN_TAB = 'stanovanja_admin_tab';
const KLJUC_ADMIN_CENE_STEVCI_PODTAB = 'stanovanja_admin_cene_stevci_podtab';

function preberiStevilkoIzStorage(kljuc, privzeto, dovoljeneVrednosti) {
  if (typeof window === 'undefined') return privzeto;
  const surovo = window.localStorage.getItem(kljuc);
  if (surovo == null) return privzeto;
  const parsed = Number(surovo);
  if (!Number.isFinite(parsed)) return privzeto;
  if (Array.isArray(dovoljeneVrednosti) && !dovoljeneVrednosti.includes(parsed)) return privzeto;
  return parsed;
}

export default function AdminPogled() {
  const { seja, profil, odjava, osveziProfil } = useAvtentikacija();
  const [tab, setTab] = useState(() =>
    preberiStevilkoIzStorage(KLJUC_ADMIN_TAB, 0, [0, 1, 2, 3, 4])
  );
  const [nalaganje, setNalaganje] = useState(true);
  const [napaka, setNapaka] = useState('');
  const [obvestilo, setObvestilo] = useState('');
  const [potrjevanjeObdobja, setPotrjevanjeObdobja] = useState(false);
  const [ceneStevciPodtab, setCeneStevciPodtab] = useState(() =>
    preberiStevilkoIzStorage(KLJUC_ADMIN_CENE_STEVCI_PODTAB, 0, [0, 1])
  );
  const [dialogManjkajoceOgrevanje, setDialogManjkajoceOgrevanje] = useState({
    odprt: false,
    mesec: null,
    leto: null,
    nazivObdobja: '',
    tipi: [],
    vrednosti: {}
  });
  const [gesloVidno, setGesloVidno] = useState(true);
  const [podatki, setPodatki] = useState({
    uporabniki: [],
    sobe: [],
    cene: [],
    ogrevanjeTipi: [],
    odcitki: [],
    placila: []
  });
  const privzetoObdobje = prejsnjiMesecLeto();

  function generirajMocnoGeslo(dolzina = 16) {
    const nabor = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*_-?';
    const nakljucno = new Uint32Array(dolzina);
    crypto.getRandomValues(nakljucno);

    let geslo = '';
    for (let i = 0; i < dolzina; i += 1) {
      geslo += nabor[nakljucno[i] % nabor.length];
    }

    return geslo;
  }

  function nakljucniIndeks(max) {
    if (!max || max <= 0) return 0;
    const r = new Uint32Array(1);
    crypto.getRandomValues(r);
    return r[0] % max;
  }

  function titleCase(beseda) {
    if (!beseda) return '';
    return `${beseda.charAt(0).toUpperCase()}${beseda.slice(1).toLowerCase()}`;
  }

  function generirajZapomljivoGeslo(imeSobe = '') {
    const sobaOznaka = normalizirajOznakoSobe(imeSobe);
    const prvaBeseda = titleCase(zapomljiveBesede[nakljucniIndeks(zapomljiveBesede.length)]);
    const drugaBeseda = titleCase(zapomljiveBesede[nakljucniIndeks(zapomljiveBesede.length)]);
    const stevilke = String(100 + nakljucniIndeks(900));
    const simboli = ['!', '#', '?'];
    const simbol = simboli[nakljucniIndeks(simboli.length)];
    return `${sobaOznaka}-${prvaBeseda}${drugaBeseda}-${stevilke}${simbol}`;
  }

  const [novUporabnik, setNovUporabnik] = useState({
    id: '',
    ime: '',
    priimek: '',
    telefon: '',
    email: '',
    geslo: generirajZapomljivoGeslo(),
    soba_id: '',
    admin: false,
    aktiven: true,
    uporabnik_od: dayjs().format('YYYY-MM-DD'),
    uporabnik_do: null,
    zacetno_stanje_elektrike: '',
    zacetno_stanje_vode: '',
    pogodba_od: null,
    pogodba_do: null
  });

  const [novaSoba, setNovaSoba] = useState({
    id: '',
    ime_sobe: '',
    tip_hise: 'velika',
    voda: 0,
    aktivna: true,
    najemnina: 0,
    strosek_skupni: 0,
    nettv: 0,
    fiksni: 0,
    faktor_ogrevanja: 1
  });

  const [novaCena, setNovaCena] = useState({
    id: '',
    tip_hise: 'velika',
    velja_od: dayjs().format('YYYY-MM-DD'),
    cena_elektrike: 0,
    cena_vode: 0
  });

  const [novoOgrevanje, setNovoOgrevanje] = useState({
    id: '',
    tip_hise: 'velika',
    mesec: privzetoObdobje.mesec,
    leto: privzetoObdobje.leto,
    znesek: 0,
    opomba: ''
  });
  const [filterObracuni, setFilterObracuni] = useState({
    soba_id: '',
    uporabnik_id: '',
    mesec: '',
    leto: ''
  });
  const [dialogPotrdiVse, setDialogPotrdiVse] = useState({ odprt: false, stevilo: 0, ids: [] });
  const [obdelujemPotrdiVse, setObdelujemPotrdiVse] = useState(false);
  const [dialogZePripravljeno, setDialogZePripravljeno] = useState({ odprt: false, nazivObdobja: '' });
  const [filterStevciSoba, setFilterStevciSoba] = useState('');
  const [novStevecAdmin, setNovStevecAdmin] = useState({
    id: '',
    soba_id: '',
    mesec: privzetoObdobje.mesec,
    leto: privzetoObdobje.leto,
    stanje_elektrike: '',
    stanje_vode: ''
  });

  function izberiUporabnikaZaUrejanje(uporabnikId, seznamUporabnikov = podatki.uporabniki) {
    const uporabnik = seznamUporabnikov.find((u) => u.id === uporabnikId);
    if (!uporabnik) return;

    setNovUporabnik({
      id: uporabnik.id,
      ime: uporabnik.ime ?? '',
      priimek: uporabnik.priimek ?? '',
      telefon: uporabnik.telefon ?? '',
      email: uporabnik.email ?? '',
      geslo: '',
      soba_id: uporabnik.soba_id ?? '',
      admin: Boolean(uporabnik.admin),
      aktiven: Boolean(uporabnik.aktiven),
      uporabnik_od: uporabnik.uporabnik_od
        ? dayjs(uporabnik.uporabnik_od).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      uporabnik_do: uporabnik.uporabnik_do
        ? dayjs(uporabnik.uporabnik_do).format('YYYY-MM-DD')
        : null,
      zacetno_stanje_elektrike:
        uporabnik.zacetno_stanje_elektrike == null ? '' : String(uporabnik.zacetno_stanje_elektrike),
      zacetno_stanje_vode:
        uporabnik.zacetno_stanje_vode == null ? '' : String(uporabnik.zacetno_stanje_vode),
      pogodba_od: uporabnik.pogodba_od
        ? dayjs(uporabnik.pogodba_od).format('YYYY-MM-DD')
        : null,
      pogodba_do: uporabnik.pogodba_do
        ? dayjs(uporabnik.pogodba_do).format('YYYY-MM-DD')
        : null
    });
  }

  function izberiCenoZaUrejanje(cenaId, seznamCen = podatki.cene) {
    const cena = seznamCen.find((c) => c.id === cenaId);
    if (!cena) return;

    setNovaCena({
      id: cena.id,
      tip_hise: cena.tip_hise,
      velja_od: cena.velja_od ? dayjs(cena.velja_od).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      cena_elektrike: cena.cena_elektrike ?? 0,
      cena_vode: cena.cena_vode ?? 0
    });
    setObvestilo(
      'Urejanje cene je dovoljeno, dokler cena še ni uporabljena v potrjenem obračunu. V nasprotnem primeru dodaj nov zapis.'
    );
  }

  function izberiOgrevanjeZaUrejanje(ogrevanjeId, seznam = podatki.ogrevanjeTipi) {
    const zapis = seznam.find((o) => o.id === ogrevanjeId);
    if (!zapis) return;

    setNovoOgrevanje({
      id: zapis.id,
      tip_hise: zapis.tip_hise,
      mesec: Number(zapis.mesec),
      leto: Number(zapis.leto),
      znesek: Number(zapis.znesek ?? 0),
      opomba: zapis.opomba ?? ''
    });
  }

  function izberiSoboZaUrejanje(sobaId, seznamSob = podatki.sobe) {
    const soba = seznamSob.find((s) => s.id === sobaId);
    if (!soba) return;

    setNovaSoba({
      id: soba.id,
      ime_sobe: soba.ime_sobe ?? '',
      tip_hise: soba.tip_hise ?? 'velika',
      voda: Number(soba.voda ?? 0),
      aktivna: Boolean(soba.aktivna),
      najemnina: Number(soba.najemnina ?? 0),
      strosek_skupni: Number(soba.strosek_skupni ?? 0),
      nettv: Number(soba.nettv ?? soba.strosek_neta ?? 0),
      fiksni: Number(soba.fiksni ?? soba.strosek_tv ?? 0),
      faktor_ogrevanja: normalizirajFaktorOgrevanja(soba.faktor_ogrevanja)
    });
  }

  function ponastaviUporabnikForm() {
    setNovUporabnik({
      id: '',
      ime: '',
      priimek: '',
      telefon: '',
      email: '',
      geslo: generirajZapomljivoGeslo(),
      soba_id: '',
      admin: false,
      aktiven: true,
      uporabnik_od: dayjs().format('YYYY-MM-DD'),
      uporabnik_do: null,
      zacetno_stanje_elektrike: '',
      zacetno_stanje_vode: '',
      pogodba_od: null,
      pogodba_do: null
    });
  }

  function nastaviAktivnostUporabnika(aktiven) {
    setNovUporabnik((prej) => ({
      ...prej,
      aktiven,
      uporabnik_do: aktiven ? null : (prej.uporabnik_do || dayjs().format('YYYY-MM-DD'))
    }));
  }

  function ponastaviCenaForm() {
    setNovaCena({
      id: '',
      tip_hise: 'velika',
      velja_od: dayjs().format('YYYY-MM-DD'),
      cena_elektrike: 0,
      cena_vode: 0
    });
  }

  function ponastaviOgrevanjeForm() {
    const p = prejsnjiMesecLeto();
    setNovoOgrevanje({
      id: '',
      tip_hise: 'velika',
      mesec: p.mesec,
      leto: p.leto,
      znesek: 0,
      opomba: ''
    });
  }

  function ponastaviNovoSoboForm() {
    setNovaSoba({
      id: '',
      ime_sobe: '',
      tip_hise: 'velika',
      voda: 0,
      aktivna: true,
      najemnina: 0,
      strosek_skupni: 0,
      nettv: 0,
      fiksni: 0,
      faktor_ogrevanja: 1
    });
  }

  function ponastaviStevecAdminForm() {
    const p = prejsnjiMesecLeto();
    setNovStevecAdmin({
      id: '',
      soba_id: '',
      mesec: p.mesec,
      leto: p.leto,
      stanje_elektrike: '',
      stanje_vode: ''
    });
  }

  function izberiStevecAdminZaUrejanje(odcitekId, seznam = vrsticeStevciAdmin) {
    const odcitek = seznam.find((o) => o.id === odcitekId);
    if (!odcitek) return;

    setNovStevecAdmin({
      id: odcitek.id,
      soba_id: odcitek.soba_id ?? '',
      mesec: Number(odcitek.mesec ?? prejsnjiMesecLeto().mesec),
      leto: Number(odcitek.leto ?? prejsnjiMesecLeto().leto),
      stanje_elektrike: String(odcitek.stanje_elektrike ?? ''),
      stanje_vode: odcitek.stanje_vode == null ? '' : String(odcitek.stanje_vode)
    });
  }

  function normalizirajSobaStroske(vrednosti) {
    const najemnina = Number(vrednosti.najemnina ?? 0);
    const skupni = Number(vrednosti.strosek_skupni ?? 0);
    const netTv = Number(vrednosti.nettv ?? 0);
    const fiksni = Number(vrednosti.fiksni ?? 0);
    const faktorOgrevanja = Number(vrednosti.faktor_ogrevanja ?? 1);
    return {
      najemnina,
      skupni,
      netTv,
      fiksni,
      faktorOgrevanja
    };
  }

  function pripraviSoboPayload(vrednosti) {
    const imeSobe = String(vrednosti.ime_sobe ?? '').trim();
    const tipHise = String(vrednosti.tip_hise ?? '').trim();
    const { najemnina, skupni, netTv, fiksni, faktorOgrevanja } = normalizirajSobaStroske(vrednosti);
    const voda = Number(vrednosti.voda ?? 0);
    const imaVodniStevec = sobaImaVodniStevec({ tip_hise: tipHise });

    if (!imeSobe) throw new Error('Polje Soba je obvezno.');
    if (!tipiHise.includes(tipHise)) throw new Error('Hiša mora biti "stara" ali "velika".');
    if (!Number.isFinite(najemnina) || najemnina < 0) throw new Error('Najemnina mora biti 0 ali vec.');
    if (!Number.isFinite(skupni) || skupni < 0) throw new Error('Skupni strosek mora biti 0 ali vec.');
    if (!Number.isFinite(netTv) || netTv < 0) throw new Error('Strosek NetTV mora biti 0 ali vec.');
    if (!Number.isFinite(fiksni) || fiksni < 0) throw new Error('Strosek fiksni mora biti 0 ali vec.');
    if (!Number.isFinite(faktorOgrevanja) || faktorOgrevanja < 0) throw new Error('Faktor ogrevanja mora biti 0 ali vec.');
    if (!Number.isFinite(voda) || voda < 0) throw new Error('Voda mora biti 0 ali vec.');

    return {
      id: vrednosti.id || undefined,
      ime_sobe: imeSobe,
      tip_hise: tipHise,
      voda_stanje: imaVodniStevec,
      voda: imaVodniStevec ? 0 : voda,
      aktivna: Boolean(vrednosti.aktivna),
      najemnina,
      strosek_skupni: skupni,
      nettv: netTv,
      fiksni,
      faktor_ogrevanja: faktorOgrevanja
    };
  }

  async function kopirajGeslo() {
    if (!novUporabnik.geslo) return;
    try {
      await navigator.clipboard.writeText(novUporabnik.geslo);
    } catch {
      setNapaka('Gesla ni bilo mogoce kopirati v odlozisce.');
    }
  }

  async function nalozi(moznosti = { prikaziNalaganje: true }) {
    const { prikaziNalaganje } = moznosti;
    if (prikaziNalaganje) {
      setNalaganje(true);
    }
    setNapaka('');
    try {
      const data = await pridobiAdminPodatke();
      setPodatki(data);
    } catch (err) {
      setNapaka(err.message || 'Napaka pri nalaganju admin podatkov.');
    } finally {
      if (prikaziNalaganje) {
        setNalaganje(false);
      }
    }
  }

  useEffect(() => {
    nalozi();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KLJUC_ADMIN_TAB, String(tab));
  }, [tab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KLJUC_ADMIN_CENE_STEVCI_PODTAB, String(ceneStevciPodtab));
  }, [ceneStevciPodtab]);

  const vrsticeUporabniki = useMemo(() => {
    const poId = new Map(
      podatki.uporabniki.map((u) => [u.id, `${u.ime ?? ''} ${u.priimek ?? ''}`.trim() || u.email || u.id])
    );
    return podatki.uporabniki.map((u) => ({
      id: u.id,
      ime_priimek: `${u.ime} ${u.priimek}`,
      email: u.email,
      telefon: u.telefon,
      soba: u.sobe?.ime_sobe ?? '-',
      admin: Boolean(u.admin),
      aktiven: Boolean(u.aktiven),
      zacetno_stanje_elektrike:
        u.zacetno_stanje_elektrike == null ? null : Number(u.zacetno_stanje_elektrike),
      zacetno_stanje_vode:
        u.zacetno_stanje_vode == null ? null : Number(u.zacetno_stanje_vode),
      pogodba_od: u.pogodba_od ?? null,
      pogodba_do: u.pogodba_do ?? null,
      ustvarjeno_ob: u.ustvarjeno_ob ?? null,
      posodobljeno_ob: u.posodobljeno_ob ?? null,
      posodobil_ime: u.posodobil ? (poId.get(u.posodobil) ?? null) : null,
    }));
  }, [podatki]);

  const vrsticeSobe = useMemo(
    () => {
      const uporabnikiPoId = new Map(
        podatki.uporabniki.map((u) => [
          u.id,
          `${u.ime ?? ''} ${u.priimek ?? ''}`.trim() || u.email || u.id
        ])
      );

      const sobePoTipu = (podatki.sobe ?? []).reduce((acc, soba) => {
        if (!soba?.tip_hise) return acc;
        if (!acc[soba.tip_hise]) acc[soba.tip_hise] = [];
        acc[soba.tip_hise].push(soba);
        return acc;
      }, {});

      const najnovejsiOgrevanjePoTipu = (podatki.ogrevanjeTipi ?? []).reduce((acc, zapis) => {
        if (!zapis?.tip_hise) return acc;
        const obstojeci = acc[zapis.tip_hise];
        if (!obstojeci || jePrvoObdobjeNovejse(zapis, obstojeci)) {
          acc[zapis.tip_hise] = zapis;
        }
        return acc;
      }, {});

      const razdelitveOgrevanjaPoTipu = new Map(
        Object.entries(najnovejsiOgrevanjePoTipu).map(([tipHise, zapis]) => [
          tipHise,
          razdeliOgrevanjePoSobah(zapis.znesek, sobePoTipu[tipHise] ?? [])
        ])
      );

      return podatki.sobe.map((s) => ({
        strosek_skupni: Number(s.strosek_skupni ?? 0),
        nettv: Number(s.nettv ?? s.strosek_neta ?? 0),
        fiksni: Number(s.fiksni ?? s.strosek_tv ?? 0),
        strosek_ogrevanja: Number(
          razdelitveOgrevanjaPoTipu.get(s.tip_hise)?.get(s.id) ?? s.strosek_ogrevanja ?? 0
        ),
        faktor_ogrevanja: normalizirajFaktorOgrevanja(s.faktor_ogrevanja),
        posodobil_ime: s.posodobil ? (uporabnikiPoId.get(s.posodobil) ?? s.posodobil) : '-',
        posodobljeno_oblikovano: s.posodobljeno_ob
          ? dayjs(s.posodobljeno_ob).format('DD.MM.YYYY HH:mm')
          : '-',
        id: s.id,
        ime_sobe: s.ime_sobe,
        tip_hise: s.tip_hise,
        voda: Number(s.voda ?? 0),
        najemnina: Number(s.najemnina ?? 0),
        aktivna: Boolean(s.aktivna)
      }));
    },
    [podatki]
  );

  // Označi cene, ki so že "zaklenjene" z uporabo v potrjenih obračunih.
  const vrsticeCene = useMemo(() => {
    const cene = podatki.cene ?? [];
    const placila = (podatki.placila ?? []).filter((placilo) => Boolean(placilo?.placano));
    const sobePoId = new Map((podatki.sobe ?? []).map((s) => [s.id, s]));

    const placilaDatumiPoTipu = new Map();
    placila.forEach((placilo) => {
      const tip = sobePoId.get(placilo.soba_id)?.tip_hise;
      if (!tip) return;
      const datumObdobja = dayjs(`${placilo.leto}-${String(placilo.mesec).padStart(2, '0')}-01`);
      if (!datumObdobja.isValid()) return;
      if (!placilaDatumiPoTipu.has(tip)) placilaDatumiPoTipu.set(tip, []);
      placilaDatumiPoTipu.get(tip).push(datumObdobja.startOf('day'));
    });

    const cenePoTipu = new Map();
    cene.forEach((cena) => {
      if (!cena?.tip_hise) return;
      if (!cenePoTipu.has(cena.tip_hise)) cenePoTipu.set(cena.tip_hise, []);
      cenePoTipu.get(cena.tip_hise).push(cena);
    });

    const povezanaCenaPoId = new Map();

    cenePoTipu.forEach((seznamCenTipa, tip) => {
      const sortirane = [...seznamCenTipa].sort(
        (a, b) => dayjs(a.velja_od).valueOf() - dayjs(b.velja_od).valueOf()
      );
      const datumiPlacil = placilaDatumiPoTipu.get(tip) ?? [];

      sortirane.forEach((cena, index) => {
        const od = dayjs(cena.velja_od).startOf('day');
        const naslednjaCena = index < sortirane.length - 1
          ? dayjs(sortirane[index + 1].velja_od).startOf('day')
          : null;

        const jePovezana = datumiPlacil.some((datumPlacila) => {
          if (!od.isValid()) return false;
          if (datumPlacila.isBefore(od, 'day')) return false;
          if (naslednjaCena?.isValid() && !datumPlacila.isBefore(naslednjaCena, 'day')) return false;
          return true;
        });

        povezanaCenaPoId.set(cena.id, jePovezana);
      });
    });

    return cene.map((c) => {
      const jePovezanaZObracuni = Boolean(povezanaCenaPoId.get(c.id));
      return {
        id: c.id,
        tip_hise: c.tip_hise,
        velja_od: dayjs(c.velja_od).format('DD.MM.YYYY'),
        cena_elektrike: Number(c.cena_elektrike).toFixed(4),
        cena_vode: Number(c.cena_vode).toFixed(4),
        je_povezana_z_obracuni: jePovezanaZObracuni,
        se_lahko_brise: !jePovezanaZObracuni
      };
    });
  }, [podatki]);

  const vrsticeOgrevanjeTipi = useMemo(
    () =>
      podatki.ogrevanjeTipi.map((o) => ({
        id: o.id,
        tip_hise: o.tip_hise,
        obdobje: `${String(Number(o.mesec) || 1).padStart(2, '0')}.${o.leto}`,
        znesek: Number(o.znesek ?? 0),
        opomba: o.opomba ?? '',
        mesec: Number(o.mesec),
        leto: Number(o.leto)
      })),
    [podatki]
  );

  const vrsticeObracuni = useMemo(() => {
    const sobePoId = new Map((podatki.sobe ?? []).map((s) => [s.id, s]));
    const uporabnikiPoId = new Map((podatki.uporabniki ?? []).map((u) => [u.id, u]));
    const odcitkiPoKljucu = new Map(
      (podatki.odcitki ?? []).map((o) => [
        kljucObracuna(o.soba_id, o.uporabnik_id, o.mesec, o.leto),
        o
      ])
    );
    const odcitkiPoSobaObdobju = new Map(
      (podatki.odcitki ?? []).map((o) => [
        `${o.soba_id ?? 'null'}|${o.mesec}|${o.leto}`,
        o
      ])
    );

    const cenePoTipu = (podatki.cene ?? []).reduce((acc, cena) => {
      if (!acc[cena.tip_hise]) acc[cena.tip_hise] = [];
      acc[cena.tip_hise].push(cena);
      return acc;
    }, {});

    Object.values(cenePoTipu).forEach((seznam) => {
      seznam.sort((a, b) => dayjs(b.velja_od).valueOf() - dayjs(a.velja_od).valueOf());
    });

    return (podatki.placila ?? []).map((placilo) => {
      const soba = sobePoId.get(placilo.soba_id);
      const uporabnik = placilo.uporabnik_id ? uporabnikiPoId.get(placilo.uporabnik_id) : null;
      const odcitek =
        odcitkiPoKljucu.get(kljucObracuna(placilo.soba_id, placilo.uporabnik_id, placilo.mesec, placilo.leto)) ??
        odcitkiPoSobaObdobju.get(`${placilo.soba_id ?? 'null'}|${placilo.mesec}|${placilo.leto}`) ??
        null;
      const tip = soba?.tip_hise ?? null;
      const ceneTip = tip ? (cenePoTipu[tip] ?? []) : [];
      const obdobjeDatum = dayjs(`${placilo.leto}-${String(placilo.mesec).padStart(2, '0')}-01`);
      const cena =
        ceneTip.find((c) => dayjs(c.velja_od).isSame(obdobjeDatum) || dayjs(c.velja_od).isBefore(obdobjeDatum)) ||
        ceneTip[0] ||
        null;

      const prejsnjeStanjeElektrike =
        odcitek?.prejsnje_stanje_elektrike == null ? 0 : Number(odcitek.prejsnje_stanje_elektrike);
      const trenutnoStanjeElektrike = Number(odcitek?.stanje_elektrike ?? 0);
      const prejsnjeStanjeVode =
        odcitek?.prejsnje_stanje_vode == null ? 0 : Number(odcitek.prejsnje_stanje_vode);
      const trenutnoStanjeVode = odcitek?.stanje_vode == null ? null : Number(odcitek.stanje_vode);
      const vodaStanje = sobaImaVodniStevec(soba);
      const vodaFiksni = Number(soba?.voda ?? 0);
      const porabaElektrike =
        odcitek?.poraba_elektrike != null
          ? Number(odcitek.poraba_elektrike)
          : Math.max(0, trenutnoStanjeElektrike - prejsnjeStanjeElektrike);
      const porabaVode =
        odcitek?.poraba_vode != null
          ? Number(odcitek.poraba_vode)
          : vodaStanje && trenutnoStanjeVode != null
            ? Math.max(0, trenutnoStanjeVode - prejsnjeStanjeVode)
          : 0;
      const cenaElektrike = Number(placilo.cena_elektrike ?? cena?.cena_elektrike ?? 0);
      const cenaVode = Number(placilo.cena_vode ?? cena?.cena_vode ?? 0);
      const strosekElektrike = Number(placilo.strosek_elektrike ?? 0);
      const strosekVode = Number(placilo.strosek_vode ?? 0);
      const najemnina = Number(placilo.najemnina ?? 0);
      const strosekSkupni = Number(placilo.strosek_skupni ?? 0);
      const strosekNeta = Number(placilo.strosek_neta ?? 0);
      const strosekTv = Number(placilo.strosek_tv ?? 0);
      const strosekOgrevanja = Number(placilo.strosek_ogrevanja ?? 0);
      const skupniStrosek = Number(
        placilo.skupni_strosek ??
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

      return {
        id: placilo.id,
        soba_id: placilo.soba_id,
        uporabnik_id: placilo.uporabnik_id,
        odcitek_id: odcitek?.id ?? null,
        voda_stanje: vodaStanje,
        soba_voda: vodaFiksni,
        mesec: placilo.mesec,
        leto: placilo.leto,
        obdobje: `${String(placilo.mesec).padStart(2, '0')}.${placilo.leto}`,
        soba: soba?.ime_sobe ?? '-',
        tip_hise: tip ?? '-',
        uporabnik: uporabnik ? `${uporabnik.ime ?? ''} ${uporabnik.priimek ?? ''}`.trim() || uporabnik.email : '-',
        stanje_elektrike_prej: prejsnjeStanjeElektrike,
        stanje_vode_prej: prejsnjeStanjeVode,
        stanje_elektrike: trenutnoStanjeElektrike,
        stanje_vode: trenutnoStanjeVode,
        poraba_elektrike: porabaElektrike,
        poraba_vode: porabaVode,
        cena_elektrike: cenaElektrike,
        cena_vode: cenaVode,
        najemnina,
        strosek_skupni: strosekSkupni,
        strosek_neta: strosekNeta,
        strosek_tv: strosekTv,
        strosek_ogrevanja: strosekOgrevanja,
        strosek_elektrike: strosekElektrike,
        strosek_vode: strosekVode,
        skupni_strosek: skupniStrosek,
        placilo_id: placilo.id,
        placano: Boolean(placilo.placano),
        datum_vnosa_iso: odcitek?.datum_vnosa ?? null,
        datum_vnosa_format: odcitek?.datum_vnosa ? dayjs(odcitek.datum_vnosa).format('DD.MM.YYYY') : '-',
        datum_placila_iso: placilo.datum_placila ?? null,
        datum_placila_format: placilo.datum_placila ? dayjs(placilo.datum_placila).format('DD.MM.YYYY') : '-'
      };
    });
  }, [podatki]);

  const vrsticeStevciAdmin = useMemo(() => {
    const sobePoId = new Map((podatki.sobe ?? []).map((s) => [s.id, s]));
    const uporabnikiPoId = new Map((podatki.uporabniki ?? []).map((u) => [u.id, u]));
    const odcitkiPoSoba = new Map();

    (podatki.odcitki ?? []).forEach((o) => {
      const kljuc = String(o.soba_id ?? '');
      if (!odcitkiPoSoba.has(kljuc)) odcitkiPoSoba.set(kljuc, []);
      odcitkiPoSoba.get(kljuc).push(o);
    });

    odcitkiPoSoba.forEach((seznam) => {
      seznam.sort((a, b) => {
        if (Number(a.leto) !== Number(b.leto)) return Number(b.leto) - Number(a.leto);
        if (Number(a.mesec) !== Number(b.mesec)) return Number(b.mesec) - Number(a.mesec);
        return dayjs(b.datum_vnosa ?? 0).valueOf() - dayjs(a.datum_vnosa ?? 0).valueOf();
      });
    });

    const vrsticeOdcitkov = (podatki.odcitki ?? []).map((o) => {
      const soba = sobePoId.get(o.soba_id);
      const vneselUporabnik = o.posodobil ? uporabnikiPoId.get(o.posodobil) : null;
      const vnesel =
        vneselUporabnik
          ? `${vneselUporabnik.ime ?? ''} ${vneselUporabnik.priimek ?? ''}`.trim() || vneselUporabnik.email
          : (o.posodobil ?? '-');
      return {
        id: o.id,
        soba_id: o.soba_id,
        soba: soba?.ime_sobe ?? '-',
        tip_hise: soba?.tip_hise ?? '-',
        voda_stanje: sobaImaVodniStevec(soba),
        mesec: Number(o.mesec ?? 0),
        leto: Number(o.leto ?? 0),
        obdobje: `${String(o.mesec).padStart(2, '0')}.${o.leto}`,
        stanje_elektrike_prej: Number(o.prejsnje_stanje_elektrike ?? 0),
        stanje_elektrike: Number(o.stanje_elektrike ?? 0),
        stanje_vode_prej: o.prejsnje_stanje_vode == null ? null : Number(o.prejsnje_stanje_vode),
        stanje_vode: o.stanje_vode == null ? null : Number(o.stanje_vode),
        datum_vnosa: o.datum_vnosa ? dayjs(o.datum_vnosa).format('DD.MM.YYYY') : '-',
        vnesel
      };
    });

    const obstojeceObdobjeSobe = new Set(
      (podatki.odcitki ?? []).map((o) => `${o.soba_id ?? ''}|${Number(o.mesec ?? 0)}|${Number(o.leto ?? 0)}`)
    );

    // Za najemnike z začetnimi stanji ustvarimo virtualne vrstice, če za začetek še ni odčitka.
    const vrsticeZacetnihStanj = (podatki.uporabniki ?? [])
      .filter((u) => u?.soba_id && u?.uporabnik_od)
      .filter((u) => u?.zacetno_stanje_elektrike != null || u?.zacetno_stanje_vode != null)
      .map((u) => {
        const soba = sobePoId.get(u.soba_id);
        if (!soba) return null;

        const datumZacetka = dayjs(u.uporabnik_od);
        if (!datumZacetka.isValid()) return null;
        const mesec = datumZacetka.month() + 1;
        const leto = datumZacetka.year();
        const kljucObdobjaSobe = `${u.soba_id}|${mesec}|${leto}`;
        if (obstojeceObdobjeSobe.has(kljucObdobjaSobe)) return null;

        const pretekli = (odcitkiPoSoba.get(String(u.soba_id)) ?? []).find((o) =>
          Number(o.leto) < leto || (Number(o.leto) === leto && Number(o.mesec) < mesec)
        );
        const imaVodo = sobaImaVodniStevec(soba);
        const zacetnaElektrika = Number(u.zacetno_stanje_elektrike ?? pretekli?.stanje_elektrike ?? 0);
        const zacetnaVoda = imaVodo
          ? Number(u.zacetno_stanje_vode ?? pretekli?.stanje_vode ?? 0)
          : null;

        return {
          id: `zacetno-${u.id}`,
          soba_id: u.soba_id,
          soba: soba?.ime_sobe ?? '-',
          tip_hise: soba?.tip_hise ?? '-',
          voda_stanje: imaVodo,
          mesec,
          leto,
          obdobje: `${String(mesec).padStart(2, '0')}.${leto}`,
          stanje_elektrike_prej: pretekli?.stanje_elektrike == null ? zacetnaElektrika : Number(pretekli.stanje_elektrike),
          stanje_elektrike: zacetnaElektrika,
          stanje_vode_prej: !imaVodo
            ? null
            : (pretekli?.stanje_vode == null ? zacetnaVoda : Number(pretekli.stanje_vode)),
          stanje_vode: zacetnaVoda,
          datum_vnosa: datumZacetka.format('DD.MM.YYYY'),
          vnesel: 'Začetno stanje najemnika'
        };
      })
      .filter(Boolean);

    return [...vrsticeZacetnihStanj, ...vrsticeOdcitkov];
  }, [podatki.odcitki, podatki.sobe, podatki.uporabniki]);

  const vrsticeStevciAdminFiltrirane = useMemo(
    () =>
      vrsticeStevciAdmin.filter((v) => {
        if (filterStevciSoba && v.soba_id !== filterStevciSoba) return false;
        return true;
      }),
    [vrsticeStevciAdmin, filterStevciSoba]
  );

  const izbranaSobaStevec = useMemo(
    () => (podatki.sobe ?? []).find((s) => s.id === novStevecAdmin.soba_id) ?? null,
    [podatki.sobe, novStevecAdmin.soba_id]
  );

  const izbranaSobaNovUporabnik = useMemo(
    () => (podatki.sobe ?? []).find((s) => s.id === novUporabnik.soba_id) ?? null,
    [podatki.sobe, novUporabnik.soba_id]
  );

  // Predlog začetnih stanj vzamemo iz zadnjega znanega odčitka posamezne sobe.
  const predlogiZacetnihStanjPoSobi = useMemo(() => {
    const kandidati = [...(podatki.odcitki ?? [])].sort((a, b) => {
      if (Number(a.leto) !== Number(b.leto)) return Number(b.leto) - Number(a.leto);
      if (Number(a.mesec) !== Number(b.mesec)) return Number(b.mesec) - Number(a.mesec);
      return dayjs(b.datum_vnosa ?? 0).valueOf() - dayjs(a.datum_vnosa ?? 0).valueOf();
    });

    const poSobi = new Map();
    kandidati.forEach((o) => {
      if (!o?.soba_id || poSobi.has(o.soba_id)) return;
      poSobi.set(o.soba_id, {
        stanje_elektrike: o.stanje_elektrike == null ? null : Number(o.stanje_elektrike),
        stanje_vode: o.stanje_vode == null ? null : Number(o.stanje_vode)
      });
    });
    return poSobi;
  }, [podatki.odcitki]);

  const predlogZacetnihStanjZaNovUporabnik = useMemo(
    () => predlogiZacetnihStanjPoSobi.get(novUporabnik.soba_id) ?? null,
    [predlogiZacetnihStanjPoSobi, novUporabnik.soba_id]
  );

  // Pri novem uporabniku samodejno predlagamo začetna stanja, če polji še nista izpolnjeni.
  useEffect(() => {
    if (novUporabnik.id || !novUporabnik.soba_id) return;
    const predlog = predlogiZacetnihStanjPoSobi.get(novUporabnik.soba_id);
    if (!predlog) return;

    setNovUporabnik((prej) => {
      if (prej.id || prej.soba_id !== novUporabnik.soba_id) return prej;
      const naslednjiElektrikaPrazna =
        prej.zacetno_stanje_elektrike == null || String(prej.zacetno_stanje_elektrike).trim() === '';
      const naslednjiVodaPrazna =
        prej.zacetno_stanje_vode == null || String(prej.zacetno_stanje_vode).trim() === '';

      if (!naslednjiElektrikaPrazna && (!naslednjiVodaPrazna || predlog.stanje_vode == null)) {
        return prej;
      }

      return {
        ...prej,
        zacetno_stanje_elektrike: naslednjiElektrikaPrazna && predlog.stanje_elektrike != null
          ? String(predlog.stanje_elektrike)
          : prej.zacetno_stanje_elektrike,
        zacetno_stanje_vode: naslednjiVodaPrazna && predlog.stanje_vode != null
          ? String(predlog.stanje_vode)
          : prej.zacetno_stanje_vode
      };
    });
  }, [novUporabnik.id, novUporabnik.soba_id, predlogiZacetnihStanjPoSobi]);

  function uporabiPredlaganaZacetnaStanja() {
    if (!predlogZacetnihStanjZaNovUporabnik) return;
    setNovUporabnik((prej) => ({
      ...prej,
      zacetno_stanje_elektrike:
        predlogZacetnihStanjZaNovUporabnik.stanje_elektrike == null
          ? ''
          : String(predlogZacetnihStanjZaNovUporabnik.stanje_elektrike),
      zacetno_stanje_vode:
        predlogZacetnihStanjZaNovUporabnik.stanje_vode == null
          ? ''
          : String(predlogZacetnihStanjZaNovUporabnik.stanje_vode)
    }));
  }

  const moznostiFilterSobe = useMemo(
    () =>
      (podatki.sobe ?? [])
        .map((s) => ({ id: s.id, ime: s.ime_sobe }))
        .sort((a, b) => a.ime.localeCompare(b.ime, 'sl')),
    [podatki.sobe]
  );

  const moznostiFilterUporabniki = useMemo(() => {
    const poId = new Map();
    vrsticeObracuni.forEach((vrstica) => {
      if (vrstica.uporabnik_id && !poId.has(vrstica.uporabnik_id)) {
        poId.set(vrstica.uporabnik_id, vrstica.uporabnik);
      }
    });
    return Array.from(poId.entries())
      .map(([id, ime]) => ({ id, ime }))
      .sort((a, b) => a.ime.localeCompare(b.ime, 'sl'));
  }, [vrsticeObracuni]);

  const letaObracunov = useMemo(
    () =>
      Array.from(
        new Set(
          vrsticeObracuni
            .map((v) => Number(v.leto))
            .filter((l) => Number.isFinite(l) && l >= 2024)
        )
      ).sort((a, b) => b - a),
    [vrsticeObracuni]
  );

  const vrsticeObracuniFiltrirane = useMemo(
    () =>
      vrsticeObracuni.filter((v) => {
        if (filterObracuni.soba_id && v.soba_id !== filterObracuni.soba_id) return false;
        if (filterObracuni.uporabnik_id && v.uporabnik_id !== filterObracuni.uporabnik_id) return false;
        if (filterObracuni.mesec && Number(v.mesec) !== Number(filterObracuni.mesec)) return false;
        if (filterObracuni.leto && Number(v.leto) !== Number(filterObracuni.leto)) return false;
        return true;
      }),
    [filterObracuni, vrsticeObracuni]
  );

  async function shraniUporabnika(e) {
    e.preventDefault();
    setNapaka('');
    try {
      if (novUporabnik.pogodba_od && novUporabnik.pogodba_do) {
        const pogodbaOd = dayjs(novUporabnik.pogodba_od);
        const pogodbaDo = dayjs(novUporabnik.pogodba_do);
        if (pogodbaOd.isValid() && pogodbaDo.isValid() && pogodbaOd.isAfter(pogodbaDo, 'day')) {
          throw new Error('Datum "Pogodba od" ne more biti po datumu "Pogodba do".');
        }
      }

      if (!novUporabnik.id && !novUporabnik.geslo) {
        throw new Error('Za novega uporabnika je obvezno geslo.');
      }

      if (
        novUporabnik.zacetno_stanje_elektrike !== '' &&
        (!Number.isFinite(Number(novUporabnik.zacetno_stanje_elektrike)) ||
          Number(novUporabnik.zacetno_stanje_elektrike) < 0)
      ) {
        throw new Error('Začetno stanje elektrike mora biti 0 ali več.');
      }

      if (
        novUporabnik.zacetno_stanje_vode !== '' &&
        (!Number.isFinite(Number(novUporabnik.zacetno_stanje_vode)) ||
          Number(novUporabnik.zacetno_stanje_vode) < 0)
      ) {
        throw new Error('Začetno stanje vode mora biti 0 ali več.');
      }

      await shraniUporabnikaZAuth(
        {
          id: novUporabnik.id || undefined,
          ime: novUporabnik.ime,
          priimek: novUporabnik.priimek,
          telefon: novUporabnik.telefon || null,
          email: novUporabnik.email,
          geslo: novUporabnik.geslo || undefined,
          soba_id: novUporabnik.soba_id || null,
          admin: novUporabnik.admin,
          aktiven: novUporabnik.aktiven,
          uporabnik_od: novUporabnik.uporabnik_od,
          uporabnik_do: novUporabnik.uporabnik_do || null,
          zacetno_stanje_elektrike:
            novUporabnik.zacetno_stanje_elektrike === ''
              ? null
              : Number(novUporabnik.zacetno_stanje_elektrike),
          zacetno_stanje_vode:
            novUporabnik.zacetno_stanje_vode === ''
              ? null
              : Number(novUporabnik.zacetno_stanje_vode),
          pogodba_od: novUporabnik.pogodba_od || null,
          pogodba_do: novUporabnik.pogodba_do || null
        },
        seja.user.id
      );
      await nalozi({ prikaziNalaganje: false });
      const jePosodobilSebe = Boolean(novUporabnik.id) && novUporabnik.id === seja.user.id;
      if (jePosodobilSebe) {
        await osveziProfil({ prikaziNalaganje: false });
      }
      ponastaviUporabnikForm();
    } catch (err) {
      setNapaka(err.message || 'Uporabnika ni bilo mogoce shraniti.');
    }
  }

  async function shraniNovoSobo(e) {
    e.preventDefault();
    setNapaka('');
    try {
      const jePosodobitev = Boolean(novaSoba.id);
      const shranjena = await shraniSoboStoritev(pripraviSoboPayload(novaSoba), seja.user.id);
      vstaviAliPosodobiSoboVStanju(shranjena);

      if (jePosodobitev) {
        izberiSoboZaUrejanje(shranjena.id, [shranjena, ...podatki.sobe]);
      } else {
        ponastaviNovoSoboForm();
      }
    } catch (err) {
      setNapaka(err.message || 'Sobe ni bilo mogoce shraniti.');
    }
  }

  function vstaviAliPosodobiSoboVStanju(shranjenaSoba) {
    setPodatki((prej) => {
      const obstojeciIndex = prej.sobe.findIndex((s) => s.id === shranjenaSoba.id);
      const noveSobe =
        obstojeciIndex >= 0
          ? prej.sobe.map((s) => (s.id === shranjenaSoba.id ? shranjenaSoba : s))
          : [...prej.sobe, shranjenaSoba];

      noveSobe.sort((a, b) => String(a.ime_sobe ?? '').localeCompare(String(b.ime_sobe ?? ''), 'sl'));

      return {
        ...prej,
        sobe: noveSobe
      };
    });
  }

  async function obdelajPosodobitevSobe(novaVrstica) {
    setNapaka('');
    const shranjena = await shraniSoboStoritev(pripraviSoboPayload(novaVrstica), seja.user.id);
    const najdenPosodobil = podatki.uporabniki.find((u) => u.id === shranjena.posodobil);
    const posodobilIme =
      (najdenPosodobil && `${najdenPosodobil.ime ?? ''} ${najdenPosodobil.priimek ?? ''}`.trim()) ||
      najdenPosodobil?.email ||
      shranjena.posodobil ||
      '-';

    vstaviAliPosodobiSoboVStanju(shranjena);

    return {
      ...novaVrstica,
      ime_sobe: shranjena.ime_sobe,
      tip_hise: shranjena.tip_hise,
      voda: Number(shranjena.voda ?? 0),
      najemnina: Number(shranjena.najemnina ?? 0),
      strosek_skupni: Number(shranjena.strosek_skupni ?? 0),
      nettv: Number(shranjena.nettv ?? shranjena.strosek_neta ?? 0),
      fiksni: Number(shranjena.fiksni ?? shranjena.strosek_tv ?? 0),
      faktor_ogrevanja: normalizirajFaktorOgrevanja(shranjena.faktor_ogrevanja),
      posodobil_ime: posodobilIme,
      posodobljeno_oblikovano: shranjena.posodobljeno_ob
        ? dayjs(shranjena.posodobljeno_ob).format('DD.MM.YYYY HH:mm')
        : '-',
      aktivna: Boolean(shranjena.aktivna)
    };
  }

  function obdelajNapakoPosodobitveSobe(err) {
    setNapaka(err?.message || 'Sobe ni bilo mogoce posodobiti.');
  }

  function vnosStevila(vrednost, privzeto) {
    const parsed = Number(vrednost);
    return Number.isFinite(parsed) ? parsed : privzeto;
  }

  function spremeniNovoSoboStevilo(polje, vrednost) {
    setNovaSoba((prej) => ({
      ...prej,
      [polje]: vnosStevila(vrednost, 0)
    }));
  }

  function spremeniNovoSoboBesedilo(polje, vrednost) {
    setNovaSoba((prej) => ({
      ...prej,
      [polje]: vrednost
    }));
  }

  function spremeniNovoSoboBool(polje, vrednost) {
    setNovaSoba((prej) => ({
      ...prej,
      [polje]: vrednost
    }));
  }

  function jeVrsticaSobeUredljiva(params) {
    if (params?.field === 'voda') {
      return !sobaImaVodniStevec(params?.row);
    }
    return Boolean(params?.row?.id);
  }

  function helperZaSobo() {
    if (podatki.sobe.length === 0) {
      return 'Najprej dodaj prvo sobo spodaj.';
    }
    return 'Dvakrat klikni celico za urejanje in pritisni Enter za shranjevanje.';
  }

  async function shraniCeno(e) {
    e.preventDefault();
    setNapaka('');
    try {
      if (novaCena.id) {
        const izbranaCena = vrsticeCene.find((c) => c.id === novaCena.id);
        if (izbranaCena?.je_povezana_z_obracuni) {
          throw new Error(
            'Obračuni so povezani s to ceno, zato je ni več mogoče urejati ali brisati. Dodaj nov zapis z datumom "Velja od".'
          );
        }
      }

      await dodajCeno({
        id: novaCena.id || undefined,
        tip_hise: novaCena.tip_hise,
        velja_od: novaCena.velja_od,
        cena_elektrike: Number(novaCena.cena_elektrike),
        cena_vode: Number(novaCena.cena_vode)
      }, seja.user.id);
      await nalozi();
      ponastaviCenaForm();
    } catch (err) {
      const sporocilo = String(err?.message ?? '');
      if (
        sporocilo.includes('Cene, uporabljene v potrjenih obračunih') ||
        sporocilo.includes('Obračuni so povezani s to ceno')
      ) {
        setNapaka(
          'Obračuni so povezani s to ceno, zato je ni več mogoče urejati ali brisati. Dodaj nov zapis z datumom "Velja od".'
        );
        return;
      }
      setNapaka(sporocilo || 'Cene ni bilo mogoče shraniti.');
    }
  }

  async function izbrisiCenoVrstico(vrstica) {
    setNapaka('');
    setObvestilo('');

    if (!vrstica?.id) return;
    if (vrstica.je_povezana_z_obracuni) {
      setNapaka(
        'Obračuni so povezani s to ceno, zato je ni več mogoče urejati ali brisati. Dodaj nov zapis z datumom "Velja od".'
      );
      return;
    }

    const potrjeno = window.confirm(
      `Izbrišem ceno (${vrstica.tip_hise}, velja od ${vrstica.velja_od})?`
    );
    if (!potrjeno) return;

    try {
      await izbrisiCenoStoritev(vrstica.id);
      await nalozi();
      if (novaCena.id === vrstica.id) {
        ponastaviCenaForm();
      }
      setObvestilo('Cena je uspešno izbrisana.');
    } catch (err) {
      const sporocilo = String(err?.message ?? '');
      if (
        sporocilo.includes('Cene, uporabljene v potrjenih obračunih') ||
        sporocilo.includes('Obračuni so povezani s to ceno')
      ) {
        setNapaka(
          'Obračuni so povezani s to ceno, zato je ni več mogoče urejati ali brisati. Dodaj nov zapis z datumom "Velja od".'
        );
        return;
      }
      setNapaka(sporocilo || 'Cene ni bilo mogoče izbrisati.');
    }
  }

  async function shraniOgrevanjePoTipu(e) {
    e.preventDefault();
    setNapaka('');
    try {
      await shraniOgrevanjeTip(
        {
          id: novoOgrevanje.id || undefined,
          tip_hise: novoOgrevanje.tip_hise,
          mesec: Number(novoOgrevanje.mesec),
          leto: Number(novoOgrevanje.leto),
          znesek: Number(novoOgrevanje.znesek),
          opomba: novoOgrevanje.opomba || null
        },
        seja.user.id
      );
      await nalozi();
      ponastaviOgrevanjeForm();
    } catch (err) {
      setNapaka(err.message || 'Ogrevanja po tipu ni bilo mogoce shraniti.');
    }
  }

  function vstaviAliPosodobiOdcitekVStanju(shranjenOdcitek) {
    setPodatki((prej) => {
      const obstojeci = prej.odcitki.findIndex((o) => o.id === shranjenOdcitek.id);
      const noviOdcitki =
        obstojeci >= 0
          ? prej.odcitki.map((o) => (o.id === shranjenOdcitek.id ? shranjenOdcitek : o))
          : [shranjenOdcitek, ...prej.odcitki];

      noviOdcitki.sort((a, b) => {
        if (Number(a.leto) !== Number(b.leto)) return Number(b.leto) - Number(a.leto);
        if (Number(a.mesec) !== Number(b.mesec)) return Number(b.mesec) - Number(a.mesec);
        return String(a.soba_id ?? '').localeCompare(String(b.soba_id ?? ''), 'sl');
      });

      return {
        ...prej,
        odcitki: noviOdcitki
      };
    });
  }

  async function shraniStevecAdmin(e) {
    e.preventDefault();
    setNapaka('');
    setObvestilo('');
    try {
      if (!novStevecAdmin.soba_id) {
        throw new Error('Izberi sobo.');
      }

      const shranjen = await shraniAdminOdcitekSobe(
        {
          soba_id: novStevecAdmin.soba_id,
          mesec: Number(novStevecAdmin.mesec),
          leto: Number(novStevecAdmin.leto),
          stanje_elektrike: Number(novStevecAdmin.stanje_elektrike),
          stanje_vode: sobaImaVodniStevec(izbranaSobaStevec)
            ? (novStevecAdmin.stanje_vode === '' ? null : Number(novStevecAdmin.stanje_vode))
            : null
        },
        seja.user.id
      );

      vstaviAliPosodobiOdcitekVStanju(shranjen);
      setObvestilo('Števec je uspešno shranjen.');
      ponastaviStevecAdminForm();
    } catch (err) {
      setNapaka(err.message || 'Števca ni bilo mogoče shraniti.');
    }
  }

  async function potrdiPrejsnjeObracunskoObdobje() {
    setNapaka('');
    setObvestilo('');
    const obdobje = prejsnjiMesecLeto();
    const nazivObdobja = `${imenaMesecov[obdobje.mesec - 1]} ${obdobje.leto}`;
    setPotrjevanjeObdobja(true);

    try {
      const pregled = await pripraviPrejsnjeObracunskoObdobje(
        {
          mesec: obdobje.mesec,
          leto: obdobje.leto,
          nastaviManjkajoceNaNulo: false
        },
        seja.user.id
      );

      if ((pregled.manjkajociTipi ?? []).length > 0) {
        setDialogManjkajoceOgrevanje({
          odprt: true,
          mesec: obdobje.mesec,
          leto: obdobje.leto,
          nazivObdobja,
          tipi: pregled.manjkajociTipi,
          vrednosti: Object.fromEntries(pregled.manjkajociTipi.map((t) => [t, '']))
        });
        return;
      }

      await osveziSobeOgrevanjePoObdobju(
        { mesec: obdobje.mesec, leto: obdobje.leto },
        seja.user.id
      );
      await nalozi();
      setDialogZePripravljeno({ odprt: true, nazivObdobja });
    } catch (err) {
      setNapaka(err.message || 'Potrditev obračunskega obdobja ni uspela.');
    } finally {
      setPotrjevanjeObdobja(false);
    }
  }

  function zapriDialogManjkajoceOgrevanje() {
    setDialogManjkajoceOgrevanje({
      odprt: false,
      mesec: null,
      leto: null,
      nazivObdobja: '',
      tipi: [],
      vrednosti: {}
    });
  }

  async function potrdiNastavitevManjkajocegaOgrevanjaNaNulo() {
    if (!dialogManjkajoceOgrevanje.mesec || !dialogManjkajoceOgrevanje.leto) return;

    setNapaka('');
    setObvestilo('');
    setPotrjevanjeObdobja(true);

    try {
      const zneski = Object.fromEntries(
        Object.entries(dialogManjkajoceOgrevanje.vrednosti).map(([tip, v]) => [tip, Number(v) || 0])
      );
      await pripraviPrejsnjeObracunskoObdobje(
        {
          mesec: dialogManjkajoceOgrevanje.mesec,
          leto: dialogManjkajoceOgrevanje.leto,
          nastaviManjkajoceNaNulo: true,
          zneski
        },
        seja.user.id
      );

      await osveziSobeOgrevanjePoObdobju(
        {
          mesec: dialogManjkajoceOgrevanje.mesec,
          leto: dialogManjkajoceOgrevanje.leto
        },
        seja.user.id
      );
      await nalozi();
      const vnosZneskiOpis = Object.entries(zneski).map(([t, z]) => `${t}: ${z.toFixed(2)} €`).join(', ');
      setObvestilo(
        `Obračunsko obdobje ${dialogManjkajoceOgrevanje.nazivObdobja} je potrjeno. Ogrevanje nastavljeno: ${vnosZneskiOpis}.`
      );
    } catch (err) {
      setNapaka(err.message || 'Nastavitev manjkajočega ogrevanja ni uspela.');
    } finally {
      zapriDialogManjkajoceOgrevanje();
      setPotrjevanjeObdobja(false);
    }
  }

  function jeCelicaObracunUredljiva(params) {
    if (!params?.row?.odcitek_id) {
      return false;
    }
    if (params?.row?.placano) {
      return false;
    }
    if (params.field === 'stanje_vode') {
      return Boolean(params?.row?.voda_stanje);
    }
    return [
      'stanje_elektrike',
      'stanje_vode',
      'najemnina',
      'strosek_skupni',
      'strosek_neta',
      'strosek_tv',
      'strosek_ogrevanja',
      'placano',
      'datum_placila_iso'
    ].includes(params.field);
  }

  async function obdelajPosodobitevObracuna(novaVrstica, staraVrstica) {
    setNapaka('');
    if (staraVrstica?.placano) {
      throw new Error('Obračun je potrjen. Za to obdobje odčitkov in stroškov ni več dovoljeno spreminjati.');
    }
    if (!novaVrstica.odcitek_id) {
      throw new Error('Za ta obračun manjka zapis odčitka. Najprej vnesi števec.');
    }

    const stanjeElektrike = Number(novaVrstica.stanje_elektrike);
    if (!Number.isFinite(stanjeElektrike) || stanjeElektrike < 0) {
      throw new Error('Stanje elektrike mora biti 0 ali več.');
    }
    if (stanjeElektrike < Number(novaVrstica.stanje_elektrike_prej ?? 0)) {
      throw new Error('Novo stanje elektrike ne sme biti manjše od prejšnjega.');
    }

    const stanjeVode = novaVrstica.voda_stanje
      ? (novaVrstica.stanje_vode == null || novaVrstica.stanje_vode === ''
          ? null
          : Number(novaVrstica.stanje_vode))
      : null;

    if (novaVrstica.voda_stanje) {
      if (!Number.isFinite(stanjeVode) || stanjeVode < 0) {
        throw new Error('Stanje vode mora biti 0 ali več.');
      }
      if (stanjeVode < Number(novaVrstica.stanje_vode_prej ?? 0)) {
        throw new Error('Novo stanje vode ne sme biti manjše od prejšnjega.');
      }
    }

    const porabaElektrike = Math.max(
      0,
      stanjeElektrike - Number(novaVrstica.stanje_elektrike_prej ?? 0)
    );
    const porabaVode = novaVrstica.voda_stanje
      ? Math.max(0, Number(stanjeVode ?? 0) - Number(novaVrstica.stanje_vode_prej ?? 0))
      : 0;

    const strosekElektrike = Number(
      (porabaElektrike * Number(novaVrstica.cena_elektrike ?? 0)).toFixed(2)
    );
    const strosekVode = novaVrstica.voda_stanje
      ? Number((porabaVode * Number(novaVrstica.cena_vode ?? 0)).toFixed(2))
      : Number(Number(novaVrstica.soba_voda ?? 0).toFixed(2));

    const najemnina = Number(novaVrstica.najemnina ?? 0);
    const strosekSkupni = Number(novaVrstica.strosek_skupni ?? 0);
    const strosekNeta = Number(novaVrstica.strosek_neta ?? 0);
    const strosekTv = Number(novaVrstica.strosek_tv ?? 0);
    const strosekOgrevanja = Number(novaVrstica.strosek_ogrevanja ?? 0);

    const poljaStroskov = [
      { vrednost: najemnina, ime: 'Najemnina' },
      { vrednost: strosekSkupni, ime: 'Skupni strošek' },
      { vrednost: strosekNeta, ime: 'NetTV' },
      { vrednost: strosekTv, ime: 'Fiksni strošek' },
      { vrednost: strosekOgrevanja, ime: 'Ogrevanje' }
    ];

    for (const polje of poljaStroskov) {
      if (!Number.isFinite(polje.vrednost) || polje.vrednost < 0) {
        throw new Error(`${polje.ime} mora biti 0 ali več.`);
      }
    }

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

    const placano = Boolean(novaVrstica.placano);
    let datumPlacilaIso = novaVrstica.datum_placila_iso ?? null;
    if (!placano) {
      datumPlacilaIso = null;
    } else if (!datumPlacilaIso) {
      datumPlacilaIso = staraVrstica.datum_placila_iso || new Date().toISOString();
    }

    const staraNormalizirana = {
      stanje_elektrike: Number(staraVrstica.stanje_elektrike ?? 0),
      stanje_vode:
        staraVrstica.stanje_vode === null || staraVrstica.stanje_vode === undefined || staraVrstica.stanje_vode === ''
          ? null
          : Number(staraVrstica.stanje_vode),
      najemnina: Number(staraVrstica.najemnina ?? 0),
      strosek_skupni: Number(staraVrstica.strosek_skupni ?? 0),
      strosek_neta: Number(staraVrstica.strosek_neta ?? 0),
      strosek_tv: Number(staraVrstica.strosek_tv ?? 0),
      strosek_ogrevanja: Number(staraVrstica.strosek_ogrevanja ?? 0),
      placano: Boolean(staraVrstica.placano),
      datum_placila_iso: staraVrstica.datum_placila_iso ?? null
    };

    const novaNormalizirana = {
      stanje_elektrike: stanjeElektrike,
      stanje_vode: stanjeVode,
      najemnina,
      strosek_skupni: strosekSkupni,
      strosek_neta: strosekNeta,
      strosek_tv: strosekTv,
      strosek_ogrevanja: strosekOgrevanja,
      placano,
      datum_placila_iso: datumPlacilaIso
    };

    const jeEnako =
      staraNormalizirana.stanje_elektrike === novaNormalizirana.stanje_elektrike &&
      staraNormalizirana.stanje_vode === novaNormalizirana.stanje_vode &&
      staraNormalizirana.najemnina === novaNormalizirana.najemnina &&
      staraNormalizirana.strosek_skupni === novaNormalizirana.strosek_skupni &&
      staraNormalizirana.strosek_neta === novaNormalizirana.strosek_neta &&
      staraNormalizirana.strosek_tv === novaNormalizirana.strosek_tv &&
      staraNormalizirana.strosek_ogrevanja === novaNormalizirana.strosek_ogrevanja &&
      staraNormalizirana.placano === novaNormalizirana.placano &&
      staraNormalizirana.datum_placila_iso === novaNormalizirana.datum_placila_iso;

    if (jeEnako) {
      return staraVrstica;
    }

    const rezultat = await shraniAdminObracun(
      {
        id: novaVrstica.odcitek_id,
        stanje_elektrike: stanjeElektrike,
        stanje_vode: stanjeVode,
        placano,
        datum_placila: datumPlacilaIso,
        placilo_id: novaVrstica.placilo_id,
        stroski: {
          najemnina,
          strosek_skupni: strosekSkupni,
          strosek_elektrike: strosekElektrike,
          strosek_vode: strosekVode,
          strosek_ogrevanja: strosekOgrevanja,
          strosek_neta: strosekNeta,
          strosek_tv: strosekTv,
          skupni_strosek: skupniStrosek
        },
        cena_elektrike: Number(novaVrstica.cena_elektrike ?? 0),
        cena_vode: Number(novaVrstica.cena_vode ?? 0)
      },
      seja.user.id
    );

    setPodatki((prej) => {
      const odcitki = prej.odcitki.map((o) => (o.id === rezultat.odcitek.id ? rezultat.odcitek : o));
      const placilo = rezultat.placilo;
      let placila = prej.placila;

      if (placilo) {
        const obstojec = placila.findIndex((p) => p.id === placilo.id);
        if (obstojec >= 0) {
          placila = placila.map((p) => (p.id === placilo.id ? placilo : p));
        } else {
          placila = [placilo, ...placila];
        }
      }

      return {
        ...prej,
        odcitki,
        placila
      };
    });

    return {
      ...novaVrstica,
      stanje_elektrike: stanjeElektrike,
      stanje_vode: stanjeVode,
      poraba_elektrike: porabaElektrike,
      poraba_vode: porabaVode,
      strosek_elektrike: strosekElektrike,
      strosek_vode: strosekVode,
      najemnina,
      strosek_skupni: strosekSkupni,
      strosek_neta: strosekNeta,
      strosek_tv: strosekTv,
      strosek_ogrevanja: strosekOgrevanja,
      skupni_strosek: skupniStrosek,
      placano,
      placilo_id: rezultat?.placilo?.id ?? novaVrstica.placilo_id,
      datum_placila_iso: datumPlacilaIso,
      datum_placila_format: datumPlacilaIso ? dayjs(datumPlacilaIso).format('DD.MM.YYYY') : '-'
    };
  }

  function obdelajNapakoPosodobitveObracuna(err) {
    setNapaka(err?.message || 'Obračuna ni bilo mogoče posodobiti.');
  }

  const gesloInfoText = novUporabnik.id
    ? 'Pusti prazno, ce ne zelis menjati gesla.'
    : 'Admin nastavi zacetno geslo. Predlagano: soba + dve kratki besedi + stevilke.';

  const imeSobeZaGeslo = useMemo(() => {
    const soba = (podatki.sobe ?? []).find((s) => s.id === novUporabnik.soba_id);
    return soba?.ime_sobe ?? '';
  }, [podatki.sobe, novUporabnik.soba_id]);

  function izvoziXlsx(imeDatoteke, imeLista, stolpci, vrstice) {
    try {
      izvoziXlsxDatoteko({
        imeDatoteke,
        listi: [
          {
            ime: imeLista,
            stolpci,
            vrstice
          }
        ]
      });
    } catch (err) {
      setNapaka(err?.message || 'Izvoz XLSX ni uspel.');
    }
  }

  function izvoziUporabnikeXlsx() {
    const vrstice = (podatki.uporabniki ?? []).map((u) => ({
      ime: u.ime ?? '',
      priimek: u.priimek ?? '',
      email: u.email ?? '',
      telefon: u.telefon ?? '',
      soba: u.sobe?.ime_sobe ?? '',
      admin: daNe(Boolean(u.admin)),
      aktiven: daNe(Boolean(u.aktiven)),
      uporabnik_od: u.uporabnik_od ? dayjs(u.uporabnik_od).format('DD.MM.YYYY') : '',
      uporabnik_do: u.uporabnik_do ? dayjs(u.uporabnik_do).format('DD.MM.YYYY') : '',
      pogodba_od: u.pogodba_od ? dayjs(u.pogodba_od).format('DD.MM.YYYY') : '',
      pogodba_do: u.pogodba_do ? dayjs(u.pogodba_do).format('DD.MM.YYYY') : ''
    }));

    izvoziXlsx(
      `uporabniki-${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
      'Uporabniki',
      [
        { key: 'ime', label: 'Ime' },
        { key: 'priimek', label: 'Priimek' },
        { key: 'email', label: 'Email' },
        { key: 'telefon', label: 'Telefon' },
        { key: 'soba', label: 'Soba' },
        { key: 'admin', label: 'Admin' },
        { key: 'aktiven', label: 'Aktiven' },
        { key: 'uporabnik_od', label: 'Uporabnik od' },
        { key: 'uporabnik_do', label: 'Uporabnik do' },
        { key: 'pogodba_od', label: 'Pogodba od' },
        { key: 'pogodba_do', label: 'Pogodba do' }
      ],
      vrstice
    );
  }

  function izvoziSobeXlsx() {
    const uporabnikiPoId = new Map(
      (podatki.uporabniki ?? []).map((u) => [u.id, `${u.ime ?? ''} ${u.priimek ?? ''}`.trim() || u.email || u.id])
    );

    const sobePoTipu = (podatki.sobe ?? []).reduce((acc, soba) => {
      if (!soba?.tip_hise) return acc;
      if (!acc[soba.tip_hise]) acc[soba.tip_hise] = [];
      acc[soba.tip_hise].push(soba);
      return acc;
    }, {});

    const najnovejsiOgrevanjePoTipu = (podatki.ogrevanjeTipi ?? []).reduce((acc, zapis) => {
      if (!zapis?.tip_hise) return acc;
      const obstojeci = acc[zapis.tip_hise];
      if (!obstojeci || jePrvoObdobjeNovejse(zapis, obstojeci)) {
        acc[zapis.tip_hise] = zapis;
      }
      return acc;
    }, {});

    const razdelitveOgrevanjaPoTipu = new Map(
      Object.entries(najnovejsiOgrevanjePoTipu).map(([tipHise, zapis]) => [
        tipHise,
        razdeliOgrevanjePoSobah(zapis.znesek, sobePoTipu[tipHise] ?? [])
      ])
    );

    const vrstice = (podatki.sobe ?? []).map((s) => ({
      soba: s.ime_sobe ?? '',
      hisa: s.tip_hise ?? '',
      voda: sobaImaVodniStevec(s) ? 'stevec' : Number(s.voda ?? 0),
      aktivna: daNe(Boolean(s.aktivna)),
      najemnina: Number(s.najemnina ?? 0),
      skupni: Number(s.strosek_skupni ?? 0),
      net_tv: Number(s.nettv ?? s.strosek_neta ?? 0),
      fiksni: Number(s.fiksni ?? s.strosek_tv ?? 0),
      ogrevanje: Number(razdelitveOgrevanjaPoTipu.get(s.tip_hise)?.get(s.id) ?? s.strosek_ogrevanja ?? 0),
      faktor_ogrevanja: normalizirajFaktorOgrevanja(s.faktor_ogrevanja),
      posodobil: s.posodobil ? (uporabnikiPoId.get(s.posodobil) ?? s.posodobil) : '',
      posodobljeno: s.posodobljeno_ob ? dayjs(s.posodobljeno_ob).format('DD.MM.YYYY HH:mm') : ''
    }));

    izvoziXlsx(
      `sobe-${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
      'Sobe',
      [
        { key: 'soba', label: 'Soba' },
        { key: 'hisa', label: 'Hisa' },
        { key: 'voda', label: 'Voda' },
        { key: 'aktivna', label: 'Aktivna' },
        { key: 'najemnina', label: 'Najemnina' },
        { key: 'skupni', label: 'Skupni' },
        { key: 'net_tv', label: 'NetTV' },
        { key: 'fiksni', label: 'Fiksni' },
        { key: 'ogrevanje', label: 'Ogrevanje' },
        { key: 'faktor_ogrevanja', label: 'Faktor ogrevanja' },
        { key: 'posodobil', label: 'Posodobil' },
        { key: 'posodobljeno', label: 'Posodobljeno ob' }
      ],
      vrstice
    );
  }

  function izvoziCeneXlsx() {
    const vrstice = [...(podatki.cene ?? [])]
      .sort((a, b) => dayjs(b.velja_od).valueOf() - dayjs(a.velja_od).valueOf())
      .map((c) => ({
        tip_hise: c.tip_hise ?? '',
        velja_od: c.velja_od ? dayjs(c.velja_od).format('DD.MM.YYYY') : '',
        cena_elektrike: Number(c.cena_elektrike ?? 0),
        cena_vode: Number(c.cena_vode ?? 0)
      }));

    izvoziXlsx(
      `cene-${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
      'Cene',
      [
        { key: 'tip_hise', label: 'Tip hise' },
        { key: 'velja_od', label: 'Velja od' },
        { key: 'cena_elektrike', label: 'Cena elektrike (EUR/kWh)' },
        { key: 'cena_vode', label: 'Cena vode (EUR/m3)' }
      ],
      vrstice
    );
  }

  function izvoziStevceXlsx() {
    const vrstice = [...(vrsticeStevciAdminFiltrirane ?? [])]
      .sort((a, b) => {
        if (Number(a.leto) !== Number(b.leto)) return Number(b.leto) - Number(a.leto);
        if (Number(a.mesec) !== Number(b.mesec)) return Number(b.mesec) - Number(a.mesec);
        return String(a.soba ?? '').localeCompare(String(b.soba ?? ''), 'sl');
      })
      .map((s) => ({
        soba: s.soba ?? '',
        hisa: s.tip_hise ?? '',
        obdobje: s.obdobje ?? '',
        e_prej: Number(s.stanje_elektrike_prej ?? 0),
        e_novo: Number(s.stanje_elektrike ?? 0),
        v_prej: s.stanje_vode_prej == null ? '' : Number(s.stanje_vode_prej),
        v_novo: s.stanje_vode == null ? '' : Number(s.stanje_vode),
        datum_vnosa: s.datum_vnosa && s.datum_vnosa !== '-' ? s.datum_vnosa : '',
        vnesel: s.vnesel ?? ''
      }));

    izvoziXlsx(
      `stevci-po-sobah-${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
      'Stevci po sobah',
      [
        { key: 'soba', label: 'Soba' },
        { key: 'hisa', label: 'Hiša' },
        { key: 'obdobje', label: 'Obdobje' },
        { key: 'e_prej', label: 'Elektrika prej' },
        { key: 'e_novo', label: 'Elektrika novo' },
        { key: 'v_prej', label: 'Voda prej' },
        { key: 'v_novo', label: 'Voda novo' },
        { key: 'datum_vnosa', label: 'Datum vnosa' },
        { key: 'vnesel', label: 'Vnesel' }
      ],
      vrstice
    );
  }

  function izvoziOgrevanjeXlsx() {
    const vrstice = [...(podatki.ogrevanjeTipi ?? [])]
      .sort((a, b) => {
        if (Number(a.leto) !== Number(b.leto)) return Number(b.leto) - Number(a.leto);
        if (Number(a.mesec) !== Number(b.mesec)) return Number(b.mesec) - Number(a.mesec);
        return String(a.tip_hise ?? '').localeCompare(String(b.tip_hise ?? ''), 'sl');
      })
      .map((o) => ({
        tip_hise: o.tip_hise ?? '',
        mesec: imenaMesecov[(Number(o.mesec) || 1) - 1] ?? '',
        leto: Number(o.leto ?? 0),
        znesek: Number(o.znesek ?? 0),
        opomba: o.opomba ?? ''
      }));

    izvoziXlsx(
      `ogrevanje-${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
      'Ogrevanje',
      [
        { key: 'tip_hise', label: 'Tip hise' },
        { key: 'mesec', label: 'Mesec' },
        { key: 'leto', label: 'Leto' },
        { key: 'znesek', label: 'Ogrevanje (EUR)' },
        { key: 'opomba', label: 'Opomba' }
      ],
      vrstice
    );
  }

  function odpreDialogPotrdiVse() {
    const odprte = (vrsticeObracuniFiltrirane ?? []).filter((v) => !v.placano && v.placilo_id);
    setDialogPotrdiVse({ odprt: true, stevilo: odprte.length, ids: odprte.map((v) => v.placilo_id) });
  }

  async function potrdiVseOdprtePotrditev() {
    if (!dialogPotrdiVse.ids.length) return;
    setObdelujemPotrdiVse(true);
    try {
      await potrdiVsaOdprtaPlacila(dialogPotrdiVse.ids, seja.user.id);
      const now = new Date().toISOString();
      setPodatki((prej) => ({
        ...prej,
        placila: prej.placila.map((p) =>
          dialogPotrdiVse.ids.includes(p.id)
            ? { ...p, placano: true, datum_placila: now }
            : p
        )
      }));
      setDialogPotrdiVse({ odprt: false, stevilo: 0, ids: [] });
    } catch (err) {
      setNapaka(err.message);
    } finally {
      setObdelujemPotrdiVse(false);
    }
  }

  function izvoziObracuneXlsx() {
    const vrstice = (vrsticeObracuniFiltrirane ?? []).map((o) => ({
      obdobje: o.obdobje ?? '',
      soba: o.soba ?? '',
      hisa: o.tip_hise ?? '',
      najemnik: o.uporabnik ?? '',
      e_prej: Number(o.stanje_elektrike_prej ?? 0),
      e_novo: Number(o.stanje_elektrike ?? 0),
      e_poraba: Number(o.poraba_elektrike ?? 0),
      e_cena: Number(o.cena_elektrike ?? 0),
      e_strosek: Number(o.strosek_elektrike ?? 0),
      v_prej: Number(o.stanje_vode_prej ?? 0),
      v_novo: o.stanje_vode == null ? '' : Number(o.stanje_vode),
      v_poraba: Number(o.poraba_vode ?? 0),
      v_cena: Number(o.cena_vode ?? 0),
      v_strosek: Number(o.strosek_vode ?? 0),
      najemnina: Number(o.najemnina ?? 0),
      skupni: Number(o.strosek_skupni ?? 0),
      net_tv: Number(o.strosek_neta ?? 0),
      fiksni: Number(o.strosek_tv ?? 0),
      ogrevanje: Number(o.strosek_ogrevanja ?? 0),
      skupaj: Number(o.skupni_strosek ?? 0),
      placano: daNe(Boolean(o.placano)),
      datum_vnosa: o.datum_vnosa_format && o.datum_vnosa_format !== '-' ? o.datum_vnosa_format : '',
      datum_placila: o.datum_placila_format && o.datum_placila_format !== '-' ? o.datum_placila_format : ''
    }));

    izvoziXlsx(
      `obracuni-${dayjs().format('YYYY-MM-DD_HH-mm')}.xlsx`,
      'Obracuni',
      [
        { key: 'obdobje', label: 'Obdobje' },
        { key: 'soba', label: 'Soba' },
        { key: 'hisa', label: 'Hisa' },
        { key: 'najemnik', label: 'Najemnik' },
        { key: 'e_prej', label: 'Elektrika prej' },
        { key: 'e_novo', label: 'Elektrika novo' },
        { key: 'e_poraba', label: 'Elektrika poraba' },
        { key: 'e_cena', label: 'Elektrika cena (EUR/kWh)' },
        { key: 'e_strosek', label: 'Strosek elektrike (EUR)' },
        { key: 'v_prej', label: 'Voda prej' },
        { key: 'v_novo', label: 'Voda novo' },
        { key: 'v_poraba', label: 'Voda poraba' },
        { key: 'v_cena', label: 'Voda cena (EUR/m3)' },
        { key: 'v_strosek', label: 'Strosek vode (EUR)' },
        { key: 'najemnina', label: 'Najemnina (EUR)' },
        { key: 'skupni', label: 'Skupni (EUR)' },
        { key: 'net_tv', label: 'NetTV (EUR)' },
        { key: 'fiksni', label: 'Fiksni (EUR)' },
        { key: 'ogrevanje', label: 'Ogrevanje (EUR)' },
        { key: 'skupaj', label: 'Skupaj (EUR)' },
        { key: 'placano', label: 'Potrjeno' },
        { key: 'datum_vnosa', label: 'Datum vnosa' },
        { key: 'datum_placila', label: 'Datum potrditve' }
      ],
      vrstice
    );
  }

  // ── Konfiguracija stranskega menija – navigacijske točke ──
  const navigacijaAdmin = [
    { id: 0, label: 'Uporabniki', ikona: <PeopleOutlinedIcon /> },
    { id: 1, label: 'Sobe', ikona: <MeetingRoomOutlinedIcon /> },
    { id: 2, label: 'Cene & Števci', ikona: <ElectricBoltOutlinedIcon /> },
    { id: 3, label: 'Ogrevanje', ikona: <WhatshotOutlinedIcon /> },
    { id: 4, label: 'Obračuni', ikona: <ReceiptLongOutlinedIcon /> },
  ];

  // Ime prijavljenega admina za glavo stranskega menija
  const adminNaziv =
    [profil?.ime, profil?.priimek].filter(Boolean).join(' ') || profil?.email || 'Admin';

  return (
    <AppLayout
      navigacija={navigacijaAdmin}
      aktivnaSekcija={tab}
      onSpremembaSekcije={setTab}
      naslov={adminNaziv}
      podnaslov="Administrator"
      onOdjava={odjava}
    >
      {/* ── Globalna sporočila (napaka / obvestilo) ── */}
      {napaka && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setNapaka('')}>
          {napaka}
        </Alert>
      )}
      {obvestilo && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setObvestilo('')}>
          {obvestilo}
        </Alert>
      )}

      {/* ── Nalagalni kazalec ── */}
      {nalaganje && (
        <Box sx={{ mb: 2 }}>
          <Typography color="text.secondary">Nalaganje podatkov...</Typography>
        </Box>
      )}

      {!nalaganje && tab === 0 && (
        <UporabnikiSekcija
          vrsticeUporabniki={vrsticeUporabniki}
          izvoziUporabnikeXlsx={izvoziUporabnikeXlsx}
          shraniUporabnika={shraniUporabnika}
          novUporabnik={novUporabnik}
          setNovUporabnik={setNovUporabnik}
          ponastaviUporabnikForm={ponastaviUporabnikForm}
          gesloInfoText={gesloInfoText}
          gesloVidno={gesloVidno}
          setGesloVidno={setGesloVidno}
          generirajZapomljivoGeslo={generirajZapomljivoGeslo}
          imeSobeZaGeslo={imeSobeZaGeslo}
          generirajMocnoGeslo={generirajMocnoGeslo}
          kopirajGeslo={kopirajGeslo}
          podatkiSobe={podatki.sobe}
          moznostiStrani={moznostiStrani}
          lokalizacijaMreze={lokalizacijaMreze}
          stolpciUporabniki={stolpciUporabniki}
          izberiUporabnikaZaUrejanje={izberiUporabnikaZaUrejanje}
          nastaviAktivnostUporabnika={nastaviAktivnostUporabnika}
          predlogZacetnihStanjZaNovUporabnik={predlogZacetnihStanjZaNovUporabnik}
          uporabiPredlaganaZacetnaStanja={uporabiPredlaganaZacetnaStanja}
          sobaImaVodniStevecZaNovUporabnik={sobaImaVodniStevec(izbranaSobaNovUporabnik)}
        />
      )}

      {!nalaganje && tab === 1 && (
        <SobeSekcija
          vrsticeSobe={vrsticeSobe}
          helperZaSobo={helperZaSobo}
          potrdiPrejsnjeObracunskoObdobje={potrdiPrejsnjeObracunskoObdobje}
          potrjevanjeObdobja={potrjevanjeObdobja}
          izvoziSobeXlsx={izvoziSobeXlsx}
          shraniNovoSobo={shraniNovoSobo}
          novaSoba={novaSoba}
          setNovaSoba={setNovaSoba}
          tipiHise={tipiHise}
          ponastaviNovoSoboForm={ponastaviNovoSoboForm}
          spremeniNovoSoboBesedilo={spremeniNovoSoboBesedilo}
          spremeniNovoSoboStevilo={spremeniNovoSoboStevilo}
          sobaImaVodniStevec={sobaImaVodniStevec}
          spremeniNovoSoboBool={spremeniNovoSoboBool}
          stolpciSobe={stolpciSobe}
          moznostiStrani={moznostiStrani}
          lokalizacijaMreze={lokalizacijaMreze}
          obdelajPosodobitevSobe={obdelajPosodobitevSobe}
          obdelajNapakoPosodobitveSobe={obdelajNapakoPosodobitveSobe}
          jeVrsticaSobeUredljiva={jeVrsticaSobeUredljiva}
          izberiSoboZaUrejanje={izberiSoboZaUrejanje}
        />
      )}

      {!nalaganje && tab === 2 && (
        <CeneStevciSekcija
          ceneStevciPodtab={ceneStevciPodtab}
          setCeneStevciPodtab={setCeneStevciPodtab}
          vrsticeCene={vrsticeCene}
          izvoziCeneXlsx={izvoziCeneXlsx}
          izvoziStevceXlsx={izvoziStevceXlsx}
          stolpciCene={stolpciCene}
          moznostiStrani={moznostiStrani}
          lokalizacijaMreze={lokalizacijaMreze}
          izberiCenoZaUrejanje={izberiCenoZaUrejanje}
          shraniCeno={shraniCeno}
          izbrisiCenoVrstico={izbrisiCenoVrstico}
          ponastaviCenaForm={ponastaviCenaForm}
          novaCena={novaCena}
          setNovaCena={setNovaCena}
          tipiHise={tipiHise}
          filterStevciSoba={filterStevciSoba}
          setFilterStevciSoba={setFilterStevciSoba}
          podatkiSobe={podatki.sobe}
          vrsticeStevciAdminFiltrirane={vrsticeStevciAdminFiltrirane}
          stolpciAdminStevci={stolpciAdminStevci}
          izberiStevecAdminZaUrejanje={izberiStevecAdminZaUrejanje}
          shraniStevecAdmin={shraniStevecAdmin}
          ponastaviStevecAdminForm={ponastaviStevecAdminForm}
          novStevecAdmin={novStevecAdmin}
          setNovStevecAdmin={setNovStevecAdmin}
          sobaImaVodniStevec={sobaImaVodniStevec}
          izbranaSobaStevec={izbranaSobaStevec}
          imenaMesecov={imenaMesecov}
        />
      )}

      {!nalaganje && tab === 3 && (
        <OgrevanjeSekcija
          vrsticeOgrevanjeTipi={vrsticeOgrevanjeTipi}
          izvoziOgrevanjeXlsx={izvoziOgrevanjeXlsx}
          stolpciOgrevanjeTipi={stolpciOgrevanjeTipi}
          moznostiStrani={moznostiStrani}
          lokalizacijaMreze={lokalizacijaMreze}
          izberiOgrevanjeZaUrejanje={izberiOgrevanjeZaUrejanje}
          shraniOgrevanjePoTipu={shraniOgrevanjePoTipu}
          ponastaviOgrevanjeForm={ponastaviOgrevanjeForm}
          novoOgrevanje={novoOgrevanje}
          setNovoOgrevanje={setNovoOgrevanje}
          tipiHise={tipiHise}
          imenaMesecov={imenaMesecov}
        />
      )}

      {!nalaganje && tab === 4 && (
        <ObracuniSekcija
          vrsticeObracuniFiltrirane={vrsticeObracuniFiltrirane}
          odpreDialogPotrdiVse={odpreDialogPotrdiVse}
          izvoziObracuneXlsx={izvoziObracuneXlsx}
          filterObracuni={filterObracuni}
          setFilterObracuni={setFilterObracuni}
          moznostiFilterSobe={moznostiFilterSobe}
          moznostiFilterUporabniki={moznostiFilterUporabniki}
          imenaMesecov={imenaMesecov}
          letaObracunov={letaObracunov}
          stolpciObracuni={stolpciObracuni}
          moznostiStrani={moznostiStrani}
          lokalizacijaMreze={lokalizacijaMreze}
          obdelajPosodobitevObracuna={obdelajPosodobitevObracuna}
          obdelajNapakoPosodobitveObracuna={obdelajNapakoPosodobitveObracuna}
          jeCelicaObracunUredljiva={jeCelicaObracunUredljiva}
        />
      )}

      <AdminDialogi
        dialogZePripravljeno={dialogZePripravljeno}
        setDialogZePripravljeno={setDialogZePripravljeno}
        dialogPotrdiVse={dialogPotrdiVse}
        setDialogPotrdiVse={setDialogPotrdiVse}
        obdelujemPotrdiVse={obdelujemPotrdiVse}
        potrdiVseOdprtePotrditev={potrdiVseOdprtePotrditev}
        dialogManjkajoceOgrevanje={dialogManjkajoceOgrevanje}
        setDialogManjkajoceOgrevanje={setDialogManjkajoceOgrevanje}
        potrjevanjeObdobja={potrjevanjeObdobja}
        zapriDialogManjkajoceOgrevanje={zapriDialogManjkajoceOgrevanje}
        potrdiNastavitevManjkajocegaOgrevanjaNaNulo={potrdiNastavitevManjkajocegaOgrevanjaNaNulo}
      />
    </AppLayout>
  );
}

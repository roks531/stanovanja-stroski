/**
 * Sekcija "Obračuni" v admin pogledu.
 * Vključuje filtre, hitra dejanja in urejljivo tabelo obračunov.
 */
import { useObvestila } from '../../kontekst/ObvestilaKontekst';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DataGrid from './AdminDataGrid';
import { GridActionIcon } from './adminGridCells';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import OrodnaVrsticaObracunov from './OrodnaVrsticaObracunov';
import SearchableSelect from '../SearchableSelect';
import PregledOddaje from './PregledOddaje';
import { pripraviStevceRocnegaObracuna, izracunajStroskeStevcev, preveriStevceRocnegaObracuna } from '../../storitve/rocniObracun';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_DIALOG_CONTENT_SX,
  ADMIN_DIALOG_ACTIONS_SX,
  ADMIN_KOMPAKTNA_POLJA_SX as KOMPAKTEN_SLOG_POLJ,
  ADMIN_TABELA_CARD_SX,
  ADMIN_TABELA_CONTENT_SX,
  ADMIN_TABELA_STACK_SX,
  ADMIN_TABELA_FLEKS_SX
} from './adminSekcijaPostavitev';


const ORODJA_OBRACUNOV = { toolbar: OrodnaVrsticaObracunov };

const PRAZNO = [];

export default function ObracuniSekcija({
  vrsticeObracuniFiltrirane,
  podatkiPlacila,
  osveziPodatke,
  odpreDialogPotrdiVse,
  dodajRocniObracun,
  izvoziObracuneXlsx,
  filterObracuni,
  setFilterObracuni,
  moznostiFilterSobe,
  moznostiFilterUporabniki,
  podatkiSobe,
  podatkiUporabniki,
  podatkiOdcitki = PRAZNO,
  podatkiCene = PRAZNO,
  podatkiOgrevanje = PRAZNO,
  imenaMesecov,
  letaObracunov,
  stolpciObracuni,
  moznostiStrani,
  lokalizacijaMreze,
  obdelajPosodobitevObracuna,
  obdelajNapakoPosodobitveObracuna,
  jeCelicaObracunUredljiva,
  izbrisiObracunVrstico,
  vrsticeObracunVUrejanju,
  preklopiUrejanjeObracuna
}) {
  const { napaka: prikaziNapako } = useObvestila();
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const [podtab, setPodtab] = useState('pregled');
  const [seznamObiskan, setSeznamObiskan] = useState(false);

  function odpriPodtab(vrednost) {
    if (vrednost === 'seznam') setSeznamObiskan(true);
    setPodtab(vrednost);
  }
  const [dialogRocniObracunOdprt, setDialogRocniObracunOdprt] = useState(false);
  const [shranjujemRocniObracun, setShranjujemRocniObracun] = useState(false);
  const [rocniObracun, setRocniObracun] = useState({
    soba_id: '',
    uporabnik_id: '',
    mesec: '',
    leto: '',
    cena_elektrike: '0',
    cena_vode: '0',
    najemnina: '0',
    strosek_skupni: '0',
    strosek_neta: '0',
    strosek_tv: '0',
    strosek_ogrevanja: '0',
    strosek_elektrike: '0',
    strosek_vode: '0'
  });

  const [vnesiStevce, setVnesiStevce] = useState(false);
  const podatkiStevcev = useMemo(() => ({ sobe: podatkiSobe, uporabniki: podatkiUporabniki,
    odcitki: podatkiOdcitki, cene: podatkiCene, ogrevanjeTipi: podatkiOgrevanje }),
    [podatkiSobe, podatkiUporabniki, podatkiOdcitki, podatkiCene, podatkiOgrevanje]);
  const { soba_id, uporabnik_id, mesec, leto } = rocniObracun;
  const kontekstStevcev = useMemo(() => pripraviStevceRocnegaObracuna({ soba_id, uporabnik_id, mesec, leto }, podatkiStevcev),
    [soba_id, uporabnik_id, mesec, leto, podatkiStevcev]);
  useEffect(() => {
    if (!vnesiStevce) return;
    setRocniObracun((prej) => ({ ...prej, ...kontekstStevcev.privzetiStroski,
      stanje_elektrike: kontekstStevcev.obstojeci?.stanje_elektrike ?? '',
      stanje_vode: kontekstStevcev.obstojeci?.stanje_vode ?? '' }));
  }, [vnesiStevce, kontekstStevcev]);
  const porabaStevcev = izracunajStroskeStevcev(rocniObracun, kontekstStevcev);
  const koncniObracun = vnesiStevce ? { ...rocniObracun,
    strosek_elektrike: porabaStevcev.strosek_elektrike, strosek_vode: porabaStevcev.strosek_vode } : rocniObracun;
  let napakaStevcev = '';
  if (vnesiStevce) {
    try { preveriStevceRocnegaObracuna(rocniObracun, kontekstStevcev, podatkiStevcev); }
    catch (err) { napakaStevcev = err.message; }
  }

  const sobePoId = useMemo(
    () => new Map((podatkiSobe ?? []).map((s) => [s.id, s])),
    [podatkiSobe]
  );

  const najemnikiZaRocniObracun = useMemo(
    () =>
      (podatkiUporabniki ?? [])
        .filter((u) => !u.admin)
        .map((u) => ({
          id: u.id,
          soba_id: u.soba_id ?? '',
          ime: `${u.ime ?? ''} ${u.priimek ?? ''}`.trim() || u.email || u.id
        }))
        .sort((a, b) => a.ime.localeCompare(b.ime, 'sl')),
    [podatkiUporabniki]
  );

  const najemnikiFiltriraniPoSobi = useMemo(() => {
    if (!rocniObracun.soba_id) return najemnikiZaRocniObracun;
    return najemnikiZaRocniObracun.filter((u) => u.soba_id === rocniObracun.soba_id);
  }, [najemnikiZaRocniObracun, rocniObracun.soba_id]);

  const trenutniNajemnikiPoSobi = useMemo(() => new Map(
    (podatkiUporabniki ?? [])
      .filter((u) => u.aktiven && !u.admin && u.soba_id)
      .map((u) => [u.soba_id, u.id])
  ), [podatkiUporabniki]);

  const letaZaRocniObracun = useMemo(() => {
    const trenutnoLeto = new Date().getFullYear();
    return Array.from(new Set([trenutnoLeto, trenutnoLeto - 1, ...(letaObracunov ?? [])])).sort((a, b) => b - a);
  }, [letaObracunov]);

  const strosekSkupajRocniObracun = useMemo(() => {
    const vrednosti = [
      rocniObracun.najemnina,
      rocniObracun.strosek_skupni,
      rocniObracun.strosek_neta,
      rocniObracun.strosek_tv,
      rocniObracun.strosek_ogrevanja,
      koncniObracun.strosek_elektrike,
      koncniObracun.strosek_vode
    ];
    const skupaj = vrednosti.reduce((vsota, v) => {
      const parsed = Number(v ?? 0);
      return vsota + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);
    return Number(skupaj.toFixed(2));
  }, [koncniObracun]);

  const stolpciObracuniZBrisanjem = useMemo(() => {
    const stolpecBrisanje = {
      field: 'akcije_obracun',
      headerName: '',
      width: 88,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const vUrejanju = vrsticeObracunVUrejanju?.has(params.row?.id);
        return (
          <div className="grid-row-actions">
            <button
              type="button"
              className={`grid-action${vUrejanju ? ' grid-action-active' : ''}`}
              title={vUrejanju ? 'Zaključi urejanje' : 'Uredi obračun'}
              aria-label={vUrejanju ? 'Zaključi urejanje obračuna' : 'Uredi obračun'}
              onClick={(e) => {
                e.stopPropagation();
                preklopiUrejanjeObracuna?.(params.row?.id);
              }}
            >
              <GridActionIcon kind={vUrejanju ? 'done' : 'edit'} />
            </button>
            {!params.row?.placano && (
              <button
                type="button"
                className="grid-action grid-action-delete"
                title="Izbriši odprt obračun"
                aria-label="Izbriši obračun"
                onClick={(e) => {
                  e.stopPropagation();
                  izbrisiObracunVrstico?.(params.row);
                }}
              >
                <GridActionIcon kind="delete" />
              </button>
            )}
          </div>
        );
      }
    };

    return [...stolpciObracuni, stolpecBrisanje];
  }, [stolpciObracuni, izbrisiObracunVrstico, vrsticeObracunVUrejanju, preklopiUrejanjeObracuna]);

  function pripraviPrivzetiRocniObracun() {
    const danes = new Date();
    const mesec = Number(filterObracuni.mesec);
    const leto = Number(filterObracuni.leto);
    const sobaId = String(filterObracuni.soba_id ?? '').trim();
    const soba = sobaId ? sobePoId.get(sobaId) : null;
    const uporabnikId = String(filterObracuni.uporabnik_id ?? '').trim();
    const izbraniNajemnik = najemnikiZaRocniObracun.find((u) => u.id === uporabnikId && (!sobaId || u.soba_id === sobaId));

    return {
      soba_id: sobaId || '',
      uporabnik_id: izbraniNajemnik?.id ?? trenutniNajemnikiPoSobi.get(sobaId) ?? '',
      mesec: Number.isFinite(mesec) && mesec >= 1 && mesec <= 12 ? String(mesec) : String(danes.getMonth() + 1),
      leto: Number.isFinite(leto) && leto >= 2024 ? String(leto) : String(danes.getFullYear()),
      cena_elektrike: '0',
      cena_vode: '0',
      najemnina: String(Number(soba?.najemnina ?? 0)),
      strosek_skupni: '0',
      strosek_neta: '0',
      strosek_tv: '0',
      strosek_ogrevanja: '0',
      strosek_elektrike: '0',
      strosek_vode: '0'
    };
  }

  function odpriDialogRocniObracun() {
    setVnesiStevce(false);
    setRocniObracun(pripraviPrivzetiRocniObracun());
    setDialogRocniObracunOdprt(true);
  }

  function spremeniRocniObracun(polje, vrednost) {
    setRocniObracun((prej) => ({ ...prej, [polje]: vrednost }));
  }

  function spremeniSoboRocniObracun(sobaId) {
    setRocniObracun((prej) => {
      const soba = sobaId ? sobePoId.get(sobaId) : null;
      return {
        ...prej,
        soba_id: sobaId ?? '',
        uporabnik_id: trenutniNajemnikiPoSobi.get(sobaId) ?? '',
        najemnina: String(Number(soba?.najemnina ?? 0))
      };
    });
  }

  async function potrdiDodajRocniObracun() {
    setShranjujemRocniObracun(true);
    try {
      if (napakaStevcev) throw new Error(napakaStevcev);
      await dodajRocniObracun({
        ...(vnesiStevce ? { stevci: { stanje_elektrike: rocniObracun.stanje_elektrike, stanje_vode: rocniObracun.stanje_vode } } : {}),
        soba_id: rocniObracun.soba_id,
        uporabnik_id: rocniObracun.uporabnik_id,
        mesec: Number(rocniObracun.mesec),
        leto: Number(rocniObracun.leto),
        cena_elektrike: Number(rocniObracun.cena_elektrike),
        cena_vode: Number(rocniObracun.cena_vode),
        najemnina: Number(rocniObracun.najemnina),
        strosek_skupni: Number(rocniObracun.strosek_skupni),
        strosek_neta: Number(rocniObracun.strosek_neta),
        strosek_tv: Number(rocniObracun.strosek_tv),
        strosek_ogrevanja: Number(rocniObracun.strosek_ogrevanja),
        strosek_elektrike: Number(koncniObracun.strosek_elektrike),
        strosek_vode: Number(koncniObracun.strosek_vode)
      });
      setDialogRocniObracunOdprt(false);
    } catch (err) {
      prikaziNapako(err?.message || 'Ročnega obračuna ni bilo mogoče shraniti.');
    } finally {
      setShranjujemRocniObracun(false);
    }
  }

  const poljeDenar = (id, label, vrednost, helperText = '') => (
    <TextField
      label={label}
      type="number"
      value={vrednost}
      onChange={(e) => spremeniRocniObracun(id, e.target.value)}
      size="small"
      fullWidth
      helperText={helperText}
      disabled={vnesiStevce && (id === 'strosek_elektrike' || id === 'strosek_vode')}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
            </InputAdornment>
          )
        },

        htmlInput: { min: 0, step: '0.01' }
      }} />
  );

  return (
    <Card className="kartica-jeklo" sx={ADMIN_TABELA_CARD_SX}>
      <CardContent sx={ADMIN_TABELA_CONTENT_SX}>
        <Tabs value={podtab} onChange={(_, vrednost) => odpriPodtab(vrednost)} aria-label="Obračuni najemnikov" sx={{ flexShrink: 0, mb: 1.5, minHeight: 36, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { minHeight: 36, py: 0.75 } }}>
          <Tab value="pregled" label="Pregled oddaj" id="obracuni-tab-pregled" aria-controls="obracuni-panel-pregled" />
          <Tab value="seznam" label="Seznam obračunov" id="obracuni-tab-seznam" aria-controls="obracuni-panel-seznam" />
        </Tabs>
        {/* Keep visited panels measurable: display:none makes the grid size its flex columns against zero width. */}
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)' }}>
        <Box role="tabpanel" id="obracuni-panel-pregled" aria-labelledby="obracuni-tab-pregled" aria-hidden={podtab !== 'pregled'} inert={podtab !== 'pregled'} sx={{ gridArea: '1 / 1', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', visibility: podtab === 'pregled' ? 'visible' : 'hidden' }}>
            <PregledOddaje
              sobe={podatkiSobe}
              uporabniki={podatkiUporabniki}
              placila={podatkiPlacila}
              imenaMesecov={imenaMesecov}
              letaObracunov={letaObracunov}
              lokalizacijaMreze={lokalizacijaMreze}
              osvezi={osveziPodatke}
              odpriObracune={(vrstica, obdobje) => {
                setFilterObracuni({ soba_id: vrstica.soba_id, uporabnik_id: vrstica.uporabnik_id, ...obdobje });
                odpriPodtab('seznam');
              }}
            />
        </Box>
        {seznamObiskan && <Stack role="tabpanel" id="obracuni-panel-seznam" aria-labelledby="obracuni-tab-seznam" aria-hidden={podtab !== 'seznam'} inert={podtab !== 'seznam'} spacing={1.5} sx={{ ...ADMIN_TABELA_STACK_SX, gridArea: '1 / 1', visibility: podtab === 'seznam' ? 'visible' : 'hidden' }}>
          {/* Glava sekcije */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1
            }}>
            <Box>
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap"
                }}>
                <Typography variant="h5">Obračuni najemnikov</Typography>
                <Tooltip title="Obračuni ostanejo statični. Cene, števce in ogrevanje lahko urejaš ločeno brez vpliva na že izračunane vrstice.">
                  <IconButton type="button" size="small" aria-label="Informacije o obračunih najemnikov">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Chip size="small" color="primary" label={`${vrsticeObracuniFiltrirane.length} obračunov`} />
                <Chip size="small" color="success" label={`Potrjeno: ${vrsticeObracuniFiltrirane.filter((v) => v.placano).length}`} />
                <Chip size="small" color="warning" label={`Odprto: ${vrsticeObracuniFiltrirane.filter((v) => !v.placano).length}`} />
              </Stack>
            </Box>
            <Stack direction="row" sx={{
              gap: 1
            }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<AddOutlinedIcon />}
                onClick={odpriDialogRocniObracun}
                aria-label="Dodaj ročni obračun"
              >
                Dodaj
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={odpreDialogPotrdiVse}
                disabled={vrsticeObracuniFiltrirane.filter((v) => !v.placano).length === 0}
              >
                Potrdi odprte
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={izvoziObracuneXlsx}
              >
                XLSX
              </Button>
            </Stack>
          </Stack>

          {/* Tabela obračunov */}
          <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
            <DataGrid
              sx={ADMIN_DATAGRID_FLEKS_SX}
              rows={vrsticeObracuniFiltrirane}
              columns={stolpciObracuniZBrisanjem}
              density="compact"
              columnHeaderHeight={48}
              rowHeight={90}
              disableRowSelectionOnClick
              showToolbar
              pageSizeOptions={moznostiStrani}
              localeText={lokalizacijaMreze}
              processRowUpdate={obdelajPosodobitevObracuna}
              onProcessRowUpdateError={obdelajNapakoPosodobitveObracuna}
              isCellEditable={jeCelicaObracunUredljiva}
              slots={ORODJA_OBRACUNOV}
              slotProps={{ toolbar: {
                filterObracuni, setFilterObracuni, moznostiFilterSobe,
                moznostiFilterUporabniki, imenaMesecov, letaObracunov
              } }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 100, page: 0 }
                }
              }}
            />
          </Box>
        </Stack>}
        </Box>
      </CardContent>

      <Dialog
        open={dialogRocniObracunOdprt}
        onClose={() => {
          if (!shranjujemRocniObracun) setDialogRocniObracunOdprt(false);
        }}
        fullScreen={jeMobilen}
        fullWidth
        maxWidth="sm"
        aria-labelledby="rocni-obracun-dialog-naslov"
        slotProps={{ paper: { sx: {
          maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)',
          ...(jeMobilen && { borderRadius: 0 })
        } } }}
      >
        <DialogTitle id="rocni-obracun-dialog-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1.5 }}>
          <Typography id="rocni-obracun-dialog-naslov" component="span" variant="h6">Dodaj ročni obračun</Typography>
          <IconButton aria-label="Zapri obrazec" onClick={() => setDialogRocniObracunOdprt(false)} disabled={shranjujemRocniObracun}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack component="fieldset" disabled={shranjujemRocniObracun} spacing={1.5} sx={{ ...KOMPAKTEN_SLOG_POLJ, border: 0, m: 0, p: 0, minWidth: 0 }}>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Vnesi obdobje, sobo, najemnika in stroške. Obračun se doda kot odprt zapis.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 180px', minWidth: 170 }}>
                <SearchableSelect
                  label="Soba"
                  value={rocniObracun.soba_id}
                  onChange={spremeniSoboRocniObracun}
                  options={[
                    { value: '', label: 'Izberi sobo' },
                    ...(moznostiFilterSobe ?? []).map((s) => ({ value: s.id, label: s.ime }))
                  ]}
                />
              </Box>
              <Box sx={{ flex: '1 1 220px', minWidth: 210 }}>
                <SearchableSelect
                  label="Najemnik"
                  value={rocniObracun.uporabnik_id}
                  onChange={(novaVrednost) => spremeniRocniObracun('uporabnik_id', novaVrednost ?? '')}
                  options={[
                    { value: '', label: 'Izberi najemnika' },
                    ...najemnikiFiltriraniPoSobi.map((u) => ({ value: u.id, label: u.ime }))
                  ]}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 180px', minWidth: 170 }}>
                <SearchableSelect
                  label="Mesec"
                  value={rocniObracun.mesec}
                  onChange={(novaVrednost) => spremeniRocniObracun('mesec', String(novaVrednost ?? ''))}
                  options={imenaMesecov.map((ime, idx) => ({ value: idx + 1, label: ime }))}
                />
              </Box>
              <Box sx={{ flex: '1 1 120px', minWidth: 110 }}>
                <SearchableSelect
                  label="Leto"
                  value={rocniObracun.leto}
                  onChange={(novaVrednost) => spremeniRocniObracun('leto', String(novaVrednost ?? ''))}
                  options={letaZaRocniObracun.map((leto) => ({ value: leto, label: String(leto) }))}
                />
              </Box>
            </Box>

            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, px: 1.25, py: 0.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel sx={{ m: 0, gap: 1 }} control={<Switch size="small" checked={vnesiStevce}
                  onChange={(_, checked) => setVnesiStevce(checked)} />} label="Števci" />
                <Tooltip title="Števci se shranijo skupaj z obračunom in veljajo kot izhodišče za naslednji mesec. Cene in ogrevanje se prevzamejo iz prejšnjega meseca.">
                  <IconButton size="small" aria-label="O vnosu števcev"><InfoOutlinedIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
              {vnesiStevce && <Stack spacing={1} sx={{ pt: 1, pb: 0.75 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  <TextField label="Stanje elektrike" type="number" size="small" fullWidth
                    value={rocniObracun.stanje_elektrike ?? ''}
                    onChange={(e) => spremeniRocniObracun('stanje_elektrike', e.target.value)}
                    helperText={`Prejšnje: ${kontekstStevcev.prejsnje_stanje_elektrike} kWh`}
                    slotProps={{ htmlInput: { min: kontekstStevcev.prejsnje_stanje_elektrike, step: 1 }, input: { endAdornment: <InputAdornment position="end">kWh</InputAdornment> } }} />
                  {kontekstStevcev.imaVodo && <TextField label="Stanje vode" type="number" size="small" fullWidth
                    value={rocniObracun.stanje_vode ?? ''}
                    onChange={(e) => spremeniRocniObracun('stanje_vode', e.target.value)}
                    helperText={`Prejšnje: ${kontekstStevcev.prejsnje_stanje_vode} m³`}
                    slotProps={{ htmlInput: { min: kontekstStevcev.prejsnje_stanje_vode, step: 0.001 }, input: { endAdornment: <InputAdornment position="end">m³</InputAdornment> } }} />}
                </Box>
                {kontekstStevcev.soba && kontekstStevcev.najemnik && !kontekstStevcev.najemnik.admin && kontekstStevcev.najemnik.soba_id === rocniObracun.soba_id && <Typography variant="caption" color={napakaStevcev ? 'text.secondary' : 'primary'} aria-live="polite">
                  {napakaStevcev || `Poraba: ${porabaStevcev.poraba_elektrike} kWh${kontekstStevcev.imaVodo ? ` · ${porabaStevcev.poraba_vode} m³` : ' · voda po pavšalu'}`}
                </Typography>}
              </Stack>}
            </Box>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.25,
                backgroundColor: 'background.paper'
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{
                  color: "text.secondary"
                }}>
                  Cene in stroški
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('cena_elektrike', 'Cena elektrike', rocniObracun.cena_elektrike)}
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('cena_vode', 'Cena vode', rocniObracun.cena_vode)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('najemnina', 'Najemnina', rocniObracun.najemnina)}
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_skupni', 'Skupni strošek', rocniObracun.strosek_skupni)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_neta', 'NetTV', rocniObracun.strosek_neta)}
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_tv', 'Drugo', rocniObracun.strosek_tv)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_ogrevanja', 'Ogrevanje', rocniObracun.strosek_ogrevanja)}
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_elektrike', 'Strošek elektrike', koncniObracun.strosek_elektrike)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_vode', 'Strošek vode', koncniObracun.strosek_vode)}
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    <TextField
                      label="Skupaj"
                      value={`${strosekSkupajRocniObracun.toFixed(2)} €`}
                      size="small"
                      fullWidth
                      disabled
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setDialogRocniObracunOdprt(false)} disabled={shranjujemRocniObracun}>
            Prekliči
          </Button>
          <Button
            variant="contained"
            className="gumb-jeklo"
            startIcon={!shranjujemRocniObracun ? <AddOutlinedIcon /> : undefined}
            onClick={potrdiDodajRocniObracun}
            disabled={shranjujemRocniObracun || Boolean(napakaStevcev)}
          >
            {shranjujemRocniObracun ? 'Shranjujem...' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

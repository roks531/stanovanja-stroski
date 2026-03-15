/**
 * Sekcija "Obračuni" v admin pogledu.
 * Vključuje filtre, hitra dejanja in urejljivo tabelo obračunov.
 */
import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import SearchableSelect from '../SearchableSelect';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_SEKCIJA_CARD_SX,
  ADMIN_SEKCIJA_CONTENT_SX,
  ADMIN_SEKCIJA_STACK_SX,
  ADMIN_TABELA_FLEKS_SX
} from './adminSekcijaPostavitev';

const KOMPAKTEN_SLOG_POLJ = {
  '& .MuiInputLabel-root': { fontSize: '0.8rem' },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '0.74rem' },
  '& .MuiInputBase-input': { fontSize: '0.82rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
  '& .MuiButton-root': { fontSize: '0.76rem' }
};

export default function ObracuniSekcija({
  vrsticeObracuniFiltrirane,
  odpreDialogPotrdiVse,
  dodajRocniObracun,
  izvoziObracuneXlsx,
  filterObracuni,
  setFilterObracuni,
  moznostiFilterSobe,
  moznostiFilterUporabniki,
  podatkiSobe,
  podatkiUporabniki,
  imenaMesecov,
  letaObracunov,
  stolpciObracuni,
  moznostiStrani,
  lokalizacijaMreze,
  obdelajPosodobitevObracuna,
  obdelajNapakoPosodobitveObracuna,
  jeCelicaObracunUredljiva,
  izbrisiObracunVrstico
}) {
  const [dialogRocniObracunOdprt, setDialogRocniObracunOdprt] = useState(false);
  const [shranjujemRocniObracun, setShranjujemRocniObracun] = useState(false);
  const [napakaRocniObracun, setNapakaRocniObracun] = useState('');
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
      rocniObracun.strosek_elektrike,
      rocniObracun.strosek_vode
    ];
    const skupaj = vrednosti.reduce((vsota, v) => {
      const parsed = Number(v ?? 0);
      return vsota + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);
    return Number(skupaj.toFixed(2));
  }, [rocniObracun]);

  const stolpciObracuniZBrisanjem = useMemo(() => {
    const stolpecBrisanje = {
      field: 'akcije_obracun',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.row?.placano) return null;
        return (
          <Tooltip title="Izbriši odprt obračun">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  izbrisiObracunVrstico?.(params.row);
                }}
                aria-label="Izbriši obračun"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        );
      }
    };

    return [...stolpciObracuni, stolpecBrisanje];
  }, [stolpciObracuni, izbrisiObracunVrstico]);

  function pripraviPrivzetiRocniObracun() {
    const danes = new Date();
    const mesec = Number(filterObracuni.mesec);
    const leto = Number(filterObracuni.leto);
    const sobaId = String(filterObracuni.soba_id ?? '').trim();
    const soba = sobaId ? sobePoId.get(sobaId) : null;

    return {
      soba_id: sobaId || '',
      uporabnik_id: String(filterObracuni.uporabnik_id ?? '').trim(),
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
    setNapakaRocniObracun('');
    setRocniObracun(pripraviPrivzetiRocniObracun());
    setDialogRocniObracunOdprt(true);
  }

  function spremeniRocniObracun(polje, vrednost) {
    setRocniObracun((prej) => ({ ...prej, [polje]: vrednost }));
  }

  function spremeniSoboRocniObracun(sobaId) {
    setRocniObracun((prej) => {
      const soba = sobaId ? sobePoId.get(sobaId) : null;
      const obdrziNajemnika = !sobaId || najemnikiZaRocniObracun.some((u) => u.id === prej.uporabnik_id && u.soba_id === sobaId);
      return {
        ...prej,
        soba_id: sobaId ?? '',
        uporabnik_id: obdrziNajemnika ? prej.uporabnik_id : '',
        najemnina: String(Number(soba?.najemnina ?? 0))
      };
    });
  }

  async function potrdiDodajRocniObracun() {
    setNapakaRocniObracun('');
    setShranjujemRocniObracun(true);
    try {
      await dodajRocniObracun({
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
        strosek_elektrike: Number(rocniObracun.strosek_elektrike),
        strosek_vode: Number(rocniObracun.strosek_vode)
      });
      setDialogRocniObracunOdprt(false);
    } catch (err) {
      setNapakaRocniObracun(err?.message || 'Ročnega obračuna ni bilo mogoče shraniti.');
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
      inputProps={{ min: 0, step: '0.01' }}
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
          </InputAdornment>
        )
      }}
    />
  );

  return (
    <Card className="kartica-jeklo" sx={ADMIN_SEKCIJA_CARD_SX}>
      <CardContent sx={ADMIN_SEKCIJA_CONTENT_SX}>
        <Stack spacing={1.5} sx={ADMIN_SEKCIJA_STACK_SX}>
          {/* Glava sekcije */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={1}
          >
            <Box>
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="h5">Obračuni najemnikov</Typography>
                <Chip size="small" color="primary" label={`${vrsticeObracuniFiltrirane.length} obračunov`} />
                <Chip size="small" color="success" label={`Potrjeno: ${vrsticeObracuniFiltrirane.filter((v) => v.placano).length}`} />
                <Chip size="small" color="warning" label={`Odprto: ${vrsticeObracuniFiltrirane.filter((v) => !v.placano).length}`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Obračuni ostanejo statični. Cene, števce in ogrevanje lahko urejaš ločeno brez vpliva na že izračunane vrstice.
              </Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={odpriDialogRocniObracun}
              >
                Dodaj ročni obračun
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
                Izvozi XLSX
              </Button>
            </Stack>
          </Stack>

          {/* Filtri obračunov */}
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center" sx={KOMPAKTEN_SLOG_POLJ}>
            <Box sx={{ width: 190 }}>
              <SearchableSelect
                label="Soba"
                value={filterObracuni.soba_id}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, soba_id: novaVrednost }))}
                options={[
                  { value: '', label: 'Vse sobe' },
                  ...moznostiFilterSobe.map((soba) => ({ value: soba.id, label: soba.ime }))
                ]}
              />
            </Box>
            <Box sx={{ width: 190 }}>
              <SearchableSelect
                label="Najemnik"
                value={filterObracuni.uporabnik_id}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, uporabnik_id: novaVrednost }))}
                options={[
                  { value: '', label: 'Vsi najemniki' },
                  ...moznostiFilterUporabniki.map((uporabnik) => ({ value: uporabnik.id, label: uporabnik.ime }))
                ]}
              />
            </Box>
            <Box sx={{ width: 148 }}>
              <SearchableSelect
                label="Mesec"
                value={filterObracuni.mesec}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, mesec: novaVrednost }))}
                options={[
                  { value: '', label: 'Vsi' },
                  ...imenaMesecov.map((ime, idx) => ({ value: idx + 1, label: ime }))
                ]}
              />
            </Box>
            <Box sx={{ width: 110 }}>
              <SearchableSelect
                label="Leto"
                value={filterObracuni.leto}
                onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, leto: novaVrednost }))}
                options={[
                  { value: '', label: 'Vsa' },
                  ...letaObracunov.map((leto) => ({ value: leto, label: String(leto) }))
                ]}
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ height: 40, whiteSpace: 'nowrap' }}
              onClick={() =>
                setFilterObracuni({
                  soba_id: '',
                  uporabnik_id: '',
                  mesec: '',
                  leto: ''
                })
              }
            >
              Počisti filtre
            </Button>
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
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 300 },
                  csvOptions: { disableToolbarButton: true },
                  printOptions: { disableToolbarButton: true }
                }
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 100, page: 0 }
                }
              }}
            />
          </Box>
        </Stack>
      </CardContent>

      <Dialog
        open={dialogRocniObracunOdprt}
        onClose={() => {
          if (!shranjujemRocniObracun) setDialogRocniObracunOdprt(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Dodaj ročni obračun</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={KOMPAKTEN_SLOG_POLJ}>
            <Typography variant="body2" color="text.secondary">
              Vnesi obdobje, sobo, najemnika in stroške. Obračun se doda kot odprt zapis.
            </Typography>

            {napakaRocniObracun && (
              <Alert severity="error" onClose={() => setNapakaRocniObracun('')}>
                {napakaRocniObracun}
              </Alert>
            )}

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
                <Typography variant="subtitle2" color="text.secondary">
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
                    {poljeDenar('strosek_tv', 'Fiksni strošek', rocniObracun.strosek_tv)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_ogrevanja', 'Ogrevanje', rocniObracun.strosek_ogrevanja)}
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_elektrike', 'Strošek elektrike', rocniObracun.strosek_elektrike)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
                    {poljeDenar('strosek_vode', 'Strošek vode', rocniObracun.strosek_vode)}
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
        <DialogActions>
          <Button onClick={() => setDialogRocniObracunOdprt(false)} disabled={shranjujemRocniObracun}>
            Prekliči
          </Button>
          <Button
            variant="contained"
            className="gumb-jeklo"
            onClick={potrdiDodajRocniObracun}
            disabled={shranjujemRocniObracun}
          >
            {shranjujemRocniObracun ? 'Shranjujem...' : 'Dodaj obračun'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

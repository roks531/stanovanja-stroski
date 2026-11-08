/**
 * Sekcija "Cene in Števci" z dvema pod-zavihkoma:
 * 1) cene elektrike/vode
 * 2) vnos števcev po sobah
 */
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import SearchableSelect from '../SearchableSelect';
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


export default function CeneStevciSekcija({
  ceneStevciPodtab,
  setCeneStevciPodtab,
  vrsticeCene,
  izvoziCeneXlsx,
  izvoziStevceXlsx,
  stolpciCene,
  moznostiStrani,
  lokalizacijaMreze,
  izberiCenoZaUrejanje,
  shraniCeno,
  izbrisiCenoVrstico,
  izbrisiStevecAdminVrstico,
  ponastaviCenaForm,
  novaCena,
  setNovaCena,
  tipiHise,
  filterStevciSoba,
  setFilterStevciSoba,
  podatkiSobe,
  vrsticeStevciAdminFiltrirane,
  stolpciAdminStevci,
  izberiStevecAdminZaUrejanje,
  shraniStevecAdmin,
  ponastaviStevecAdminForm,
  novStevecAdmin,
  setNovStevecAdmin,
  sobaImaVodniStevec,
  izbranaSobaStevec,
  imenaMesecov
}) {
  const [dialog, setDialog] = useState(null);
  const [shranjujem, setShranjujem] = useState(false);
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const urejanje = dialog === 'cena' ? Boolean(novaCena.id) : Boolean(novStevecAdmin.id);
  const naslovDialoga = dialog === 'cena'
    ? (urejanje ? 'Uredi ceno' : 'Dodaj ceno')
    : (urejanje ? 'Uredi odčitek' : 'Dodaj odčitek');

  function zapriDialog() {
    if (!shranjujem) setDialog(null);
  }

  async function shrani(e) {
    e.preventDefault();
    if (shranjujem) return;
    setShranjujem(true);
    try {
      const uspeh = await (dialog === 'cena' ? shraniCeno(e) : shraniStevecAdmin(e));
      if (uspeh) setDialog(null);
    } finally {
      setShranjujem(false);
    }
  }

  const stolpciCeneZBrisanjem = useMemo(() => {
    const stolpecBrisanje = {
      field: 'akcije_cena',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <Tooltip title="Izbriši ceno">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  izbrisiCenoVrstico?.(params.row);
                }}
                aria-label="Izbriši ceno"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        );
      }
    };

    const stolpciBrezAkcij = stolpciCene.filter((stolpec) => stolpec.field !== 'akcije_cena');
    return [...stolpciBrezAkcij, stolpecBrisanje];
  }, [stolpciCene, izbrisiCenoVrstico]);

  const stolpciStevciZBrisanjem = useMemo(() => {
    const stolpecBrisanje = {
      field: 'akcije_stevec',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.row.je_zacetno_stanje) {
          return null;
        }

        return (
          <Tooltip title="Izbriši odčitek">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  izbrisiStevecAdminVrstico?.(params.row);
                }}
                aria-label="Izbriši odčitek"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        );
      }
    };

    const stolpciBrezAkcij = stolpciAdminStevci.filter((stolpec) => stolpec.field !== 'akcije_stevec');
    return [...stolpciBrezAkcij, stolpecBrisanje];
  }, [stolpciAdminStevci, izbrisiStevecAdminVrstico]);

  const vrsticeStevciAdminUrejene = useMemo(
    () =>
      [...(vrsticeStevciAdminFiltrirane ?? [])].sort((a, b) => {
        const kljucA = (Number(a?.leto ?? 0) * 100) + Number(a?.mesec ?? 0);
        const kljucB = (Number(b?.leto ?? 0) * 100) + Number(b?.mesec ?? 0);
        if (kljucA !== kljucB) return kljucB - kljucA; // novejše obdobje najprej
        return String(a?.soba ?? '').localeCompare(String(b?.soba ?? ''), 'sl');
      }),
    [vrsticeStevciAdminFiltrirane]
  );

  return (
    <>
      <Card className="kartica-jeklo" sx={ADMIN_TABELA_CARD_SX}>
        <CardContent sx={ADMIN_TABELA_CONTENT_SX}>
          <Stack spacing={1.5} sx={ADMIN_TABELA_STACK_SX}>
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
                  <Typography variant="h5">Cene in Števci</Typography>
                  <Tooltip title="Cene elektrike in vode ter vnos odčitkov po sobah. Zapise lahko izbrišeš z ikono koša na desni strani tabele.">
                    <IconButton type="button" size="small" aria-label="Informacije o cenah in števcih">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} aria-label={ceneStevciPodtab === 1 ? 'Dodaj odčitek' : 'Dodaj ceno'} title={ceneStevciPodtab === 1 ? 'Dodaj odčitek' : 'Dodaj ceno'} onClick={() => {
                  if (ceneStevciPodtab === 1) {
                    ponastaviStevecAdminForm();
                    setDialog('odcitek');
                  } else {
                    ponastaviCenaForm();
                    setDialog('cena');
                  }
                }}>
                  Dodaj
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={ceneStevciPodtab === 1 ? izvoziStevceXlsx : izvoziCeneXlsx}
                >
                  XLSX
                </Button>
              </Stack>
            </Stack>

            {/* Pod-zavihki */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={ceneStevciPodtab} onChange={(_, v) => setCeneStevciPodtab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="Cene elektrike in vode" />
                <Tab label="Vnos števcev po sobah" />
              </Tabs>
            </Box>

            {ceneStevciPodtab === 0 && (
              <Box
                className="tabela-polna"
                sx={ADMIN_TABELA_FLEKS_SX}
              >
                <DataGrid
                  sx={{ ...ADMIN_DATAGRID_FLEKS_SX, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
                  rows={vrsticeCene}
                  columns={stolpciCeneZBrisanjem}
                  density="compact"
                  rowHeight={66}
                  disableRowSelectionOnClick
                  pageSizeOptions={moznostiStrani}
                  localeText={lokalizacijaMreze}
                  onRowClick={(params) => {
                    izberiCenoZaUrejanje(params.id);
                    setDialog('cena');
                  }}
                  initialState={{ pagination: { paginationModel: { pageSize: 100, page: 0 } } }}
                />
              </Box>
            )}

            {ceneStevciPodtab === 1 && (
              <Stack spacing={1.5} sx={ADMIN_TABELA_STACK_SX}>
                <Box sx={KOMPAKTEN_SLOG_POLJ}>
                  <SearchableSelect
                    label="Filter sobe"
                    value={filterStevciSoba}
                    onChange={(novaVrednost) => setFilterStevciSoba(novaVrednost)}
                    options={[
                      { value: '', label: 'Vse sobe' },
                      ...(podatkiSobe ?? [])
                        .map((s) => ({ value: s.id, label: s.ime_sobe }))
                        .sort((a, b) => a.label.localeCompare(b.label, 'sl'))
                    ]}
                    sx={{ minWidth: { xs: '100%', sm: 220 }, maxWidth: { sm: 260 } }}
                  />
                </Box>

                <Box
                  className="tabela-polna"
                  sx={ADMIN_TABELA_FLEKS_SX}
                >
                  <DataGrid
                    sx={{ ...ADMIN_DATAGRID_FLEKS_SX, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
                    rows={vrsticeStevciAdminUrejene}
                    columns={stolpciStevciZBrisanjem}
                    density="compact"
                    rowHeight={66}
                    disableRowSelectionOnClick
                    pageSizeOptions={moznostiStrani}
                    localeText={lokalizacijaMreze}
                    onRowClick={(params) => {
                      izberiStevecAdminZaUrejanje(params.id);
                      setDialog('odcitek');
                    }}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 100, page: 0 } },
                      sorting: { sortModel: [{ field: 'obdobje', sort: 'desc' }] }
                    }}
                  />
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Dialog
        open={dialog !== null}
        onClose={zapriDialog}
        fullScreen={jeMobilen}
        fullWidth
        maxWidth="sm"
        aria-labelledby="cene-stevci-dialog-naslov"
        slotProps={{ paper: {
          component: 'form', onSubmit: shrani,
          sx: { maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)', ...(jeMobilen && { borderRadius: 0 }) }
        } }}
      >
        <DialogTitle id="cene-stevci-dialog-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography id="cene-stevci-dialog-naslov" component="span" variant="h6">{naslovDialoga}</Typography>
          <IconButton aria-label="Zapri obrazec" onClick={zapriDialog} disabled={shranjujem}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack component="fieldset" disabled={shranjujem} spacing={2} sx={{ ...KOMPAKTEN_SLOG_POLJ, m: 0, p: 0, border: 0, minWidth: 0 }}>
            {dialog === 'cena' ? (
              <>
                <SearchableSelect
                  label="Tip hiše"
                  value={novaCena.tip_hise}
                  onChange={(novaVrednost) => setNovaCena({ ...novaCena, tip_hise: novaVrednost })}
                  options={tipiHise.map((tip) => ({ value: tip, label: tip }))}
                  disableClearable
                />
                <DatePicker
                  label="Velja od"
                  value={novaCena.velja_od ? dayjs(novaCena.velja_od) : null}
                  onChange={(novaVrednost) =>
                    setNovaCena({
                      ...novaCena,
                      velja_od: novaVrednost ? novaVrednost.format('YYYY-MM-DD') : ''
                    })
                  }
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
                <TextField
                  label="Cena elektrike"
                  type="number"
                  value={novaCena.cena_elektrike}
                  onChange={(e) => setNovaCena({ ...novaCena, cena_elektrike: e.target.value })}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                        </InputAdornment>
                      )
                    },

                    htmlInput: { step: '0.0001' }
                  }} />
                <TextField
                  label="Cena vode"
                  type="number"
                  value={novaCena.cena_vode}
                  onChange={(e) => setNovaCena({ ...novaCena, cena_vode: e.target.value })}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                        </InputAdornment>
                      )
                    },

                    htmlInput: { step: '0.0001' }
                  }} />
              </>
            ) : (
              <>
                <SearchableSelect
                  label="Soba"
                  value={novStevecAdmin.soba_id}
                  onChange={(novaVrednost) => {
                    const soba = (podatkiSobe ?? []).find((s) => s.id === novaVrednost);
                    setNovStevecAdmin((prej) => ({
                      ...prej,
                      soba_id: novaVrednost,
                      prejsnje_stanje_vode: sobaImaVodniStevec(soba) ? prej.prejsnje_stanje_vode : '',
                      stanje_vode: sobaImaVodniStevec(soba) ? prej.stanje_vode : ''
                    }));
                  }}
                  options={(podatkiSobe ?? [])
                    .map((s) => ({ value: s.id, label: `${s.ime_sobe} (${s.tip_hise})` }))
                    .sort((a, b) => a.label.localeCompare(b.label, 'sl'))}
                  required
                />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <SearchableSelect
                    label="Mesec"
                    value={novStevecAdmin.mesec}
                    onChange={(novaVrednost) =>
                      setNovStevecAdmin((prej) => ({ ...prej, mesec: Number(novaVrednost) }))
                    }
                    options={imenaMesecov.map((ime, idx) => ({ value: idx + 1, label: ime }))}
                    disableClearable
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                  <TextField
                    label="Leto"
                    type="number"
                    value={novStevecAdmin.leto}
                    onChange={(e) =>
                      setNovStevecAdmin((prej) => ({ ...prej, leto: Number(e.target.value) }))
                    }
                    size="small"
                    sx={{ width: 96, flexShrink: 0 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label="E prejšnje"
                    type="number"
                    value={novStevecAdmin.prejsnje_stanje_elektrike}
                    onChange={(e) =>
                      setNovStevecAdmin((prej) => ({ ...prej, prejsnje_stanje_elektrike: e.target.value }))
                    }
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="E novo"
                    type="number"
                    value={novStevecAdmin.stanje_elektrike}
                    onChange={(e) =>
                      setNovStevecAdmin((prej) => ({ ...prej, stanje_elektrike: e.target.value }))
                    }
                    size="small"
                    required
                    fullWidth
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label="V prejšnje"
                    type="number"
                    value={novStevecAdmin.prejsnje_stanje_vode}
                    onChange={(e) =>
                      setNovStevecAdmin((prej) => ({ ...prej, prejsnje_stanje_vode: e.target.value }))
                    }
                    size="small"
                    fullWidth
                    disabled={!sobaImaVodniStevec(izbranaSobaStevec)}
                    slotProps={{
                      htmlInput: { min: 0, step: '0.001' }
                    }}
                  />
                  <TextField
                    label="V novo"
                    type="number"
                    value={novStevecAdmin.stanje_vode}
                    onChange={(e) =>
                      setNovStevecAdmin((prej) => ({ ...prej, stanje_vode: e.target.value }))
                    }
                    size="small"
                    fullWidth
                    disabled={!sobaImaVodniStevec(izbranaSobaStevec)}
                    helperText={!sobaImaVodniStevec(izbranaSobaStevec) ? 'Ta soba nima števca za vodo.' : ''}
                    slotProps={{
                      htmlInput: { min: 0, step: '0.001' }
                    }}
                  />
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={zapriDialog} disabled={shranjujem}>Prekliči</Button>
          <Button type="submit" variant="contained" disabled={shranjujem}>
            {shranjujem ? 'Shranjujem...' : urejanje ? 'Shrani spremembe' : naslovDialoga}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

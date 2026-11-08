/**
 * Sekcija "Stroški" v admin pogledu.
 * Splošni stroški, ki niso vezani na obračune najemnikov - le na hišo/sobo za pregled.
 * Podpira opcijski opis, datum stroška in razčlenitev na postavke (pod-vnosi).
 */
import { useObvestila } from '../../kontekst/ObvestilaKontekst';
import { useMemo, useState } from 'react';
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
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DataGrid from './AdminDataGrid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
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


const PRAZNA_POSTAVKA = { opis: '', znesek: '' };

const PRAZEN_STROSEK = {
  id: '',
  strosek: '',
  opis: '',
  tip_hise: '',
  soba_id: '',
  znesek: '',
  datum_stroska: null,
  postavke: []
};

export default function StrokiSekcija({
  vrsticeStroski,
  izvoziStrokiXlsx,
  dodajStrosek,
  izbrisiStrosekVrstico,
  podatkiSobe,
  tipiHise,
  stolpciStroski,
  moznostiStrani,
  lokalizacijaMreze
}) {
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const { napaka: prikaziNapako } = useObvestila();
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const [novStrosek, setNovStrosek] = useState(PRAZEN_STROSEK);

  // detail modals
  const [opisModal, setOpisModal] = useState(null);       // { strosek, opis }
  const [postavkeModal, setPostavkeModal] = useState(null); // { strosek, postavke, znesek }

  const skupajZnesek = useMemo(
    () => (vrsticeStroski ?? []).reduce((vsota, v) => vsota + Number(v.znesek ?? 0), 0),
    [vrsticeStroski]
  );

  const sobeFiltrirane = useMemo(() => {
    if (!novStrosek.tip_hise) return podatkiSobe ?? [];
    return (podatkiSobe ?? []).filter((s) => s.tip_hise === novStrosek.tip_hise);
  }, [podatkiSobe, novStrosek.tip_hise]);

  const imaPostavke = novStrosek.postavke.length > 0;

  const znesekIzPostavk = useMemo(
    () => novStrosek.postavke.reduce((vsota, p) => vsota + Number(p.znesek || 0), 0),
    [novStrosek.postavke]
  );

  // Dynamic columns built here so they can open modals via local state
  const stolpciDinamicni = useMemo(() => {
    const stolpecNaziv = {
      field: 'strosek',
      headerName: 'Strošek',
      width: 300,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const postavke = Array.isArray(params.row.postavke) ? params.row.postavke : [];
        const imaPostavkeVrstica = postavke.length > 0;
        const stPostavk = postavke.length;
        const beseda = stPostavk === 1 ? 'postavka' : stPostavk < 5 ? 'postavke' : 'postavk';
        return (
          <Stack
            spacing={0.15}
            onClick={imaPostavkeVrstica ? (e) => {
              e.stopPropagation();
              setPostavkeModal({ strosek: params.row.strosek, postavke, znesek: params.row.znesek });
            } : undefined}
            sx={{
              justifyContent: "center",
              height: '100%',
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              cursor: imaPostavkeVrstica ? 'pointer' : 'default',
              transition: 'background 0.15s',
              '&:hover': imaPostavkeVrstica ? { bgcolor: 'action.hover' } : {}
            }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.3 }} noWrap>
              {params.value}
            </Typography>
            {imaPostavkeVrstica && (
              <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.3 }}>
                {stPostavk} {beseda}
              </Typography>
            )}
          </Stack>
        );
      }
    };

    const stolpecOpis = {
      field: 'opis',
      headerName: 'Opis',
      width: 48,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Tooltip title="Prikaži opis">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpisModal({ strosek: params.row.strosek, opis: params.value });
              }}
            >
              <NotesOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
            </IconButton>
          </Tooltip>
        );
      }
    };

    return [stolpecNaziv, stolpecOpis, ...stolpciStroski];
  }, [stolpciStroski]);

  const stolpciZBrisanjem = useMemo(() => {
    const stolpecAkcije = {
      field: 'akcije_strosek',
      headerName: '',
      width: 88,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Uredi strošek">
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  urediStrosek(params.row);
                }}
                aria-label="Uredi strošek"
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Izbriši strošek">
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  izbrisiStrosekVrstico?.(params.row);
                }}
                aria-label="Izbriši strošek"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )
    };

    return [...stolpciDinamicni, stolpecAkcije];
  }, [stolpciDinamicni, izbrisiStrosekVrstico]);

  function odpriDialog() {
    setNovStrosek(PRAZEN_STROSEK);
    setDialogOdprt(true);
  }

  function urediStrosek(vrstica) {
    setNovStrosek({
      id: vrstica.id,
      strosek: vrstica.strosek ?? '',
      opis: vrstica.opis ?? '',
      tip_hise: vrstica.tip_hise ?? '',
      soba_id: vrstica.soba_id ?? '',
      znesek: Array.isArray(vrstica.postavke) && vrstica.postavke.length > 0
        ? ''
        : String(vrstica.znesek ?? ''),
      datum_stroska: vrstica.datum_stroska ? dayjs(vrstica.datum_stroska) : null,
      postavke: Array.isArray(vrstica.postavke)
        ? vrstica.postavke
            .sort((a, b) => (a.vrstni_red ?? 0) - (b.vrstni_red ?? 0))
            .map((p) => ({ opis: p.opis ?? '', znesek: String(p.znesek ?? '') }))
        : []
    });
    setDialogOdprt(true);
  }

  function spremeniTipHise(tip) {
    setNovStrosek((prej) => {
      const obdrziSobo = !tip || (podatkiSobe ?? []).some((s) => s.id === prej.soba_id && s.tip_hise === tip);
      return { ...prej, tip_hise: tip ?? '', soba_id: obdrziSobo ? prej.soba_id : '' };
    });
  }

  function spremeniSobo(sobaId) {
    setNovStrosek((prej) => {
      const soba = (podatkiSobe ?? []).find((s) => s.id === sobaId);
      return { ...prej, soba_id: sobaId ?? '', tip_hise: soba ? soba.tip_hise : prej.tip_hise };
    });
  }

  function dodajPostavko() {
    setNovStrosek((prej) => ({
      ...prej,
      postavke: [...prej.postavke, { ...PRAZNA_POSTAVKA }]
    }));
  }

  function spremeniPostavko(index, polje, vrednost) {
    setNovStrosek((prej) => {
      const nove = [...prej.postavke];
      nove[index] = { ...nove[index], [polje]: vrednost };
      return { ...prej, postavke: nove };
    });
  }

  function odstraniPostavko(index) {
    setNovStrosek((prej) => ({
      ...prej,
      postavke: prej.postavke.filter((_, i) => i !== index)
    }));
  }

  async function potrdiDodajStrosek() {

    if (!novStrosek.strosek.trim()) {
      prikaziNapako('Strošek je obvezen.');
      return;
    }

    const postavke = novStrosek.postavke.filter((p) => String(p.opis ?? '').trim());

    if (postavke.length > 0) {
      for (const p of postavke) {
        const z = Number(p.znesek);
        if (!Number.isFinite(z) || z < 0) {
          prikaziNapako('Znesek vsake postavke mora biti 0 ali več.');
          return;
        }
      }
    } else {
      const znesek = Number(novStrosek.znesek);
      if (!Number.isFinite(znesek) || znesek < 0) {
        prikaziNapako('Znesek mora biti 0 ali več.');
        return;
      }
    }

    const datumIso = novStrosek.datum_stroska?.isValid?.()
      ? novStrosek.datum_stroska.format('YYYY-MM-DD')
      : null;

    setShranjujem(true);
    try {
      await dodajStrosek({
        id: novStrosek.id || undefined,
        strosek: novStrosek.strosek.trim(),
        opis: novStrosek.opis.trim() || null,
        tip_hise: novStrosek.tip_hise || null,
        soba_id: novStrosek.soba_id || null,
        znesek: postavke.length > 0 ? undefined : Number(novStrosek.znesek),
        datum_stroska: datumIso,
        postavke: postavke.map((p) => ({ opis: p.opis.trim(), znesek: Number(p.znesek) }))
      });
      setDialogOdprt(false);
    } catch (err) {
      prikaziNapako(err?.message || 'Stroška ni bilo mogoče shraniti.');
    } finally {
      setShranjujem(false);
    }
  }

  return (
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
                <Typography variant="h5">Stroški</Typography>
                <Tooltip title="Splošni stroški, neodvisni od obračunov najemnikov. Hiša in soba sta neobvezni.">
                  <IconButton type="button" size="small" aria-label="Informacije o stroških">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Chip size="small" color="primary" label={`${(vrsticeStroski ?? []).length} stroškov`} />
                <Chip size="small" color="success" label={`Skupaj: ${skupajZnesek.toFixed(2)} €`} />
              </Stack>
            </Box>
            <Stack direction="row" sx={{
              gap: 1
            }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<AddOutlinedIcon />} aria-label="Dodaj strošek" title="Dodaj strošek"
                onClick={odpriDialog}
              >
                Dodaj
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={izvoziStrokiXlsx}
              >
                XLSX
              </Button>
            </Stack>
          </Stack>

          {/* Tabela stroškov */}
          <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
            <DataGrid
              sx={ADMIN_DATAGRID_FLEKS_SX}
              rows={vrsticeStroski ?? []}
              columns={stolpciZBrisanjem}
              density="compact"
              rowHeight={72}
              disableRowSelectionOnClick
              showToolbar
              pageSizeOptions={moznostiStrani}
              localeText={lokalizacijaMreze}
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

      {/* ── Modal: opis ──────────────────────────────────────────── */}
      <Dialog
        open={!!opisModal}
        onClose={() => setOpisModal(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <NotesOutlinedIcon sx={{ fontSize: 20, color: '#64748b' }} />
            <Typography variant="h6" component="span">{opisModal?.strosek}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {opisModal?.opis}
          </Typography>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setOpisModal(null)}>Zapri</Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: postavke ──────────────────────────────────────── */}
      <Dialog
        open={!!postavkeModal}
        onClose={() => setPostavkeModal(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <ListAltOutlinedIcon sx={{ fontSize: 20, color: '#64748b' }} />
            <Typography variant="h6" component="span">{postavkeModal?.strosek}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Stack divider={<Divider />}>
            {(postavkeModal?.postavke ?? [])
              .slice()
              .sort((a, b) => (a.vrstni_red ?? 0) - (b.vrstni_red ?? 0))
              .map((p, i) => (
                <Stack
                  key={i}
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2.5,
                    py: 1
                  }}>
                  <Typography sx={{ fontSize: '0.85rem' }}>{p.opis}</Typography>
                  <Stack direction="row" spacing={0.4} sx={{
                    alignItems: "center"
                  }}>
                    <EuroSymbolOutlinedIcon sx={{ fontSize: 12, color: '#059669' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#059669' }}>
                      {Number(p.znesek ?? 0).toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
          </Stack>
          <Divider />
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: 2.5,
              py: 1.25,
              bgcolor: '#f8fafc'
            }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Skupaj</Typography>
            <Stack direction="row" spacing={0.4} sx={{
              alignItems: "center"
            }}>
              <EuroSymbolOutlinedIcon sx={{ fontSize: 13, color: '#059669' }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#059669' }}>
                {Number(postavkeModal?.znesek ?? 0).toFixed(2)}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setPostavkeModal(null)}>Zapri</Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: dodaj / uredi strošek ────────────────────────── */}
      <Dialog
        open={dialogOdprt}
        onClose={() => {
          if (!shranjujem) setDialogOdprt(false);
        }}
        fullScreen={jeMobilen}
        fullWidth
        maxWidth="sm"
        aria-labelledby="strosek-dialog-naslov"
        slotProps={{ paper: { sx: {
          maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)',
          ...(jeMobilen && { borderRadius: 0 })
        } } }}
      >
        <DialogTitle id="strosek-dialog-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
            <Typography id="strosek-dialog-naslov" component="span" variant="h6">{novStrosek.id ? 'Uredi strošek' : 'Dodaj strošek'}</Typography>
            <Tooltip title="Vnesi naziv stroška. Opis, datum, hiša in soba so neobvezni." arrow>
              <IconButton type="button" size="small" aria-label="Informacije o vnosu stroška">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <IconButton aria-label="Zapri obrazec" onClick={() => setDialogOdprt(false)} disabled={shranjujem}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack spacing={1.5} sx={KOMPAKTEN_SLOG_POLJ}>
            {/* Naziv */}
            <TextField
              label="Naziv stroška"
              value={novStrosek.strosek}
              onChange={(e) => setNovStrosek((prej) => ({ ...prej, strosek: e.target.value }))}
              size="small"
              fullWidth
              required
              placeholder="npr. Nova strešna okna"
            />

            {/* Opis (daljši) */}
            <TextField
              label="Opis (neobvezno)"
              value={novStrosek.opis}
              onChange={(e) => setNovStrosek((prej) => ({ ...prej, opis: e.target.value }))}
              size="small"
              fullWidth
              multiline
              minRows={2}
              placeholder="Daljši opis, opombe, izvajalec…"
              slotProps={{
                htmlInput: { maxLength: 2000 }
              }}
            />

            {/* Datum stroška */}
            <DatePicker
              label="Datum stroška (neobvezno)"
              value={novStrosek.datum_stroska}
              onChange={(val) => setNovStrosek((prej) => ({ ...prej, datum_stroska: val }))}
              format="DD.MM.YYYY"
              slotProps={{
                textField: { size: 'small', fullWidth: true },
                field: { clearable: true }
              }}
            />

            {/* Hiša + soba */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 180px', minWidth: 170 }}>
                <SearchableSelect
                  label="Hiša"
                  value={novStrosek.tip_hise}
                  onChange={spremeniTipHise}
                  options={[
                    { value: '', label: 'Brez hiše' },
                    ...tipiHise.map((tip) => ({ value: tip, label: tip }))
                  ]}
                />
              </Box>
              <Box sx={{ flex: '1 1 220px', minWidth: 210 }}>
                <SearchableSelect
                  label="Soba"
                  value={novStrosek.soba_id}
                  onChange={spremeniSobo}
                  options={[
                    { value: '', label: 'Brez sobe' },
                    ...sobeFiltrirane.map((s) => ({ value: s.id, label: s.ime_sobe }))
                  ]}
                />
              </Box>
            </Box>

            <Divider />

            {/* Postavke ali skupni znesek */}
            {imaPostavke ? (
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                  <Typography variant="body2" sx={{
                    fontWeight: 600
                  }}>
                    Postavke
                  </Typography>
                  <Typography variant="body2" fontVariantNumeric="tabular-nums" sx={{
                    color: "text.secondary"
                  }}>
                    Skupaj: <strong>{znesekIzPostavk.toFixed(2)} €</strong>
                  </Typography>
                </Stack>

                {novStrosek.postavke.map((p, i) => (
                  <Stack key={i} direction="row" spacing={0.75} sx={{
                    alignItems: "flex-start"
                  }}>
                    <TextField
                      label={`Postavka ${i + 1}`}
                      value={p.opis}
                      onChange={(e) => spremeniPostavko(i, 'opis', e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                      placeholder="npr. Miza"
                    />
                    <TextField
                      type="number"
                      value={p.znesek}
                      onChange={(e) => spremeniPostavko(i, 'znesek', e.target.value)}
                      size="small"
                      sx={{ width: 90 }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <EuroSymbolOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                            </InputAdornment>
                          )
                        },

                        htmlInput: { min: 0, step: '0.01', 'aria-label': `Znesek postavke ${i + 1}` }
                      }} />
                    <Tooltip title="Odstrani postavko">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => odstraniPostavko(i)}
                        sx={{ mt: 0.5 }}
                      >
                        <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}

                <Stack direction="row" sx={{
                  gap: 1
                }}>
                  <Button
                    size="small"
                    startIcon={<AddOutlinedIcon />}
                    onClick={dodajPostavko}
                    variant="outlined"
                  >
                    Dodaj
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => setNovStrosek((prej) => ({ ...prej, postavke: [], znesek: '' }))}
                  >
                    Brez postavk
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <TextField
                  label="Znesek"
                  type="number"
                  value={novStrosek.znesek}
                  onChange={(e) => setNovStrosek((prej) => ({ ...prej, znesek: e.target.value }))}
                  size="small"
                  fullWidth
                  required
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
                <Button
                  size="small"
                  startIcon={<AddOutlinedIcon />}
                  onClick={dodajPostavko}
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Razčleni na postavke
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setDialogOdprt(false)} disabled={shranjujem}>
            Prekliči
          </Button>
          <Button
            variant="contained"
            className="gumb-jeklo"
            startIcon={!shranjujem && !novStrosek.id ? <AddOutlinedIcon /> : undefined}
            onClick={potrdiDodajStrosek}
            disabled={shranjujem}
          >
            {shranjujem ? 'Shranjujem...' : novStrosek.id ? 'Shrani spremembe' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

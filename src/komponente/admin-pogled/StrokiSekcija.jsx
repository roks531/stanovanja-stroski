/**
 * Sekcija "Stroški" v admin pogledu.
 * Splošni stroški, ki niso vezani na obračune najemnikov - le na hišo/sobo za pregled.
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
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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

const PRAZEN_STROSEK = {
  id: '',
  strosek: '',
  tip_hise: '',
  soba_id: '',
  znesek: ''
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
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState('');
  const [novStrosek, setNovStrosek] = useState(PRAZEN_STROSEK);

  const skupajZnesek = useMemo(
    () => (vrsticeStroski ?? []).reduce((vsota, v) => vsota + Number(v.znesek ?? 0), 0),
    [vrsticeStroski]
  );

  const sobeFiltrirane = useMemo(() => {
    if (!novStrosek.tip_hise) return podatkiSobe ?? [];
    return (podatkiSobe ?? []).filter((s) => s.tip_hise === novStrosek.tip_hise);
  }, [podatkiSobe, novStrosek.tip_hise]);

  const stolpciStroskiZBrisanjem = useMemo(() => {
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

    return [...stolpciStroski, stolpecAkcije];
  }, [stolpciStroski, izbrisiStrosekVrstico]);

  function odpriDialog() {
    setNapaka('');
    setNovStrosek(PRAZEN_STROSEK);
    setDialogOdprt(true);
  }

  function urediStrosek(vrstica) {
    setNapaka('');
    setNovStrosek({
      id: vrstica.id,
      strosek: vrstica.strosek ?? '',
      tip_hise: vrstica.tip_hise ?? '',
      soba_id: vrstica.soba_id ?? '',
      znesek: String(vrstica.znesek ?? '')
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

  async function potrdiDodajStrosek() {
    setNapaka('');

    if (!novStrosek.strosek.trim()) {
      setNapaka('Strošek je obvezen.');
      return;
    }

    const znesek = Number(novStrosek.znesek);
    if (!Number.isFinite(znesek) || znesek < 0) {
      setNapaka('Znesek mora biti 0 ali več.');
      return;
    }

    setShranjujem(true);
    try {
      await dodajStrosek({
        id: novStrosek.id || undefined,
        strosek: novStrosek.strosek.trim(),
        tip_hise: novStrosek.tip_hise || null,
        soba_id: novStrosek.soba_id || null,
        znesek
      });
      setDialogOdprt(false);
    } catch (err) {
      setNapaka(err?.message || 'Stroška ni bilo mogoče shraniti.');
    } finally {
      setShranjujem(false);
    }
  }

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
                <Typography variant="h5">Stroški</Typography>
                <Chip size="small" color="primary" label={`${(vrsticeStroski ?? []).length} stroškov`} />
                <Chip size="small" color="success" label={`Skupaj: ${skupajZnesek.toFixed(2)} €`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Splošni stroški, neodvisni od obračunov najemnikov. Hiša in soba sta neobvezni.
              </Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={odpriDialog}
              >
                Dodaj strošek
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={izvoziStrokiXlsx}
              >
                Izvozi XLSX
              </Button>
            </Stack>
          </Stack>

          {/* Tabela stroškov */}
          <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
            <DataGrid
              sx={ADMIN_DATAGRID_FLEKS_SX}
              rows={vrsticeStroski ?? []}
              columns={stolpciStroskiZBrisanjem}
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

      <Dialog
        open={dialogOdprt}
        onClose={() => {
          if (!shranjujem) setDialogOdprt(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{novStrosek.id ? 'Uredi strošek' : 'Dodaj strošek'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={KOMPAKTEN_SLOG_POLJ}>
            <Typography variant="body2" color="text.secondary">
              Vnesi opis stroška in znesek. Hiša in soba sta neobvezni.
            </Typography>

            {napaka && (
              <Alert severity="error" onClose={() => setNapaka('')}>
                {napaka}
              </Alert>
            )}

            <TextField
              label="Strošek"
              value={novStrosek.strosek}
              onChange={(e) => setNovStrosek((prej) => ({ ...prej, strosek: e.target.value }))}
              size="small"
              fullWidth
              required
            />

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

            <TextField
              label="Znesek"
              type="number"
              value={novStrosek.znesek}
              onChange={(e) => setNovStrosek((prej) => ({ ...prej, znesek: e.target.value }))}
              size="small"
              fullWidth
              required
              inputProps={{ min: 0, step: '0.01' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOdprt(false)} disabled={shranjujem}>
            Prekliči
          </Button>
          <Button
            variant="contained"
            className="gumb-jeklo"
            onClick={potrdiDodajStrosek}
            disabled={shranjujem}
          >
            {shranjujem ? 'Shranjujem...' : novStrosek.id ? 'Shrani spremembe' : 'Dodaj strošek'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

/**
 * Sekcija "Sobe" v administraciji.
 * Vse akcije (shranjevanje, validacije, potrditve) prihajajo iz parent komponente.
 */
import { useCallback, useMemo, useState } from 'react';
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
  IconButton,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DataGrid from './AdminDataGrid';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchableSelect from '../SearchableSelect';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_DIALOG_CONTENT_SX,
  ADMIN_DIALOG_ACTIONS_SX,
  ADMIN_KOMPAKTNA_POLJA_SX,
  ADMIN_TABELA_CARD_SX,
  ADMIN_TABELA_CONTENT_SX,
  ADMIN_TABELA_STACK_SX,
  ADMIN_TABELA_FLEKS_SX
} from './adminSekcijaPostavitev';

export default function SobeSekcija({
  vrsticeSobe,
  helperZaSobo,
  potrdiPrejsnjeObracunskoObdobje,
  potrjevanjeObdobja,
  izvoziSobeXlsx,
  shraniNovoSobo,
  novaSoba,
  setNovaSoba,
  tipiHise,
  ponastaviNovoSoboForm,
  spremeniNovoSoboBesedilo,
  spremeniNovoSoboStevilo,
  sobaImaVodniStevec,
  spremeniNovoSoboBool,
  stolpciSobe,
  moznostiStrani,
  lokalizacijaMreze,
  izberiSoboZaUrejanje
}) {
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const odpriUrejanje = useCallback((id) => {
    izberiSoboZaUrejanje(id);
    setDialogOdprt(true);
  }, [izberiSoboZaUrejanje]);
  const stolpciZAkcijami = useMemo(() => [
    ...stolpciSobe.map((stolpec) => ({ ...stolpec, editable: false })),
    {
      field: 'akcije_soba', headerName: '', width: 56,
      sortable: false, filterable: false, disableColumnMenu: true,
      align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="Uredi sobo">
          <IconButton size="small" aria-label="Uredi sobo" onClick={(e) => {
            e.stopPropagation();
            odpriUrejanje(params.id);
          }}>
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      )
    }
  ], [stolpciSobe, odpriUrejanje]);

  function zapriDialog() {
    if (!shranjujem) setDialogOdprt(false);
  }

  async function shrani(e) {
    e.preventDefault();
    if (shranjujem) return;
    setShranjujem(true);
    try {
      if (await shraniNovoSobo(e)) setDialogOdprt(false);
    } finally {
      setShranjujem(false);
    }
  }

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
                gap: 1,
                flexShrink: 0
              }}>
              <Box>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap"
                  }}>
                  <Typography variant="h5">Sobe</Typography>
                  <Tooltip title={`${helperZaSobo()} Vključi "Vodni števec", če se voda računa po števcu. Izklop pomeni fiksni strošek vode.`}>
                    <IconButton type="button" size="small" aria-label="Informacije o urejanju sob">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Chip size="small" color="primary" label={`${vrsticeSobe.length} sob`} />
                </Stack>
              </Box>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} aria-label="Dodaj sobo" title="Dodaj sobo" onClick={() => {
                  ponastaviNovoSoboForm();
                  setDialogOdprt(true);
                }}>
                  Dodaj
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  className="gumb-jeklo"
                  onClick={potrdiPrejsnjeObracunskoObdobje}
                  disabled={potrjevanjeObdobja}
                >
                  {potrjevanjeObdobja ? 'Odpiram...' : 'Potrdi podatke za obračune'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={izvoziSobeXlsx}
                >
                  XLSX
                </Button>
              </Stack>
            </Stack>

            {/* Tabela sob */}
            <Box
              className="tabela-polna"
              sx={ADMIN_TABELA_FLEKS_SX}
            >
              <DataGrid
                sx={{
                  ...ADMIN_DATAGRID_FLEKS_SX,
                  '& .MuiDataGrid-row': { cursor: 'pointer' },
                  '& .grid-money': { fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.5 }
                }}
                rows={vrsticeSobe}
                columns={stolpciZAkcijami}
                density="compact"
                rowHeight={64}
                disableRowSelectionOnClick
                pageSizeOptions={moznostiStrani}
                localeText={lokalizacijaMreze}
                onRowClick={(params) => odpriUrejanje(params.id)}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100, page: 0 }
                  }
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Dialog
        open={dialogOdprt}
        onClose={zapriDialog}
        fullScreen={jeMobilen}
        fullWidth
        maxWidth="sm"
        aria-labelledby="soba-dialog-naslov"
        slotProps={{ paper: {
          component: 'form', onSubmit: shrani,
          sx: { maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)', ...(jeMobilen && { borderRadius: 0 }) }
        } }}
      >
        <DialogTitle id="soba-dialog-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1.5 }}>
          <Typography id="soba-dialog-naslov" component="span" variant="h6">{novaSoba.id ? `Uredi sobo: ${novaSoba.ime_sobe}` : 'Nova soba'}</Typography>
          <IconButton type="button" aria-label="Zapri obrazec" onClick={zapriDialog} disabled={shranjujem}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack spacing={1.5} sx={ADMIN_KOMPAKTNA_POLJA_SX}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              <TextField label="Soba" autoFocus value={novaSoba.ime_sobe} onChange={(e) => spremeniNovoSoboBesedilo('ime_sobe', e.target.value)} size="small" fullWidth required />
              <SearchableSelect
                label="Hiša"
                value={novaSoba.tip_hise}
                onChange={(novaVrednost) =>
                  setNovaSoba((prej) => ({
                    ...prej,
                    tip_hise: novaVrednost
                  }))
                }
                options={tipiHise.map((tip) => ({ value: tip, label: tip }))}
                disableClearable
              />
              <TextField label="Najemnina" type="number" value={novaSoba.najemnina} onChange={(e) => spremeniNovoSoboStevilo('najemnina', e.target.value)} size="small" fullWidth slotProps={{
                input: { endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }
              }} />
              <TextField label="Skupni" type="number" value={novaSoba.strosek_skupni} onChange={(e) => spremeniNovoSoboStevilo('strosek_skupni', e.target.value)} size="small" fullWidth slotProps={{
                input: { endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }
              }} />
              <TextField label="NetTV" type="number" value={novaSoba.nettv} onChange={(e) => spremeniNovoSoboStevilo('nettv', e.target.value)} size="small" fullWidth slotProps={{
                input: { endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }
              }} />
              <TextField label="Drugo" type="number" value={novaSoba.fiksni} onChange={(e) => spremeniNovoSoboStevilo('fiksni', e.target.value)} size="small" fullWidth slotProps={{
                input: { endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }
              }} />
              <TextField
                label="Delež ogrevanja"
                type="number"
                value={novaSoba.faktor_ogrevanja}
                onChange={(e) => spremeniNovoSoboStevilo('faktor_ogrevanja', e.target.value)}
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title='Strošek ogrevanja za sobo = skupni znesek ogrevanja tipa hiše × delež sobe. Primer: 0.1900 pomeni 19 %.'
                          arrow
                          placement="top"
                        >
                          <InfoOutlinedIcon sx={{ fontSize: '0.95rem', color: '#0ea5e9', cursor: 'default' }} />
                        </Tooltip>
                      </InputAdornment>
                    )
                  },

                  htmlInput: { min: 0, max: 1, step: '0.0001' }
                }} />
              <TextField
                label="Voda"
                type="number"
                value={novaSoba.voda}
                onChange={(e) => spremeniNovoSoboStevilo('voda', e.target.value)}
                size="small"
                disabled={sobaImaVodniStevec(novaSoba)}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={sobaImaVodniStevec(novaSoba)
                            ? 'Voda se računa po števcu.'
                            : 'Strošek vode za sobo.'}
                          arrow
                          placement="top"
                        >
                          <InfoOutlinedIcon sx={{ fontSize: '0.95rem', color: '#059669', cursor: 'default', mr: 0.5 }} />
                        </Tooltip>
                        <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                      </InputAdornment>
                    )
                  },

                  htmlInput: { min: 0, step: '0.01' }
                }} />
            </Box>

            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Switch size="small" checked={Boolean(novaSoba.voda_stanje)} onChange={(e) => spremeniNovoSoboBool('voda_stanje', e.target.checked)} />}
                label="Vodni števec" sx={{ ml: 0 }}
              />
              <FormControlLabel
                control={<Switch size="small" checked={novaSoba.aktivna} onChange={(e) => spremeniNovoSoboBool('aktivna', e.target.checked)} />}
                label="Aktivna soba" sx={{ ml: 0 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={zapriDialog} disabled={shranjujem}>Prekliči</Button>
          <Button type="submit" variant="contained" className="gumb-jeklo" disabled={shranjujem}>
            {shranjujem ? 'Shranjujem …' : novaSoba.id ? 'Posodobi sobo' : 'Shrani sobo'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

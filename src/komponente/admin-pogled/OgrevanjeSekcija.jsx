/**
 * Sekcija "Ogrevanje" za urejanje mesečnih zneskov po tipu hiše.
 */
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
  Grid,
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
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
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


export default function OgrevanjeSekcija({
  vrsticeOgrevanjeTipi,
  izvoziOgrevanjeXlsx,
  stolpciOgrevanjeTipi,
  moznostiStrani,
  lokalizacijaMreze,
  izberiOgrevanjeZaUrejanje,
  shraniOgrevanjePoTipu,
  izbrisiOgrevanjeVrstico,
  ponastaviOgrevanjeForm,
  novoOgrevanje,
  setNovoOgrevanje,
  tipiHise,
  imenaMesecov
}) {
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));

  function zapriDialog() {
    if (!shranjujem) setDialogOdprt(false);
  }

  async function shrani(e) {
    e.preventDefault();
    if (shranjujem) return;
    setShranjujem(true);
    try {
      if (await shraniOgrevanjePoTipu(e)) setDialogOdprt(false);
    } finally {
      setShranjujem(false);
    }
  }

  const stolpciOgrevanjeZBrisanjem = useMemo(() => {
    const akcije = {
      field: 'akcije_ogrevanje',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="Izbriši ogrevanje">
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                izbrisiOgrevanjeVrstico?.(params.row);
              }}
              aria-label="Izbriši ogrevanje"
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </span>
        </Tooltip>
      )
    };

    const indeksOpombe = stolpciOgrevanjeTipi.findIndex((stolpec) => stolpec.field === 'opomba');
    if (indeksOpombe < 0) return [...stolpciOgrevanjeTipi, akcije];

    return [
      ...stolpciOgrevanjeTipi.slice(0, indeksOpombe + 1),
      akcije,
      ...stolpciOgrevanjeTipi.slice(indeksOpombe + 1)
    ];
  }, [stolpciOgrevanjeTipi, izbrisiOgrevanjeVrstico]);

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
                  <Typography variant="h5">Ogrevanje</Typography>
                  <Tooltip title="Privzeto je predhodni mesec. Klikni vrstico za urejanje.">
                    <IconButton type="button" size="small" aria-label="Informacije o urejanju ogrevanja">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Chip size="small" color="primary" label={`${vrsticeOgrevanjeTipi.length} zapisov`} />
                </Stack>
              </Box>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} aria-label="Dodaj ogrevanje" title="Dodaj ogrevanje" onClick={() => {
                  ponastaviOgrevanjeForm();
                  setDialogOdprt(true);
                }}>
                  Dodaj
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={izvoziOgrevanjeXlsx}
                >
                  XLSX
                </Button>
              </Stack>
            </Stack>

            <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
              <DataGrid
                sx={{ ...ADMIN_DATAGRID_FLEKS_SX, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
                rows={vrsticeOgrevanjeTipi}
                columns={stolpciOgrevanjeZBrisanjem}
                density="compact"
                rowHeight={56}
                disableRowSelectionOnClick
                pageSizeOptions={moznostiStrani}
                localeText={lokalizacijaMreze}
                onRowClick={(params) => {
                  izberiOgrevanjeZaUrejanje(params.id);
                  setDialogOdprt(true);
                }}
                initialState={{ pagination: { paginationModel: { pageSize: 100, page: 0 } } }}
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
        aria-labelledby="ogrevanje-dialog-naslov"
        slotProps={{ paper: {
          component: 'form', onSubmit: shrani,
          sx: { maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)', ...(jeMobilen && { borderRadius: 0 }) }
        } }}
      >
        <DialogTitle id="ogrevanje-dialog-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography id="ogrevanje-dialog-naslov" component="span" variant="h6">
            {novoOgrevanje.id ? 'Uredi ogrevanje' : 'Dodaj ogrevanje'}
          </Typography>
          <IconButton aria-label="Zapri obrazec" onClick={zapriDialog} disabled={shranjujem}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack component="fieldset" disabled={shranjujem} spacing={2} sx={{ ...KOMPAKTEN_SLOG_POLJ, m: 0, p: 0, border: 0, minWidth: 0 }}>
            <SearchableSelect
              label="Tip hiše"
              value={novoOgrevanje.tip_hise}
              onChange={(novaVrednost) => setNovoOgrevanje({ ...novoOgrevanje, tip_hise: novaVrednost })}
              options={tipiHise.map((tip) => ({ value: tip, label: tip }))}
              disableClearable
            />
            <SearchableSelect
              label="Mesec"
              value={novoOgrevanje.mesec}
              onChange={(novaVrednost) => setNovoOgrevanje({ ...novoOgrevanje, mesec: Number(novaVrednost) })}
              options={imenaMesecov.map((ime, idx) => ({ value: idx + 1, label: ime }))}
              disableClearable
            />
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Leto"
                  type="number"
                  value={novoOgrevanje.leto}
                  onChange={(e) => setNovoOgrevanje({ ...novoOgrevanje, leto: Number(e.target.value) })}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Ogrevanje"
                  type="number"
                  value={novoOgrevanje.znesek}
                  onChange={(e) => setNovoOgrevanje({ ...novoOgrevanje, znesek: Number(e.target.value) })}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Opomba"
              value={novoOgrevanje.opomba}
              onChange={(e) => setNovoOgrevanje({ ...novoOgrevanje, opomba: e.target.value })}
              size="small"
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={zapriDialog} disabled={shranjujem}>Prekliči</Button>
          <Button type="submit" variant="contained" disabled={shranjujem} startIcon={!shranjujem && !novoOgrevanje.id ? <AddOutlinedIcon /> : undefined}>
            {shranjujem ? 'Shranjujem...' : novoOgrevanje.id ? 'Shrani spremembe' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

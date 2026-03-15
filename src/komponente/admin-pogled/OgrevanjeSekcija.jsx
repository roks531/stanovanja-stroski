/**
 * Sekcija "Ogrevanje" za urejanje mesečnih zneskov po tipu hiše.
 */
import { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchableSelect from '../SearchableSelect';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_GRID_FLEKS_SX,
  ADMIN_GRID_ITEM_FLEKS_SX,
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
  '& .MuiFormControlLabel-label': { fontSize: '0.82rem' },
  '& .MuiChip-label': { fontSize: '0.72rem' },
  '& .MuiButton-root': { fontSize: '0.76rem' }
};

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
                <Typography variant="h5">Ogrevanje</Typography>
                <Chip size="small" color="primary" label={`${vrsticeOgrevanjeTipi.length} zapisov`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Privzeto je predhodni mesec. Klikni vrstico za urejanje.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={izvoziOgrevanjeXlsx}
            >
              Izvozi XLSX
            </Button>
          </Stack>

          <Grid container spacing={2} alignItems="stretch" sx={ADMIN_GRID_FLEKS_SX}>
            <Grid size={{ xs: 12, md: 8 }} sx={ADMIN_GRID_ITEM_FLEKS_SX}>
              <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
                <DataGrid
                  sx={ADMIN_DATAGRID_FLEKS_SX}
                  rows={vrsticeOgrevanjeTipi}
                  columns={stolpciOgrevanjeZBrisanjem}
                  density="compact"
                  rowHeight={56}
                  disableRowSelectionOnClick
                  pageSizeOptions={moznostiStrani}
                  localeText={lokalizacijaMreze}
                  onRowClick={(params) => izberiOgrevanjeZaUrejanje(params.id)}
                  initialState={{ pagination: { paginationModel: { pageSize: 100, page: 0 } } }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2.5,
                  backgroundColor: 'background.paper',
                  maxWidth: 360,
                }}
              >
                <Stack component="form" spacing={1} onSubmit={shraniOgrevanjePoTipu} sx={KOMPAKTEN_SLOG_POLJ}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" color="text.secondary">Uredi ogrevanje</Typography>
                    <Button variant="outlined" size="small" onClick={ponastaviOgrevanjeForm}>Novo ogrevanje</Button>
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', py: 0.5 }}>
                    <Chip
                      size="small"
                      color={novoOgrevanje.id ? 'info' : 'success'}
                      label={novoOgrevanje.id ? 'Urejanje zapisa' : 'Nov zapis'}
                    />
                    {novoOgrevanje.id && (
                      <Typography variant="caption" color="text.secondary">
                        {novoOgrevanje.tip_hise} | {String(Number(novoOgrevanje.mesec) || 1).padStart(2, '0')}.{novoOgrevanje.leto}
                      </Typography>
                    )}
                    {!novoOgrevanje.id && (
                      <Typography variant="caption" color="text.secondary">
                        Klikni vrstico v tabeli za urejanje ali dodaj novo.
                      </Typography>
                    )}
                  </Box>
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
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                            </InputAdornment>
                          )
                        }}
                        size="small"
                        fullWidth
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
                  <Button type="submit" variant="contained" className="gumb-jeklo">Shrani ogrevanje</Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

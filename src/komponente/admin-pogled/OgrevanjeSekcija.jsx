/**
 * Sekcija "Ogrevanje" za urejanje mesečnih zneskov po tipu hiše.
 */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import SearchableSelect from '../SearchableSelect';

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
  ponastaviOgrevanjeForm,
  novoOgrevanje,
  setNovoOgrevanje,
  tipiHise,
  imenaMesecov
}) {
  return (
    <Card className="kartica-jeklo">
      <CardContent>
        <Stack spacing={1.5}>
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

          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={8}>
              <Box className="tabela-polna">
                <DataGrid
                  rows={vrsticeOgrevanjeTipi}
                  columns={stolpciOgrevanjeTipi}
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

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2.5,
                  height: '100%',
                  backgroundColor: 'background.paper',
                  maxWidth: { xs: '100%', md: 340 },
                  ml: { xs: 0, md: 'auto' }
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
                        {novoOgrevanje.tip_hise} | {imenaMesecov[(Number(novoOgrevanje.mesec) || 1) - 1]} {novoOgrevanje.leto}
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Leto"
                        type="number"
                        value={novoOgrevanje.leto}
                        onChange={(e) => setNovoOgrevanje({ ...novoOgrevanje, leto: Number(e.target.value) })}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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

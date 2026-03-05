/**
 * Sekcija "Cene in Števci" z dvema pod-zavihkoma:
 * 1) cene elektrike/vode
 * 2) vnos števcev po sobah
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
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import dayjs from 'dayjs';
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
                <Typography variant="h5">Cene in Števci</Typography>
                <Chip size="small" color="primary" label={`${vrsticeCene.length} zapisov`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Cene elektrike in vode ter vnos odčitkov po sobah.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={ceneStevciPodtab === 1 ? izvoziStevceXlsx : izvoziCeneXlsx}
            >
              Izvozi XLSX
            </Button>
          </Stack>

          {/* Pod-zavihki */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={ceneStevciPodtab} onChange={(_, v) => setCeneStevciPodtab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Cene elektrike in vode" />
              <Tab label="Vnos števcev po sobah" />
            </Tabs>
          </Box>

          {ceneStevciPodtab === 0 && (
            <Grid container spacing={2} alignItems="stretch">
              <Grid item xs={12} md={8}>
                <Box className="tabela-polna">
                  <DataGrid
                    rows={vrsticeCene}
                    columns={stolpciCene}
                    density="compact"
                    rowHeight={56}
                    columnHeaderHeight={64}
                    disableRowSelectionOnClick
                    pageSizeOptions={moznostiStrani}
                    localeText={lokalizacijaMreze}
                    onRowClick={(params) => izberiCenoZaUrejanje(params.id)}
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
                    p: 1.5,
                    height: '100%',
                    backgroundColor: 'background.paper',
                    maxWidth: { xs: '100%', md: 340 },
                    ml: { xs: 0, md: 'auto' }
                  }}
                >
                  <Stack component="form" spacing={1} onSubmit={shraniCeno} sx={KOMPAKTEN_SLOG_POLJ}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" color="text.secondary">Uredi ceno</Typography>
                      <Button variant="outlined" size="small" onClick={ponastaviCenaForm}>Nova cena</Button>
                    </Stack>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', py: 0.5 }}>
                      <Chip size="small" color={novaCena.id ? 'info' : 'success'} label={novaCena.id ? 'Urejanje zapisa' : 'Nov zapis'} />
                      {novaCena.id && (
                        <Typography variant="caption" color="text.secondary">
                          {novaCena.tip_hise} | {dayjs(novaCena.velja_od).format('DD.MM.YYYY')}
                        </Typography>
                      )}
                      {!novaCena.id && (
                        <Typography variant="caption" color="text.secondary">
                          Klikni vrstico v tabeli za urejanje ali dodaj novo.
                        </Typography>
                      )}
                    </Box>
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
                      inputProps={{ step: '0.0001' }}
                      value={novaCena.cena_elektrike}
                      onChange={(e) => setNovaCena({ ...novaCena, cena_elektrike: e.target.value })}
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
                    <TextField
                      label="Cena vode"
                      type="number"
                      inputProps={{ step: '0.0001' }}
                      value={novaCena.cena_vode}
                      onChange={(e) => setNovaCena({ ...novaCena, cena_vode: e.target.value })}
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
                    <Button type="submit" variant="contained" className="gumb-jeklo">Shrani ceno</Button>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          )}

          {ceneStevciPodtab === 1 && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.5,
                backgroundColor: 'background.paper'
              }}
            >
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1}
                >
                  <Box sx={KOMPAKTEN_SLOG_POLJ}>
                    <Typography variant="subtitle1" fontWeight={700}>Vnos števcev po sobah</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admin lahko vnese ali popravi stanje elektrike in vode za katerokoli sobo.
                    </Typography>
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
                      sx={{ mt: 1, minWidth: { xs: '100%', sm: 220 }, maxWidth: { sm: 260 } }}
                    />
                  </Box>
                </Stack>

                <Grid container spacing={2} alignItems="stretch">
                  <Grid item xs={12} md={8}>
                    <Box sx={{ height: 360 }} className="tabela-polna">
                      <DataGrid
                        rows={vrsticeStevciAdminFiltrirane}
                        columns={stolpciAdminStevci}
                        density="compact"
                        rowHeight={66}
                        disableRowSelectionOnClick
                        pageSizeOptions={moznostiStrani}
                        localeText={lokalizacijaMreze}
                        onRowClick={(params) => izberiStevecAdminZaUrejanje(params.id)}
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
                        p: 1.25,
                        height: '100%'
                      }}
                    >
                      <Stack component="form" spacing={1} onSubmit={shraniStevecAdmin} sx={KOMPAKTEN_SLOG_POLJ}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" color="text.secondary">Uredi števec</Typography>
                          <Button variant="outlined" size="small" onClick={ponastaviStevecAdminForm}>Nov števec</Button>
                        </Stack>
                        <Chip
                          size="small"
                          color={novStevecAdmin.id ? 'info' : 'success'}
                          label={novStevecAdmin.id ? 'Urejanje odčitka' : 'Nov odčitek'}
                        />

                        <SearchableSelect
                          label="Soba"
                          value={novStevecAdmin.soba_id}
                          onChange={(novaVrednost) => {
                            const soba = (podatkiSobe ?? []).find((s) => s.id === novaVrednost);
                            setNovStevecAdmin((prej) => ({
                              ...prej,
                              soba_id: novaVrednost,
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

                        <TextField
                          label="Stanje elektrike"
                          type="number"
                          value={novStevecAdmin.stanje_elektrike}
                          onChange={(e) =>
                            setNovStevecAdmin((prej) => ({ ...prej, stanje_elektrike: e.target.value }))
                          }
                          size="small"
                          required
                          fullWidth
                        />

                        <TextField
                          label="Stanje vode"
                          type="number"
                          value={novStevecAdmin.stanje_vode}
                          onChange={(e) =>
                            setNovStevecAdmin((prej) => ({ ...prej, stanje_vode: e.target.value }))
                          }
                          size="small"
                          fullWidth
                          disabled={!sobaImaVodniStevec(izbranaSobaStevec)}
                          helperText={!sobaImaVodniStevec(izbranaSobaStevec) ? 'Ta soba nima števca za vodo.' : ''}
                        />

                        <Button type="submit" variant="contained" className="gumb-jeklo">Shrani števec</Button>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

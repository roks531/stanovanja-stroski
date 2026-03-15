/**
 * Sekcija "Sobe" v administraciji.
 * Vse akcije (shranjevanje, validacije, potrditve) prihajajo iz parent komponente.
 */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchableSelect from '../SearchableSelect';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_SEKCIJA_CARD_SX,
  ADMIN_SEKCIJA_CONTENT_SX,
  ADMIN_SEKCIJA_STACK_SX,
  ADMIN_TABELA_FLEKS_SX
} from './adminSekcijaPostavitev';

const MAX_SIRINA_SOBE_SEKCIJE = 1280;

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
  obdelajPosodobitevSobe,
  obdelajNapakoPosodobitveSobe,
  jeVrsticaSobeUredljiva,
  izberiSoboZaUrejanje
}) {
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
                <Typography variant="h5">Sobe</Typography>
                <Chip size="small" color="primary" label={`${vrsticeSobe.length} sob`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                {helperZaSobo()} Za hišo "stara" vpiši fiksni strošek vode, v "velika" se voda računa po števcu.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
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
                Izvozi XLSX
              </Button>
            </Stack>
          </Stack>

          {/* Obrazec za sobo */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              backgroundColor: 'background.paper',
              maxWidth: MAX_SIRINA_SOBE_SEKCIJE
            }}
          >
            <Stack
              component="form"
              spacing={1}
              onSubmit={shraniNovoSobo}
              sx={{
                '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '0.74rem' },
                '& .MuiInputBase-input': { fontSize: '0.82rem' },
                '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
                '& .MuiFormControlLabel-label': { fontSize: '0.82rem' },
                '& .MuiChip-label': { fontSize: '0.72rem' },
                '& .MuiButton-root': { fontSize: '0.76rem' }
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Dodaj / posodobi sobo
                  </Typography>
                  <Chip
                    size="small"
                    color={novaSoba.id ? 'info' : 'success'}
                    label={novaSoba.id
                      ? `Urejanje: ${novaSoba.ime_sobe}`
                      : 'Nova soba — klikni vrstico za urejanje'}
                  />
                </Stack>
                <Button variant="outlined" size="small" onClick={ponastaviNovoSoboForm}>
                  Nova soba
                </Button>
              </Stack>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <TextField label="Soba" value={novaSoba.ime_sobe} onChange={(e) => spremeniNovoSoboBesedilo('ime_sobe', e.target.value)} size="small" required sx={{ flex: '3 1 140px' }} />
                <SearchableSelect
                  label="Hiša"
                  value={novaSoba.tip_hise}
                  onChange={(novaVrednost) =>
                    setNovaSoba((prej) => ({
                      ...prej,
                      tip_hise: novaVrednost,
                      voda: novaVrednost === 'velika' ? 0 : Number(prej.voda ?? 0)
                    }))
                  }
                  options={tipiHise.map((tip) => ({ value: tip, label: tip }))}
                  disableClearable
                  sx={{ flex: '1 1 98px' }}
                />
                <TextField label="Najemnina" type="number" value={novaSoba.najemnina} onChange={(e) => spremeniNovoSoboStevilo('najemnina', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }} size="small" sx={{ flex: '1 1 96px' }} />
                <TextField label="Skupni" type="number" value={novaSoba.strosek_skupni} onChange={(e) => spremeniNovoSoboStevilo('strosek_skupni', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }} size="small" sx={{ flex: '1 1 96px' }} />
                <TextField label="NetTV" type="number" value={novaSoba.nettv} onChange={(e) => spremeniNovoSoboStevilo('nettv', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }} size="small" sx={{ flex: '1 1 96px' }} />
                <TextField label="Fiksni" type="number" value={novaSoba.fiksni} onChange={(e) => spremeniNovoSoboStevilo('fiksni', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} /></InputAdornment> }} size="small" sx={{ flex: '1 1 96px' }} />
                <TextField
                  label="Delež ogrevanja"
                  type="number"
                  inputProps={{ min: 0, max: 1, step: '0.0001' }}
                  value={novaSoba.faktor_ogrevanja}
                  onChange={(e) => spremeniNovoSoboStevilo('faktor_ogrevanja', e.target.value)}
                  InputProps={{
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
                  }}
                  size="small"
                  sx={{ flex: '1 1 170px' }}
                />
                <TextField
                  label="Voda"
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={novaSoba.voda}
                  onChange={(e) => spremeniNovoSoboStevilo('voda', e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={sobaImaVodniStevec(novaSoba)
                            ? 'V hiši "velika" se voda računa po števcu.'
                            : 'Fiksni strošek vode za sobo.'}
                          arrow
                          placement="top"
                        >
                          <InfoOutlinedIcon sx={{ fontSize: '0.95rem', color: '#059669', cursor: 'default', mr: 0.5 }} />
                        </Tooltip>
                        <EuroSymbolOutlinedIcon sx={{ fontSize: '1rem' }} />
                      </InputAdornment>
                    )
                  }}
                  size="small"
                  disabled={sobaImaVodniStevec(novaSoba)}
                  sx={{ flex: '1 1 110px' }}
                />
              </Box>

              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ ml: '2px' }}>
                <FormControlLabel
                  control={<Switch size="small" checked={novaSoba.aktivna} onChange={(e) => spremeniNovoSoboBool('aktivna', e.target.checked)} />}
                  label="Aktivna soba"
                  sx={{ ml: 0 }}
                />
                <Button type="submit" size="small" variant="contained" className="gumb-jeklo" sx={{ ml: 'auto' }}>
                  {novaSoba.id ? 'Posodobi sobo' : 'Shrani sobo'}
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Tabela sob */}
          <Box
            className="tabela-polna"
            sx={{ ...ADMIN_TABELA_FLEKS_SX, maxWidth: MAX_SIRINA_SOBE_SEKCIJE }}
          >
            <DataGrid
              sx={ADMIN_DATAGRID_FLEKS_SX}
              rows={vrsticeSobe}
              columns={stolpciSobe}
              density="compact"
              rowHeight={64}
              disableRowSelectionOnClick
              pageSizeOptions={moznostiStrani}
              localeText={lokalizacijaMreze}
              processRowUpdate={obdelajPosodobitevSobe}
              onProcessRowUpdateError={obdelajNapakoPosodobitveSobe}
              isCellEditable={jeVrsticaSobeUredljiva}
              onCellClick={(params) => {
                if (params?.row?.id) {
                  izberiSoboZaUrejanje(params.row.id);
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
    </Card>
  );
}

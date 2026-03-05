/**
 * Sekcija "Uporabniki" v administraciji.
 * Komponenta je namenoma prezentacijska: vsa poslovna logika ostane v `AdminPogled`.
 */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import dayjs from 'dayjs';
import SearchableSelect from '../SearchableSelect';

export default function UporabnikiSekcija({
  vrsticeUporabniki,
  izvoziUporabnikeXlsx,
  shraniUporabnika,
  novUporabnik,
  setNovUporabnik,
  ponastaviUporabnikForm,
  gesloInfoText,
  gesloVidno,
  setGesloVidno,
  generirajZapomljivoGeslo,
  imeSobeZaGeslo,
  generirajMocnoGeslo,
  kopirajGeslo,
  podatkiSobe,
  moznostiStrani,
  lokalizacijaMreze,
  stolpciUporabniki,
  izberiUporabnikaZaUrejanje,
  nastaviAktivnostUporabnika
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
                <Typography variant="h5">Vsi uporabniki</Typography>
                <Chip size="small" color="primary" label={`${vrsticeUporabniki.length} zapisov`} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Klikni vrstico v tabeli za urejanje podatkov.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={izvoziUporabnikeXlsx}
            >
              Izvozi XLSX
            </Button>
          </Stack>

          {/* Obrazec za dodajanje/urejanje */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
              backgroundColor: 'background.paper',
              maxWidth: 960
            }}
          >
            <Stack
              component="form"
              spacing={1}
              onSubmit={shraniUporabnika}
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
                    Dodaj / posodobi uporabnika
                  </Typography>
                  <Chip
                    size="small"
                    color={novUporabnik.id ? 'info' : 'success'}
                    label={novUporabnik.id
                      ? `Urejanje: ${novUporabnik.ime} ${novUporabnik.priimek}`
                      : 'Nov zapis — klikni vrstico za urejanje'}
                  />
                </Stack>
                <Button variant="outlined" size="small" onClick={ponastaviUporabnikForm}>
                  Nov uporabnik
                </Button>
              </Stack>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <TextField label="Ime" value={novUporabnik.ime} onChange={(e) => setNovUporabnik({ ...novUporabnik, ime: e.target.value })} required size="small" sx={{ flex: '1 1 200px' }} />
                <TextField label="Priimek" value={novUporabnik.priimek} onChange={(e) => setNovUporabnik({ ...novUporabnik, priimek: e.target.value })} required size="small" sx={{ flex: '1 1 200px' }} />
                <TextField label="Telefon" value={novUporabnik.telefon} onChange={(e) => setNovUporabnik({ ...novUporabnik, telefon: e.target.value })} size="small" sx={{ flex: '1 1 160px' }} />
                <TextField label="Email" type="email" value={novUporabnik.email} onChange={(e) => setNovUporabnik({ ...novUporabnik, email: e.target.value })} required size="small" sx={{ flex: '2 1 260px' }} />
                <TextField
                  label={novUporabnik.id ? 'Novo geslo (neobvezno)' : 'Geslo'}
                  type={gesloVidno ? 'text' : 'password'}
                  value={novUporabnik.geslo}
                  onChange={(e) => setNovUporabnik({ ...novUporabnik, geslo: e.target.value })}
                  required={!novUporabnik.id}
                  size="small"
                  sx={{ flex: '1 1 300px' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={gesloInfoText}>
                          <IconButton type="button" edge="end" tabIndex={-1} onMouseDown={(e) => e.preventDefault()}>
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={gesloVidno ? 'Skrij geslo' : 'Prikazi geslo'}>
                          <IconButton type="button" onClick={() => setGesloVidno((prej) => !prej)} edge="end">
                            {gesloVidno ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generiraj zapomljivo geslo">
                          <IconButton
                            type="button"
                            onClick={() =>
                              setNovUporabnik({
                                ...novUporabnik,
                                geslo: generirajZapomljivoGeslo(imeSobeZaGeslo)
                              })
                            }
                            edge="end"
                          >
                            <AutoFixHighIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generiraj močno geslo">
                          <IconButton
                            type="button"
                            onClick={() => setNovUporabnik({ ...novUporabnik, geslo: generirajMocnoGeslo() })}
                            edge="end"
                          >
                            <GppGoodOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Kopiraj geslo">
                          <span>
                            <IconButton type="button" onClick={kopirajGeslo} edge="end" disabled={!novUporabnik.geslo}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
                <SearchableSelect
                  label="Soba"
                  value={novUporabnik.soba_id}
                  onChange={(novaVrednost) => setNovUporabnik({ ...novUporabnik, soba_id: novaVrednost ?? '' })}
                  options={[
                    { value: '', label: 'Brez sobe' },
                    ...(podatkiSobe ?? []).map((s) => ({ value: s.id, label: s.ime_sobe }))
                  ]}
                  sx={{ flex: '2 1 260px' }}
                />
                <DatePicker
                  label="Uporabnik od"
                  value={novUporabnik.uporabnik_od ? dayjs(novUporabnik.uporabnik_od) : null}
                  onChange={(novaVrednost) =>
                    setNovUporabnik({
                      ...novUporabnik,
                      uporabnik_od: novaVrednost ? novaVrednost.format('YYYY-MM-DD') : ''
                    })
                  }
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        flex: '1 1 160px',
                        '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                        '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '0.74rem' },
                        '& .MuiInputBase-input': { fontSize: '0.82rem' },
                        '& .MuiPickersSectionList-root': { fontSize: '0.82rem' },
                        '& .MuiPickersSectionList-section': { fontSize: '0.82rem' },
                        '& .MuiPickersInputBase-input': { fontSize: '0.82rem' }
                      }
                    }
                  }}
                />
              </Box>

              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ ml: '2px' }}>
                <FormControlLabel
                  control={<Switch size="small" checked={novUporabnik.admin} onChange={(e) => setNovUporabnik({ ...novUporabnik, admin: e.target.checked })} />}
                  label="Admin"
                  sx={{ ml: 0 }}
                />
                <FormControlLabel
                  control={<Switch size="small" checked={novUporabnik.aktiven} onChange={(e) => nastaviAktivnostUporabnika(e.target.checked)} />}
                  label="Aktiven"
                  sx={{ ml: 0 }}
                />
                <Button type="submit" size="small" variant="contained" className="gumb-jeklo" sx={{ ml: 'auto' }}>
                  Shrani uporabnika
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Tabela uporabnikov */}
          <Box className="tabela-polna" sx={{ maxWidth: 960 }}>
            <DataGrid
              rows={vrsticeUporabniki}
              columns={stolpciUporabniki}
              density="compact"
              rowHeight={68}
              columnHeaderHeight={48}
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
              onRowClick={(params) => izberiUporabnikaZaUrejanje(params.id)}
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

/**
 * Sekcija "Uporabniki" v administraciji.
 * Komponenta je namenoma prezentacijska: vsa poslovna logika ostane v `AdminPogled`.
 */
import { useMemo, useState } from 'react';
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
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import dayjs from 'dayjs';
import SearchableSelect from '../SearchableSelect';
import {
  ADMIN_DATAGRID_FLEKS_SX,
  ADMIN_SEKCIJA_CARD_SX,
  ADMIN_SEKCIJA_CONTENT_SX,
  ADMIN_SEKCIJA_STACK_SX,
  ADMIN_TABELA_FLEKS_SX
} from './adminSekcijaPostavitev';

const FILTER_CHIP_BASE_SX = {
  '& .MuiChip-label': { fontWeight: 600 },
  '&.MuiChip-clickable:active': { opacity: 1 },
  '&.Mui-focusVisible': { boxShadow: 'none' }
};

function statusPogodbeFilter(pogodbaOd, pogodbaDo) {
  if (!pogodbaOd || !pogodbaDo) return 'drugo';

  const danes = dayjs().startOf('day');
  const od = dayjs(pogodbaOd).startOf('day');
  const doDatuma = dayjs(pogodbaDo).startOf('day');

  if (!od.isValid() || !doDatuma.isValid()) return 'drugo';
  if (danes.isAfter(doDatuma, 'day')) return 'potekla';
  if (danes.isBefore(od, 'day')) return 'prihaja';

  const dniDoPoteka = doDatuma.diff(danes, 'day');
  if (dniDoPoteka <= 31) return 'kmalu';

  return 'aktivna';
}

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
  nastaviAktivnostUporabnika,
  predlogZacetnihStanjZaNovUporabnik,
  uporabiPredlaganaZacetnaStanja,
  sobaImaVodniStevecZaNovUporabnik
}) {
  const [filterPogodbe, setFilterPogodbe] = useState(null);

  const stetjePogodb = useMemo(
    () =>
      vrsticeUporabniki.reduce(
        (acc, vrstica) => {
          const status = statusPogodbeFilter(vrstica.pogodba_od, vrstica.pogodba_do);
          if (status in acc) acc[status] += 1;
          return acc;
        },
        { aktivna: 0, kmalu: 0, potekla: 0 }
      ),
    [vrsticeUporabniki]
  );

  const vrsticeUporabnikiFiltrirane = useMemo(() => {
    if (!filterPogodbe) return vrsticeUporabniki;
    return vrsticeUporabniki.filter(
      (vrstica) => statusPogodbeFilter(vrstica.pogodba_od, vrstica.pogodba_do) === filterPogodbe
    );
  }, [filterPogodbe, vrsticeUporabniki]);

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
                <Typography variant="h5">Vsi uporabniki</Typography>
                <Chip
                  size="small"
                  color="primary"
                  label={filterPogodbe
                    ? `${vrsticeUporabnikiFiltrirane.length} / ${vrsticeUporabniki.length} zapisov`
                    : `${vrsticeUporabniki.length} zapisov`}
                />
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
                  sx={{ flex: '1 1 180px' }}
                />
                <TextField
                  label="Začetno stanje elektrike"
                  type="number"
                  value={novUporabnik.zacetno_stanje_elektrike ?? ''}
                  onChange={(e) =>
                    setNovUporabnik({ ...novUporabnik, zacetno_stanje_elektrike: e.target.value })
                  }
                  size="small"
                  sx={{ flex: '1 1 170px' }}
                  inputProps={{ min: 0, step: 1 }}
                  helperText={predlogZacetnihStanjZaNovUporabnik?.stanje_elektrike != null
                    ? `Predlog: ${predlogZacetnihStanjZaNovUporabnik.stanje_elektrike}`
                    : 'Vnesi ob primopredaji'}
                />
                <TextField
                  label="Začetno stanje vode"
                  type="number"
                  value={novUporabnik.zacetno_stanje_vode ?? ''}
                  onChange={(e) =>
                    setNovUporabnik({ ...novUporabnik, zacetno_stanje_vode: e.target.value })
                  }
                  size="small"
                  sx={{ flex: '1 1 170px' }}
                  inputProps={{ min: 0, step: 1 }}
                  disabled={!sobaImaVodniStevecZaNovUporabnik}
                  helperText={!sobaImaVodniStevecZaNovUporabnik
                    ? 'Soba nima vodnega števca'
                    : (predlogZacetnihStanjZaNovUporabnik?.stanje_vode != null
                      ? `Predlog: ${predlogZacetnihStanjZaNovUporabnik.stanje_vode}`
                      : 'Vnesi ob primopredaji')}
                />
                <Tooltip title="Pridobi zadnje vrednosti števca za to sobo">
                  <span>
                    <IconButton
                      type="button"
                      size="small"
                      color="primary"
                      onClick={uporabiPredlaganaZacetnaStanja}
                      disabled={!predlogZacetnihStanjZaNovUporabnik}
                      aria-label="Uporabi zadnji odčitek sobe"
                      sx={{
                        alignSelf: 'flex-start',
                        mt: 0.25,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '8px',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>
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
                        flex: '1 1 150px',
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
                <Box sx={{ display: 'flex', flex: '2 1 360px', gap: 1, minWidth: 320 }}>
                  <DatePicker
                    label="Pogodba od"
                    value={novUporabnik.pogodba_od ? dayjs(novUporabnik.pogodba_od) : null}
                    onChange={(novaVrednost) =>
                      setNovUporabnik({
                        ...novUporabnik,
                        pogodba_od: novaVrednost ? novaVrednost.format('YYYY-MM-DD') : null
                      })
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          flex: 1,
                          minWidth: 0,
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
                  <DatePicker
                    label="Pogodba do"
                    value={novUporabnik.pogodba_do ? dayjs(novUporabnik.pogodba_do) : null}
                    onChange={(novaVrednost) =>
                      setNovUporabnik({
                        ...novUporabnik,
                        pogodba_do: novaVrednost ? novaVrednost.format('YYYY-MM-DD') : null
                      })
                    }
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: {
                          flex: 1,
                          minWidth: 0,
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
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 1.25,
              py: 0.85,
              backgroundColor: '#f8fafc',
              width: '100%',
              maxWidth: 1320,
              mx: 'auto'
            }}
          >
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mr: 0.5 }}>
                Filter pogodbe
              </Typography>
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`Vse (${vrsticeUporabniki.length})`}
                onClick={() => setFilterPogodbe(null)}
                clickable
                sx={{
                  ...FILTER_CHIP_BASE_SX,
                  ...(filterPogodbe
                    ? {}
                    : {
                      bgcolor: '#dbeafe',
                      color: '#1e3a8a',
                      borderColor: '#93c5fd',
                      '&:hover': { bgcolor: '#bfdbfe' }
                    })
                }}
              />
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`Aktivna (${stetjePogodb.aktivna})`}
                onClick={() =>
                  setFilterPogodbe((prej) => (prej === 'aktivna' ? null : 'aktivna'))
                }
                clickable
                sx={{
                  ...FILTER_CHIP_BASE_SX,
                  ...(filterPogodbe === 'aktivna'
                    ? {
                      bgcolor: '#dcfce7',
                      color: '#166534',
                      borderColor: '#86efac',
                      '&:hover': { bgcolor: '#bbf7d0' }
                    }
                    : {})
                }}
              />
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label={`Poteče v 30 dneh (${stetjePogodb.kmalu})`}
                onClick={() => setFilterPogodbe((prej) => (prej === 'kmalu' ? null : 'kmalu'))}
                clickable
                sx={{
                  ...FILTER_CHIP_BASE_SX,
                  ...(filterPogodbe === 'kmalu'
                    ? {
                      bgcolor: '#fef3c7',
                      color: '#92400e',
                      borderColor: '#fcd34d',
                      '&:hover': { bgcolor: '#fde68a' }
                    }
                    : {})
                }}
              />
              <Chip
                size="small"
                color="error"
                variant="outlined"
                label={`Potekla (${stetjePogodb.potekla})`}
                onClick={() =>
                  setFilterPogodbe((prej) => (prej === 'potekla' ? null : 'potekla'))
                }
                clickable
                sx={{
                  ...FILTER_CHIP_BASE_SX,
                  ...(filterPogodbe === 'potekla'
                    ? {
                      bgcolor: '#fee2e2',
                      color: '#991b1b',
                      borderColor: '#fca5a5',
                      '&:hover': { bgcolor: '#fecaca' }
                    }
                    : {})
                }}
              />
            </Stack>
          </Box>

          <Box
            className="tabela-polna"
            sx={{ ...ADMIN_TABELA_FLEKS_SX, maxWidth: 1320, mx: 'auto' }}
          >
            <DataGrid
              sx={ADMIN_DATAGRID_FLEKS_SX}
              rows={vrsticeUporabnikiFiltrirane}
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

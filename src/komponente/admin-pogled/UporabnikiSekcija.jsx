/**
 * Sekcija "Uporabniki" v administraciji.
 * Komponenta je namenoma prezentacijska: vsa poslovna logika ostane v `AdminPogled`.
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
  Divider,
  FormControlLabel,
  IconButton,
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
import OrodnaVrsticaUporabnikov from './OrodnaVrsticaUporabnikov';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import SearchableSelect from '../SearchableSelect';
import { ADMIN_DIALOG_CONTENT_SX, ADMIN_DIALOG_ACTIONS_SX, ADMIN_DATAGRID_FLEKS_SX, ADMIN_TABELA_CARD_SX, ADMIN_TABELA_CONTENT_SX, ADMIN_TABELA_STACK_SX, ADMIN_TABELA_FLEKS_SX } from './adminSekcijaPostavitev';

const ORODJA_UPORABNIKOV = { toolbar: OrodnaVrsticaUporabnikov };

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
  izbrisiUporabnika,
  prijavljenUporabnikId,
  predlogZacetnihStanjZaNovUporabnik,
  uporabiPredlaganaZacetnaStanja,
  sobaImaVodniStevecZaNovUporabnik
}) {
  const [filterPogodbe, setFilterPogodbe] = useState(null);
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const odpriUrejanje = useCallback((id) => {
    izberiUporabnikaZaUrejanje(id);
    setDialogOdprt(true);
  }, [izberiUporabnikaZaUrejanje]);

  function zapriDialog() {
    if (!shranjujem) setDialogOdprt(false);
  }

  async function shrani(e) {
    e.preventDefault();
    if (shranjujem) return;
    setShranjujem(true);
    try {
      const uspesno = await shraniUporabnika(e);
      if (uspesno) setDialogOdprt(false);
    } finally {
      setShranjujem(false);
    }
  }

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

  const orodnaVrsticaProps = useMemo(() => ({
    toolbar: { filterPogodbe, setFilterPogodbe, stetjePogodb, steviloUporabnikov: vrsticeUporabniki.length }
  }), [filterPogodbe, stetjePogodb, vrsticeUporabniki.length]);

  const stolpciUporabnikiZBrisanjem = useMemo(() => {
    const stolpecBrisanje = {
      field: 'akcije_uporabnik',
      headerName: '',
      width: 88,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const jeTrenutniAdmin = params.row?.id === prijavljenUporabnikId;
        return (
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Uredi uporabnika">
              <IconButton size="small" aria-label="Uredi uporabnika" onClick={(e) => {
                e.stopPropagation();
                odpriUrejanje(params.id);
              }}><EditOutlinedIcon sx={{ fontSize: 17 }} /></IconButton>
            </Tooltip>
            <Tooltip title={jeTrenutniAdmin ? 'Prijavljenega admina ni mogoče izbrisati' : 'Izbriši uporabnika'}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={jeTrenutniAdmin}
                  onClick={(e) => {
                    e.stopPropagation();
                    izbrisiUporabnika?.(params.row);
                  }}
                  aria-label="Izbriši uporabnika"
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      }
    };

    const stolpciBrezAkcij = stolpciUporabniki.filter((stolpec) => stolpec.field !== 'akcije_uporabnik');
    return [...stolpciBrezAkcij, stolpecBrisanje];
  }, [stolpciUporabniki, izbrisiUporabnika, prijavljenUporabnikId, odpriUrejanje]);

  return (
    <>
      <Card className="kartica-jeklo" sx={ADMIN_TABELA_CARD_SX}>
        <CardContent sx={ADMIN_TABELA_CONTENT_SX}>
          <Stack spacing={1.25} sx={ADMIN_TABELA_STACK_SX}>
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
                  <Typography variant="h5">Vsi uporabniki</Typography>
                  <Tooltip title="Klikni vrstico v tabeli za urejanje podatkov.">
                    <IconButton type="button" size="small" aria-label="Informacije o urejanju uporabnikov">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Chip
                    size="small"
                    color="primary"
                    label={filterPogodbe
                      ? `${vrsticeUporabnikiFiltrirane.length} / ${vrsticeUporabniki.length} zapisov`
                      : `${vrsticeUporabniki.length} zapisov`}
                  />
                </Stack>
              </Box>
              <Stack direction="row" sx={{
                gap: 1
              }}>
                <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} aria-label="Dodaj uporabnika" title="Dodaj uporabnika" onClick={() => {
                  ponastaviUporabnikForm();
                  setDialogOdprt(true);
                }}>Dodaj</Button>
                <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon />} onClick={izvoziUporabnikeXlsx}>XLSX</Button>
              </Stack>
            </Stack>

            {/* Tabela uporabnikov */}
            <Box
              sx={ADMIN_TABELA_FLEKS_SX}
            >
              <DataGrid
                sx={{ ...ADMIN_DATAGRID_FLEKS_SX, minWidth: 0, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
                rows={vrsticeUporabnikiFiltrirane}
                columns={stolpciUporabnikiZBrisanjem}
                density="compact"
                rowHeight={68}
                columnHeaderHeight={48}
                disableRowSelectionOnClick
                showToolbar
                pageSizeOptions={moznostiStrani}
                localeText={lokalizacijaMreze}
                slots={ORODJA_UPORABNIKOV}
                slotProps={orodnaVrsticaProps}
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
        maxWidth="md"
        aria-labelledby="uporabnik-dialog-naslov"
        slotProps={{
          paper: { component: 'form', onSubmit: shrani, sx: { maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)', ...(jeMobilen && { borderRadius: 0 }) } }
        }}
      >
        <DialogTitle id="uporabnik-dialog-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1.5 }}>
          <Typography id="uporabnik-dialog-naslov" component="span" variant="h6">{novUporabnik.id ? `Uredi uporabnika: ${novUporabnik.ime} ${novUporabnik.priimek}` : 'Nov uporabnik'}</Typography>
          <IconButton aria-label="Zapri obrazec" onClick={zapriDialog} disabled={shranjujem}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack component="fieldset" disabled={shranjujem} spacing={2} sx={{
            m: 0, p: 0, border: 0, minWidth: 0,
            '& .MuiFormControl-root': { minWidth: 0 },
            '& .MuiInputBase-root': { fontSize: '0.875rem' }
          }}>
            {/* ── Osebni podatki ───────────────────────────── */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.67rem', display: 'block', mb: 0.75 }}>
                Osebni podatki
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              <TextField label="Ime" autoFocus value={novUporabnik.ime} onChange={(e) => setNovUporabnik({ ...novUporabnik, ime: e.target.value })} required size="small" sx={{ flex: '1 1 150px' }} />
              <TextField label="Priimek" value={novUporabnik.priimek} onChange={(e) => setNovUporabnik({ ...novUporabnik, priimek: e.target.value })} required size="small" sx={{ flex: '1 1 150px' }} />
              <TextField label="Telefon" value={novUporabnik.telefon} onChange={(e) => setNovUporabnik({ ...novUporabnik, telefon: e.target.value })} size="small" sx={{ flex: '1 1 130px' }} />
              <TextField label="Email" type="email" value={novUporabnik.email} onChange={(e) => setNovUporabnik({ ...novUporabnik, email: e.target.value })} required size="small" sx={{ flex: '2 1 220px' }} />
              </Box>
            </Box>

            <Divider />

            {/* ── Dostop & soba ─────────────────────────────── */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.67rem', display: 'block', mb: 0.75 }}>
                Dostop & soba
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, alignItems: 'start' }}>
              <SearchableSelect
                label="Soba"
                value={novUporabnik.soba_id}
                onChange={(novaVrednost) => setNovUporabnik({ ...novUporabnik, soba_id: novaVrednost ?? '' })}
                options={[
                  { value: '', label: 'Brez sobe' },
                  ...(podatkiSobe ?? []).map((s) => ({ value: s.id, label: s.ime_sobe }))
                ]}
                sx={{ flex: '1 1 160px' }}
              />
              <TextField
                label={novUporabnik.id ? 'Novo geslo (neobvezno)' : 'Geslo'}
                type={gesloVidno ? 'text' : 'password'}
                value={novUporabnik.geslo}
                onChange={(e) => setNovUporabnik({ ...novUporabnik, geslo: e.target.value })}
                required={!novUporabnik.id}
                size="small"
                sx={{ flex: '2 1 280px' }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={gesloVidno ? 'Skrij geslo' : 'Prikazi geslo'}>
                          <IconButton type="button" onClick={() => setGesloVidno((prej) => !prej)} edge="end">
                            {gesloVidno ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  flexWrap: "wrap",
                  gridColumn: '1 / -1'
                }}>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 0.5
                  }}>
                  <Typography variant="caption" sx={{
                    color: "text.secondary"
                  }}>Orodja za geslo</Typography>
                  <Tooltip title={gesloInfoText}>
                    <IconButton type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Generiraj zapomljivo geslo">
                    <IconButton type="button" onClick={() => setNovUporabnik({ ...novUporabnik, geslo: generirajZapomljivoGeslo(imeSobeZaGeslo) })}>
                      <AutoFixHighIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Generiraj močno geslo">
                    <IconButton type="button" onClick={() => setNovUporabnik({ ...novUporabnik, geslo: generirajMocnoGeslo() })}>
                      <GppGoodOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Kopiraj geslo">
                    <span>
                      <IconButton type="button" onClick={kopirajGeslo} disabled={!novUporabnik.geslo}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1,
                    ml: 'auto'
                  }}>
                  <FormControlLabel
                    control={<Switch size="small" checked={novUporabnik.admin} onChange={(e) => setNovUporabnik({ ...novUporabnik, admin: e.target.checked })} />}
                    label="Admin"
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch size="small" checked={novUporabnik.aktiven} onChange={(e) => nastaviAktivnostUporabnika(e.target.checked)} />}
                    label="Aktiven"
                    sx={{ m: 0 }}
                  />
                </Stack>
              </Stack>
              </Box>
            </Box>

            <Divider />

            {/* ── Datumi ───────────────────────────────────── */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.67rem', display: 'block', mb: 0.75 }}>
                Datumi
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
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
                <DatePicker
                  label="Uporabnik do"
                  disabled={novUporabnik.aktiven}
                  value={novUporabnik.uporabnik_do ? dayjs(novUporabnik.uporabnik_do) : null}
                  onChange={(novaVrednost) =>
                    setNovUporabnik({
                      ...novUporabnik,
                      uporabnik_do: novaVrednost ? novaVrednost.format('YYYY-MM-DD') : null
                    })
                  }
                  slotProps={{
                    textField: {
                      size: 'small',
                      helperText: novUporabnik.aktiven ? 'Najprej izklopite možnost »Aktiven«.' : '',
                      sx: {
                        flex: '1 1 150px',
                        '& .MuiInputLabel-root': { fontSize: '0.8rem' },
                        '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '0.74rem' },
                        '& .MuiInputBase-input': { fontSize: '0.82rem' },
                        '& .MuiFormHelperText-root': { fontSize: '0.68rem', mx: 0.25 },
                        '& .MuiPickersSectionList-root': { fontSize: '0.82rem' },
                        '& .MuiPickersSectionList-section': { fontSize: '0.82rem' },
                        '& .MuiPickersInputBase-input': { fontSize: '0.82rem' }
                      }
                    }
                  }}
                />
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
              </Box>
            </Box>

            <Divider />

            {/* ── Začetna stanja števcev ────────────────────── */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.67rem', display: 'block', mb: 0.75 }}>
                Začetna stanja števcev
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'repeat(2, minmax(0, 1fr)) auto' }, gap: 1.5, alignItems: 'start' }}>
                <TextField
                  label="Začetno stanje elektrike"
                  type="number"
                  value={novUporabnik.zacetno_stanje_elektrike ?? ''}
                  onChange={(e) =>
                    setNovUporabnik({ ...novUporabnik, zacetno_stanje_elektrike: e.target.value })
                  }
                  size="small"
                  sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                  helperText={predlogZacetnihStanjZaNovUporabnik?.stanje_elektrike != null
                    ? `Predlog: ${predlogZacetnihStanjZaNovUporabnik.stanje_elektrike}`
                    : 'Vnesi ob primopredaji'}
                  slotProps={{
                    htmlInput: { min: 0, step: 1 }
                  }}
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
                  disabled={!sobaImaVodniStevecZaNovUporabnik}
                  helperText={!sobaImaVodniStevecZaNovUporabnik
                    ? 'Soba nima vodnega števca'
                    : (predlogZacetnihStanjZaNovUporabnik?.stanje_vode != null
                      ? `Predlog: ${predlogZacetnihStanjZaNovUporabnik.stanje_vode}`
                      : 'Vnesi ob primopredaji')}
                  slotProps={{
                    htmlInput: { min: 0, step: '0.001' }
                  }}
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
                        mt: 0.25,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '8px',
                        backgroundColor: 'background.paper',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>

          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={zapriDialog} disabled={shranjujem}>Prekliči</Button>
          <Button type="submit" variant="contained" disabled={shranjujem}>{shranjujem ? 'Shranjujem …' : 'Shrani uporabnika'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * ObvestilaSekcija – admin stran za pošiljanje obvestil najemnikom.
 *
 * Sestavljeno iz:
 * - Modala za izbiro sob in vnos sporočila
 * - Seznam posredovanih obvestil z možnostjo deaktivacije / brisanja
 */
import { useObvestila } from '../../kontekst/ObvestilaKontekst';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminObvestilaPoizvedba } from '../../storitve/adminObvestilaPoizvedba';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  TablePagination,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import {
  posljObvestila,
  deaktivirajObvestilo,
  aktivirajObvestilo,
  izbrisiObvestiloAdmin,
  izbrisiVsaObvestila,
} from '../../storitve/podatki';
import {
  ADMIN_TABELA_CARD_SX,
  ADMIN_DIALOG_CONTENT_SX,
  ADMIN_DIALOG_ACTIONS_SX,
  ADMIN_TABELA_CONTENT_SX,
  ADMIN_TABELA_STACK_SX,
  ADMIN_SEZNAM_PANEL_SX,
  ADMIN_SEZNAM_SCROLL_SX,
} from './adminSekcijaPostavitev';

const MAX_SPOROCILO = 2000;
const PRAZNA_OBVESTILA = [];

function ObvestiloKartica({ obvestilo, selected, onToggleSelect, onDeaktiviraj, onAktiviraj, onIzbrisi }) {
  const prebranihStevilo = obvestilo.prebrana_obvestila?.[0]?.count ?? obvestilo.prebrana_obvestila?.length ?? 0;
  const soba = obvestilo.sobe?.ime_sobe ?? '—';
  const datum = dayjs(obvestilo.ustvarjeno_ob).format('DD.MM.YYYY HH:mm');

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: obvestilo.aktivno ? 'divider' : '#e2e8f0',
        borderRadius: 1,
        p: 1.5,
        background: obvestilo.aktivno ? 'background.paper' : '#f8fafc',
        opacity: obvestilo.aktivno ? 1 : 0.7,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 0.5
        }}>
        <Checkbox
          size="small"
          checked={!!selected}
          onChange={onToggleSelect}
          disableRipple
          sx={{ p: 0.5, mt: 0.15, flexShrink: 0 }}
        />
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          {/* Glava kartice: soba + status + datum */}
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: "center",
              flexWrap: "wrap"
            }}>
            <Chip
              size="small"
              label={soba}
              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
              color="primary"
              variant="outlined"
            />
            {obvestilo.aktivno ? (
              <Chip
                size="small"
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: '10px !important' }} />}
                label="aktivno"
                color="success"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            ) : (
              <Chip
                size="small"
                label="neaktivno"
                sx={{ height: 20, fontSize: '0.68rem', color: '#94a3b8', borderColor: '#cbd5e1' }}
                variant="outlined"
              />
            )}
            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>{datum}</Typography>
            {prebranihStevilo > 0 && (
              <Chip
                size="small"
                icon={<CheckCircleOutlineIcon sx={{ fontSize: '11px !important', color: '#059669 !important' }} />}
                label={`prebral${prebranihStevilo === 1 ? '' : 'o'} ${prebranihStevilo}`}
                sx={{ height: 20, fontSize: '0.68rem', background: '#d1fae5', color: '#065f46', border: 'none' }}
              />
            )}
          </Stack>

          {/* Besedilo sporočila */}
          <Typography
            sx={{
              fontSize: '0.82rem',
              color: obvestilo.aktivno ? '#1e293b' : '#64748b',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {obvestilo.sporocilo}
          </Typography>
        </Stack>

        {/* Akcijski gumbi – fiksna širina prepreči premikanje ob hoverju */}
        <Stack
          direction="row"
          spacing={0}
          sx={{
            flexShrink: 0,
            width: { xs: 80, sm: 60 },
            justifyContent: 'flex-end',
            overflow: 'hidden'
          }}>
          {obvestilo.aktivno ? (
            <Tooltip title="Deaktiviraj (najemnik ne bo več videl)">
              <IconButton
                size="small"
                disableRipple
                onClick={() => onDeaktiviraj(obvestilo.id)}
                sx={{ width: { xs: 40, sm: 28 }, height: { xs: 40, sm: 28 }, overflow: 'hidden', '&:hover': { background: 'rgba(0,0,0,0.06)' } }}
              >
                <VisibilityOffOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>

          ) : (
            <Tooltip title="Aktiviraj (najemnik bo spet videl)">
              <IconButton
                size="small"
                color="success"
                disableRipple
                onClick={() => onAktiviraj(obvestilo.id)}
                sx={{ width: { xs: 40, sm: 28 }, height: { xs: 40, sm: 28 }, overflow: 'hidden', '&:hover': { background: 'rgba(5,150,105,0.08)' } }}
              >
                <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Izbriši obvestilo">
            <IconButton
              size="small"
              color="error"
              disableRipple
              onClick={() => onIzbrisi(obvestilo.id)}
              sx={{ width: { xs: 40, sm: 28 }, height: { xs: 40, sm: 28 }, overflow: 'hidden', '&:hover': { background: 'rgba(239,68,68,0.08)' } }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function ObvestilaSekcija({ podatkiSobe, ustvarilId }) {
  const { napaka: prikaziNapako, uspeh: prikaziUspeh } = useObvestila();
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const [sporocilo, setSporocilo] = useState('');
  const [izbraneSobe, setIzbraneSobe] = useState([]);
  const [posiljanje, setPosiljanje] = useState(false);
  const [briseVse, setBriseVse] = useState(false);

  const queryClient = useQueryClient();
  const poizvedba = adminObvestilaPoizvedba(ustvarilId);
  const { data: obvestila = PRAZNA_OBVESTILA, isPending, error, refetch: nalozi } = useQuery(poizvedba);
  const [stran, setStran] = useState(0);
  const [velikostStrani, setVelikostStrani] = useState(10);
  const seznamRef = useRef(null);

  function setObvestila(posodobi) {
    queryClient.setQueryData(poizvedba.queryKey, (prej) => posodobi(prej ?? []));
  }
  const [filterSoba, setFilterSoba] = useState('');
  const [filterAktivno, setFilterAktivno] = useState('vse');
  const [izbraniIds, setIzbraniIds] = useState([]);
  const [bulkDeaktiviranje, setBulkDeaktiviranje] = useState(false);
  const [bulkBrisanje, setBulkBrisanje] = useState(false);

  const aktivneSobe = (podatkiSobe ?? [])
    .filter((s) => s.aktivna !== false)
    .sort((a, b) => a.ime_sobe.localeCompare(b.ime_sobe, 'sl'));

  const filtrirano = useMemo(() => obvestila.filter((o) => {
    if (filterSoba && o.soba_id !== filterSoba) return false;
    if (filterAktivno === 'aktivno' && !o.aktivno) return false;
    if (filterAktivno === 'neaktivno' && o.aktivno) return false;
    return true;
  }), [obvestila, filterSoba, filterAktivno]);

  const zadnjaStran = Math.max(0, Math.ceil(filtrirano.length / velikostStrani) - 1);
  const trenutnaStran = Math.min(stran, zadnjaStran);
  const vidnaObvestila = filtrirano.slice(trenutnaStran * velikostStrani, (trenutnaStran + 1) * velikostStrani);

  useEffect(() => { setStran(0); }, [filterSoba, filterAktivno, velikostStrani]);
  useEffect(() => {
    if (stran > zadnjaStran) setStran(zadnjaStran);
  }, [stran, zadnjaStran]);
  useEffect(() => {
    seznamRef.current?.scrollTo({ top: 0 });
  }, [trenutnaStran, filterSoba, filterAktivno, velikostStrani]);

  const izbraniVFiltru = filtrirano.filter((o) => izbraniIds.includes(o.id));
  const vsiIzbrani = filtrirano.length > 0 && izbraniVFiltru.length === filtrirano.length;
  const nekajIzbrano = izbraniVFiltru.length > 0;

  function toggleIzbranId(id) {
    setIzbraniIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleVseIzbrane() {
    if (vsiIzbrani) {
      const filtriraniIds = new Set(filtrirano.map((o) => o.id));
      setIzbraniIds((prev) => prev.filter((id) => !filtriraniIds.has(id)));
    } else {
      const filtriraniIds = filtrirano.map((o) => o.id);
      setIzbraniIds((prev) => [...new Set([...prev, ...filtriraniIds])]);
    }
  }

  function zapriDialog() {
    if (!posiljanje) setDialogOdprt(false);
  }

  async function poslji(e) {
    e.preventDefault();
    if (posiljanje) return;

    if (!izbraneSobe.length) {
      prikaziNapako('Izberi vsaj eno sobo.');
      return;
    }
    if (!sporocilo.trim()) {
      prikaziNapako('Sporočilo ne sme biti prazno.');
      return;
    }

    setPosiljanje(true);
    try {
      await posljObvestila(
        izbraneSobe.map((s) => s.id),
        sporocilo,
        ustvarilId
      );
      prikaziUspeh(`Obvestilo poslano za ${izbraneSobe.length} sobo/sob.`);
      setSporocilo('');
      setIzbraneSobe([]);
      setDialogOdprt(false);
      await nalozi();
    } catch (err) {
      prikaziNapako(err.message || 'Napaka pri pošiljanju.');
    } finally {
      setPosiljanje(false);
    }
  }

  async function handleDeaktiviraj(id) {
    try {
      await queryClient.cancelQueries({ queryKey: poizvedba.queryKey });
      await deaktivirajObvestilo(id);
      setObvestila((prev) => prev.map((o) => (o.id === id ? { ...o, aktivno: false } : o)));
    } catch (err) {
      prikaziNapako(err.message);
    }
  }

  async function handleAktiviraj(id) {
    try {
      await queryClient.cancelQueries({ queryKey: poizvedba.queryKey });
      await aktivirajObvestilo(id);
      setObvestila((prev) => prev.map((o) => (o.id === id ? { ...o, aktivno: true } : o)));
    } catch (err) {
      prikaziNapako(err.message);
    }
  }

  async function handleIzbrisi(id) {
    try {
      await queryClient.cancelQueries({ queryKey: poizvedba.queryKey });
      await izbrisiObvestiloAdmin(id);
      setObvestila((prev) => prev.filter((o) => o.id !== id));
      setIzbraniIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      prikaziNapako(err.message);
    }
  }

  async function handleIzbrisiVse() {
    if (!obvestila.length) return;
    setBriseVse(true);
    try {
      await queryClient.cancelQueries({ queryKey: poizvedba.queryKey });
      await izbrisiVsaObvestila();
      setObvestila([]);
      setIzbraniIds([]);
    } catch (err) {
      prikaziNapako(err.message);
    } finally {
      setBriseVse(false);
    }
  }

  async function handleBulkDeaktiviraj() {
    const ids = izbraniVFiltru.filter((o) => o.aktivno).map((o) => o.id);
    if (!ids.length) return;
    setBulkDeaktiviranje(true);
    try {
      await queryClient.cancelQueries({ queryKey: poizvedba.queryKey });
      await Promise.all(ids.map((id) => deaktivirajObvestilo(id)));
      setObvestila((prev) => prev.map((o) => ids.includes(o.id) ? { ...o, aktivno: false } : o));
    } catch (err) {
      prikaziNapako(err.message);
    } finally {
      setBulkDeaktiviranje(false);
    }
  }

  async function handleBulkIzbrisi() {
    const ids = izbraniVFiltru.map((o) => o.id);
    if (!ids.length) return;
    setBulkBrisanje(true);
    try {
      await queryClient.cancelQueries({ queryKey: poizvedba.queryKey });
      await Promise.all(ids.map((id) => izbrisiObvestiloAdmin(id)));
      setObvestila((prev) => prev.filter((o) => !ids.includes(o.id)));
      setIzbraniIds((prev) => prev.filter((id) => !ids.includes(id)));
    } catch (err) {
      prikaziNapako(err.message);
    } finally {
      setBulkBrisanje(false);
    }
  }

  return (
    <>
      <Card className="kartica-jeklo" sx={ADMIN_TABELA_CARD_SX}>
        <CardContent sx={ADMIN_TABELA_CONTENT_SX}>
          <Stack spacing={1.5} sx={ADMIN_TABELA_STACK_SX}>

            {/* Glava sekcije */}
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap"
              }}>
              <CampaignOutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
              <Typography variant="h5">Obvestila najemnikom</Typography>
              <Tooltip title="Pošlji enkratno sporočilo izbrani sobi ali več sobam. Najemnik ga vidi ob prijavi in ga zapre. Ko zapre, ga ne vidi več.">
                <IconButton type="button" size="small" aria-label="Informacije o obvestilih najemnikom">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {obvestila.length > 0 && (
                <Chip size="small" label={`${obvestila.length} skupaj`} sx={{ fontSize: '0.7rem', height: 20 }} />
              )}
              <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} aria-label="Dodaj obvestilo" title="Dodaj obvestilo" sx={{ ml: 'auto' }} onClick={() => {
                setSporocilo('');
                setIzbraneSobe([]);
                setDialogOdprt(true);
              }}>
                Dodaj
              </Button>
            </Stack>

            <Box sx={{ ...ADMIN_SEZNAM_PANEL_SX, flex: '1 1 0%', width: '100%' }}>

              {/* Toolbar: select-all + filtri + bulk akcije + izbriši vsa */}
              {obvestila.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    mb: 1.25,
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}>
                  {/* Select all */}
                  <Tooltip title={vsiIzbrani ? 'Odznači vse' : 'Izberi vse'}>
                    <Checkbox
                      size="small"
                      checked={vsiIzbrani}
                      indeterminate={nekajIzbrano && !vsiIzbrani}
                      onChange={toggleVseIzbrane}
                      disableRipple
                      sx={{ p: 0.5 }}
                    />
                  </Tooltip>
                  {nekajIzbrano && (
                    <Chip size="small" color="primary" label={`${izbraniVFiltru.length} izbrano`} sx={{ fontSize: '0.7rem', height: 22 }} />
                  )}
                  {/* Soba filter */}
                  <Select size="small" displayEmpty value={filterSoba}
                    onChange={(e) => setFilterSoba(e.target.value)}
                    sx={{ fontSize: '0.78rem', minWidth: 130, height: 30 }}>
                    <MenuItem value="" sx={{ fontSize: '0.78rem' }}>Vse sobe</MenuItem>
                    {Array.from(new Map(obvestila.map((o) => [o.soba_id, o.sobe?.ime_sobe ?? o.soba_id])).entries())
                      .sort(([, a], [, b]) => a.localeCompare(b, 'sl'))
                      .map(([id, ime]) => (
                        <MenuItem key={id} value={id} sx={{ fontSize: '0.78rem' }}>{ime}</MenuItem>
                      ))}
                  </Select>
                  {/* Status filter */}
                  <Select size="small" value={filterAktivno}
                    onChange={(e) => setFilterAktivno(e.target.value)}
                    sx={{ fontSize: '0.78rem', minWidth: 110, height: 30 }}>
                    <MenuItem value="vse" sx={{ fontSize: '0.78rem' }}>Vse</MenuItem>
                    <MenuItem value="aktivno" sx={{ fontSize: '0.78rem' }}>Aktivno</MenuItem>
                    <MenuItem value="neaktivno" sx={{ fontSize: '0.78rem' }}>Neaktivno</MenuItem>
                  </Select>
                  {(filterSoba || filterAktivno !== 'vse') && (
                    <Button size="small" variant="text" sx={{ fontSize: '0.72rem', height: 30, px: 1 }}
                      onClick={() => { setFilterSoba(''); setFilterAktivno('vse'); }}>
                      Počisti
                    </Button>
                  )}
                  {/* Bulk + izbriši vsa — desna stran */}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    {nekajIzbrano && (
                      <>
                        <Button size="small" variant="outlined"
                          startIcon={bulkDeaktiviranje ? <CircularProgress size={12} color="inherit" /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 14 }} />}
                          onClick={handleBulkDeaktiviraj}
                          disabled={bulkDeaktiviranje || izbraniVFiltru.every((o) => !o.aktivno)}
                          sx={{ fontSize: '0.72rem', py: 0.25, px: 1, height: 26 }}>
                          Deaktiviraj ({izbraniVFiltru.length})
                        </Button>
                        <Button size="small" color="error" variant="outlined"
                          startIcon={bulkBrisanje ? <CircularProgress size={12} color="inherit" /> : <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                          onClick={handleBulkIzbrisi}
                          disabled={bulkBrisanje}
                          sx={{ fontSize: '0.72rem', py: 0.25, px: 1, height: 26 }}>
                          Izbriši ({izbraniVFiltru.length})
                        </Button>
                      </>
                    )}
                    <Button size="small" color="error" variant="outlined"
                      startIcon={briseVse ? <CircularProgress size={12} color="inherit" /> : <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />}
                      onClick={handleIzbrisiVse}
                      disabled={briseVse}
                      sx={{ fontSize: '0.72rem', py: 0.25, px: 1, height: 26, whiteSpace: 'nowrap' }}>
                      Izbriši vsa
                    </Button>
                  </Box>
                </Stack>
              )}

              {/* Scrollable seznam */}
              {error && (
                <Box role="alert" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="error">Obvestil ni bilo mogoče osvežiti.</Typography>
                  <Button size="small" onClick={() => nalozi()}>Poskusi znova</Button>
                </Box>
              )}
              {isPending ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pripravljam obvestila…</Typography>
              ) : obvestila.length === 0 && !error ? (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>Še ni posredovanih obvestil.</Typography>
                </Box>
              ) : filtrirano.length === 0 && !error ? (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>Noben zapis ne ustreza filtru.</Typography>
                </Box>
              ) : (
                <Box ref={seznamRef} sx={ADMIN_SEZNAM_SCROLL_SX}>
                  <Stack spacing={1}>
                    {vidnaObvestila.map((o) => (
                      <ObvestiloKartica
                        key={o.id}
                        obvestilo={o}
                        selected={izbraniIds.includes(o.id)}
                        onToggleSelect={() => toggleIzbranId(o.id)}
                        onDeaktiviraj={handleDeaktiviraj}
                        onAktiviraj={handleAktiviraj}
                        onIzbrisi={handleIzbrisi}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              {obvestila.length > 0 && (
                <TablePagination
                  component="div"
                  count={filtrirano.length}
                  page={trenutnaStran}
                  onPageChange={(_, novaStran) => setStran(novaStran)}
                  rowsPerPage={velikostStrani}
                  onRowsPerPageChange={(e) => setVelikostStrani(Number(e.target.value))}
                  rowsPerPageOptions={[10, 25, 50]}
                  labelRowsPerPage="Na stran:"
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} od ${count}`}
                  getItemAriaLabel={(tip) => tip === 'next' ? 'Naslednja stran' : 'Prejšnja stran'}
                  sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0,
                    '& .MuiTablePagination-toolbar': { px: { xs: 0, sm: 1 }, minHeight: 52 },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' },
                    '& .MuiTablePagination-spacer': { display: { xs: 'none', sm: 'block' } },
                    '& .MuiTablePagination-select': { mr: { xs: 0.5, sm: 3 } },
                    '& .MuiTablePagination-actions': { ml: { xs: 0.5, sm: 2 } }
                  }}
                />
              )}
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
        aria-labelledby="ObvestilaSekcija-naslov"
        slotProps={{ paper: {
          component: 'form', onSubmit: poslji,
          sx: { maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)', ...(jeMobilen && { borderRadius: 0 }) }
        } }}
      >
        <DialogTitle id="ObvestilaSekcija-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography id="ObvestilaSekcija-naslov" component="span" variant="h6">{'Dodaj obvestilo'}</Typography>
          <IconButton aria-label="Zapri obrazec" onClick={zapriDialog} disabled={posiljanje}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack component="fieldset" disabled={posiljanje} spacing={2} sx={{
            m: 0, p: 0, border: 0, minWidth: 0,
            '& .MuiInputBase-input': { fontSize: { xs: '1rem', sm: '0.875rem' } }
          }}>
            {/* Multi-select sob */}
            <Autocomplete
              multiple
              limitTags={3}
              disableCloseOnSelect
              options={aktivneSobe}
              value={izbraneSobe}
              onChange={(_, nova) => setIzbraneSobe(nova)}
              getOptionLabel={(o) => o.ime_sobe}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderOption={(props, option, { selected }) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      checked={selected}
                      sx={{ mr: 1, p: 0.5 }}
                    />
                    <Typography variant="body2">{option.ime_sobe}</Typography>
                  </li>
                );
              }}
              renderValue={(value, getItemProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getItemProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option.ime_sobe}
                      size="small"
                      {...tagProps}
                      sx={{ fontSize: '0.72rem', height: 22 }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sobe"
                  size="small"
                  placeholder={izbraneSobe.length ? '' : 'Izberi sobo...'}
                  slotProps={{
                    ...params.slotProps,
                    inputLabel: { sx: { fontSize: '0.82rem' } }
                  }}
                />
              )}
              sx={{ '& .MuiInputBase-root': { maxHeight: 180, overflowY: 'auto' } }}
            />

            {/* Hitre izbire sob */}
            <Stack direction="row" spacing={0.75} sx={{
              flexWrap: "wrap"
            }}>
              {['velika', 'stara'].map((tip) => {
                const sobe = aktivneSobe.filter((s) => s.tip_hise === tip);
                const label = tip === 'velika' ? 'Velika hiša' : 'Stara hiša';
                const vseIzbrane =
                  sobe.length > 0 &&
                  sobe.every((s) => izbraneSobe.some((i) => i.id === s.id));
                return (
                  <Button
                    key={tip}
                    size="small"
                    variant="outlined"
                    disabled={vseIzbrane || sobe.length === 0}
                    onClick={() => {
                      const brezTega = izbraneSobe.filter((s) => s.tip_hise !== tip);
                      setIzbraneSobe([...brezTega, ...sobe]);
                    }}
                    sx={{ fontSize: '0.74rem' }}
                  >
                    {label} ({sobe.length})
                  </Button>
                );
              })}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIzbraneSobe(aktivneSobe)}
                disabled={izbraneSobe.length === aktivneSobe.length}
                sx={{ fontSize: '0.74rem' }}
              >
                Vse sobe ({aktivneSobe.length})
              </Button>
            </Stack>

            {/* Sporočilo */}
            <TextField
              label="Sporočilo"
              multiline
              minRows={4}
              maxRows={10}
              value={sporocilo}
              onChange={(e) => setSporocilo(e.target.value.slice(0, MAX_SPOROCILO))}
              size="small"
              fullWidth
              helperText={`${sporocilo.length} / ${MAX_SPOROCILO}`}
              slotProps={{
                htmlInput: { sx: { fontSize: '0.82rem' } },
                inputLabel: { sx: { fontSize: '0.82rem' } }
              }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={zapriDialog} disabled={posiljanje}>Prekliči</Button>
          <Button type="submit" variant="contained" disabled={posiljanje} startIcon={<SendOutlinedIcon />}>
            {posiljanje ? 'Pošiljanje...' : 'Pošlji obvestilo'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

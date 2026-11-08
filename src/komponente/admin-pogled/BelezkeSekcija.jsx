/**
 * BelezkeSekcija – admin interni zapiski.
 * Urejanje v modalu, seznam kartic zapolni razpoložljivi prostor.
 */
import { useObvestila } from '../../kontekst/ObvestilaKontekst';
import { useCallback, useEffect, useState } from 'react';
import {
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
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import {
  pridobiAdminBelezke,
  dodajBelezko,
  izbrisiBelezko,
  izbrisiVseBelezke,
  izbrisiIzbraneBelezke
} from '../../storitve/podatki';
import {
  ADMIN_TABELA_CARD_SX,
  ADMIN_DIALOG_CONTENT_SX,
  ADMIN_DIALOG_ACTIONS_SX,
  ADMIN_TABELA_CONTENT_SX,
  ADMIN_TABELA_STACK_SX,
  ADMIN_SEZNAM_PANEL_SX,
  ADMIN_SEZNAM_SCROLL_SX
} from './adminSekcijaPostavitev';

const MAX_OPIS = 2000;
const PRAZNA = { id: '', naslov: '', opis: '' };

function BelezkaKartica({ belezka, selected, onToggleSelect, onUredi, onIzbrisi }) {
  const datum = dayjs(belezka.ustvarjeno_ob).format('DD.MM.YYYY HH:mm');

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        background: 'background.paper',
        overflow: 'hidden'
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
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              alignItems: "center",
              flexWrap: "wrap"
            }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', overflowWrap: 'anywhere' }}>
              {belezka.naslov}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>{datum}</Typography>
          </Stack>
          {belezka.opis && (
            <Typography
              sx={{
                fontSize: '0.82rem',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {belezka.opis}
            </Typography>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={0}
          sx={{
            flexShrink: 0,
            width: { xs: 80, sm: 60 },
            justifyContent: 'flex-end'
          }}>
          <Tooltip title="Uredi beležko">
            <IconButton
              size="small"
              disableRipple
              onClick={() => onUredi(belezka)}
              sx={{ width: { xs: 40, sm: 28 }, height: { xs: 40, sm: 28 }, '&:hover': { background: 'rgba(0,0,0,0.06)' } }}
            >
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Izbriši beležko">
            <IconButton
              size="small"
              color="error"
              disableRipple
              onClick={() => onIzbrisi(belezka.id)}
              sx={{ width: { xs: 40, sm: 28 }, height: { xs: 40, sm: 28 }, '&:hover': { background: 'rgba(239,68,68,0.08)' } }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

export default function BelezkeSekcija({ ustvarilId }) {
  const { napaka: prikaziNapako, uspeh: prikaziUspeh } = useObvestila();
  const [dialogOdprt, setDialogOdprt] = useState(false);
  const tema = useTheme();
  const jeMobilen = useMediaQuery(tema.breakpoints.down('sm'));
  const [belezke, setBelezke] = useState([]);
  const [nalaganje, setNalaganje] = useState(true);
  const [shranjujem, setShranjujem] = useState(false);
  const [briseVse, setBriseVse] = useState(false);
  const [bulkBrisanje, setBulkBrisanje] = useState(false);
  const [izbraniIds, setIzbraniIds] = useState([]);
  const [forma, setForma] = useState(PRAZNA);

  const vsiIzbrani = belezke.length > 0 && izbraniIds.length === belezke.length;
  const nekajIzbrano = izbraniIds.length > 0;

  const nalozi = useCallback(async () => {
    setNalaganje(true);
    try {
      const data = await pridobiAdminBelezke();
      setBelezke(data);
    } catch (err) {
      prikaziNapako(err.message || 'Napaka pri nalaganju beležk.');
    } finally {
      setNalaganje(false);
    }
  }, []);

  useEffect(() => { nalozi(); }, [nalozi]);

  function toggleIzbranId(id) {
    setIzbraniIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleVseIzbrane() {
    if (vsiIzbrani) {
      setIzbraniIds([]);
    } else {
      setIzbraniIds(belezke.map((b) => b.id));
    }
  }

  function uredi(belezka) {
    setForma({ id: belezka.id, naslov: belezka.naslov, opis: belezka.opis ?? '' });
    setDialogOdprt(true);
  }

  function zapriDialog() {
    if (!shranjujem) setDialogOdprt(false);
  }

  async function shrani(e) {
    e.preventDefault();
    if (shranjujem) return;

    if (!forma.naslov.trim()) {
      prikaziNapako('Naslov je obvezen.');
      return;
    }

    setShranjujem(true);
    try {
      const shranjena = await dodajBelezko(
        { id: forma.id || undefined, naslov: forma.naslov.trim(), opis: forma.opis.trim() || null },
        ustvarilId
      );

      if (forma.id) {
        setBelezke((prev) => prev.map((b) => b.id === forma.id ? shranjena : b));
        prikaziUspeh('Beležka je posodobljena.');
      } else {
        setBelezke((prev) => [shranjena, ...prev]);
        prikaziUspeh('Beležka je dodana.');
      }
      setForma(PRAZNA);
      setDialogOdprt(false);
    } catch (err) {
      prikaziNapako(err.message || 'Napaka pri shranjevanju.');
    } finally {
      setShranjujem(false);
    }
  }

  async function handleIzbrisi(id) {
    try {
      await izbrisiBelezko(id);
      setBelezke((prev) => prev.filter((b) => b.id !== id));
      setIzbraniIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      prikaziNapako(err.message);
    }
  }

  async function handleIzbrisiVse() {
    if (!belezke.length) return;
    setBriseVse(true);
    try {
      await izbrisiVseBelezke();
      setBelezke([]);
      setIzbraniIds([]);
    } catch (err) {
      prikaziNapako(err.message);
    } finally {
      setBriseVse(false);
    }
  }

  async function handleBulkIzbrisi() {
    if (!izbraniIds.length) return;
    setBulkBrisanje(true);
    try {
      await izbrisiIzbraneBelezke(izbraniIds);
      setBelezke((prev) => prev.filter((b) => !izbraniIds.includes(b.id)));
      setIzbraniIds([]);
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

            {/* Glava */}
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap"
              }}>
              <StickyNote2OutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
              <Typography variant="h5">Beležke</Typography>
              <Tooltip title="Interni zapiski admina. Vidni samo tebi.">
                <IconButton type="button" size="small" aria-label="Informacije o beležkah">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} aria-label="Dodaj beležko" title="Dodaj beležko" sx={{ ml: 'auto' }} onClick={() => {
                setForma(PRAZNA);
                setDialogOdprt(true);
              }}>
                Dodaj
              </Button>
            </Stack>

            <Box sx={{ ...ADMIN_SEZNAM_PANEL_SX, flex: '1 1 0%', width: '100%' }}>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  mb: 0.75
                }}>
                <Typography variant="subtitle2" sx={{
                  color: "text.secondary"
                }}>Beležke</Typography>
                {belezke.length > 0 && (
                  <Chip size="small" label={`${belezke.length} skupaj`} sx={{ fontSize: '0.7rem', height: 20 }} />
                )}
              </Stack>

              {belezke.length > 0 && !nalaganje && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    mb: 1.25,
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}>
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
                    <Chip size="small" color="primary" label={`${izbraniIds.length} izbrano`} sx={{ fontSize: '0.7rem', height: 22 }} />
                  )}

                  <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    {nekajIzbrano && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={bulkBrisanje ? <CircularProgress size={12} color="inherit" /> : <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={handleBulkIzbrisi}
                        disabled={bulkBrisanje}
                        sx={{ fontSize: '0.72rem', py: 0.25, px: 1, height: 26 }}
                      >
                        Izbriši ({izbraniIds.length})
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={briseVse ? <CircularProgress size={12} color="inherit" /> : <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />}
                      onClick={handleIzbrisiVse}
                      disabled={briseVse}
                      sx={{ fontSize: '0.72rem', py: 0.25, px: 1, height: 26, whiteSpace: 'nowrap' }}
                    >
                      Izbriši vse
                    </Button>
                  </Box>
                </Stack>
              )}

              {nalaganje ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : belezke.length === 0 ? (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: "text.secondary"
                  }}>Še ni beležk.</Typography>
                </Box>
              ) : (
                <Box sx={ADMIN_SEZNAM_SCROLL_SX}>
                  <Stack spacing={1}>
                    {belezke.map((b) => (
                      <BelezkaKartica
                        key={b.id}
                        belezka={b}
                        selected={izbraniIds.includes(b.id)}
                        onToggleSelect={() => toggleIzbranId(b.id)}
                        onUredi={uredi}
                        onIzbrisi={handleIzbrisi}
                      />
                    ))}
                  </Stack>
                </Box>
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
        aria-labelledby="BelezkeSekcija-naslov"
        slotProps={{ paper: {
          component: 'form', onSubmit: shrani,
          sx: { maxHeight: jeMobilen ? '100dvh' : 'calc(100dvh - 48px)', ...(jeMobilen && { borderRadius: 0 }) }
        } }}
      >
        <DialogTitle id="BelezkeSekcija-glava" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography id="BelezkeSekcija-naslov" component="span" variant="h6">{forma.id ? 'Uredi beležko' : 'Dodaj beležko'}</Typography>
          <IconButton aria-label="Zapri obrazec" onClick={zapriDialog} disabled={shranjujem}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ADMIN_DIALOG_CONTENT_SX}>
          <Stack component="fieldset" disabled={shranjujem} spacing={2} sx={{
            m: 0, p: 0, border: 0, minWidth: 0,
            '& .MuiInputBase-input': { fontSize: { xs: '1rem', sm: '0.875rem' } }
          }}>
            <TextField
              label="Naslov"
              autoFocus
              value={forma.naslov}
              onChange={(e) => setForma((p) => ({ ...p, naslov: e.target.value }))}
              size="small"
              fullWidth
              required
              slotProps={{
                htmlInput: { sx: { fontSize: '0.82rem' }, maxLength: 300 },
                inputLabel: { sx: { fontSize: '0.82rem' } }
              }} />

            <TextField
              label="Opis / Zapisek (neobvezno)"
              multiline
              minRows={4}
              maxRows={12}
              value={forma.opis}
              onChange={(e) => setForma((p) => ({ ...p, opis: e.target.value.slice(0, MAX_OPIS) }))}
              size="small"
              fullWidth
              helperText={`${forma.opis.length} / ${MAX_OPIS}`}
              slotProps={{
                htmlInput: { sx: { fontSize: '0.82rem' } },
                inputLabel: { sx: { fontSize: '0.82rem' } }
              }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={ADMIN_DIALOG_ACTIONS_SX}>
          <Button onClick={zapriDialog} disabled={shranjujem}>Prekliči</Button>
          <Button type="submit" variant="contained" disabled={shranjujem} startIcon={!shranjujem && !forma.id ? <AddOutlinedIcon /> : undefined}>
            {shranjujem ? 'Shranjujem...' : forma.id ? 'Shrani spremembe' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * BelezkeSekcija – admin interni zapiski.
 * Forma levo, kartice desno – enaka postavitev kot ObvestilaSekcija.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import dayjs from 'dayjs';
import {
  pridobiAdminBelezke,
  dodajBelezko,
  izbrisiBelezko,
  izbrisiVseBelezke,
  izbrisiIzbraneBelezke
} from '../../storitve/podatki';
import {
  ADMIN_SEKCIJA_CARD_SX,
  ADMIN_SEKCIJA_CONTENT_SX,
  ADMIN_SEKCIJA_STACK_SX
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={0.5}>
        <Checkbox
          size="small"
          checked={!!selected}
          onChange={onToggleSelect}
          disableRipple
          sx={{ p: 0.5, mt: 0.15, flexShrink: 0 }}
        />
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
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
          flexShrink={0}
          sx={{ width: 60, justifyContent: 'flex-end' }}
        >
          <Tooltip title="Uredi beležko">
            <IconButton
              size="small"
              disableRipple
              onClick={() => onUredi(belezka)}
              sx={{ width: 28, height: 28, '&:hover': { background: 'rgba(0,0,0,0.06)' } }}
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
              sx={{ width: 28, height: 28, '&:hover': { background: 'rgba(239,68,68,0.08)' } }}
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
  const [belezke, setBelezke] = useState([]);
  const [nalaganje, setNalaganje] = useState(true);
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState('');
  const [uspeh, setUspeh] = useState('');
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
      setNapaka(err.message || 'Napaka pri nalaganju beležk.');
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
    setNapaka('');
    setUspeh('');
    setForma({ id: belezka.id, naslov: belezka.naslov, opis: belezka.opis ?? '' });
  }

  function odklici() {
    setForma(PRAZNA);
    setNapaka('');
    setUspeh('');
  }

  async function shrani(e) {
    e.preventDefault();
    setNapaka('');
    setUspeh('');

    if (!forma.naslov.trim()) {
      setNapaka('Naslov je obvezen.');
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
        setUspeh('Beležka je posodobljena.');
      } else {
        setBelezke((prev) => [shranjena, ...prev]);
        setUspeh('Beležka je dodana.');
      }
      setForma(PRAZNA);
    } catch (err) {
      setNapaka(err.message || 'Napaka pri shranjevanju.');
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
      setNapaka(err.message);
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
      setNapaka(err.message);
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
      setNapaka(err.message);
    } finally {
      setBulkBrisanje(false);
    }
  }

  return (
    <Card className="kartica-jeklo" sx={{ ...ADMIN_SEKCIJA_CARD_SX, overflowX: 'hidden' }}>
      <CardContent sx={ADMIN_SEKCIJA_CONTENT_SX}>
        <Stack spacing={1.5} sx={ADMIN_SEKCIJA_STACK_SX}>

          {/* Glava */}
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
            <StickyNote2OutlinedIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
            <Box>
              <Typography variant="h5">Beležke</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Interni zapiski admina. Vidni samo tebi.
              </Typography>
            </Box>
          </Stack>

          {napaka && <Alert severity="error" onClose={() => setNapaka('')}>{napaka}</Alert>}
          {uspeh && <Alert severity="success" onClose={() => setUspeh('')}>{uspeh}</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">

            {/* ── Forma ── */}
            <Box
              component="form"
              onSubmit={shrani}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                background: 'background.paper',
                width: { xs: '100%', md: 440 },
                flexShrink: 0
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  {forma.id ? 'Uredi beležko' : 'Nova beležka'}
                </Typography>

                <TextField
                  label="Naslov"
                  value={forma.naslov}
                  onChange={(e) => setForma((p) => ({ ...p, naslov: e.target.value }))}
                  size="small"
                  fullWidth
                  required
                  InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
                  inputProps={{ sx: { fontSize: '0.82rem' }, maxLength: 300 }}
                />

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
                  InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
                  inputProps={{ sx: { fontSize: '0.82rem' } }}
                />

                <Stack direction="row" spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    className="gumb-jeklo"
                    disabled={shranjujem}
                    startIcon={shranjujem ? <CircularProgress size={14} color="inherit" /> : null}
                  >
                    {shranjujem ? 'Shranjujem...' : forma.id ? 'Shrani spremembe' : 'Dodaj beležko'}
                  </Button>
                  {forma.id && (
                    <Button variant="outlined" onClick={odklici} disabled={shranjujem}>
                      Prekliči
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>

            {/* ── Seznam beležk ── */}
            <Box sx={{ flex: 1, minWidth: 0, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

              <Stack direction="row" spacing={0.75} alignItems="center" mb={0.75}>
                <Typography variant="subtitle2" color="text.secondary">Beležke</Typography>
                {belezke.length > 0 && (
                  <Chip size="small" label={`${belezke.length} skupaj`} sx={{ fontSize: '0.7rem', height: 20 }} />
                )}
              </Stack>

              {belezke.length > 0 && !nalaganje && (
                <Stack direction="row" spacing={0.75} mb={1.25} flexWrap="wrap" alignItems="center">
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
                  <Typography color="text.secondary" variant="body2">Še ni beležk.</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: 'calc(100dvh - 280px)', minHeight: 200, pr: 0.5 }}>
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
        </Stack>
      </CardContent>
    </Card>
  );
}

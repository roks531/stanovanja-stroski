import { useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, Chip, IconButton, InputAdornment,
  MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Tooltip, Typography
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { pripraviPregledOddajeZaMesece } from '../../storitve/pregledOddaje';

const STATUSI = {
  manjka: { naziv: 'Ni oddano', barva: 'warning', Ikona: PendingActionsOutlinedIcon },
  oddano: { naziv: 'Oddano', barva: 'success', Ikona: CheckCircleOutlineIcon },
  ni_potrebno: { naziv: 'Ni potrebno', barva: 'default', Ikona: MeetingRoomOutlinedIcon }
};

const FORMAT_DATUMA_ODDAJE = new Intl.DateTimeFormat('sl-SI', {
  timeZone: 'Europe/Ljubljana',
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

function opisOddaje(datumOddaje) {
  const datum = datumOddaje ? new Date(datumOddaje) : null;
  return datum && !Number.isNaN(datum.getTime())
    ? `Oddano: ${FORMAT_DATUMA_ODDAJE.format(datum)}`
    : 'Čas oddaje ni na voljo.';
}

function trenutnoObdobje() {
  const deli = new Intl.DateTimeFormat('sl-SI', { timeZone: 'Europe/Ljubljana', year: 'numeric', month: 'numeric' }).formatToParts(new Date());
  return { mesec: Number(deli.find((d) => d.type === 'month').value), leto: Number(deli.find((d) => d.type === 'year').value) };
}

export default function PregledOddaje({ sobe, uporabniki, placila, imenaMesecov, letaObracunov, osvezi, odpriObracune }) {
  const trenutno = trenutnoObdobje();
  const [obdobje, setObdobje] = useState(() => ({ leto: trenutno.leto, meseci: [trenutno.mesec] }));
  const [sobaId, setSobaId] = useState('');
  const [iskanje, setIskanje] = useState('');
  const [hisa, setHisa] = useState('');
  const [status, setStatus] = useState('vsi');
  const [stran, setStran] = useState(0);
  const [steviloVrstic, setSteviloVrstic] = useState(50);
  const [osvezujem, setOsvezujem] = useState(false);
  const vrstice = useMemo(() => pripraviPregledOddajeZaMesece({ sobe, uporabniki, placila, ...obdobje }), [sobe, uporabniki, placila, obdobje]);
  const hisneVrstice = vrstice.filter((v) => (!hisa || v.tip_hise === hisa) && (!sobaId || v.soba_id === sobaId));
  const stevila = Object.fromEntries(['manjka', 'oddano', 'ni_potrebno'].map((s) => [s, hisneVrstice.filter((v) => v.status === s).length]));
  const niz = iskanje.trim().toLocaleLowerCase('sl');
  const filtrirane = hisneVrstice.filter((v) => (status === 'vsi' || v.status === status) && `${v.soba} ${v.najemnik}`.toLocaleLowerCase('sl').includes(niz));
  const prikazanaStran = Math.min(stran, Math.max(0, Math.ceil(filtrirane.length / steviloVrstic) - 1));
  const leta = [...new Set([trenutno.leto, trenutno.leto - 1, obdobje.leto, ...letaObracunov])].sort((a, b) => b - a);
  const tipi = [...new Set(sobe.map((s) => s.tip_hise).filter(Boolean))].sort();
  const nazivObdobja = `${obdobje.meseci.map((mesec) => imenaMesecov[mesec - 1]).join(', ')} ${obdobje.leto}`;
  const enMesec = obdobje.meseci.length === 1;
  const jeTrenutno = enMesec && obdobje.meseci[0] === trenutno.mesec && obdobje.leto === trenutno.leto;
  const zadnjiMesec = obdobje.leto === trenutno.leto ? trenutno.mesec : 12;
  const spremeniFilter = (nastavi, vrednost) => { nastavi(vrednost); setStran(0); };
  function premakniMesec(premik) {
    if (!enMesec) return;
    const datum = new Date(obdobje.leto, obdobje.meseci[0] - 1 + premik, 1);
    spremeniFilter(setObdobje, { leto: datum.getFullYear(), meseci: [datum.getMonth() + 1] });
  }

  return (
    <Stack spacing={1.25} sx={{
      flex: 1, minHeight: 0, minWidth: 0, '& > *': { flexShrink: 0 },
      '& .MuiInputBase-root': { fontSize: '0.8rem', height: 34 },
      '& .MuiInputLabel-root': { fontSize: '0.8rem' },
      '& .MuiButton-sizeSmall': { py: 0.5, px: 1, minHeight: 30 }
    }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          flexShrink: 0
        }}>
        <Stack
          direction="row"
          role="group"
          aria-label="Filtriraj po statusu oddaje"
          sx={{
            gap: 0.5,
            flexWrap: "wrap",
            mr: 'auto'
          }}>
          {[{ key: 'vsi', label: 'Vsi', count: hisneVrstice.length }, ...Object.entries(STATUSI).map(([key, s]) => ({ key, label: s.naziv, count: stevila[key] }))].map(({ key, label, count }) => (
            <Button key={key} size="small" variant={status === key ? 'contained' : 'text'} aria-pressed={status === key} onClick={() => spremeniFilter(setStatus, key)}>{label} ({count})</Button>
          ))}
        </Stack>
        <Stack
          direction="row"
          sx={{
            gap: 0.25,
            alignItems: "center"
          }}>
          <Tooltip title={enMesec ? 'Prejšnji mesec' : 'Za premik izberi en mesec'}>
            <span><IconButton size="small" aria-label="Prejšnji mesec" onClick={() => premakniMesec(-1)} disabled={!enMesec || (obdobje.leto <= Math.min(...leta) && obdobje.meseci[0] === 1)}><ChevronLeftIcon fontSize="small" /></IconButton></span>
          </Tooltip>
          <TextField
            select size="small" label="Meseci" value={obdobje.meseci} sx={{ width: { xs: 135, sm: 155 } }}
            onChange={(e) => {
              const vrednost = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
              const meseci = vrednost.includes('vsi')
                ? Array.from({ length: zadnjiMesec }, (_, i) => i + 1)
                : vrednost.map(Number).filter((m) => m >= 1 && m <= zadnjiMesec).sort((a, b) => a - b);
              if (meseci.length) spremeniFilter(setObdobje, { ...obdobje, meseci });
            }}
            slotProps={{ select: {
              multiple: true,
              renderValue: (izbrani) => izbrani.length === 1 ? imenaMesecov[izbrani[0] - 1] : `${izbrani.length} izbranih`,
              MenuProps: { slotProps: { paper: { sx: { maxHeight: 420 } } } }
            } }}
          >
            <MenuItem value="vsi">Vsi dosedanji meseci</MenuItem>
            {imenaMesecov.map((ime, i) => (
              <MenuItem key={ime} value={i + 1} disabled={i + 1 > zadnjiMesec || (enMesec && obdobje.meseci[0] === i + 1)}>
                <Checkbox size="small" checked={obdobje.meseci.includes(i + 1)} disableRipple sx={{ p: 0.5, mr: 0.5 }} />{ime}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Leto" value={obdobje.leto} sx={{ width: 82 }} onChange={(e) => {
            const leto = Number(e.target.value);
            const meseci = obdobje.meseci.filter((m) => leto < trenutno.leto || m <= trenutno.mesec);
            spremeniFilter(setObdobje, { leto, meseci: meseci.length ? meseci : [trenutno.mesec] });
          }}>
            {leta.filter((leto) => leto <= trenutno.leto).map((leto) => <MenuItem key={leto} value={leto}>{leto}</MenuItem>)}
          </TextField>
          <Tooltip title={enMesec ? 'Naslednji mesec' : 'Za premik izberi en mesec'}>
            <span><IconButton size="small" aria-label="Naslednji mesec" disabled={!enMesec || jeTrenutno} onClick={() => premakniMesec(1)}><ChevronRightIcon fontSize="small" /></IconButton></span>
          </Tooltip>
        </Stack>
        {!jeTrenutno && <Button size="small" onClick={() => spremeniFilter(setObdobje, { leto: trenutno.leto, meseci: [trenutno.mesec] })}>Tekoči mesec</Button>}
        <TextField select size="small" label="Soba" value={sobaId} sx={{ width: 125 }} onChange={(e) => spremeniFilter(setSobaId, e.target.value)}>
          <MenuItem value="">Vse sobe</MenuItem>
          {sobe.map((soba) => <MenuItem key={soba.id} value={soba.id}>{soba.ime_sobe}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Hiša" value={hisa} sx={{ width: 125 }} onChange={(e) => spremeniFilter(setHisa, e.target.value)}>
          <MenuItem value="">Vse hiše</MenuItem>
          {tipi.map((tip) => <MenuItem key={tip} value={tip}>{tip.charAt(0).toUpperCase() + tip.slice(1)} hiša</MenuItem>)}
        </TextField>
        <TextField size="small" label="Poišči sobo ali najemnika" value={iskanje} onChange={(e) => spremeniFilter(setIskanje, e.target.value)} sx={{ flex: '1 1 190px', maxWidth: { md: 230 }, minWidth: 0 }} slotProps={{
          input: { startAdornment: <InputAdornment position="start"><SearchOutlinedIcon fontSize="small" /></InputAdornment> }
        }} />
        <Tooltip title="Počisti filtre" arrow>
          <IconButton
            size="small"
            aria-label="Počisti filtre"
            sx={{ width: 36, height: 36, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            onClick={() => {
              const zdaj = trenutnoObdobje();
              setObdobje({ leto: zdaj.leto, meseci: [zdaj.mesec] });
              setSobaId('');
              setHisa('');
              setIskanje('');
              setStatus('vsi');
              setStran(0);
            }}
          >
            <FilterAltOffOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={osvezujem ? 'Osvežujem …' : 'Osveži podatke'}>
          <span><IconButton size="small" aria-label="Osveži podatke" disabled={osvezujem} onClick={async () => {
            setOsvezujem(true);
            try { await osvezi(); } finally { setOsvezujem(false); }
          }}><RefreshIcon fontSize="small" /></IconButton></span>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', scrollbarGutter: 'stable' }}>
          <Table stickyHeader size="small" aria-label={`Oddaja obračunov za ${nazivObdobja}`} sx={{
            tableLayout: 'fixed', width: '100%', minWidth: 1120,
            '& .MuiTableCell-root': { py: 0.5, px: 1.5, height: 36, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
            '& .MuiTableHead-root': { bgcolor: 'action.hover' },
            '& .MuiChip-root': { height: 22 },
            '& .MuiButton-root': { minHeight: 24, py: 0 }
          }}>
            <colgroup>
              <col style={{ width: 80 }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col />
              <col style={{ width: 140 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <TableHead><TableRow><TableCell>Soba</TableCell><TableCell>Najemnik</TableCell><TableCell>Hiša</TableCell><TableCell>Obdobje</TableCell><TableCell>Status oddaje</TableCell><TableCell align="center">Status obračuna</TableCell><TableCell align="center">Obračun</TableCell></TableRow></TableHead>
            <TableBody>
              {filtrirane.slice(prikazanaStran * steviloVrstic, (prikazanaStran + 1) * steviloVrstic).map((v) => {
                const { naziv, barva, Ikona } = STATUSI[v.status];
                return (
                  <TableRow key={v.id} hover sx={{ bgcolor: v.status === 'manjka' ? 'rgba(245, 158, 11, 0.045)' : undefined }}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>{v.soba}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{v.najemnik}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{v.tip_hise ? `${v.tip_hise} hiša` : '—'}</TableCell>
                    <TableCell>{imenaMesecov[v.mesec - 1]} {v.leto}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={v.status === 'oddano' ? opisOddaje(v.datum_oddaje) : ''} describeChild arrow>
                          <Chip size="small" variant="outlined" icon={<Ikona />} label={naziv} color={barva} tabIndex={v.status === 'oddano' ? 0 : undefined} sx={{ flexShrink: 0 }} />
                        </Tooltip>
                        {v.status === 'ni_potrebno' && <Tooltip title={v.razlog} describeChild>
                          <Typography component="span" variant="caption" noWrap sx={{ color: 'text.secondary', minWidth: 0 }}>{v.razlog}</Typography>
                        </Tooltip>}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{v.placano == null ? '—' : <Chip size="small" variant="outlined" label={v.placano ? 'Potrjeno' : 'Odprto'} color={v.placano ? 'success' : 'warning'} />}</TableCell>
                    <TableCell align="center">{v.status === 'oddano' ? <Tooltip title="Poglej obračun"><IconButton size="small" color="primary" aria-label={`Poglej obračun za sobo ${v.soba}`} onClick={() => odpriObracune(v, { mesec: v.mesec, leto: v.leto })}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip> : '—'}</TableCell>
                  </TableRow>
                );
              })}
              {filtrirane.length === 0 && <TableRow><TableCell colSpan={7} sx={{ py: 2, textAlign: 'center' }}><Typography variant="body2" sx={{
                color: "text.secondary"
              }}>Ni zadetkov. Poskusi drug status, hišo ali iskalni niz.</Typography><Button sx={{ mt: 0.5 }} size="small" onClick={() => { setIskanje(''); setStatus('vsi'); setHisa(''); setSobaId(''); setStran(0); }}>Počisti filtre</Button></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
          <TablePagination component="div" count={filtrirane.length} page={prikazanaStran} onPageChange={(_, nova) => setStran(nova)} rowsPerPage={steviloVrstic} rowsPerPageOptions={[25, 50, 100]} onRowsPerPageChange={(e) => spremeniFilter(setSteviloVrstic, Number(e.target.value))} labelRowsPerPage="Vrstic na stran:" labelDisplayedRows={({ from, to, count }) => `${from}–${to} od ${count}`} getItemAriaLabel={(type) => type === 'previous' ? 'Prejšnja stran' : 'Naslednja stran'} sx={{ flexShrink: 0, minHeight: 52, bgcolor: '#f8fafc', borderTop: 1, borderColor: 'divider', '& .MuiTablePagination-toolbar': { minHeight: 52 }, '& .MuiTablePagination-displayedRows': { my: 0 } }} />
        </Paper>
      </Box>
    </Stack>
  );
}

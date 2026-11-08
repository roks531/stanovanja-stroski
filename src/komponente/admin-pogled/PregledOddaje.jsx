import { useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, Chip, IconButton, InputAdornment,
  MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography
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
import { pripraviLetniPregledOddaj, pripraviPregledOddajeZaMesece } from '../../storitve/pregledOddaje';
import DataGrid from './AdminDataGrid';
import './pregledOddaje.css';
import { ADMIN_DATAGRID_FLEKS_SX, ADMIN_TABELA_FLEKS_SX } from './adminSekcijaPostavitev';

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

function BrezOddaj({ onPocisti }) {
  return <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center', px: 2, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">Ni zadetkov. Poskusi drug status, hišo ali iskalni niz.</Typography>
    <Button size="small" onClick={onPocisti} sx={{ mt: 0.5 }}>Počisti filtre</Button>
  </Stack>;
}

const PREGLED_OVERLAY_SLOTS = { noRowsOverlay: BrezOddaj };

export default function PregledOddaje({ sobe, uporabniki, placila, imenaMesecov, letaObracunov, lokalizacijaMreze, osvezi, odpriObracune }) {
  const trenutno = trenutnoObdobje();
  const [pogled, setPogled] = useState('letni');
  const letniPogled = pogled === 'letni';
  const [obdobje, setObdobje] = useState(() => ({ leto: trenutno.leto, meseci: [trenutno.mesec] }));
  const [sobaId, setSobaId] = useState('');
  const [iskanje, setIskanje] = useState('');
  const [hisa, setHisa] = useState('');
  const [status, setStatus] = useState('vsi');
  const [stran, setStran] = useState(0);
  const [steviloVrstic, setSteviloVrstic] = useState(50);
  const [osvezujem, setOsvezujem] = useState(false);
  const seznamVrstice = useMemo(() => pripraviPregledOddajeZaMesece({ sobe, uporabniki, placila, ...obdobje }), [sobe, uporabniki, placila, obdobje]);
  const letneVrstice = useMemo(() => pripraviLetniPregledOddaj({ sobe, uporabniki, placila, leto: obdobje.leto, trenutno }),
    [sobe, uporabniki, placila, obdobje.leto, trenutno.mesec, trenutno.leto]);
  const vrstice = letniPogled ? letneVrstice : seznamVrstice;
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
  const stolpci = useMemo(() => [
    { field: 'soba', headerName: 'Soba', width: 80, flex: 0,
      renderCell: ({ value }) => <strong>{value}</strong> },
    { field: 'najemnik', headerName: 'Najemnik', width: 200 },
    { field: 'tip_hise', headerName: 'Hiša', width: 125,
      renderCell: ({ value }) => <span style={{ textTransform: 'capitalize' }}>{value ? `${value} hiša` : '—'}</span> },
    { field: 'obdobje', headerName: 'Obdobje', width: 160, type: 'number', align: 'left', headerAlign: 'left',
      valueGetter: (_, row) => Number(row.leto) * 12 + Number(row.mesec),
      renderCell: ({ row }) => `${imenaMesecov[row.mesec - 1]} ${row.leto}` },
    { field: 'status', headerName: 'Status oddaje', width: 300,
      valueFormatter: (value) => STATUSI[value]?.naziv ?? value,
      renderCell: ({ row }) => {
        const { naziv, barva, Ikona } = STATUSI[row.status];
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Tooltip title={row.status === 'oddano' ? opisOddaje(row.datum_oddaje) : ''} describeChild arrow>
            <Chip size="small" variant="outlined" icon={<Ikona />} label={naziv} color={barva} tabIndex={row.status === 'oddano' ? 0 : undefined} sx={{ flexShrink: 0 }} />
          </Tooltip>
          {row.status === 'ni_potrebno' && <Tooltip title={row.razlog} describeChild>
            <Typography component="span" variant="caption" noWrap sx={{ color: 'text.secondary', minWidth: 0 }}>{row.razlog}</Typography>
          </Tooltip>}
        </Box>;
      } },
    { field: 'placano', headerName: 'Status obračuna', width: 155, align: 'center', headerAlign: 'center',
      renderCell: ({ value }) => value == null ? '—' : <Chip size="small" variant="outlined" label={value ? 'Potrjeno' : 'Odprto'} color={value ? 'success' : 'warning'} /> },
    { field: 'akcije_pregled_oddaj', headerName: 'Obračun', width: 95, flex: 0,
      sortable: false, filterable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => row.status === 'oddano' ? <Tooltip title="Poglej obračun">
        <IconButton size="small" color="primary" aria-label={`Poglej obračun za sobo ${row.soba}`} onClick={(e) => {
          e.stopPropagation();
          odpriObracune(row, { mesec: row.mesec, leto: row.leto });
        }}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
      </Tooltip> : '—' }
  ], [imenaMesecov, odpriObracune]);

  const letniStolpci = useMemo(() => [
    { field: 'soba', headerName: 'Soba', width: 80, flex: 0,
      renderCell: ({ value }) => <strong>{value}</strong> },
    { field: 'najemnik', headerName: 'Najemnik', width: 140, flex: 0 },
    ...Array.from({ length: 12 }, (_, i) => {
      const mesec = i + 1;
      const kratica = imenaMesecov[i].slice(0, 3);
      return {
        field: `mesec_${mesec}`, headerName: kratica, width: 56,
        align: 'center', headerAlign: 'center', sortable: false, filterable: false, disableColumnMenu: true,
        renderHeader: () => <Tooltip title={imenaMesecov[i]}><span>{kratica}</span></Tooltip>,
        renderCell: ({ row }) => {
          const oddaja = row.meseci[mesec];
          const naziv = `${row.soba}, ${row.najemnik}, ${imenaMesecov[i]} ${obdobje.leto}`;
          if (oddaja.status === 'oddano') {
            return <button type="button" className="oddaja-mesec oddaja-mesec-oddano"
              aria-label={`Poglej obračun: ${naziv}`}
              title={`${naziv} — Oddano; ${oddaja.placano ? 'Potrjeno' : 'Odprto'}. ${opisOddaje(oddaja.datum_oddaje)}`}
              onClick={(e) => {
                e.stopPropagation();
                odpriObracune(oddaja, { mesec, leto: obdobje.leto });
              }}><span aria-hidden="true">✓</span></button>;
          }
          const niPotrebno = oddaja.status === 'ni_potrebno';
          const opis = `${naziv} — ${niPotrebno ? oddaja.razlog : 'Ni oddano'}`;
          return <span className={`oddaja-mesec${niPotrebno ? ' oddaja-mesec-nepotrebno' : ''}`} title={opis} aria-label={opis}>
            {niPotrebno ? <span aria-hidden="true">—</span> : null}
          </span>;
        }
      };
    })
  ], [imenaMesecov, obdobje.leto, odpriObracune]);

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
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <ToggleButtonGroup value={pogled} exclusive size="small" color="primary" aria-label="Prikaz oddaj"
          onChange={(_, novPogled) => { if (novPogled) { setPogled(novPogled); setStran(0); } }}>
          <ToggleButton value="letni" sx={{ textTransform: 'none' }}>Letni pregled</ToggleButton>
          <ToggleButton value="seznam" sx={{ textTransform: 'none' }}>Seznam</ToggleButton>
        </ToggleButtonGroup>
        {letniPogled && <Tooltip title="Prikazani so trenutno aktivni najemniki v aktivnih sobah. Kljukica pomeni shranjeno oddajo; potrditev obračuna je navedena ob njej. Prejšnji najemniki so v pogledu Seznam.">
          <Typography variant="caption" color="text.secondary">✓ Oddano · □ Ni oddano · — Ni potrebno / prihodnji mesec</Typography>
        </Tooltip>}
      </Stack>
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
          {[{ key: 'vsi', label: 'Vsi', count: hisneVrstice.length }, ...Object.entries(STATUSI).map(([key, s]) => ({ key, label: letniPogled && key === 'manjka' ? 'Manjkajo oddaje' : letniPogled && key === 'oddano' ? 'Vse oddano' : s.naziv, count: stevila[key] }))].map(({ key, label, count }) => (
            <Button key={key} size="small" variant={status === key ? 'contained' : 'text'} aria-pressed={status === key} onClick={() => spremeniFilter(setStatus, key)}>{label} ({count})</Button>
          ))}
        </Stack>
        <Stack
          direction="row"
          sx={{
            gap: 0.25,
            alignItems: "center"
          }}>
          {!letniPogled && <Tooltip title={enMesec ? 'Prejšnji mesec' : 'Za premik izberi en mesec'}>
            <span><IconButton size="small" aria-label="Prejšnji mesec" onClick={() => premakniMesec(-1)} disabled={!enMesec || (obdobje.leto <= Math.min(...leta) && obdobje.meseci[0] === 1)}><ChevronLeftIcon fontSize="small" /></IconButton></span>
          </Tooltip>}
          {!letniPogled && <TextField
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
          </TextField>}
          <TextField select size="small" label="Leto" value={obdobje.leto} sx={{ width: 82 }} onChange={(e) => {
            const leto = Number(e.target.value);
            const meseci = obdobje.meseci.filter((m) => leto < trenutno.leto || m <= trenutno.mesec);
            spremeniFilter(setObdobje, { leto, meseci: meseci.length ? meseci : [trenutno.mesec] });
          }}>
            {leta.filter((leto) => leto <= trenutno.leto).map((leto) => <MenuItem key={leto} value={leto}>{leto}</MenuItem>)}
          </TextField>
          {!letniPogled && <Tooltip title={enMesec ? 'Naslednji mesec' : 'Za premik izberi en mesec'}>
            <span><IconButton size="small" aria-label="Naslednji mesec" disabled={!enMesec || jeTrenutno} onClick={() => premakniMesec(1)}><ChevronRightIcon fontSize="small" /></IconButton></span>
          </Tooltip>}
        </Stack>
        {!letniPogled && !jeTrenutno && <Button size="small" onClick={() => spremeniFilter(setObdobje, { leto: trenutno.leto, meseci: [trenutno.mesec] })}>Tekoči mesec</Button>}
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

      <Box className="tabela-polna" sx={ADMIN_TABELA_FLEKS_SX}>
        <DataGrid
          aria-label={letniPogled ? `Letni pregled oddaj ${obdobje.leto}` : `Oddaja obračunov za ${nazivObdobja}`}
          sx={ADMIN_DATAGRID_FLEKS_SX}
          key={pogled}
          rows={filtrirane}
          columns={letniPogled ? letniStolpci : stolpci}
          density="compact"
          rowHeight={56}
          columnHeaderHeight={48}
          disableRowSelectionOnClick
          localeText={lokalizacijaMreze}
          paginationModel={{ page: prikazanaStran, pageSize: steviloVrstic }}
          onPaginationModelChange={({ page, pageSize }) => {
            setStran(pageSize === steviloVrstic ? page : 0);
            setSteviloVrstic(pageSize);
          }}
          pageSizeOptions={[25, 50, 100]}
          slots={PREGLED_OVERLAY_SLOTS}
          slotProps={{ noRowsOverlay: { onPocisti: () => {
            setIskanje(''); setStatus('vsi'); setHisa(''); setSobaId(''); setStran(0);
          } } }}
        />
      </Box>
    </Stack>
  );
}

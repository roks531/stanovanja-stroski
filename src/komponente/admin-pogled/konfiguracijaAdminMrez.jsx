/**
 * Konfiguracija za admin tabele (MUI DataGrid) in skupne admin pomožne funkcije.
 *
 * Datoteka centralizira statične definicije (stolpci, lokalizacija, konstante),
 * da je `AdminPogled.jsx` krajši in osredotočen na stanje ter akcije.
 */
import { Box, Chip, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EuroSymbolOutlinedIcon from '@mui/icons-material/EuroSymbolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
const stolpciUporabniki = [
  { field: 'ime_priimek', headerName: 'Ime in priimek', flex: 1, minWidth: 220,
    renderHeader: () => <Box sx={{ whiteSpace: 'normal', lineHeight: 1.3, fontSize: '0.72rem', fontWeight: 600 }}>Ime in<br />priimek</Box>
  },
  {
    field: 'kontakt',
    headerName: 'Kontakt',
    flex: 1.2,
    minWidth: 240,
    sortable: false,
    renderCell: (params) => (
      <Stack spacing={0.25} py={0.5}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <EmailOutlinedIcon fontSize="inherit" />
          {params.row.email ? (
            <Link
              href={`mailto:${params.row.email}`}
              underline="hover"
              color="inherit"
              variant="body2"
              onClick={(e) => e.stopPropagation()}
            >
              {params.row.email}
            </Link>
          ) : (
            <Typography variant="body2">-</Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <PhoneOutlinedIcon fontSize="inherit" />
          <Typography variant="body2">{params.row.telefon ?? '-'}</Typography>
        </Stack>
      </Stack>
    )
  },
  { field: 'soba', headerName: 'Soba', width: 80 },
  {
    field: 'admin',
    headerName: 'Admin',
    width: 82,
    type: 'boolean',
    renderCell: (params) => (
      params.value
        ? <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.6, py: 0.15, borderRadius: '4px', background: '#e0f2fe', border: '1px solid #7dd3fc' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#0284c7' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#075985' }}>da</Typography>
          </Box>
        : <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>—</Typography>
    )
  },
  {
    field: 'aktiven',
    headerName: 'Aktiven',
    width: 88,
    type: 'boolean',
    renderCell: (params) => (
      params.value
        ? <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.6, py: 0.15, borderRadius: '4px', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#059669' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#065f46' }}>aktiven</Typography>
          </Box>
        : <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.6, py: 0.15, borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8' }}>neaktiven</Typography>
          </Box>
    )
  },
  {
    field: 'cas_info',
    headerName: 'Ustvarjeno / Posodobljeno',
    width: 240,
    renderHeader: () => <Box sx={{ whiteSpace: 'normal', lineHeight: 1.3, fontSize: '0.72rem', fontWeight: 600 }}>Ustvarjeno /<br />Posodobljeno</Box>,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack spacing={0.25} py={0.4}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }} noWrap>
            {params.row.ustvarjeno_ob ? dayjs(params.row.ustvarjeno_ob).format('DD.MM.YY HH:mm') : '—'}
          </Typography>
        </Stack>
        {params.row.posodobljeno_ob && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <InfoOutlinedIcon sx={{ fontSize: 11, color: '#0284c7', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }} noWrap>
              {dayjs(params.row.posodobljeno_ob).format('DD.MM.YY HH:mm')}
              {params.row.posodobil_ime ? ` · ${params.row.posodobil_ime}` : ''}
            </Typography>
          </Stack>
        )}
      </Stack>
    )
  }
];

const tipiHise = ['stara', 'velika'];
const zapomljiveBesede = [
  'luna',
  'most',
  'gozd',
  'pot',
  'zora',
  'veter',
  'list',
  'kava',
  'miza',
  'sonce',
  'breg',
  'val',
  'dom',
  'hrib',
  'sreca',
  'iskra'
];
const imenaMesecov = [
  'januar',
  'februar',
  'marec',
  'april',
  'maj',
  'junij',
  'julij',
  'avgust',
  'september',
  'oktober',
  'november',
  'december'
];

function prejsnjiMesecLeto() {
  const d = dayjs().subtract(1, 'month');
  return {
    mesec: d.month() + 1,
    leto: d.year()
  };
}

function jePrvoObdobjeNovejse(prvo, drugo) {
  const prvoLeto = Number(prvo?.leto ?? 0);
  const drugoLeto = Number(drugo?.leto ?? 0);
  if (prvoLeto !== drugoLeto) return prvoLeto > drugoLeto;
  return Number(prvo?.mesec ?? 0) > Number(drugo?.mesec ?? 0);
}

function daNe(vrednost) {
  return vrednost ? 'da' : 'ne';
}

function sobaImaVodniStevec(soba) {
  const tipHise = String(soba?.tip_hise ?? '').toLowerCase();
  if (tipHise === 'velika') return true;
  if (tipHise === 'stara') return false;
  return Boolean(soba?.voda_stanje);
}

function slogBadgaTipaHise(tipHise) {
  const tip = String(tipHise ?? '').toLowerCase();
  if (tip === 'stara') {
    return {
      ozadje: '#fff7ed',
      rob: '#fed7aa',
      besedilo: '#9a3412'
    };
  }
  if (tip === 'velika') {
    return {
      ozadje: '#f0f9ff',
      rob: '#bae6fd',
      besedilo: '#0369a1'
    };
  }
  return {
    ozadje: '#f1f5f9',
    rob: '#cbd5e1',
    besedilo: '#475569'
  };
}

function renderDenarCelica(params) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.5
      }}
    >
      <Typography variant="body2" noWrap>
        {Number(params.value ?? 0).toFixed(2)}
      </Typography>
      <EuroSymbolOutlinedIcon fontSize="inherit" />
    </Box>
  );
}

/* Pomožna mini-Badge za porabo (delta) – kvadratasta */
function PorabaBadge({ vrednost, enota, barva = 'amber' }) {
  const barve = {
    amber: { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
    blue:  { bg: '#dbeafe', border: '#bfdbfe', text: '#1d4ed8' },
    emerald: { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46' },
  };
  const c = barve[barva] ?? barve.amber;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.3,
        px: 0.7,
        py: 0.1,
        borderRadius: '4px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: c.text, lineHeight: 1.5 }}>
        Δ {vrednost} {enota}
      </Typography>
    </Box>
  );
}

function DatumPlacilaEditCelica(params) {
  const vrednost = params.value ? dayjs(params.value) : null;

  return (
    <DatePicker
      value={vrednost}
      format="DD.MM.YYYY"
      onChange={async (novaVrednost) => {
        const iso = novaVrednost?.isValid() ? novaVrednost.startOf('day').toISOString() : null;
        await params.api.setEditCellValue({
          id: params.id,
          field: params.field,
          value: iso
        });
      }}
      onAccept={() => {
        params.api.stopCellEditMode({ id: params.id, field: params.field });
      }}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
          autoFocus: true
        }
      }}
    />
  );
}

const stolpciSobe = [
  // ── Soba ──────────────────────────────────────────────────────
  {
    field: 'ime_sobe',
    headerName: 'Soba',
    width: 95,
    editable: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
        <HomeOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }} noWrap>
          {params.value}
        </Typography>
      </Stack>
    )
  },

  // ── Tip hiše ──────────────────────────────────────────────────
  {
    field: 'tip_hise',
    headerName: 'Hiša',
    width: 95,
    editable: true,
    type: 'singleSelect',
    valueOptions: tipiHise,
    renderCell: (params) => {
      const slog = slogBadgaTipaHise(params.value);
      return (
        <Box
          sx={{
            px: 0.75,
            py: 0.2,
            borderRadius: '4px',
            background: slog.ozadje,
            border: `1px solid ${slog.rob}`,
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: slog.besedilo, textTransform: 'capitalize' }}>
            {params.value}
          </Typography>
        </Box>
      );
    }
  },

  // ── Voda (fiksna za stara / števec za velika) ──────────────────
  {
    field: 'voda',
    headerName: 'Voda',
    width: 96,
    editable: true,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => {
      const imaStevec = sobaImaVodniStevec(params.row);
      if (imaStevec) {
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.6, py: 0.15, borderRadius: '4px', background: '#dbeafe', border: '1px solid #bfdbfe' }}>
              <WaterDropOutlinedIcon sx={{ fontSize: 11, color: '#3b82f6' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8' }}>števec</Typography>
            </Box>
          </Box>
        );
      }
      return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack direction="row" spacing={0.35} alignItems="center">
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>
              {Number(params.value ?? 0).toFixed(2)}
            </Typography>
            <EuroSymbolOutlinedIcon sx={{ fontSize: 12, color: '#3b82f6' }} />
          </Stack>
        </Box>
      );
    }
  },

  // ── Mesečni fiksni stroški ─────────────────────────────────────
  { field: 'najemnina',     headerName: 'Najemnina', width: 108, editable: true, type: 'number', renderCell: renderDenarCelica },
  { field: 'strosek_skupni', headerName: 'Skupni',   width: 100, editable: true, type: 'number', renderCell: renderDenarCelica },
  { field: 'nettv',          headerName: 'NetTV',    width: 96,  editable: true, type: 'number', renderCell: renderDenarCelica },
  { field: 'fiksni',         headerName: 'Fiksni',   width: 96,  editable: true, type: 'number', renderCell: renderDenarCelica },

  // ── Ogrevanje + Faktor ──────────────────────────────────────
  {
    field: 'strosek_ogrevanja',
    headerName: 'Ogrevanje',
    width: 128,
    editable: false,
    type: 'number',
    renderCell: (params) => (
      <Stack spacing={0.2} alignItems="flex-end" sx={{ width: '100%' }}>
        <Stack direction="row" spacing={0.4} alignItems="center">
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {Number(params.value ?? 0).toFixed(2)}
          </Typography>
          <EuroSymbolOutlinedIcon sx={{ fontSize: 12, color: '#d97706' }} />
        </Stack>
        <Box sx={{ px: 0.6, py: 0.1, borderRadius: '4px', background: '#fffbeb', border: '1px solid #fde68a', display: 'inline-flex' }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>
            ×{Number(params.row.faktor_ogrevanja ?? 1).toFixed(2)}
          </Typography>
        </Box>
      </Stack>
    )
  },

  // ── Aktivna ───────────────────────────────────────────────────
  {
    field: 'aktivna',
    headerName: 'Aktivna',
    width: 96,
    editable: true,
    type: 'boolean',
    renderCell: (params) => (
      params.value
        ? <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.6, py: 0.15, borderRadius: '4px', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#059669' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#065f46' }}>aktivna</Typography>
          </Box>
        : <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.6, py: 0.15, borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8' }}>neaktivna</Typography>
          </Box>
    )
  },

  // ── Zadnja posodobitev ────────────────────────────────────────
  {
    field: 'posodobljeno_info',
    headerName: 'Posodobljeno',
    flex: 1,
    minWidth: 190,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack spacing={0.25} py={0.4}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }} noWrap>
          {params.row.posodobil_ime ?? '—'}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }} noWrap>
            {params.row.posodobljeno_oblikovano ?? '—'}
          </Typography>
        </Stack>
      </Stack>
    )
  }
];

const stolpciCene = [
  // ── Tip hiše ──────────────────────────────────────────────────
  {
    field: 'tip_hise',
    headerName: 'Tip hiše',
    width: 120,
    renderCell: (params) => (
      <Box sx={{ px: 0.75, py: 0.2, borderRadius: '4px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      </Box>
    )
  },

  // ── Velja od ──────────────────────────────────────────────────
  {
    field: 'velja_od',
    headerName: 'Velja od',
    width: 130,
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
          {params.value ?? '—'}
        </Typography>
      </Stack>
    )
  },

  // ── Cena elektrike ────────────────────────────────────────────
  {
    field: 'cena_elektrike',
    headerName: 'Elektrika',
    width: 148,
    renderHeader: () => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <BoltOutlinedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
        <Stack spacing={0} sx={{ lineHeight: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>Elektrika</Typography>
          <Typography sx={{ fontSize: '0.66rem', color: '#94a3b8' }}>€ / kWh</Typography>
        </Stack>
      </Stack>
    ),
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <BoltOutlinedIcon sx={{ fontSize: 13, color: '#f59e0b', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#92400e' }}>
          {Number(params.value ?? 0).toFixed(4)}
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>€/kWh</Typography>
      </Stack>
    )
  },

  // ── Cena vode ─────────────────────────────────────────────────
  {
    field: 'cena_vode',
    headerName: 'Voda',
    width: 148,
    renderHeader: () => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <WaterDropOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
        <Stack spacing={0} sx={{ lineHeight: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>Voda</Typography>
          <Typography sx={{ fontSize: '0.66rem', color: '#94a3b8' }}>€ / m³</Typography>
        </Stack>
      </Stack>
    ),
    renderCell: (params) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <WaterDropOutlinedIcon sx={{ fontSize: 13, color: '#3b82f6', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#1d4ed8' }}>
          {Number(params.value ?? 0).toFixed(4)}
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>€/m³</Typography>
      </Stack>
    )
  }
];

const stolpciAdminStevci = [
  // ── Soba / Hiša – kombinirana celica (enako kot v obračunih) ──
  {
    field: 'soba',
    headerName: 'Soba / Hiša',
    width: 118,
    renderCell: (params) => (
      <Stack spacing={0.25} py={0.25}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <HomeOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={700} noWrap>
            {params.row.soba ?? '-'}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: '0.67rem',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
          noWrap
        >
          {params.row.tip_hise ?? '-'}
        </Typography>
      </Stack>
    )
  },

  // ── Obdobje ───────────────────────────────────────────────────
  {
    field: 'obdobje',
    headerName: 'Obdobje',
    width: 100,
    renderCell: (params) => (
      <Box sx={{ px: 0.75, py: 0.2, borderRadius: '4px', background: '#f0fdf4', border: '1px solid #a7f3d0', display: 'inline-flex' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>{params.value}</Typography>
      </Box>
    )
  },

  // ── Elektrika: prej → novo ─────────────────────────────────────
  {
    field: 'stanje_elektrike_prej',
    headerName: 'E prej',
    width: 90,
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} alignItems="center">
        <BoltOutlinedIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>E prej</Typography>
      </Stack>
    ),
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        {params.value ?? '—'}
      </Typography>
    )
  },
  {
    field: 'stanje_elektrike',
    headerName: 'E novo',
    width: 90,
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} alignItems="center">
        <BoltOutlinedIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>E novo</Typography>
      </Stack>
    ),
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>
        {params.value ?? '—'}
      </Typography>
    )
  },

  // ── Voda: prej → novo ─────────────────────────────────────────
  {
    field: 'stanje_vode_prej',
    headerName: 'V prej',
    width: 90,
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} alignItems="center">
        <WaterDropOutlinedIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>V prej</Typography>
      </Stack>
    ),
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        {params.value ?? '—'}
      </Typography>
    )
  },
  {
    field: 'stanje_vode',
    headerName: 'V novo',
    width: 90,
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} alignItems="center">
        <WaterDropOutlinedIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>V novo</Typography>
      </Stack>
    ),
    renderCell: (params) => (
      params.value == null
        ? <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>—</Typography>
        : <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>{params.value}</Typography>
    )
  },

  // ── Kdo in kdaj je vnesel ─────────────────────────────────────
  {
    field: 'vnos_info',
    headerName: 'Vnesel / Vneseno',
    flex: 1,
    minWidth: 190,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Stack spacing={0.25} py={0.4}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }} noWrap>
          {params.row.vnesel ?? '—'}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }} noWrap>
            {params.row.datum_vnosa ?? '—'}
          </Typography>
        </Stack>
      </Stack>
    )
  }
];

const stolpciOgrevanjeTipi = [
  // ── Tip hiše ──────────────────────────────────────────────────
  {
    field: 'tip_hise',
    headerName: 'Tip hiše',
    width: 105,
    renderCell: (params) => (
      <Box sx={{ px: 0.75, py: 0.2, borderRadius: '4px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'inline-flex' }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      </Box>
    )
  },

  // ── Obdobje ───────────────────────────────────────────────────
  {
    field: 'obdobje',
    headerName: 'Obdobje',
    width: 148,
    renderCell: (params) => (
      <Box sx={{ px: 0.75, py: 0.2, borderRadius: '4px', background: '#f0fdf4', border: '1px solid #a7f3d0', display: 'inline-flex' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>{params.value}</Typography>
      </Box>
    )
  },

  // ── Znesek ogrevanja ──────────────────────────────────────────
  {
    field: 'znesek',
    headerName: 'Ogrevanje €',
    width: 140,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Typography
        sx={{
          fontSize: '0.92rem',
          fontWeight: 800,
          color: '#d97706',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.01em',
        }}
        noWrap
      >
        {Number(params.value ?? 0).toFixed(2)} €
      </Typography>
    )
  },

  // ── Opomba ────────────────────────────────────────────────────
  {
    field: 'opomba',
    headerName: 'Opomba',
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      params.value
        ? (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
            <InfoOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#374151' }} noWrap>{params.value}</Typography>
          </Stack>
        )
        : <Typography sx={{ fontSize: '0.72rem', color: '#cbd5e1' }}>—</Typography>
    )
  }
];

const stolpciObracuni = [
  // ── Obdobje ──────────────────────────────────────────────────────
  {
    field: 'obdobje',
    headerName: 'Obdobje',
    width: 90,
    renderCell: (params) => (
      <Box
        sx={{
          px: 0.75, py: 0.25,
          borderRadius: '4px',
          background: '#f0fdf4',
          border: '1px solid #a7f3d0',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#065f46' }}>
          {params.value}
        </Typography>
      </Box>
    )
  },

  // ── Soba / Hiša ─────────────────────────────────────────────────
  {
    field: 'soba',
    headerName: 'Soba / Hiša',
    width: 118,
    renderCell: (params) => (
      <Stack spacing={0.25} py={0.25}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <HomeOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={700} noWrap>
            {params.row.soba ?? '-'}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: '0.67rem',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
          noWrap
        >
          {params.row.tip_hise ?? '-'}
        </Typography>
      </Stack>
    )
  },

  // ── Najemnik ─────────────────────────────────────────────────────
  { field: 'uporabnik', headerName: 'Najemnik', width: 136 },

  // ── Fiksni stroški (urejljivo, manjoe vrednosti) ─────────────────
  {
    field: 'najemnina',
    headerName: 'Najemnina',
    width: 84,
    editable: true,
    type: 'number',
    renderCell: renderDenarCelica
  },
  {
    field: 'strosek_skupni',
    headerName: 'Skupni',
    width: 76,
    editable: true,
    type: 'number',
    renderCell: renderDenarCelica
  },
  {
    field: 'strosek_neta',
    headerName: 'NetTV',
    width: 74,
    editable: true,
    type: 'number',
    renderCell: renderDenarCelica
  },
  {
    field: 'strosek_tv',
    headerName: 'Fiksni',
    width: 74,
    editable: true,
    type: 'number',
    renderCell: renderDenarCelica
  },
  {
    field: 'strosek_ogrevanja',
    headerName: 'Ogrevanje',
    width: 84,
    editable: true,
    type: 'number',
    renderCell: renderDenarCelica
  },

  // ── Odčitek elektrike: prej → novo + delta badge ──────────────────
  {
    field: 'stanje_elektrike',
    headerName: 'Elektrika',
    width: 130,
    editable: true,
    sortable: false,
    type: 'number',
    renderCell: (params) => (
      <Stack spacing={0.3} sx={{ width: '100%', py: 0.5 }}>
        {/* Prev → New reading row */}
        <Stack direction="row" spacing={0.4} alignItems="center">
          <BoltOutlinedIcon sx={{ fontSize: 12, color: '#f59e0b', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
            {Number(params.row.stanje_elektrike_prej ?? 0)}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#cbd5e1', mx: 0.2 }}>→</Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {Number(params.value ?? 0)}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>kWh</Typography>
        </Stack>
        {/* Consumption delta badge */}
        <PorabaBadge vrednost={Number(params.row.poraba_elektrike ?? 0)} enota="kWh" barva="amber" />
      </Stack>
    )
  },

  // ── Odčitek vode: prej → novo + delta badge ─────────────────────
  {
    field: 'stanje_vode',
    headerName: 'Voda',
    width: 122,
    editable: true,
    sortable: false,
    type: 'number',
    renderCell: (params) => {
      const niVode = params.value == null;
      return (
        <Stack spacing={0.3} sx={{ width: '100%', py: 0.5 }}>
          <Stack direction="row" spacing={0.4} alignItems="center">
            <WaterDropOutlinedIcon sx={{ fontSize: 12, color: '#3b82f6', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
              {Number(params.row.stanje_vode_prej ?? 0)}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#cbd5e1', mx: 0.2 }}>→</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {niVode ? '—' : Number(params.value)}
            </Typography>
            {!niVode && (
              <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>m³</Typography>
            )}
          </Stack>
          {niVode
            ? (
              <Box sx={{ px: 0.7, py: 0.1, borderRadius: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'inline-flex' }}>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>ni števca</Typography>
              </Box>
            )
            : <PorabaBadge vrednost={Number(params.row.poraba_vode ?? 0)} enota="m³" barva="blue" />
          }
        </Stack>
      );
    }
  },

  // ── Strošek E + V: ikone + poudarjen skupaj ───────────────────────
  {
    field: 'strosek_energija',
    headerName: 'Strošek E+V',
    width: 112,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const e = Number(params.row.strosek_elektrike ?? 0);
      const v = Number(params.row.strosek_vode ?? 0);
      const skupaj = e + v;
      return (
        <Stack spacing={0.2} sx={{ width: '100%', py: 0.4 }}>
          {/* Elektrika */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <BoltOutlinedIcon sx={{ fontSize: 12, color: '#f59e0b', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', flex: 1 }}>E</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {e.toFixed(2)} €
            </Typography>
          </Stack>
          {/* Voda */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <WaterDropOutlinedIcon sx={{ fontSize: 12, color: '#3b82f6', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', flex: 1 }}>V</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {v.toFixed(2)} €
            </Typography>
          </Stack>
          {/* Skupaj – bold divider line */}
          <Box sx={{ height: '1px', bgcolor: 'rgba(15,23,42,0.08)', mx: 0.25 }} />
          <Typography
            sx={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textAlign: 'right',
              color: '#0f172a',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {skupaj.toFixed(2)} €
          </Typography>
        </Stack>
      );
    }
  },

  // ── Skupaj – poudarjen emerald znesek ─────────────────────────────
  {
    field: 'skupni_strosek',
    headerName: 'Skupaj',
    width: 92,
    type: 'number',
    renderCell: (params) => (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#059669',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.01em',
          }}
          noWrap
        >
          {Number(params.value ?? 0).toFixed(2)} €
        </Typography>
      </Box>
    )
  },

  // ── Status potrditve – Chip badge (urejljivo boolean) ──────────────
  {
    field: 'placano',
    headerName: 'Status',
    width: 96,
    editable: true,
    type: 'boolean',
    renderCell: (params) => (
      params.value
        ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.3, borderRadius: '4px', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 13, color: '#059669' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46' }}>Potrjeno</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.3, borderRadius: '4px', background: '#fef3c7', border: '1px solid #fde68a' }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 13, color: '#d97706' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>Odprto</Typography>
          </Box>
        )
    )
  },

  // ── Datumi vnosa in plačila ────────────────────────────────────────
  {
    field: 'datum_placila_iso',
    headerName: 'Datumi',
    width: 130,
    editable: true,
    sortable: false,
    filterable: false,
    renderEditCell: (params) => <DatumPlacilaEditCelica {...params} />,
    renderCell: (params) => (
      <Stack spacing={0.3} py={0.4} sx={{ lineHeight: 1.2 }}>
        {/* Datum vnosa */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }} noWrap>
            {params.row.datum_vnosa_format ?? '—'}
          </Typography>
        </Stack>
        {/* Datum plačila – zeleno če je, amber pika če ni */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.row.datum_placila_format
            ? <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#059669', flexShrink: 0 }} />
            : <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: '#d97706', flexShrink: 0 }} />
          }
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: params.row.datum_placila_format ? '#059669' : '#d97706',
            }}
            noWrap
          >
            {params.row.datum_placila_format ?? 'ni potrjeno'}
          </Typography>
        </Stack>
      </Stack>
    )
  }
];

function kljucObracuna(sobaId, uporabnikId, mesec, leto) {
  return `${sobaId ?? 'null'}|${uporabnikId ?? 'null'}|${mesec}|${leto}`;
}

function normalizirajOznakoSobe(imeSobe) {
  const oznaka = String(imeSobe ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return oznaka ? oznaka.slice(0, 4) : 'SOBA';
}

const moznostiStrani = [25, 50, 100, { value: -1, label: 'Vse' }];

const lokalizacijaMreze = {
  noRowsLabel: 'Ni vrstic.',
  noResultsOverlayLabel: 'Ni rezultatov.',
  noColumnsOverlayLabel: 'Ni stolpcev.',
  noColumnsOverlayManageColumns: 'Upravljaj stolpce',
  toolbarDensity: 'Gostota',
  toolbarDensityLabel: 'Gostota',
  toolbarDensityCompact: 'Kompaktno',
  toolbarDensityStandard: 'Standardno',
  toolbarDensityComfortable: 'Udobno',
  toolbarColumns: 'Stolpci',
  toolbarColumnsLabel: 'Izberi stolpce',
  toolbarFilters: 'Filtri',
  toolbarFiltersLabel: 'Prikaži filtre',
  toolbarFiltersTooltipHide: 'Skrij filtre',
  toolbarFiltersTooltipShow: 'Prikaži filtre',
  toolbarFiltersTooltipActive: (count) => (count !== 1 ? `${count} aktivnih filtrov` : `${count} aktiven filter`),
  toolbarQuickFilterPlaceholder: 'Išči...',
  toolbarQuickFilterLabel: 'Išči',
  toolbarQuickFilterDeleteIconLabel: 'Počisti',
  toolbarExport: 'Izvoz',
  toolbarExportLabel: 'Izvoz',
  toolbarExportCSV: 'Prenesi CSV',
  toolbarExportPrint: 'Natisni',
  toolbarExportExcel: 'Prenesi Excel',
  columnsManagementSearchTitle: 'Išči',
  columnsManagementNoColumns: 'Ni stolpcev',
  columnsManagementShowHideAllText: 'Prikaži/skrij vse',
  columnsManagementReset: 'Ponastavi',
  columnsManagementDeleteIconLabel: 'Počisti',
  filterPanelAddFilter: 'Dodaj filter',
  filterPanelRemoveAll: 'Odstrani vse',
  filterPanelDeleteIconLabel: 'Izbriši',
  filterPanelLogicOperator: 'Logični operator',
  filterPanelOperator: 'Operator',
  filterPanelOperatorAnd: 'In',
  filterPanelOperatorOr: 'Ali',
  filterPanelColumns: 'Stolpec',
  filterPanelInputLabel: 'Vrednost',
  filterPanelInputPlaceholder: 'Vrednost filtra',
  filterOperatorContains: 'vsebuje',
  filterOperatorDoesNotContain: 'ne vsebuje',
  filterOperatorEquals: 'je enako',
  filterOperatorDoesNotEqual: 'ni enako',
  filterOperatorStartsWith: 'se začne z',
  filterOperatorEndsWith: 'se konča z',
  filterOperatorIs: 'je',
  filterOperatorNot: 'ni',
  filterOperatorAfter: 'je po',
  filterOperatorOnOrAfter: 'je na ali po',
  filterOperatorBefore: 'je pred',
  filterOperatorOnOrBefore: 'je na ali pred',
  filterOperatorIsEmpty: 'je prazno',
  filterOperatorIsNotEmpty: 'ni prazno',
  filterOperatorIsAnyOf: 'je katerikoli od',
  'filterOperator=': '=',
  'filterOperator!=': '!=',
  'filterOperator>': '>',
  'filterOperator>=': '>=',
  'filterOperator<': '<',
  'filterOperator<=': '<=',
  headerFilterOperatorContains: 'Vsebuje',
  headerFilterOperatorDoesNotContain: 'Ne vsebuje',
  headerFilterOperatorEquals: 'Je enako',
  headerFilterOperatorDoesNotEqual: 'Ni enako',
  headerFilterOperatorStartsWith: 'Se začne z',
  headerFilterOperatorEndsWith: 'Se konča z',
  headerFilterOperatorIs: 'Je',
  headerFilterOperatorNot: 'Ni',
  headerFilterOperatorAfter: 'Je po',
  headerFilterOperatorOnOrAfter: 'Je na ali po',
  headerFilterOperatorBefore: 'Je pred',
  headerFilterOperatorOnOrBefore: 'Je na ali pred',
  headerFilterOperatorIsEmpty: 'Je prazno',
  headerFilterOperatorIsNotEmpty: 'Ni prazno',
  headerFilterOperatorIsAnyOf: 'Je katerikoli od',
  'headerFilterOperator=': 'Je enako',
  'headerFilterOperator!=': 'Ni enako',
  'headerFilterOperator>': 'Večje od',
  'headerFilterOperator>=': 'Večje ali enako',
  'headerFilterOperator<': 'Manjše od',
  'headerFilterOperator<=': 'Manjše ali enako',
  headerFilterClear: 'Počisti filter',
  booleanCellTrueLabel: 'da',
  booleanCellFalseLabel: 'ne',
  filterValueAny: 'katerikoli',
  filterValueTrue: 'da',
  filterValueFalse: 'ne',
  columnMenuLabel: 'Meni',
  columnMenuAriaLabel: (columnName) => `Meni stolpca ${columnName}`,
  columnMenuShowColumns: 'Prikaži stolpce',
  columnMenuManageColumns: 'Upravljaj stolpce',
  columnMenuFilter: 'Filter',
  columnMenuHideColumn: 'Skrij stolpec',
  columnMenuUnsort: 'Odstrani razvrščanje',
  columnMenuSortAsc: 'Razvrsti naraščajoče',
  columnMenuSortDesc: 'Razvrsti padajoče',
  columnHeaderFiltersTooltipActive: (count) => (count !== 1 ? `${count} aktivnih filtrov` : `${count} aktiven filter`),
  columnHeaderFiltersLabel: 'Prikaži filtre',
  columnHeaderSortIconLabel: 'Razvrsti',
  footerRowSelected: (count) =>
    count === 1 ? `${count.toLocaleString()} izbrana vrstica` : `${count.toLocaleString()} izbranih vrstic`,
  footerTotalRows: 'Skupaj vrstic:',
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString()} od ${totalCount.toLocaleString()}`,
  checkboxSelectionHeaderName: 'Izbira vrstic',
  checkboxSelectionSelectAllRows: 'Izberi vse vrstice',
  checkboxSelectionUnselectAllRows: 'Prekliči izbiro vseh vrstic',
  checkboxSelectionSelectRow: 'Izberi vrstico',
  checkboxSelectionUnselectRow: 'Prekliči izbiro vrstice',
  actionsCellMore: 'več',
  pinToLeft: 'Pripni levo',
  pinToRight: 'Pripni desno',
  unpin: 'Odpni',
  paginationRowsPerPage: 'Vrstic na stran:',
  paginationDisplayedRows: ({ from, to, count, estimated }) => {
    if (!estimated) {
      return `${from}-${to} od ${count !== -1 ? count : `več kot ${to}`}`;
    }
    const oznakaOcene = estimated && estimated > to ? `okoli ${estimated}` : `več kot ${to}`;
    return `${from}-${to} od ${count !== -1 ? count : oznakaOcene}`;
  },
  paginationItemAriaLabel: (type) => {
    if (type === 'first') return 'Pojdi na prvo stran';
    if (type === 'last') return 'Pojdi na zadnjo stran';
    if (type === 'next') return 'Pojdi na naslednjo stran';
    return 'Pojdi na prejšnjo stran';
  }
};


export {
  stolpciUporabniki,
  tipiHise,
  zapomljiveBesede,
  imenaMesecov,
  prejsnjiMesecLeto,
  jePrvoObdobjeNovejse,
  daNe,
  sobaImaVodniStevec,
  stolpciSobe,
  stolpciCene,
  stolpciAdminStevci,
  stolpciOgrevanjeTipi,
  stolpciObracuni,
  kljucObracuna,
  normalizirajOznakoSobe,
  moznostiStrani,
  lokalizacijaMreze
};

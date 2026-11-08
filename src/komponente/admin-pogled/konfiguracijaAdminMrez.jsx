/**
 * Konfiguracija za admin tabele (MUI DataGrid) in skupne admin pomožne funkcije.
 *
 * Datoteka centralizira statične definicije (stolpci, lokalizacija, konstante),
 * da je `AdminPogled.jsx` krajši in osredotočen na stanje ter akcije.
 */
import {
  renderDenarCelica,
  renderObdobjeCelica,
  renderSobaCelica,
  renderElektrikaCelica,
  renderVodaCelica,
  renderStrosekEnergijeCelica,
  renderSkupajCelica,
  renderStatusCelica,
  renderDatumiCelica,
  renderOdcitekCelica,
} from './adminGridCells';
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
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

function formatDatumPogodbe(vrednost) {
  if (!vrednost) return '—';
  const d = dayjs(vrednost);
  return d.isValid() ? d.format('DD.MM.YYYY') : '—';
}

// Vrne ključ statusa pogodbe za prikaz barv in filtriranje.
function statusPogodbe(pogodbaOd, pogodbaDo) {
  if (!pogodbaOd || !pogodbaDo) {
    return 'manjka';
  }

  const danes = dayjs().startOf('day');
  const od = dayjs(pogodbaOd).startOf('day');
  const doDatuma = dayjs(pogodbaDo).startOf('day');

  if (!od.isValid() || !doDatuma.isValid()) {
    return 'manjka';
  }

  if (danes.isAfter(doDatuma, 'day')) {
    return 'potekla';
  }

  if (danes.isBefore(od, 'day')) {
    return 'prihaja';
  }

  const dniDoPoteka = doDatuma.diff(danes, 'day');
  if (dniDoPoteka <= 31) {
    return 'kmalu';
  }

  return 'aktivna';
}

const stolpciUporabniki = [
  { field: 'ime_priimek', headerName: 'Ime in priimek', flex: 0.9, minWidth: 220,
    renderHeader: () => <Box sx={{ whiteSpace: 'normal', lineHeight: 1.3, fontSize: '0.72rem', fontWeight: 600 }}>Ime in<br />priimek</Box>
  },
  {
    field: 'kontakt',
    headerName: 'Kontakt',
    flex: 1,
    minWidth: 240,
    sortable: false,
    renderCell: (params) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4, paddingBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 6, alignItems: "center" }}>
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
            <span style={{ display: "block", fontSize: "0.875rem", lineHeight: 1.43, fontWeight: 400 }}>-</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 6, alignItems: "center" }}>
          <PhoneOutlinedIcon fontSize="inherit" />
          <span style={{ display: "block", fontSize: "0.875rem", lineHeight: 1.43, fontWeight: 400 }}>{params.row.telefon ?? '-'}</span>
        </div>
      </div>
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
        ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#e0f2fe', border: '1px solid #7dd3fc' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#0284c7' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 700, color: '#075985' }}>da</span>
          </div>
        : <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8' }}>—</span>
    )
  },
  {
    field: 'aktiven',
    headerName: 'Aktiven',
    width: 88,
    type: 'boolean',
    renderCell: (params) => (
      params.value
        ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#059669' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 700, color: '#065f46' }}>aktiven</span>
          </div>
        : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 600, color: '#94a3b8' }}>neaktiven</span>
          </div>
    )
  },
  {
    field: 'pogodba',
    headerName: 'Pogodba',
    width: 138,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const od = formatDatumPogodbe(params.row.pogodba_od);
      const doDatuma = formatDatumPogodbe(params.row.pogodba_do);
      const status = statusPogodbe(params.row.pogodba_od, params.row.pogodba_do);
      const statusBarve =
        status === 'aktivna'
          ? { rob: '#a7f3d0', pika: '#059669' }
          : status === 'potekla'
            ? { rob: '#fecaca', pika: '#dc2626' }
            : status === 'kmalu' || status === 'prihaja'
              ? { rob: '#fde68a', pika: '#d97706' }
              : { rob: '#cbd5e1', pika: '#94a3b8' };

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0.8, paddingTop: 1.6, paddingBottom: 1.6, width: '100%' }}>
          <div style={{ display: "flex", flexDirection: "row", gap: 3.6, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, flexShrink: 0, visibility: 'hidden' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.2, fontWeight: 400, color: '#64748b', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              od: {od}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 3.6, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, borderRadius: '999px', background: statusBarve.pika, border: `1px solid ${statusBarve.rob}`, flexShrink: 0 }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.2, fontWeight: 400, color: '#475569', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              do: {doDatuma}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    field: 'zacetno_stanje',
    headerName: 'Začetno stanje',
    width: 118,
    renderHeader: () => (
      <Box sx={{ whiteSpace: 'normal', lineHeight: 1.2, fontSize: '0.72rem', fontWeight: 600 }}>
        Začetno
        <br />
        stanje
      </Box>
    ),
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const elektrika = params.row.zacetno_stanje_elektrike;
      const voda = params.row.zacetno_stanje_vode;
      if (elektrika == null && voda == null) {
        return (
          <span style={{ display: "block", fontSize: '0.76rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8', fontVariantNumeric: 'tabular-nums', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            —
          </span>
        );
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 1.2, paddingTop: 1.6, paddingBottom: 1.6, width: '100%' }}>
          <div style={{ display: "flex", flexDirection: "row", gap: 3.6, alignItems: "center" }}>
            <BoltOutlinedIcon sx={{ fontSize: 12, color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.1, fontWeight: 400, color: '#64748b', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {elektrika == null ? '—' : elektrika}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: 3.6, alignItems: "center" }}>
            <WaterDropOutlinedIcon sx={{ fontSize: 12, color: '#3b82f6', flexShrink: 0 }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.1, fontWeight: 400, color: '#475569', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {voda == null ? '—' : voda}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    field: 'cas_info',
    headerName: 'Ustvarjeno / Posodobljeno',
    width: 240,
    renderHeader: () => <Box sx={{ whiteSpace: 'normal', lineHeight: 1.3, fontSize: '0.72rem', fontWeight: 600 }}>Ustvarjeno /<br />Posodobljeno</Box>,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 3.2, paddingBottom: 3.2 }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 400, color: '#64748b', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {params.row.ustvarjeno_ob ? dayjs(params.row.ustvarjeno_ob).format('DD.MM.YY HH:mm') : '—'}
          </span>
        </div>
        {params.row.posodobljeno_ob && (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
            <InfoOutlinedIcon sx={{ fontSize: 11, color: '#0284c7', flexShrink: 0 }} />
            <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 400, color: '#64748b', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {dayjs(params.row.posodobljeno_ob).format('DD.MM.YY HH:mm')}
              {params.row.posodobil_ime ? ` · ${params.row.posodobil_ime}` : ''}
            </span>
          </div>
        )}
      </div>
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

function obdobjeSortKljuc(vrednost) {
  const niz = String(vrednost ?? '').trim();
  const deli = niz.split('.');
  if (deli.length !== 2) return 0;
  const mesec = Number(deli[0]);
  const leto = Number(deli[1]);
  if (!Number.isFinite(mesec) || !Number.isFinite(leto)) return 0;
  return (leto * 100) + mesec;
}

function sobaImaVodniStevec(soba) {
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
    width: 80,
    flex: 0,
    editable: true,
    renderCell: (params) => (
      <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center", height: '100%' }}>
        <HomeOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
        <span style={{ display: "block", fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {params.value}
        </span>
      </div>
    )
  },

  // ── Tip hiše ──────────────────────────────────────────────────
  {
    field: 'tip_hise',
    headerName: 'Hiša',
    width: 80,
    flex: 0,
    editable: true,
    type: 'singleSelect',
    valueOptions: tipiHise,
    renderCell: (params) => {
      const slog = slogBadgaTipaHise(params.value);
      return (
        <div style={{ paddingLeft: 6, paddingRight: 6, paddingTop: 1.6, paddingBottom: 1.6, borderRadius: '4px', background: slog.ozadje, border: `1px solid ${slog.rob}`, display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 700, color: slog.besedilo, textTransform: 'capitalize' }}>
            {params.value}
          </span>
        </div>
      );
    }
  },

  // ── Način vode (fiksni strošek ali števec) ─────────────────────
  {
    field: 'voda_stanje',
    headerName: 'Vodni števec',
    width: 112,
    editable: true,
    type: 'boolean',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      params.value
        ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#dbeafe', border: '1px solid #bfdbfe' }}>
            <WaterDropOutlinedIcon sx={{ fontSize: 11, color: '#3b82f6' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 700, color: '#1d4ed8' }}>da</span>
          </div>
        : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 600, color: '#64748b' }}>ne</span>
          </div>
    )
  },

  // ── Voda (fiksni strošek ali števec) ───────────────────────────
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
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#dbeafe', border: '1px solid #bfdbfe' }}>
              <WaterDropOutlinedIcon sx={{ fontSize: 11, color: '#3b82f6' }} />
              <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 700, color: '#1d4ed8' }}>števec</span>
            </div>
          </div>
        );
      }
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: "flex", flexDirection: "row", gap: 2.8, alignItems: "center" }}>
            <span style={{ display: "block", fontSize: '0.8rem', lineHeight: 1.5, fontWeight: 700, color: '#1d4ed8', fontVariantNumeric: 'tabular-nums' }}>
              {Number(params.value ?? 0).toFixed(2)}
            </span>
            <EuroSymbolOutlinedIcon sx={{ fontSize: 12, color: '#3b82f6' }} />
          </div>
        </div>
      );
    }
  },

  // ── Mesečni stroški ────────────────────────────────────────────
  { field: 'najemnina',     headerName: 'Najemnina', width: 108, editable: true, type: 'number', renderCell: renderDenarCelica },
  { field: 'strosek_skupni', headerName: 'Skupni',   width: 100, editable: true, type: 'number', renderCell: renderDenarCelica },
  { field: 'nettv',          headerName: 'NetTV',    width: 96,  editable: true, type: 'number', renderCell: renderDenarCelica },
  { field: 'fiksni',         headerName: 'Drugo',    width: 96,  editable: true, type: 'number', renderCell: renderDenarCelica },

  // ── Ogrevanje + Delež ──────────────────────────────────────
  {
    field: 'strosek_ogrevanja',
    headerName: 'Ogrevanje',
    width: 172,
    editable: false,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 4.4, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: 3.2, alignItems: "center" }}>
            <span style={{ display: "block", fontSize: '0.8rem', lineHeight: 1.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {Number(params.value ?? 0).toFixed(2)}
            </span>
            <EuroSymbolOutlinedIcon sx={{ fontSize: 12, color: '#d97706' }} />
          </div>
          <div style={{ paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 0.8, paddingBottom: 0.8, borderRadius: '4px', background: '#fffbeb', border: '1px solid #fde68a', display: 'inline-flex' }}>
            <span style={{ display: "block", fontSize: '0.65rem', lineHeight: 1.5, fontWeight: 700, color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>
              delež {Number(params.row.faktor_ogrevanja ?? 0).toFixed(4)}
            </span>
          </div>
        </div>
      </div>
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
        ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#059669' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 700, color: '#065f46' }}>aktivna</span>
          </div>
        : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2.8, paddingLeft: 4.8, paddingRight: 4.8, paddingTop: 1.2, paddingBottom: 1.2, borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
            <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 600, color: '#94a3b8' }}>neaktivna</span>
          </div>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 3.2, paddingBottom: 3.2 }}>
        <span style={{ display: "block", fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {params.row.posodobil_ime ?? '—'}
        </span>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.7rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {params.row.posodobljeno_oblikovano ?? '—'}
          </span>
        </div>
      </div>
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
      <div style={{ paddingLeft: 6, paddingRight: 6, paddingTop: 1.6, paddingBottom: 1.6, borderRadius: '4px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 700, color: '#0369a1', textTransform: 'capitalize' }}>
          {params.value}
        </span>
      </div>
    )
  },

  // ── Velja od ──────────────────────────────────────────────────
  {
    field: 'velja_od',
    headerName: 'Velja od',
    width: 130,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 600, color: '#374151' }}>
            {params.value ?? '—'}
          </span>
        </div>
      </div>
    )
  },

  // ── Cena elektrike ────────────────────────────────────────────
  {
    field: 'cena_elektrike',
    headerName: 'Elektrika',
    width: 148,
    align: 'center',
    headerAlign: 'center',
    renderHeader: () => (
      <Stack direction="row" spacing={0.5} sx={{
        alignItems: "center"
      }}>
        <BoltOutlinedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
        <Stack spacing={0} sx={{ lineHeight: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>Elektrika</Typography>
          <Typography sx={{ fontSize: '0.66rem', color: '#94a3b8' }}>€ / kWh</Typography>
        </Stack>
      </Stack>
    ),
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <BoltOutlinedIcon sx={{ fontSize: 13, color: '#f59e0b', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#92400e' }}>
            {Number(params.value ?? 0).toFixed(4)}
          </span>
          <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8' }}>€/kWh</span>
        </div>
      </div>
    )
  },

  // ── Cena vode ─────────────────────────────────────────────────
  {
    field: 'cena_vode',
    headerName: 'Voda',
    width: 148,
    align: 'center',
    headerAlign: 'center',
    renderHeader: () => (
      <Stack direction="row" spacing={0.5} sx={{
        alignItems: "center"
      }}>
        <WaterDropOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
        <Stack spacing={0} sx={{ lineHeight: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>Voda</Typography>
          <Typography sx={{ fontSize: '0.66rem', color: '#94a3b8' }}>€ / m³</Typography>
        </Stack>
      </Stack>
    ),
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <WaterDropOutlinedIcon sx={{ fontSize: 13, color: '#3b82f6', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#1d4ed8' }}>
            {Number(params.value ?? 0).toFixed(4)}
          </span>
          <span style={{ display: "block", fontSize: '0.68rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8' }}>€/m³</span>
        </div>
      </div>
    )
  }
];

// stolpciStroski does NOT include the 'strosek' and 'opis' columns — those are
// built dynamically in StrokiSekcija so they can carry click-handler state.
const stolpciStroski = [
  // ── Soba / Hiša ───────────────────────────────────────────────
  {
    field: 'soba',
    headerName: 'Soba / Hiša',
    width: 140,
    renderCell: (params) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2, paddingBottom: 2 }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <HomeOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: "0.75rem", lineHeight: 1.66, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {params.row.soba ?? 'Splošno'}
          </span>
        </div>
        {params.row.tip_hise && (
          <span style={{ display: "block", fontSize: '0.67rem', lineHeight: 1.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {params.row.tip_hise}
          </span>
        )}
      </div>
    )
  },

  // ── Znesek ────────────────────────────────────────────────────
  {
    field: 'znesek',
    headerName: 'Znesek',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <EuroSymbolOutlinedIcon sx={{ fontSize: 13, color: '#059669', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#059669' }}>
            {Number(params.value ?? 0).toFixed(2)}
          </span>
        </div>
      </div>
    )
  },

  // ── Datum stroška + vnos (kombinirano) ───────────────────────
  {
    field: 'datum_stroska',
    headerName: 'Datum',
    width: 130,
    align: 'center',
    headerAlign: 'center',
    // sort on raw ISO date so ordering is correct
    sortComparator: (v1, v2) => {
      if (!v1 && !v2) return 0;
      if (!v1) return 1;
      if (!v2) return -1;
      return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    },
    renderCell: (params) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center", height: '100%' }}>
        {params.row.datum_stroska_format ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
            <SellOutlinedIcon sx={{ fontSize: 11, color: '#059669', flexShrink: 0 }} />
            <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 700, color: '#059669' }}>
              {params.row.datum_stroska_format}
            </span>
          </div>
        ) : (
          <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 400, color: '#cbd5e1' }}>—</span>
        )}
        <div style={{ display: "flex", flexDirection: "row", gap: 3.2, alignItems: "center" }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#cbd5e1', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8' }}>
            {params.row.ustvarjeno_ob_format ?? ''}
          </span>
        </div>
      </div>
    )
  }
];

const stolpciAdminStevci = [
  // ── Soba / Hiša – kombinirana celica (enako kot v obračunih) ──
  {
    field: 'soba',
    headerName: 'Soba / Hiša',
    width: 118,
    renderCell: renderSobaCelica
  },

  // ── Obdobje ───────────────────────────────────────────────────
  {
    field: 'obdobje',
    headerName: 'Obdobje',
    width: 100,
    sortComparator: (v1, v2) => obdobjeSortKljuc(v1) - obdobjeSortKljuc(v2),
    renderCell: renderObdobjeCelica
  },

  // ── Elektrika: prej → novo ─────────────────────────────────────
  {
    field: 'stanje_elektrike_prej',
    headerName: 'E prej',
    width: 90,
    align: 'center',
    headerAlign: 'center',
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} sx={{
        alignItems: "center"
      }}>
        <BoltOutlinedIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>E prej</Typography>
      </Stack>
    ),
    renderCell: renderOdcitekCelica
  },
  {
    field: 'stanje_elektrike',
    headerName: 'E novo',
    width: 90,
    align: 'center',
    headerAlign: 'center',
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} sx={{
        alignItems: "center"
      }}>
        <BoltOutlinedIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>E novo</Typography>
      </Stack>
    ),
    renderCell: renderOdcitekCelica
  },

  // ── Voda: prej → novo ─────────────────────────────────────────
  {
    field: 'stanje_vode_prej',
    headerName: 'V prej',
    width: 90,
    align: 'center',
    headerAlign: 'center',
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} sx={{
        alignItems: "center"
      }}>
        <WaterDropOutlinedIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>V prej</Typography>
      </Stack>
    ),
    renderCell: renderOdcitekCelica
  },
  {
    field: 'stanje_vode',
    headerName: 'V novo',
    width: 90,
    align: 'center',
    headerAlign: 'center',
    renderHeader: () => (
      <Stack direction="row" spacing={0.4} sx={{
        alignItems: "center"
      }}>
        <WaterDropOutlinedIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>V novo</Typography>
      </Stack>
    ),
    renderCell: renderOdcitekCelica
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
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 3.2, paddingBottom: 3.2 }}>
        <span style={{ display: "block", fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {params.row.vnesel ?? '—'}
        </span>
        <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center" }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ display: "block", fontSize: '0.7rem', lineHeight: 1.5, fontWeight: 400, color: '#94a3b8', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {params.row.datum_vnosa ?? '—'}
          </span>
        </div>
      </div>
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
      <div style={{ paddingLeft: 6, paddingRight: 6, paddingTop: 1.6, paddingBottom: 1.6, borderRadius: '4px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'inline-flex' }}>
        <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 700, color: '#0369a1', textTransform: 'capitalize' }}>
          {params.value}
        </span>
      </div>
    )
  },

  // ── Obdobje ───────────────────────────────────────────────────
  {
    field: 'obdobje',
    headerName: 'Obdobje',
    width: 90,
    renderCell: renderObdobjeCelica
  },

  // ── Znesek ogrevanja ──────────────────────────────────────────
  {
    field: 'znesek',
    headerName: 'Ogrevanje €',
    width: 140,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ display: "block", fontSize: '0.92rem', lineHeight: 1.5, fontWeight: 800, color: '#d97706', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {Number(params.value ?? 0).toFixed(2)} €
        </span>
      </div>
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
          <div style={{ display: "flex", flexDirection: "row", gap: 4, alignItems: "center", height: '100%' }}>
            <InfoOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }} />
            <span style={{ display: "block", fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 400, color: '#374151', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{params.value}</span>
          </div>
        )
        : <span style={{ display: "block", fontSize: '0.72rem', lineHeight: 1.5, fontWeight: 400, color: '#cbd5e1' }}>—</span>
    )
  }
];

const stolpciObracuni = [
  // ── Obdobje ──────────────────────────────────────────────────────
  {
    field: 'obdobje',
    headerName: 'Obdobje',
    width: 90,
    renderCell: renderObdobjeCelica
  },

  // ── Soba / Hiša ─────────────────────────────────────────────────
  {
    field: 'soba',
    headerName: 'Soba / Hiša',
    width: 118,
    renderCell: renderSobaCelica
  },

  // ── Najemnik ─────────────────────────────────────────────────────
  { field: 'uporabnik', headerName: 'Najemnik', width: 136 },

  // ── Stroški (urejljivo, manjše vrednosti) ───────────────────────
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
    headerName: 'Drugo',
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
    renderCell: renderElektrikaCelica
  },

  // ── Odčitek vode: prej → novo + delta badge ─────────────────────
  {
    field: 'stanje_vode',
    headerName: 'Voda',
    width: 152,
    editable: true,
    sortable: false,
    type: 'number',
    renderCell: renderVodaCelica
  },

  // ── Strošek E + V: ikone + poudarjen skupaj ───────────────────────
  {
    field: 'strosek_energija',
    headerName: 'Strošek E+V',
    width: 112,
    sortable: false,
    filterable: false,
    renderCell: renderStrosekEnergijeCelica
  },

  // ── Skupaj – poudarjen emerald znesek ─────────────────────────────
  {
    field: 'skupni_strosek',
    headerName: 'Skupaj',
    width: 92,
    type: 'number',
    renderCell: renderSkupajCelica
  },

  // ── Status potrditve – Chip badge (urejljivo boolean) ──────────────
  {
    field: 'placano',
    headerName: 'Status',
    width: 96,
    editable: true,
    type: 'boolean',
    renderCell: renderStatusCelica
  },

  // ── Datumi vnosa in plačila (sortirano po datumu obračuna) ───────────
  {
    field: 'datum_placila_iso',
    headerName: 'Datumi',
    width: 130,
    editable: true,
    sortable: true,
    filterable: false,
    sortComparator: (v1, v2, cellParams1, cellParams2) => {
      const a = cellParams1.api.getRow(cellParams1.id)?.datum_vnosa_iso;
      const b = cellParams2.api.getRow(cellParams2.id)?.datum_vnosa_iso;
      return dayjs(a ?? 0).valueOf() - dayjs(b ?? 0).valueOf();
    },
    renderEditCell: (params) => <DatumPlacilaEditCelica {...params} />,
    renderCell: renderDatumiCelica
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
  filterPanelColumn: 'Stolpec',
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
  stolpciStroski,
  stolpciAdminStevci,
  stolpciOgrevanjeTipi,
  stolpciObracuni,
  kljucObracuna,
  normalizirajOznakoSobe,
  moznostiStrani,
  lokalizacijaMreze
};

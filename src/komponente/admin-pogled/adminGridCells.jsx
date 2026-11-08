import './adminGridCells.css';

// Static SVGs avoid running MUI styling hooks for each newly visible cell.
function BoltOutlinedIcon(props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}><path d={"M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21"} /></svg>;
}

function WaterDropOutlinedIcon(props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}><path d={"M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8m0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2m-4.17-6c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12-.08-.45.28-.87.74-.87"} /></svg>;
}

function CalendarTodayOutlinedIcon(props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}><path d={"M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 18H4V10h16zm0-13H4V5h16z"} /></svg>;
}

function CheckCircleOutlineIcon(props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}><path d={"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"} /></svg>;
}

function RadioButtonUncheckedIcon(props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}><path d={"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"} /></svg>;
}

function HomeOutlinedIcon(props) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" {...props}><path d={"m12 5.69 5 4.5V18h-2v-6H9v6H7v-7.81zM12 3 2 12h3v8h6v-6h2v6h6v-8h3z"} /></svg>;
}

// These read-only cells use native markup: scrolling must not run the MUI styling
// system for every label. Editors remain the grid's existing MUI components.
export function renderDenarCelica({ value }) {
  return <span className="grid-money">{Number(value ?? 0).toFixed(2)} <span aria-hidden="true">€</span></span>;
}

export function renderObdobjeCelica({ value }) {
  return <span className="grid-badge grid-period">{value}</span>;
}

export function renderSobaCelica({ row }) {
  return <span className="grid-cell-stack grid-room">
    <span className="grid-cell-line"><HomeOutlinedIcon className="grid-cell-icon grid-muted" /><strong>{row.soba ?? '-'}</strong></span>
    <span className="grid-house">{row.tip_hise ?? '-'}</span>
  </span>;
}

function ReadingCell({ row, value, water = false }) {
  const Icon = water ? WaterDropOutlinedIcon : BoltOutlinedIcon;
  const missing = water && value == null;
  return <span className="grid-cell-stack grid-reading">
    <span className="grid-cell-line">
      <Icon className={`grid-cell-icon ${water ? 'grid-blue' : 'grid-amber'}`} />
      <span className="grid-muted">{Number((water ? row.stanje_vode_prej : row.stanje_elektrike_prej) ?? 0)}</span>
      <span className="grid-arrow">→</span>
      <strong>{missing ? '—' : Number(value ?? 0)}</strong>
    </span>
    {missing ? <span className="grid-badge grid-missing">ni števca</span> :
      <span className={`grid-badge ${water ? 'grid-water-badge' : 'grid-energy-badge'}`}>Δ {Number((water ? row.poraba_vode : row.poraba_elektrike) ?? 0)} {water ? 'm³' : 'kWh'}</span>}
  </span>;
}

export function renderElektrikaCelica(params) {
  return <ReadingCell {...params} />;
}

export function renderVodaCelica(params) {
  return <ReadingCell {...params} water />;
}

export function renderStrosekEnergijeCelica({ row }) {
  const electricity = Number(row.strosek_elektrike ?? 0);
  const water = Number(row.strosek_vode ?? 0);
  return <span className="grid-cell-stack grid-energy-cost">
    <span className="grid-cell-line"><BoltOutlinedIcon className="grid-cell-icon grid-amber" /><span className="grid-energy-label">E</span><strong>{electricity.toFixed(2)} €</strong></span>
    <span className="grid-cell-line"><WaterDropOutlinedIcon className="grid-cell-icon grid-blue" /><span className="grid-energy-label">V</span><strong>{water.toFixed(2)} €</strong></span>
    <strong className="grid-energy-total">{(electricity + water).toFixed(2)} €</strong>
  </span>;
}

export function renderSkupajCelica({ value }) {
  return <strong className="grid-money grid-total">{Number(value ?? 0).toFixed(2)} €</strong>;
}

export function renderStatusCelica({ value }) {
  const Icon = value ? CheckCircleOutlineIcon : RadioButtonUncheckedIcon;
  return <span className={`grid-badge grid-cell-line ${value ? 'grid-confirmed' : 'grid-energy-badge'}`}>
    <Icon className="grid-cell-icon" />{value ? 'Potrjeno' : 'Odprto'}
  </span>;
}

export function renderDatumiCelica({ row }) {
  const confirmed = Boolean(row.datum_placila_format);
  const Icon = confirmed ? CheckCircleOutlineIcon : RadioButtonUncheckedIcon;
  return <span className="grid-cell-stack grid-dates">
    <span className="grid-cell-line grid-muted"><CalendarTodayOutlinedIcon className="grid-cell-icon" />{row.datum_vnosa_format ?? '—'}</span>
    <span className={`grid-cell-line ${confirmed ? 'grid-green' : 'grid-amber'}`}><Icon className="grid-cell-icon" /><strong>{row.datum_placila_format ?? 'ni potrjeno'}</strong></span>
  </span>;
}

export function renderOdcitekCelica({ value, field }) {
  const previous = field.endsWith('_prej');
  const water = field.startsWith('stanje_vode');
  return <span className={`grid-meter ${previous ? 'grid-muted' : water ? 'grid-water-value' : 'grid-energy-value'}`}>{value ?? '—'}</span>;
}

const ACTION_PATHS = {"edit": ["m14.06 9.02.92.92L5.92 19H5v-.92zM17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"], "done": ["m14.06 9.02.92.92-1.11 1.11 1.41 1.41 2.52-2.52-3.75-3.75-2.52 2.52 1.41 1.41zm6.65-1.98c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75zM2.81 2.81 1.39 4.22l7.32 7.32L3 17.25V21h3.75l5.71-5.71 7.32 7.32 1.41-1.41zM5.92 19H5v-.92l5.13-5.13.92.92z"], "delete": ["M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8zm7.5-5-1-1h-5l-1 1H5v2h14V4z"]};

export function GridActionIcon({ kind }) {
  return <svg className="grid-action-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{ACTION_PATHS[kind].map((d) => <path key={d} d={d} />)}</svg>;
}

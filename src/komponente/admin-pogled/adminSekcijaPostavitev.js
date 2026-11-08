export const ADMIN_SEKCIJA_CARD_SX = {};

export const ADMIN_SEKCIJA_CONTENT_SX = {};

export const ADMIN_SEKCIJA_STACK_SX = {};

// Table pages share a bounded flex chain from the viewport to the grid.
export const ADMIN_TABELA_CARD_SX = {
  flex: 1, display: 'flex', width: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden'
};

export const ADMIN_TABELA_CONTENT_SX = {
  flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, minWidth: 0,
  p: { xs: 1.5, md: 2 },
  '&:last-child': { pb: { xs: 1.5, md: 2 } }
};

export const ADMIN_TABELA_STACK_SX = {
  flex: 1, width: '100%', minHeight: 0, minWidth: 0,
  '& > *': { flexShrink: 0 }
};

// Keep the table and its editor in bounded tracks, including on small screens.
export const ADMIN_GRID_FLEKS_SX = {
  flex: '1 1 0%', minHeight: 0, minWidth: 0,
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 360px' },
  gridTemplateRows: { xs: 'minmax(0, 40%) minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
  '& > .MuiGrid-root': {
    width: 'auto', maxWidth: 'none', flexBasis: 'auto', minWidth: 0, minHeight: 0
  },
  '& > .MuiGrid-root:first-child': { gridRow: { xs: 2, md: 1 }, gridColumn: 1 },
  '& > .MuiGrid-root:last-child': { gridRow: 1, gridColumn: { xs: 1, md: 2 }, overflowY: 'auto' }
};

export const ADMIN_GRID_ITEM_FLEKS_SX = {
  display: 'flex', minWidth: 0, minHeight: 0
};

export const ADMIN_TABELA_FLEKS_SX = {
  flex: '1 1 0%', minHeight: 0, minWidth: 0,
  width: '100%', height: 'auto', display: 'flex', overflow: 'hidden'
};

export const ADMIN_DATAGRID_FLEKS_SX = {
  flex: 1, minHeight: 0, minWidth: 0, height: '100%',
  '& .MuiDataGrid-footerContainer': { minHeight: 52, flexShrink: 0 },
  '& .MuiDataGrid-row': { contain: 'layout style paint' }
};

// Shared panel and field styles for inline admin editors.
export const ADMIN_OBRAZEC_PANEL_SX = {
  width: '100%', minWidth: 0,
  border: '1px solid', borderColor: 'divider', borderRadius: 1,
  p: 1.5, backgroundColor: 'background.paper'
};

export const ADMIN_KOMPAKTNA_POLJA_SX = {
  '& .MuiInputLabel-root': { fontSize: '0.8rem' },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '0.74rem' },
  '& .MuiInputBase-input': { fontSize: '0.82rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
  '& .MuiFormControlLabel-label': { fontSize: '0.82rem' },
  '& .MuiChip-label': { fontSize: '0.72rem' },
  '& .MuiButton-root': { fontSize: '0.76rem' }
};

// Notes and notifications use the same page frame, with a composer beside the list.
export const ADMIN_SEZNAM_POSTAVITEV_SX = {
  flex: '1 1 0%', minHeight: 0, minWidth: 0,
  display: 'grid', gap: 2,
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 440px) minmax(0, 1fr)' },
  gridTemplateRows: { xs: 'minmax(0, 40%) minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
  '& > form': { minHeight: 0, overflowY: 'auto', maxHeight: '100%' }
};

export const ADMIN_SEZNAM_PANEL_SX = {
  minHeight: 0, minWidth: 0, overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
  '& > *': { flexShrink: 0 }
};

export const ADMIN_SEZNAM_SCROLL_SX = {
  flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pr: 0.5
};

// Add/edit dialogs use the screen edges on phones and keep actions clear of the home indicator.
export const ADMIN_DIALOG_CONTENT_SX = {
  px: { xs: 2, sm: 3 }, py: 2
};

export const ADMIN_DIALOG_ACTIONS_SX = {
  px: { xs: 2, sm: 3 }, py: 1.5,
  pb: 'max(12px, env(safe-area-inset-bottom))', flexShrink: 0
};

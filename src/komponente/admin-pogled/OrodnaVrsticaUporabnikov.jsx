import { Badge, Box, Button, Tooltip } from '@mui/material';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  QuickFilter,
  QuickFilterControl,
  Toolbar,
  ToolbarButton,
  useGridApiContext
} from '@mui/x-data-grid';

const FILTRI_POGODBE = [
  { value: null, label: 'Vse' },
  { value: 'aktivna', label: 'Aktivna' },
  { value: 'kmalu', label: 'Poteče v 30 dneh' },
  { value: 'potekla', label: 'Potekla' }
];

export default function OrodnaVrsticaUporabnikov({ filterPogodbe, setFilterPogodbe, stetjePogodb, steviloUporabnikov }) {
  const apiRef = useGridApiContext();
  const stolpciLabel = apiRef.current.getLocaleText('toolbarColumns');
  const filtriLabel = apiRef.current.getLocaleText('toolbarFilters');
  const iskanjeLabel = apiRef.current.getLocaleText('toolbarQuickFilterLabel');

  return (
    <Toolbar
      aria-label="Orodja in filtri uporabnikov"
      render={<Box sx={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, gap: 0.75,
        minHeight: 44, px: 1.25, py: 0.75,
        borderBottom: '1px solid', borderColor: 'divider'
      }} />}
    >
      {FILTRI_POGODBE.map(({ value, label }) => (
        <ToolbarButton
          key={value ?? 'vse'}
          aria-pressed={filterPogodbe === value}
          onClick={() => setFilterPogodbe(filterPogodbe === value ? null : value)}
          render={
            <Button
              size="small"
              color="primary"
              variant={filterPogodbe === value ? 'contained' : 'text'}
            >
              {label} ({value === null ? steviloUporabnikov : stetjePogodb[value]})
            </Button>
          }
        />
      ))}
      <Box sx={{ flex: 1 }} />
      <Tooltip title={stolpciLabel}>
        <ColumnsPanelTrigger render={<ToolbarButton aria-label={stolpciLabel} />}>
          <ViewColumnOutlinedIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>
      <Tooltip title={filtriLabel}>
        <FilterPanelTrigger render={(props, state) => (
          <ToolbarButton {...props} aria-label={filtriLabel}>
            <Badge badgeContent={state.filterCount} color="primary">
              <FilterListOutlinedIcon fontSize="small" />
            </Badge>
          </ToolbarButton>
        )} />
      </Tooltip>
      <QuickFilter expanded debounceMs={300}>
        <QuickFilterControl
          placeholder={apiRef.current.getLocaleText('toolbarQuickFilterPlaceholder')}
          slotProps={{ htmlInput: { role: 'searchbox', 'aria-label': iskanjeLabel } }}
          sx={{ width: { xs: 150, sm: 180 }, '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
        />
      </QuickFilter>
    </Toolbar>
  );
}

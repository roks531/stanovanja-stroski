import { useState } from 'react';
import { Badge, Box, IconButton, Tooltip } from '@mui/material';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import {
  ColumnsPanelTrigger, FilterPanelTrigger, QuickFilter, QuickFilterControl,
  Toolbar, ToolbarButton, useGridApiContext
} from '@mui/x-data-grid';
import SearchableSelect from '../SearchableSelect';
import { ADMIN_KOMPAKTNA_POLJA_SX } from './adminSekcijaPostavitev';

export default function OrodnaVrsticaObracunov({
  filterObracuni, setFilterObracuni, moznostiFilterSobe,
  moznostiFilterUporabniki, imenaMesecov, letaObracunov
}) {
  const apiRef = useGridApiContext();
  const [iskanjePonastavitev, setIskanjePonastavitev] = useState(0);
  const stolpciLabel = apiRef.current.getLocaleText('toolbarColumns');
  const filtriLabel = apiRef.current.getLocaleText('toolbarFilters');
  const iskanjeLabel = apiRef.current.getLocaleText('toolbarQuickFilterLabel');

  return (
    <Toolbar
      aria-label="Orodja in filtri obračunov"
      render={<Box sx={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, gap: 1,
        px: 1.25, py: 1.25, borderBottom: '1px solid', borderColor: 'divider'
      }} />}
    >
      <Box role="group" aria-label="Filtri obračunov" sx={{
        ...ADMIN_KOMPAKTNA_POLJA_SX,
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1,
        flex: '1 1 744px', minWidth: 0
      }}>
        <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 190 } }}>
          <SearchableSelect
            label="Soba"
            value={filterObracuni.soba_id}
            onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, soba_id: novaVrednost }))}
            options={[
              { value: '', label: 'Vse sobe' },
              ...moznostiFilterSobe.map((soba) => ({ value: soba.id, label: soba.ime }))
            ]}
          />
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 190 } }}>
          <SearchableSelect
            label="Najemnik"
            value={filterObracuni.uporabnik_id}
            onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, uporabnik_id: novaVrednost }))}
            options={[
              { value: '', label: 'Vsi najemniki' },
              ...moznostiFilterUporabniki.map((uporabnik) => ({ value: uporabnik.id, label: uporabnik.ime }))
            ]}
          />
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 148 } }}>
          <SearchableSelect
            label="Mesec"
            value={filterObracuni.mesec}
            onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, mesec: novaVrednost }))}
            options={[
              { value: '', label: 'Vsi' },
              ...imenaMesecov.map((ime, idx) => ({ value: idx + 1, label: ime }))
            ]}
          />
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 148 }, flexShrink: 0 }}>
          <SearchableSelect
            label="Leto"
            value={filterObracuni.leto}
            onChange={(novaVrednost) => setFilterObracuni((prej) => ({ ...prej, leto: novaVrednost }))}
            options={[
              { value: '', label: 'Vsa' },
              ...letaObracunov.map((leto) => ({ value: leto, label: String(leto) }))
            ]}
          />
        </Box>
        <Tooltip title="Počisti filtre" arrow>
          <IconButton
            size="small"
            aria-label="Počisti filtre"
            sx={{ width: 36, height: 36, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            onClick={() => {
              setFilterObracuni({
                soba_id: '',
                uporabnik_id: '',
                mesec: '',
                leto: ''
              });
              apiRef.current.setFilterModel({ items: [], quickFilterValues: [] });
              // Remount also cancels a search still waiting for its debounce.
              setIskanjePonastavitev((prej) => prej + 1);
            }}
          >
            <FilterAltOffOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto', flexShrink: 0 }}>
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
        <QuickFilter key={iskanjePonastavitev} expanded debounceMs={300}>
          <QuickFilterControl
            placeholder={apiRef.current.getLocaleText('toolbarQuickFilterPlaceholder')}
            slotProps={{ htmlInput: { role: 'searchbox', 'aria-label': iskanjeLabel } }}
            sx={{ width: { xs: 150, sm: 180 }, '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
          />
        </QuickFilter>
      </Box>
    </Toolbar>
  );
}

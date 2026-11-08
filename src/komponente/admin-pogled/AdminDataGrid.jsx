import { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ADMIN_DATAGRID_FLEKS_SX } from './adminSekcijaPostavitev';

/** Data columns share the available space; utility columns keep their button widths. */
export default function AdminDataGrid({ columns, sx, ...props }) {
  const slog = useMemo(
    () => [ADMIN_DATAGRID_FLEKS_SX, ...(Array.isArray(sx) ? sx : [sx])],
    [sx]
  );
  const raztegljiviStolpci = useMemo(() => columns.map((izvirniStolpec) => {
    // Custom cell content needs flex display for MUI's vertical centering.
    const stolpec = izvirniStolpec.renderCell
      ? { display: 'flex', ...izvirniStolpec }
      : izvirniStolpec;
    if (stolpec.flex === 0 || stolpec.type === 'actions' || stolpec.headerName === '' || stolpec.field.startsWith('akcije_')) {
      return stolpec;
    }
    const { width, maxWidth, ...ostalo } = stolpec;
    return {
      ...ostalo,
      minWidth: stolpec.minWidth ?? width ?? 100,
      flex: stolpec.flex || (width ?? stolpec.minWidth ?? 100) / 100
    };
  }), [columns]);

  return (
    <DataGrid
      density="compact"
      columnHeaderHeight={48}
      rowHeight={66}
      disableRowSelectionOnClick
      // Pre-render about a screen of rows so wheel/trackpad scrolling has content
      // ready before it enters the viewport. Keep both axes virtualized.
      rowBufferPx={Math.max(600, (props.rowHeight ?? 66) * 8)}
      columnBufferPx={240}
      {...props}
      columns={raztegljiviStolpci}
      sx={slog}
    />
  );
}

import { Autocomplete, Box, IconButton, TextField, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Poenotimo primerjavo številskih/niznih ID-jev, da izbrana oznaka ostane vidna tudi ob menjavi tipa vrednosti.
function enakaVrednost(a, b) {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  size = 'small',
  fullWidth = true,
  helperText,
  placeholder,
  required = false,
  disableClearable = false,
  disabled = false,
  infoText,
  sx
}) {
  const seznam = options ?? [];
  const izbran = seznam.find((opt) => enakaVrednost(opt.value, value)) ?? null;

  return (
    <Box
      sx={[
        {
          position: 'relative',
          width: fullWidth ? '100%' : 'auto',
          minWidth: 0,
          '& .MuiAutocomplete-root': {
            width: fullWidth ? '100%' : 'auto'
          },
          '& .MuiFormControl-root': {
            width: fullWidth ? '100%' : 'auto'
          }
        },
        sx
      ]}
    >
      <Autocomplete
        options={seznam}
        value={izbran}
        onChange={(_, novaVrednost) => onChange(novaVrednost ? novaVrednost.value : '')}
        getOptionLabel={(option) => String(option?.label ?? '')}
        isOptionEqualToValue={(option, izbrana) => enakaVrednost(option.value, izbrana.value)}
        fullWidth={fullWidth}
        disableClearable={disableClearable}
        disabled={disabled}
        sx={[
          {
            width: fullWidth ? '100%' : undefined
          },
          infoText
            ? {
                '& .MuiInputBase-root': {
                  pr: 4
                }
              }
            : null
        ]}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            size={size}
            fullWidth={fullWidth}
            helperText={helperText}
            placeholder={placeholder}
            required={required}
          />
        )}
      />
      {infoText ? (
        <Tooltip title={infoText}>
          <IconButton
            type="button"
            size="small"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            sx={{
              position: 'absolute',
              top: 7,
              right: 28,
              zIndex: 2,
              p: 0.2,
              color: 'text.secondary'
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: '0.95rem' }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}

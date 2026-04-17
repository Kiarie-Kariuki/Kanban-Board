import { createTheme, alpha } from '@mui/material/styles';

const defaultTheme = createTheme();

const customShadows = [...defaultTheme.shadows];

export const brand = {
  50: 'hsl(217, 100%, 97%)',
  100: 'hsl(217, 100%, 94%)',
  200: 'hsl(217, 98%, 85%)',
  300: 'hsl(217, 97%, 70%)',
  400: 'hsl(217, 95%, 54%)',
  500: 'hsl(217, 92%, 46%)',
  600: 'hsl(217, 90%, 38%)',
  700: 'hsl(217, 88%, 30%)',
  800: 'hsl(217, 85%, 20%)',
  900: 'hsl(217, 82%, 12%)',
};

export const gray = {
  50: 'hsl(220, 50%, 98%)',
  100: 'hsl(220, 40%, 96%)',
  200: 'hsl(220, 35%, 91%)',
  300: 'hsl(220, 30%, 84%)',
  400: 'hsl(220, 20%, 70%)',
  500: 'hsl(220, 15%, 55%)',
  600: 'hsl(220, 12%, 42%)',
  700: 'hsl(220, 15%, 28%)',
  800: 'hsl(220, 25%, 12%)',
  900: 'hsl(220, 30%, 4%)',
};

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
};

export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)',
};

export const getDesignTokens = (mode) => {
  customShadows[1] =
    mode === 'dark'
      ? '0 2px 8px 0 rgba(0, 0, 0, 0.4), 0 4px 16px 0 rgba(0, 0, 0, 0.3)'
      : '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 4px 16px 0 rgba(0, 0, 0, 0.1)';
  
  customShadows[2] =
    mode === 'dark'
      ? '0 4px 12px 0 rgba(0, 0, 0, 0.5), 0 8px 24px 0 rgba(0, 0, 0, 0.35)'
      : '0 4px 12px 0 rgba(0, 0, 0, 0.1), 0 8px 24px 0 rgba(0, 0, 0, 0.12)';

  customShadows[3] =
    mode === 'dark'
      ? '0 6px 16px 0 rgba(0, 0, 0, 0.6), 0 12px 32px 0 rgba(0, 0, 0, 0.4)'
      : '0 6px 16px 0 rgba(0, 0, 0, 0.12), 0 12px 32px 0 rgba(0, 0, 0, 0.15)';

  return {
    palette: {
      mode,
      primary: {
        light: brand[200],
        main: brand[500],
        dark: brand[700],
        contrastText: brand[50],
        ...(mode === 'dark' && {
          contrastText: brand[50],
          light: brand[300],
          main: brand[500],
          dark: brand[700],
        }),
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
        ...(mode === 'dark' && {
          contrastText: brand[300],
          light: brand[500],
          main: brand[700],
          dark: brand[900],
        }),
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
        ...(mode === 'dark' && {
          light: orange[400],
          main: orange[500],
          dark: orange[700],
        }),
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
        ...(mode === 'dark' && {
          light: red[400],
          main: red[500],
          dark: red[700],
        }),
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
        ...(mode === 'dark' && {
          light: green[400],
          main: green[500],
          dark: green[700],
        }),
      },
      grey: {
        ...gray,
      },
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 99.5%)',
        paper: 'hsl(220, 40%, 98%)',
        ...(mode === 'dark' && { default: gray[900], paper: 'hsl(220, 30%, 8%)' }),
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
        ...(mode === 'dark' && {
          primary: 'hsl(0, 0%, 100%)',
          secondary: gray[400],
        }),
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
        ...(mode === 'dark' && {
          hover: alpha(gray[600], 0.2),
          selected: alpha(gray[600], 0.3),
        }),
      },
    },
    typography: {
      fontFamily: ['"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"'].join(','),
      h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: defaultTheme.typography.pxToRem(30),
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(16),
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: defaultTheme.typography.pxToRem(14),
        lineHeight: 1.6,
      },
      body2: {
        fontSize: defaultTheme.typography.pxToRem(13),
        lineHeight: 1.6,
      },
      caption: {
        fontSize: defaultTheme.typography.pxToRem(12),
        fontWeight: 500,
        lineHeight: 1.5,
      },
      button: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 600,
        textTransform: 'none',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: customShadows,
  };
};

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        light: brand[200],
        main: brand[500],
        dark: brand[700],
        contrastText: brand[50],
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[600],
        contrastText: gray[50],
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[300], 0.4),
      background: {
        default: 'hsl(0, 0%, 99.5%)',
        paper: 'hsl(220, 40%, 98%)',
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
      },
      action: {
        hover: alpha(gray[200], 0.2),
        selected: `${alpha(gray[200], 0.3)}`,
      },
      baseShadow:
        '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 4px 16px 0 rgba(0, 0, 0, 0.1)',
    },
  },
  dark: {
    palette: {
      primary: {
        contrastText: brand[50],
        light: brand[300],
        main: brand[500],
        dark: brand[700],
      },
      info: {
        contrastText: brand[300],
        light: brand[500],
        main: brand[700],
        dark: brand[900],
      },
      warning: {
        light: orange[400],
        main: orange[500],
        dark: orange[700],
      },
      error: {
        light: red[400],
        main: red[500],
        dark: red[700],
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[700], 0.6),
      background: {
        default: gray[900],
        paper: 'hsl(220, 30%, 8%)',
      },
      text: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: gray[400],
      },
      action: {
        hover: alpha(gray[600], 0.2),
        selected: alpha(gray[600], 0.3),
      },
      baseShadow:
        '0 2px 8px 0 rgba(0, 0, 0, 0.4), 0 4px 16px 0 rgba(0, 0, 0, 0.3)',
    },
  },
};

export const typography = {
  fontFamily: ['"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"'].join(','),
  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(16),
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(14),
    lineHeight: 1.6,
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(13),
    lineHeight: 1.6,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 500,
    lineHeight: 1.5,
  },
  button: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 600,
    textTransform: 'none',
    lineHeight: 1.5,
  },
};

export const shape = {
  borderRadius: 12,
};

const defaultShadows = [
  'none',
  '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 4px 16px 0 rgba(0, 0, 0, 0.1)',
  ...defaultTheme.shadows.slice(2),
];

export const shadows = defaultShadows;
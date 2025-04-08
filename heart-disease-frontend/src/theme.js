import { extendTheme } from '@chakra-ui/react';

// Custom color palette with better light/dark mode support
const colors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  heartRed: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e', // Heart disease indicator
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Healthy indicator
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
};

// Component style overrides for light and dark mode
const components = {
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        boxShadow: props.colorMode === 'dark' ? 'lg' : 'md',
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
      }
    }),
  },
  Button: {
    variants: {
      primary: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.700' : 'brand.600',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.700', 
        },
        transition: 'all 0.2s',
      }),
      secondary: (props) => ({
        bg: 'transparent',
        color: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
        borderWidth: '1px',
        borderColor: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.900' : 'brand.50',
        },
      }),
    },
  },
  Heading: {
    baseStyle: (props) => ({
      color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
    }),
  },
  Text: {
    baseStyle: (props) => ({
      color: props.colorMode === 'dark' ? 'gray.300' : 'gray.700', 
    }),
  },
  Chart: {
    baseStyle: (props) => ({
      bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
      borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
      textColor: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
    }),
  },
};

// Global styles including chart styling for dark/light mode
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
    // Chart styles for Recharts
    '.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line': {
      stroke: props.colorMode === 'dark' ? '#4A5568' : '#E2E8F0',
    },
    '.recharts-text.recharts-cartesian-axis-tick-value': {
      fill: props.colorMode === 'dark' ? '#CBD5E0' : '#4A5568',
    },
    '.recharts-default-tooltip': {
      backgroundColor: props.colorMode === 'dark' ? '#2D3748 !important' : '#FFF !important',
      border: props.colorMode === 'dark' ? '1px solid #4A5568 !important' : '1px solid #E2E8F0 !important',
      color: props.colorMode === 'dark' ? '#CBD5E0 !important' : '#4A5568 !important',
    },
    '.recharts-layer.recharts-polar-angle-axis-tick text': {
      fill: props.colorMode === 'dark' ? '#CBD5E0' : '#4A5568',
    },
    '.recharts-polar-grid-concentric-circle': {
      stroke: props.colorMode === 'dark' ? '#4A5568' : '#E2E8F0',
    },
    '.recharts-polar-grid-concentric-polygon': {
      stroke: props.colorMode === 'dark' ? '#4A5568' : '#E2E8F0',
    },
    '.recharts-legend-item-text': {
      color: props.colorMode === 'dark' ? '#CBD5E0' : '#4A5568',
    }
  }),
};

// Config for the theme
const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Extended theme
const theme = extendTheme({
  colors,
  components,
  styles,
  config,
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
});

export default theme;

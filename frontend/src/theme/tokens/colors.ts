// Neubrutalism v2 - Candy/Cartoon Color Palette

export const colors = {
  candy: {
    yellow: '#FFE566',
    orange: '#FF9F43',
    pink: '#FF6B9D',
    purple: '#A66CFF',
    blue: '#5DADE2',
    cyan: '#00D9C0',
    green: '#7AE582',
    red: '#FF6B6B',
  },
  cream: '#FFFEF5',
  paper: '#FFF9E3',
  ink: '#1A1A2E',
  // Keep neutral scale for text
  neutral: {
    50: '#FFFEF5',
    100: '#FFF9E3',
    200: '#F8F9FA',
    300: '#E9ECEF',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#2D3436',
    900: '#1A1A2E',
  },
} as const;

// Category colors for Neubrutalism - using candy palette backgrounds
// Keys are now category codes (matching backend IngredientCategory)
export const categoryColors: Record<string, { bg: string; text: string; border: string; candy: string }> = {
  vegetable: { bg: '#7AE58230', text: '#1A1A2E', border: '#1A1A2E', candy: '#7AE582' },
  fruit: { bg: '#FF9F4330', text: '#1A1A2E', border: '#1A1A2E', candy: '#FF9F43' },
  meat: { bg: '#FF6B9D30', text: '#1A1A2E', border: '#1A1A2E', candy: '#FF6B9D' },
  seafood: { bg: '#5DADE230', text: '#1A1A2E', border: '#1A1A2E', candy: '#5DADE2' },
  dairy: { bg: '#FFE56630', text: '#1A1A2E', border: '#1A1A2E', candy: '#FFE566' },
  other: { bg: '#A66CFF30', text: '#1A1A2E', border: '#1A1A2E', candy: '#A66CFF' },
  default: { bg: '#FFE56630', text: '#1A1A2E', border: '#1A1A2E', candy: '#FFE566' },
};

export type ColorToken = typeof colors;
export type CategoryColor = typeof categoryColors;

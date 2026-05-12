export const THEME = {
  mint50: '#CBDED3',
  sage400: '#8BA49A',
  sand400: '#D2C49E',
  forest700: '#3B6255',
  bone100: '#E2DFDA',
  cream50: '#F4EFE6',
  ink900: '#1F2A26',
  alertAmber: '#C8923B',
  alertRed: '#A04A3C',
  sun: '#FFF6E5',
  // realistic urban surfaces (derived from palette)
  asphalt: '#2A2D2B',
  pavement: '#9C9588',
  curb: '#E5DFD2',
  laneLine: '#F4E4B8',
  parkGrass: '#9CB89B',
  ground: '#C8C1B3',
  glass: '#B7C2BD',
  brick: '#B59D7C',
  water: '#6BA3C0',
  fog: '#9E8862',
} as const;

export type ThemeColor = keyof typeof THEME;

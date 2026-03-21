export const Colors = {
  light: {
    // ---- Backgrounds ----
    backgroundPrimary: '#FFFAF0', // main background (lightest)
    backgroundSecondary: '#F7F0E0', // section / card backgrounds
    backgroundTertiary: '#F7EFDF', // slight background variation

    // ---- Text and borders ----
    textPrimary: '#06003aff', // primary text colour
    textSecondary: '#5A2E3D', // optional – softer derived tone
    borderColor: '#3A001D', // default border colour
    textHighlight: '#F3D8B4', // for highlights / links
    // ---- State / emphasis colours ----
    accentRed: '#EA3D5C', // highlight / error / delete
    accentRedDark: '#A01538', // dark tone for hover/press
    accentYellow: '#FCCB66', // warning / soft highlight
    accentBlue: '#AEE3F3', // info / focus
    accentGreen: '#BCEBCB', // success / confirmation
    accentOrange: '#FBC19D', // action / energy
    accentPurple: '#CFBDDE', // creative / secondary elements
    accentPink: '#F296B8', // playful / visual support

    // ---- Neutrals ----
    white: '#FFFFFF',
    black: '#111214', // reused from primary text (consistent)
    disabled: '#DEDEDEFF',
  },

  backgroundTextColors: {
    sand: '#F3D8B4',
    sage: '#D8E2DC',
    blush: '#F0C1C1',
    cream: '#EAD7C3',
    mint: '#CDE3D3',
    lilac: '#E9D6EB',
    butter: '#F1E3B6',
    sky: '#D7E4EA',
    peach: '#F5D6C6',
    olive: '#E0E4D9',
  },
}

export const border = {
  size: 1,
  sizeThick: 2,
  radius8: 8,
  radius10: 10,
  radius12: 12,
  radius16: 16,
  shadow: 4,
}

export const spacings = {
  xTiny: 2,
  xSmall: 4,
  small: 8,
  xMedium: 12,
  medium: 16,
  large: 24,
  xLarge: 32,
}

export const font = {
  light: 'Fredoka-Light',
  regular: 'Fredoka-Regular',
  medium: 'Fredoka-Medium',
  semiBold: 'Fredoka-SemiBold',
  bold: 'Fredoka-Bold',
}

export const typography = {
  small: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  medium: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  large: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  xLarge: {
    fontFamily: font.medium,
    fontSize: 18,
    lineHeight: 24,
  },
  xxLarge: {
    fontFamily: font.semiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  xxxLarge: {
    fontFamily: font.bold,
    fontSize: 50,
    lineHeight: 50,
  },
  Large4xl: {
    fontFamily: font.bold,
    fontSize: 80,
    lineHeight: 88,
  },
}

export const textWeight = {
  light: font.light,
  regular: font.regular,
  medium: font.medium,
  semiBold: font.semiBold,
  bold: font.bold,
} as const

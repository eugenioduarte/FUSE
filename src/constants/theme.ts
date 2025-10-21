export const Colors = {
  light: {
    text: '#33323C',
    light_text: '#ECEDF2',
    background: '#ECEDF2',
    primary: '#2996F3',
    secondary: '#FEEAEA',
    tertiary: '#2996F3',
    surface: '#FFFFFF',
    background_color_modal: 'rgba(0,0,0,0.1)',
    grey: '#B0B0B0',
    warning_text: '#f25d4cff',
    disabled: '#dededeff',
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
  radius: 8,
}

export const spacings = {
  xTiny: 2,
  xSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
}

export const font = {
  light: 'Quicksand-Light',
  regular: 'Quicksand-Regular',
  medium: 'Quicksand-Medium',
  semiBold: 'Quicksand-SemiBold',
  bold: 'Quicksand-Bold',
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
}

export const textWeight = {
  light: font.light,
  regular: font.regular,
  medium: font.medium,
  semiBold: font.semiBold,
  bold: font.bold,
} as const

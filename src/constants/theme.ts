export const Colors = {
  light: {
    // ---- Backgrounds ----
    backgroundPrimary: '#FFFAF0', // fundo principal (mais claro)
    backgroundSecondary: '#F7F0E0', // fundo de seções / cartões
    backgroundTertiary: '#F7EFDF', // leve variação do fundo

    // ---- Texto e bordas ----
    textPrimary: '#3A001D', // cor principal do texto
    textSecondary: '#5A2E3D', // opcional – tom mais suave derivado
    borderColor: '#3A001D', // cor padrão de borda

    // ---- Cores de estado / ênfase ----
    accentRed: '#EA3D5C', // destaque / erro / delete
    accentRedDark: '#A01538', // tom escuro para hover/press
    accentYellow: '#FCCB66', // aviso / destaque leve
    accentBlue: '#AEE3F3', // info / foco
    accentGreen: '#BCEBCB', // sucesso / confirmação
    accentOrange: '#FBC19D', // ação / energia
    accentPurple: '#CFBDDE', // elementos criativos / secundários
    accentPink: '#F296B8', // feminino / lúdico / apoio visual

    // ---- Neutros ----
    white: '#FFFFFF',
    black: '#3A001D', // reutilizado do texto primário (consistente)
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
}

export const textWeight = {
  light: font.light,
  regular: font.regular,
  medium: font.medium,
  semiBold: font.semiBold,
  bold: font.bold,
} as const

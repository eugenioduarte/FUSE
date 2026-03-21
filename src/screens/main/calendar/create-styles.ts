import { Colors, spacings } from '@/constants/theme'
import { StyleSheet } from 'react-native'

export const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: Colors.light.backgroundPrimary,
      padding: spacings.medium,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    gridItem: { width: '14.2857%', padding: 2 },
    monthHeader: {
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacings.small,
    },

    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    monthText: {
      color: Colors.light.textPrimary,
      fontWeight: '700',
    },
    monthNavText: {
      color: Colors.light.backgroundPrimary,
      fontWeight: '700',
    },
    dayCell: {
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.black,
    },
    dayCellSelected: { borderColor: color, borderWidth: 2 },

    dayDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: color,
      position: 'absolute',
      bottom: 4,
    },
    addBtn: {
      backgroundColor: Colors.light.backgroundPrimary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },

    emptyText: {
      color: Colors.light.textPrimary,
      opacity: 0.6,
      marginTop: spacings.small,
    },
    card: {
      borderRadius: 10,
      padding: spacings.medium,
      marginBottom: spacings.small,
      borderWidth: 1,
      borderColor: '#3a3a3a',
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    badge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: color,
    },

    desc: { color: '#000', opacity: 0.8, marginTop: 4 },
    meta: { color: '#000', opacity: 0.7, marginTop: 6 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: spacings.small },
    removeText: { color: theme.colors.accentRedDark },
    chevronRotate: { transform: [{ rotate: '180deg' }] },
    monthTitle: {
      marginHorizontal: spacings.medium,
      marginVertical: spacings.medium,
    },
    actionsContainer: { marginTop: spacings.medium },
    addButton: { marginVertical: spacings.medium, alignSelf: 'center' },
  })

export default createStyles

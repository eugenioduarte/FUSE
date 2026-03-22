import { useSyncStatusStore } from '@/store/useSyncStatusStore'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const DOT_COLOR: Record<string, string> = {
  idle: '#22c55e',    // green
  syncing: '#eab308', // yellow
  error: '#ef4444',   // red
  offline: '#9ca3af', // gray
}

export default function SyncIndicator() {
  const status = useSyncStatusStore((s) => s.status)
  if (status === 'idle') return null

  return (
    <View style={styles.wrapper}>
      <View style={[styles.dot, { backgroundColor: DOT_COLOR[status] }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

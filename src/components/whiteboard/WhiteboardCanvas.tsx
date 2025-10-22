import React, { useCallback, useMemo, useRef, useState } from 'react'
import { PanResponder, StyleSheet, Text, TextInput, View } from 'react-native'
import Svg, { Circle, G, Path, Rect } from 'react-native-svg'
import { useWhiteboardStore } from '../../store/useWhiteboardStore'
import type {
  EmojiElement,
  IconElement,
  StrokeElement,
  TextElement,
  WhiteboardElement,
} from '../../types/whiteboard.type'

// Canvas responsible for pan/zoom, drawing, hit tests and rendering
// Simplified MVP: one-finger interaction drives either drawing or moving elements/canvas based on mode

const CANVAS_BG = '#fff'

const WhiteboardCanvas: React.FC = () => {
  const {
    elements,
    mode,
    viewport,
    selectedId,
    setViewport,
    setMode,
    select,
    addStroke,
    appendPointToStroke,
    addText,
    updateText,
    addEmoji,
    addIcon,
    moveElement,
    bringToFront,
    hitTest,
  } = useWhiteboardStore()

  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editingTextValue, setEditingTextValue] = useState('')

  // mode is fully typed from the store

  const activeStrokeId = useRef<string | null>(null)
  const interactionState = useRef<
    | { kind: 'none' }
    | { kind: 'panning'; lastX: number; lastY: number }
    | { kind: 'dragging'; id: string; lastX: number; lastY: number }
    | { kind: 'drawing' }
  >({ kind: 'none' })

  // Utility: convert view coords to canvas coords considering current viewport
  const toCanvas = useCallback(
    (vx: number, vy: number) => ({
      x: (vx - viewport.translateX) / viewport.scale,
      y: (vy - viewport.translateY) / viewport.scale,
    }),
    [viewport.scale, viewport.translateX, viewport.translateY],
  )

  // PanResponder to manage single-touch interactions (draw/drag/pan)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const canvasPt = toCanvas(locationX, locationY)

          if (mode === 'draw') {
            const id = addStroke()
            activeStrokeId.current = id
            appendPointToStroke(id, canvasPt)
            interactionState.current = { kind: 'drawing' }
            return
          }

          if (mode === 'text') {
            const id = addText('Texto', canvasPt)
            setEditingTextId(id)
            setEditingTextValue('Texto')
            select(id)
            bringToFront(id)
            interactionState.current = { kind: 'none' }
            return
          }

          if (mode === 'emoji') {
            const id = addEmoji('😀', canvasPt)
            select(id)
            bringToFront(id)
            setMode('select')
            interactionState.current = {
              kind: 'dragging',
              id,
              lastX: locationX,
              lastY: locationY,
            }
            return
          }

          if (mode === 'icon') {
            const id = addIcon('arrow', canvasPt)
            select(id)
            bringToFront(id)
            setMode('select')
            interactionState.current = {
              kind: 'dragging',
              id,
              lastX: locationX,
              lastY: locationY,
            }
            return
          }

          // select mode: decide if tapping an element or panning canvas
          const hitId = hitTest(canvasPt.x, canvasPt.y)
          if (hitId) {
            select(hitId)
            bringToFront(hitId)
            interactionState.current = {
              kind: 'dragging',
              id: hitId,
              lastX: locationX,
              lastY: locationY,
            }
          } else {
            select(null)
            interactionState.current = {
              kind: 'panning',
              lastX: locationX,
              lastY: locationY,
            }
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          const { moveX, moveY } = gestureState
          const cur = interactionState.current
          if (cur.kind === 'drawing' && activeStrokeId.current) {
            const { locationX, locationY } = evt.nativeEvent
            const pt = toCanvas(locationX, locationY)
            appendPointToStroke(activeStrokeId.current, pt)
            return
          }
          if (cur.kind === 'dragging') {
            // Move element by delta adjusted by scale
            const deltaX = (moveX - cur.lastX) / viewport.scale
            const deltaY = (moveY - cur.lastY) / viewport.scale
            if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
              moveElement(cur.id, deltaX, deltaY)
              interactionState.current = {
                ...cur,
                lastX: moveX,
                lastY: moveY,
              }
            }
            return
          }
          if (cur.kind === 'panning') {
            const deltaX = moveX - cur.lastX
            const deltaY = moveY - cur.lastY
            setViewport({
              translateX: viewport.translateX + deltaX,
              translateY: viewport.translateY + deltaY,
            })
            // Update anchor to reflect absolute moveX/moveY basis
            interactionState.current = {
              kind: 'panning',
              lastX: moveX,
              lastY: moveY,
            }
          }
        },
        onPanResponderRelease: () => {
          interactionState.current = { kind: 'none' }
          activeStrokeId.current = null
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [
      mode,
      viewport.translateX,
      viewport.translateY,
      viewport.scale,
      addStroke,
      appendPointToStroke,
      addText,
      addEmoji,
      addIcon,
      select,
      bringToFront,
      moveElement,
      setViewport,
      setMode,
      hitTest,
      toCanvas,
    ],
  )

  // Pinch-to-zoom using two touches (basic): compute scale based on distance
  const pinchState = useRef<{
    initialDistance: number
    initialScale: number
  } | null>(null)

  const handleTouchMove = (e: any) => {
    const touches = e.nativeEvent.touches
    if (touches.length === 2) {
      const [t1, t2] = touches
      const dx = t2.pageX - t1.pageX
      const dy = t2.pageY - t1.pageY
      const dist = Math.hypot(dx, dy)
      if (!pinchState.current) {
        pinchState.current = {
          initialDistance: dist,
          initialScale: viewport.scale,
        }
        return
      }
      const scale = Math.max(
        0.2,
        Math.min(
          4,
          (dist / pinchState.current.initialDistance) *
            pinchState.current.initialScale,
        ),
      )
      setViewport({ scale })
    }
  }

  const handleTouchEnd = (e: any) => {
    const touches = e.nativeEvent.touches
    if (touches.length < 2) {
      pinchState.current = null
    }
  }

  // Inline text editor overlay
  const renderTextEditor = () => {
    if (!editingTextId) return null
    const el = elements.find((e) => e.id === editingTextId) as
      | TextElement
      | undefined
    if (!el) return null
    return (
      <TextInput
        value={editingTextValue}
        onChangeText={(t) => setEditingTextValue(t)}
        onSubmitEditing={() => {
          updateText(editingTextId, editingTextValue)
          setEditingTextId(null)
        }}
        onBlur={() => {
          updateText(editingTextId, editingTextValue)
          setEditingTextId(null)
        }}
        autoFocus
        style={{
          position: 'absolute',
          left: viewport.translateX + el.x * viewport.scale,
          top: viewport.translateY + el.y * viewport.scale,
          minWidth: 120,
          padding: 6,
          borderWidth: 1,
          borderColor: '#cbd5e1',
          borderRadius: 6,
          backgroundColor: '#fff',
        }}
        placeholder="Digite o texto"
      />
    )
  }

  const renderElement = (el: WhiteboardElement, idx: number) => {
    const isSelected = selectedId === el.id
    switch (el.type) {
      case 'stroke':
        return renderStroke(el, idx, isSelected)
      case 'text':
        return renderText(el, idx, isSelected)
      case 'emoji':
        return renderEmoji(el, idx, isSelected)
      case 'icon':
        return renderIcon(el, idx, isSelected)
      default:
        return null
    }
  }

  const renderStroke = (el: StrokeElement, _idx: number, _sel: boolean) => {
    const d = pointsToPath(el.points)
    return (
      <Path
        key={el.id}
        d={d}
        stroke={el.color}
        strokeWidth={el.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }

  const renderText = (el: TextElement, idx: number, sel: boolean) => {
    return (
      <View key={el.id} style={{ position: 'absolute', left: el.x, top: el.y }}>
        {sel && <View style={styles.selectionBox} />}
        <Text style={{ fontSize: el.fontSize, color: '#111827' }}>
          {el.text}
        </Text>
      </View>
    )
  }

  const renderEmoji = (el: EmojiElement, idx: number, sel: boolean) => {
    return (
      <View key={el.id} style={{ position: 'absolute', left: el.x, top: el.y }}>
        {sel && <View style={styles.selectionBox} />}
        <Text style={{ fontSize: el.fontSize }}>{el.emoji}</Text>
      </View>
    )
  }

  const renderIcon = (el: IconElement, _idx: number, sel: boolean) => {
    const size = el.size
    const half = size / 2
    return (
      <View
        key={el.id}
        style={{
          position: 'absolute',
          left: el.x,
          top: el.y,
          width: size,
          height: size,
        }}
      >
        {sel && <View style={styles.selectionBox} />}
        <Svg width={size} height={size}>
          {el.shape === 'circle' && (
            <Circle
              cx={half}
              cy={half}
              r={half - (el.strokeWidth || 0)}
              stroke={el.color}
              strokeWidth={el.strokeWidth}
              fill={el.fill}
            />
          )}
          {el.shape === 'rect' && (
            <Rect
              x={0}
              y={0}
              width={size}
              height={size}
              stroke={el.color}
              strokeWidth={el.strokeWidth}
              fill={el.fill}
              rx={8}
            />
          )}
          {el.shape === 'arrow' && (
            <G stroke={el.color} strokeWidth={el.strokeWidth}>
              <Path d={`M 8 ${half} L ${size - 16} ${half}`} />
              <Path
                d={`M ${size - 24} ${half - 12} L ${size - 8} ${half} L ${size - 24} ${half + 12}`}
              />
            </G>
          )}
        </Svg>
      </View>
    )
  }

  const pointsToPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return ''
    const [first, ...rest] = pts
    let d = `M ${first.x} ${first.y}`
    for (const p of rest) d += ` L ${p.x} ${p.y}`
    return d
  }

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Transformed content */}
      <View
        style={{
          transform: [
            { translateX: viewport.translateX },
            { translateY: viewport.translateY },
            { scale: viewport.scale },
          ],
          width: '100%',
          height: '100%',
        }}
      >
        {/* SVG layer for strokes */}
        <Svg style={StyleSheet.absoluteFill as any}>
          {elements
            .filter((e) => e.type === 'stroke')
            .map((e, idx) => renderElement(e, idx))}
        </Svg>

        {/* Overlay layer for text / emojis / icons */}
        <View style={StyleSheet.absoluteFill}>
          {elements
            .filter((e) => e.type !== 'stroke')
            .map((e, idx) => renderElement(e, idx))}
        </View>
      </View>

      {renderTextEditor()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CANVAS_BG,
  },
  selectionBox: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 1,
    borderColor: '#60a5fa',
    borderStyle: 'dashed',
    borderRadius: 4,
  },
})

export default WhiteboardCanvas

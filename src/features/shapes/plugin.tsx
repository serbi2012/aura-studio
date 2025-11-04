import type { Plugin } from '@/core/plugin/types'
import type { Artboard, EllipseData, PathData, RectData, Shape } from '@/types/vector'
import { colorToString } from '@/types/vector'
import type Konva from 'konva'
import React, { useEffect, useState } from 'react'
import { Circle, Layer, Path, Rect } from 'react-konva'
import { createShapeStore } from './store'

/**
 * ShapePlugin - Shape 오브젝트 관리 및 렌더링
 */
export const ShapePlugin: Plugin = {
  id: 'shapes',
  name: 'Shape System',
  version: '1.0.0',
  dependencies: ['viewport'],

  async initialize(context) {
    console.log('[ShapePlugin] Initializing...')

    const store = createShapeStore()

    // Shape 명령
    context.registerCommand({
      id: 'shape.add',
      name: 'Add Shape',
      execute: (shape: Shape) => {
        store.getState().addShape(shape)
        context.events.emit('shape:added', { shape })
      },
    })

    context.registerCommand({
      id: 'shape.remove',
      name: 'Remove Shape',
      execute: (shapeId: string) => {
        store.getState().removeShape(shapeId)
        context.events.emit('shape:removed', { shapeId })
      },
    })

    context.registerCommand({
      id: 'shape.update',
      name: 'Update Shape',
      execute: ({ id, updates }: { id: string; updates: Partial<Shape> }) => {
        store.getState().updateShape(id, updates)
        context.events.emit('shape:updated', { id, updates })
      },
    })

    // Selection 명령
    context.registerCommand({
      id: 'shape.select',
      name: 'Select Shape',
      execute: (shapeId: string) => {
        store.getState().selectShape(shapeId)
        context.events.emit('shape:selected', { shapeId })
      },
    })

    context.registerCommand({
      id: 'shape.clear-selection',
      name: 'Clear Selection',
      execute: () => {
        store.getState().clearSelection()
        context.events.emit('shape:selection-cleared')
      },
    })

    // Artboard 명령
    context.registerCommand({
      id: 'artboard.add',
      name: 'Add Artboard',
      execute: (artboard: Artboard) => {
        store.getState().addArtboard(artboard)
        context.events.emit('artboard:added', { artboard })
      },
    })

    // Konva 렌더러 컴포넌트
    const ShapeRenderer: React.FC = () => {
      const [shapes, setShapes] = useState<Shape[]>([])
      const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
      const [artboards, setArtboards] = useState<Artboard[]>([])

      useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
          const newShapes = Array.from(state.shapes.values())
          const newArtboards = Array.from(state.artboards.values())
          console.log('[ShapeRenderer] State updated:', {
            shapes: newShapes.length,
            artboards: newArtboards.length,
          })
          setShapes(newShapes)
          setSelectedIds(new Set(state.selectedIds))
          setArtboards(newArtboards)
        })

        // 초기값 설정
        const initialShapes = store.getState().getAllShapes()
        const initialArtboards = Array.from(store.getState().artboards.values())
        console.log('[ShapeRenderer] Initial state:', {
          shapes: initialShapes.length,
          artboards: initialArtboards.length,
        })
        setShapes(initialShapes)
        setSelectedIds(new Set(store.getState().selectedIds))
        setArtboards(initialArtboards)

        return unsubscribe
      }, [])

      const renderShape = (shape: Shape) => {
        const isSelected = selectedIds.has(shape.id)
        const commonProps = {
          key: shape.id,
          id: shape.id,
          x: shape.transform.x,
          y: shape.transform.y,
          scaleX: shape.transform.scaleX,
          scaleY: shape.transform.scaleY,
          rotation: shape.transform.rotation,
          opacity: shape.opacity,
          visible: shape.visible,
          draggable: !shape.locked && isSelected,
          stroke: isSelected ? '#0066FF' : undefined,
          strokeWidth: isSelected ? 2 / (context.engine.getStage()?.scaleX() || 1) : 0,
          onClick: () => {
            if (!shape.locked) {
              store.getState().selectShape(shape.id)
            }
          },
          onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
            store.getState().updateShape(shape.id, {
              transform: {
                ...shape.transform,
                x: e.target.x(),
                y: e.target.y(),
              },
            })
          },
        }

        switch (shape.type) {
          case 'rect': {
            const data = shape.data as RectData
            return (
              <Rect
                {...commonProps}
                width={data.width}
                height={data.height}
                cornerRadius={data.cornerRadius || 0}
                fill={shape.fill?.type === 'solid' ? colorToString(shape.fill.color) : undefined}
                stroke={
                  shape.stroke
                    ? colorToString(shape.stroke.color)
                    : isSelected
                      ? '#0066FF'
                      : undefined
                }
                strokeWidth={shape.stroke?.width || (isSelected ? 2 : 0)}
              />
            )
          }

          case 'ellipse': {
            const data = shape.data as EllipseData
            return (
              <Circle
                {...commonProps}
                radius={Math.max(data.radiusX, data.radiusY)}
                scaleX={
                  (data.radiusX / Math.max(data.radiusX, data.radiusY)) * shape.transform.scaleX
                }
                scaleY={
                  (data.radiusY / Math.max(data.radiusX, data.radiusY)) * shape.transform.scaleY
                }
                fill={shape.fill?.type === 'solid' ? colorToString(shape.fill.color) : undefined}
                stroke={
                  shape.stroke
                    ? colorToString(shape.stroke.color)
                    : isSelected
                      ? '#0066FF'
                      : undefined
                }
                strokeWidth={shape.stroke?.width || (isSelected ? 2 : 0)}
              />
            )
          }

          case 'path': {
            const data = shape.data as PathData
            const pathString = createSVGPath(data)

            return (
              <Path
                {...commonProps}
                data={pathString}
                fill={shape.fill?.type === 'solid' ? colorToString(shape.fill.color) : undefined}
                stroke={
                  shape.stroke
                    ? colorToString(shape.stroke.color)
                    : isSelected
                      ? '#0066FF'
                      : undefined
                }
                strokeWidth={shape.stroke?.width || (isSelected ? 2 : 0)}
                lineCap={shape.stroke?.cap || 'butt'}
                lineJoin={shape.stroke?.join || 'miter'}
              />
            )
          }

          default:
            return null
        }
      }

      const renderArtboard = (artboard: Artboard) => {
        console.log('[ShapeRenderer] Rendering artboard:', artboard)
        return (
          <React.Fragment key={artboard.id}>
            {/* 아트보드 그림자 (깊이감) */}
            <Rect
              x={artboard.x + 4}
              y={artboard.y + 4}
              width={artboard.width}
              height={artboard.height}
              fill="rgba(0, 0, 0, 0.15)"
              cornerRadius={2}
              listening={false}
            />

            {/* 아트보드 배경 */}
            <Rect
              x={artboard.x}
              y={artboard.y}
              width={artboard.width}
              height={artboard.height}
              fill={colorToString(artboard.backgroundColor)}
              cornerRadius={2}
              listening={false}
            />

            {/* 아트보드 테두리 (더 진하고 두껍게) */}
            <Rect
              x={artboard.x}
              y={artboard.y}
              width={artboard.width}
              height={artboard.height}
              stroke="#333333"
              strokeWidth={2}
              cornerRadius={2}
              listening={false}
            />

            {/* 아트보드 이름 */}
            {/* TODO: Text 컴포넌트 추가 */}
          </React.Fragment>
        )
      }

      console.log('[ShapeRenderer] Rendering Layer with:', {
        artboards: artboards.length,
        shapes: shapes.length,
      })

      return (
        <Layer>
          {/* 아트보드 렌더링 */}
          {artboards.map(renderArtboard)}

          {/* Shape 렌더링 */}
          {shapes.map(renderShape)}
        </Layer>
      )
    }

    // React-Konva Layer로 등록
    // App.tsx에서 직접 렌더링하도록 이벤트로 알림
    context.events.emit('shape-renderer:ready', { ShapeRenderer })
    console.log('[ShapePlugin] Emitted shape-renderer:ready')

    // 재요청 시 다시 전송
    context.events.on('request-renderers', () => {
      console.log('[ShapePlugin] Re-emitting shape-renderer:ready')
      context.events.emit('shape-renderer:ready', { ShapeRenderer })
    })

    // Store를 전역에서 접근 가능하게
    context.events.on(
      'shape:get-store',
      (callback: (store: ReturnType<typeof createShapeStore>) => void) => {
        callback(store)
      },
    )

    console.log('[ShapePlugin] Initialized')
  },
}

/**
 * PathData를 SVG 경로 문자열로 변환
 */
function createSVGPath(pathData: PathData): string {
  if (pathData.segments.length === 0) return ''

  let pathString = ''
  const segments = pathData.segments

  // 첫 포인트로 이동
  const firstSegment = segments[0]
  if (!firstSegment) return ''

  pathString += `M ${firstSegment.point.x} ${firstSegment.point.y}`

  // 나머지 세그먼트 처리
  for (let i = 1; i < segments.length; i++) {
    const prevSegment = segments[i - 1]
    const currentSegment = segments[i]

    if (!prevSegment || !currentSegment) continue

    const startX = prevSegment.point.x
    const startY = prevSegment.point.y
    const endX = currentSegment.point.x
    const endY = currentSegment.point.y

    // 핸들이 있으면 cubic bezier, 없으면 직선
    if (prevSegment.handleOut && currentSegment.handleIn) {
      const cp1x = startX + prevSegment.handleOut.x
      const cp1y = startY + prevSegment.handleOut.y
      const cp2x = endX + currentSegment.handleIn.x
      const cp2y = endY + currentSegment.handleIn.y

      pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`
    } else if (prevSegment.handleOut) {
      const cpx = startX + prevSegment.handleOut.x
      const cpy = startY + prevSegment.handleOut.y
      pathString += ` Q ${cpx} ${cpy}, ${endX} ${endY}`
    } else if (currentSegment.handleIn) {
      const cpx = endX + currentSegment.handleIn.x
      const cpy = endY + currentSegment.handleIn.y
      pathString += ` Q ${cpx} ${cpy}, ${endX} ${endY}`
    } else {
      pathString += ` L ${endX} ${endY}`
    }
  }

  // 패스 닫기
  if (pathData.closed) {
    // 마지막 세그먼트에서 첫 세그먼트로
    const lastSegment = segments[segments.length - 1]
    const firstSeg = segments[0]

    if (lastSegment && firstSeg) {
      const startX = lastSegment.point.x
      const startY = lastSegment.point.y
      const endX = firstSeg.point.x
      const endY = firstSeg.point.y

      if (lastSegment.handleOut && firstSeg.handleIn) {
        const cp1x = startX + lastSegment.handleOut.x
        const cp1y = startY + lastSegment.handleOut.y
        const cp2x = endX + firstSeg.handleIn.x
        const cp2y = endY + firstSeg.handleIn.y

        pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`
      } else if (lastSegment.handleOut) {
        const cpx = startX + lastSegment.handleOut.x
        const cpy = startY + lastSegment.handleOut.y
        pathString += ` Q ${cpx} ${cpy}, ${endX} ${endY}`
      } else if (firstSeg.handleIn) {
        const cpx = endX + firstSeg.handleIn.x
        const cpy = endY + firstSeg.handleIn.y
        pathString += ` Q ${cpx} ${cpy}, ${endX} ${endY}`
      }
    }

    pathString += ' Z'
  }

  return pathString
}

import type { Plugin } from '@/core/plugin/types'
import { Button } from '@/shared/components/Button'
import { Tooltip } from '@/shared/components/Tooltip'
import type { RectData, Shape } from '@/types/vector'
import { Circle, Square } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

/**
 * ShapeToolsPlugin - 기본 도형 그리기 도구
 */
export const ShapeToolsPlugin: Plugin = {
  id: 'tools.shapes',
  name: 'Shape Tools',
  version: '1.0.0',
  dependencies: ['shapes', 'viewport'],

  async initialize(context) {
    console.log('[ShapeToolsPlugin] Initializing...')

    let activeToolType: 'rect' | 'ellipse' | null = null
    let isDrawing = false
    let startPoint = { x: 0, y: 0 }
    let currentShapeId: string | null = null

    // 도구 활성화
    const activateTool = (type: 'rect' | 'ellipse') => {
      activeToolType = type
      context.events.emit('tool:activated', { toolId: `shape.${type}` })
    }

    // 도구 비활성화
    const deactivateTool = () => {
      activeToolType = null
      isDrawing = false
      currentShapeId = null
    }

    // 마우스 다운 - 그리기 시작
    context.events.on<{ x: number; y: number }>('canvas:pointer:down', (e) => {
      if (!activeToolType) return

      isDrawing = true
      // React-Konva 사용 시 좌표는 이미 변환된 상태
      const canvasPoint = { x: e.x, y: e.y }
      startPoint = canvasPoint

      // 새 Shape 생성
      const shapeId = crypto.randomUUID()
      currentShapeId = shapeId

      const baseShape: Omit<Shape, 'data'> = {
        id: shapeId,
        type: activeToolType,
        name: activeToolType === 'rect' ? 'Rectangle' : 'Ellipse',
        transform: {
          x: canvasPoint.x,
          y: canvasPoint.y,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          skewX: 0,
          skewY: 0,
        },
        fill: {
          type: 'solid',
          color: { r: 100, g: 150, b: 255, a: 1 },
          opacity: 1,
        },
        stroke: {
          color: { r: 0, g: 0, b: 0, a: 1 },
          width: 2,
          opacity: 1,
          cap: 'butt',
          join: 'miter',
        },
        opacity: 1,
        layerId: 'default',
        locked: false,
        visible: true,
      }

      if (activeToolType === 'rect') {
        const shape: Shape = {
          ...baseShape,
          data: {
            width: 1,
            height: 1,
            cornerRadius: 0,
          } as RectData,
        }
        context.events.emit('shape:add', shape)
      } else if (activeToolType === 'ellipse') {
        const shape: Shape = {
          ...baseShape,
          data: {
            radiusX: 1,
            radiusY: 1,
          },
        }
        context.events.emit('shape:add', shape)
      }
    })

    // 마우스 이동 - 그리기
    context.events.on<{ x: number; y: number }>('canvas:pointer:move', (e) => {
      if (!isDrawing || !currentShapeId || !activeToolType) return

      // React-Konva 사용 시 좌표는 이미 변환된 상태
      const canvasPoint = { x: e.x, y: e.y }

      const width = Math.abs(canvasPoint.x - startPoint.x)
      const height = Math.abs(canvasPoint.y - startPoint.y)
      const x = Math.min(startPoint.x, canvasPoint.x)
      const y = Math.min(startPoint.y, canvasPoint.y)

      if (activeToolType === 'rect') {
        context.events.emit('shape:update', {
          id: currentShapeId,
          updates: {
            transform: {
              x,
              y,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              skewX: 0,
              skewY: 0,
            },
            data: {
              width,
              height,
              cornerRadius: 0,
            },
          },
        })
      } else if (activeToolType === 'ellipse') {
        context.events.emit('shape:update', {
          id: currentShapeId,
          updates: {
            transform: {
              x: x + width / 2,
              y: y + height / 2,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              skewX: 0,
              skewY: 0,
            },
            data: {
              radiusX: width / 2,
              radiusY: height / 2,
            },
          },
        })
      }
    })

    // 마우스 업 - 그리기 완료
    context.events.on('canvas:pointer:up', () => {
      if (isDrawing && currentShapeId) {
        isDrawing = false
        context.events.emit('shape:created', { shapeId: currentShapeId })
        currentShapeId = null
      }
    })

    // Shape 이벤트 -> 명령 실행
    context.events.on<Shape>('shape:add', (shape) => {
      context.pluginManager?.executeCommand('shape.add', shape)
    })

    context.events.on<{ id: string; updates: Partial<Shape> }>(
      'shape:update',
      ({ id, updates }) => {
        context.pluginManager?.executeCommand('shape.update', { id, updates })
      },
    )

    // UI 컴포넌트
    const ShapeToolsUI: React.FC = () => {
      const [activeTool, setActiveTool] = useState<string | null>(null)

      return (
        <div className="flex flex-col gap-1">
          <Tooltip content="사각형 도구 (M)">
            <Button
              size="icon"
              variant={activeTool === 'rect' ? 'default' : 'ghost'}
              onClick={() => {
                if (activeTool === 'rect') {
                  setActiveTool(null)
                  deactivateTool()
                } else {
                  setActiveTool('rect')
                  activateTool('rect')
                }
              }}
              className="w-10 h-10"
            >
              <Square className="h-5 w-5" />
            </Button>
          </Tooltip>

          <Tooltip content="원형 도구 (L)">
            <Button
              size="icon"
              variant={activeTool === 'ellipse' ? 'default' : 'ghost'}
              onClick={() => {
                if (activeTool === 'ellipse') {
                  setActiveTool(null)
                  deactivateTool()
                } else {
                  setActiveTool('ellipse')
                  activateTool('ellipse')
                }
              }}
              className="w-10 h-10"
            >
              <Circle className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>
      )
    }

    // UI 등록
    context.registerSlot('toolbar-left', ShapeToolsUI, 90)

    // 단축키
    context.registerHotkey({
      id: 'tool.rect',
      keys: 'M',
      description: 'Rectangle Tool',
      handler: () => activateTool('rect'),
    })

    context.registerHotkey({
      id: 'tool.ellipse',
      keys: 'L',
      description: 'Ellipse Tool',
      handler: () => activateTool('ellipse'),
    })

    console.log('[ShapeToolsPlugin] Initialized')
  },
}

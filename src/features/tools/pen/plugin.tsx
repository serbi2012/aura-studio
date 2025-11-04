import type { Plugin } from '@/core/plugin/types'
import { Button } from '@/shared/components/Button'
import { Tooltip } from '@/shared/components/Tooltip'
import type { PathData, Shape } from '@/types/vector'
import { Pen } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Layer } from 'react-konva'
import { PathPreview } from './PathPreview'
import { PenTool } from './PenTool'

export const PenToolPlugin: Plugin = {
  id: 'tool.pen',
  name: 'Pen Tool',
  version: '1.0.0',
  dependencies: ['shapes', 'viewport'],

  async initialize(context) {
    console.log('[PenToolPlugin] Initializing...')

    let penTool: PenTool | null = null
    let isActive = false

    const createPenTool = () => {
      return new PenTool({
        onPathComplete: (pathData: PathData) => {
          const shape: Shape = {
            id: crypto.randomUUID(),
            type: 'path',
            name: 'Path',
            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0 },
            fill: { type: 'solid', color: { r: 100, g: 150, b: 255, a: 1 }, opacity: 1 },
            stroke: {
              color: { r: 0, g: 0, b: 0, a: 1 },
              width: 2,
              opacity: 1,
              cap: 'round',
              join: 'round',
            },
            opacity: 1,
            layerId: 'default',
            locked: false,
            visible: true,
            data: pathData,
          }
          context.pluginManager?.executeCommand('shape.add', shape)
          context.events.emit('pen:preview-update', null)
        },
        onPathUpdate: (pathData: PathData) => {
          context.events.emit('pen:preview-update', pathData)
        },
      })
    }

    const activateTool = () => {
      penTool = createPenTool()
      penTool.onActivate()
      isActive = true
    }

    const deactivateTool = () => {
      if (penTool) {
        penTool.onDeactivate()
        penTool = null
      }
      isActive = false
      context.events.emit('pen:preview-update', null)
    }

    context.events.on<{ x: number; y: number }>('canvas:pointer:down', (e) => {
      if (!isActive || !penTool) return
      // React-Konva 사용 시 좌표는 이미 변환된 상태
      penTool.onPointerDown({ x: e.x, y: e.y })
    })

    context.events.on<{ x: number; y: number }>('canvas:pointer:move', (e) => {
      if (!isActive || !penTool) return
      // React-Konva 사용 시 좌표는 이미 변환된 상태
      penTool.onPointerMove({ x: e.x, y: e.y })
    })

    context.events.on<{ x: number; y: number }>('canvas:pointer:up', (e) => {
      if (!isActive || !penTool) return
      // React-Konva 사용 시 좌표는 이미 변환된 상태
      penTool.onPointerUp({ x: e.x, y: e.y })
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isActive && penTool) penTool.onKeyDown(e)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isActive && penTool) penTool.onKeyUp(e)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const PenPreviewLayer: React.FC = () => {
      const [previewPath, setPreviewPath] = useState<PathData | null>(null)
      const [zoom, setZoom] = useState(1)

      // biome-ignore lint/correctness/useExhaustiveDependencies: context는 플러그인 생명주기 동안 안정적
      useEffect(() => {
        const u1 = context.events.on<PathData | null>('pen:preview-update', (path) =>
          setPreviewPath(path),
        )
        const u2 = context.events.on<{ zoom: number }>('viewport:zoom-changed', ({ zoom: z }) =>
          setZoom(z),
        )
        return () => {
          u1()
          u2()
        }
      }, [])

      return (
        <Layer listening={false}>
          <PathPreview pathData={previewPath} zoom={zoom} />
        </Layer>
      )
    }

    context.events.emit('pen-preview:ready', { PenPreviewLayer })

    // 재요청 시 다시 전송
    context.events.on('request-renderers', () => {
      console.log('[PenToolPlugin] Re-emitting pen-preview:ready')
      context.events.emit('pen-preview:ready', { PenPreviewLayer })
    })

    const PenToolUI: React.FC = () => {
      const [active, setActive] = useState(false)
      // biome-ignore lint/correctness/useExhaustiveDependencies: context는 플러그인 생명주기 동안 안정적
      useEffect(() => {
        return context.events.on<{ toolId: string }>('tool:activated', ({ toolId }) => {
          setActive(toolId === 'tool.pen')
        })
      }, [])

      return (
        <Tooltip content="펜 도구 (P)">
          <Button
            size="icon"
            variant={active ? 'default' : 'ghost'}
            onClick={() => {
              if (active) {
                deactivateTool()
                setActive(false)
              } else {
                activateTool()
                setActive(true)
              }
            }}
            className="w-10 h-10"
          >
            <Pen className="h-5 w-5" />
          </Button>
        </Tooltip>
      )
    }

    context.registerSlot('toolbar-left', PenToolUI, 95)
    context.registerHotkey({
      id: 'tool.pen',
      keys: 'P',
      description: 'Pen Tool',
      handler: () => {
        if (isActive) deactivateTool()
        else activateTool()
      },
    })

    console.log('[PenToolPlugin] Initialized')
  },

  async cleanup() {
    console.log('[PenToolPlugin] Cleanup')
  },
}

import type { Plugin } from '@/core/plugin/types'
import { Button } from '@/shared/components/Button'
import { Separator } from '@/shared/components/Separator'
import { Tooltip } from '@/shared/components/Tooltip'
import { Maximize, Minus, Plus } from 'lucide-react'
import type React from 'react'
import { createViewportStore } from './store'

/**
 * ViewportPlugin - 캔버스 뷰포트 관리
 * 줌/팬 기능
 */
export const ViewportPlugin: Plugin = {
  id: 'viewport',
  name: 'Viewport System',
  version: '1.0.0',
  dependencies: [],

  async initialize(context) {
    console.log('[ViewportPlugin] Initializing...')

    const store = createViewportStore()

    // Stage에 transform 적용
    const updateStageTransform = () => {
      const stage = context.engine.getStage()
      if (!stage) return

      const { viewport } = store.getState()
      stage.scale({ x: viewport.zoom, y: viewport.zoom })
      stage.position({ x: viewport.x, y: viewport.y })
      stage.batchDraw()
    }

    // Viewport 변경 시 Stage 업데이트
    store.subscribe(updateStageTransform)

    // 줌 명령
    context.registerCommand({
      id: 'viewport.zoom-in',
      name: 'Zoom In',
      execute: () => {
        store.getState().zoomIn()
        context.events.emit('viewport:zoom-changed', { zoom: store.getState().viewport.zoom })
      },
    })

    context.registerCommand({
      id: 'viewport.zoom-out',
      name: 'Zoom Out',
      execute: () => {
        store.getState().zoomOut()
        context.events.emit('viewport:zoom-changed', { zoom: store.getState().viewport.zoom })
      },
    })

    context.registerCommand({
      id: 'viewport.reset',
      name: 'Reset Zoom',
      execute: () => {
        store.getState().resetZoom()
        context.events.emit('viewport:reset')
      },
    })

    context.registerCommand({
      id: 'viewport.fit',
      name: 'Zoom to Fit',
      execute: () => {
        store.getState().zoomToFit()
        context.events.emit('viewport:fit')
      },
    })

    // 휠 이벤트 (줌)
    context.events.on<{ deltaY: number; x: number; y: number }>('canvas:wheel', (e) => {
      const stage = context.engine.getStage()
      if (!stage) return

      const oldScale = store.getState().viewport.zoom
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - store.getState().viewport.x) / oldScale,
        y: (pointer.y - store.getState().viewport.y) / oldScale,
      }

      const newScale = e.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1
      store.getState().setZoom(newScale)

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      }

      store.getState().setPan(newPos.x, newPos.y)
    })

    // 스페이스바 + 드래그로 팬
    let isPanning = false
    let lastPos = { x: 0, y: 0 }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        isPanning = true
        const stage = context.engine.getStage()
        if (stage) {
          stage.container().style.cursor = 'grab'
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isPanning = false
        const stage = context.engine.getStage()
        if (stage) {
          stage.container().style.cursor = 'default'
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    context.events.on<{ x: number; y: number }>('canvas:pointer:down', (e) => {
      if (isPanning) {
        lastPos = { x: e.x, y: e.y }
        const stage = context.engine.getStage()
        if (stage) {
          stage.container().style.cursor = 'grabbing'
        }
      }
    })

    context.events.on<{ x: number; y: number }>('canvas:pointer:move', (e) => {
      if (isPanning) {
        const dx = e.x - lastPos.x
        const dy = e.y - lastPos.y
        store.getState().pan(dx, dy)
        lastPos = { x: e.x, y: e.y }
      }
    })

    context.events.on('canvas:pointer:up', () => {
      if (isPanning) {
        const stage = context.engine.getStage()
        if (stage) {
          stage.container().style.cursor = 'grab'
        }
      }
    })

    // UI 컨트롤
    const ViewportControls: React.FC = () => {
      const { viewport } = store()
      const zoomPercent = Math.round(viewport.zoom * 100)

      return (
        <div className="flex items-center gap-1">
          <Tooltip content="축소 (Ctrl+-)">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => store.getState().zoomOut()}
              className="h-7 w-7"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </Tooltip>

          <div className="min-w-16 text-center text-xs font-medium">{zoomPercent}%</div>

          <Tooltip content="확대 (Ctrl++)">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => store.getState().zoomIn()}
              className="h-7 w-7"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip content="맞춤 (Ctrl+0)">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => store.getState().zoomToFit()}
              className="h-7 w-7"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content="100% (Ctrl+1)">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => store.getState().resetZoom()}
              className="h-7 w-7"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }

    // 상태바에 등록
    context.registerSlot('statusbar', ViewportControls, 100)

    // 단축키
    context.registerHotkey({
      id: 'viewport.zoom-in',
      keys: '$mod+Plus',
      description: 'Zoom In',
      handler: () => store.getState().zoomIn(),
    })

    context.registerHotkey({
      id: 'viewport.zoom-out',
      keys: '$mod+Minus',
      description: 'Zoom Out',
      handler: () => store.getState().zoomOut(),
    })

    context.registerHotkey({
      id: 'viewport.reset',
      keys: '$mod+1',
      description: 'Reset Zoom to 100%',
      handler: () => store.getState().resetZoom(),
    })

    context.registerHotkey({
      id: 'viewport.fit',
      keys: '$mod+0',
      description: 'Zoom to Fit',
      handler: () => store.getState().zoomToFit(),
    })

    console.log('[ViewportPlugin] Initialized')

    // Cleanup 함수
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }

    // cleanup 반환하지 않고 직접 등록
    window.addEventListener('beforeunload', cleanup)
  },

  async cleanup() {
    console.log('[ViewportPlugin] Cleanup')
  },
}

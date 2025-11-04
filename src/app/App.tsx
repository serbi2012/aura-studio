import type { PluginManager } from '@/core/plugin/PluginManager'
import { Separator } from '@/shared/components/Separator'
import { SlotRenderer } from '@/shared/components/SlotRenderer'
import { TooltipProvider } from '@/shared/components/Tooltip'
import React, { useEffect, useRef, useState } from 'react'
import { Stage } from 'react-konva'
import { bootstrap } from './bootstrap'

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [pluginManager, setPluginManager] = useState<PluginManager | null>(null)
  const [shapeRenderer, setShapeRenderer] = useState<React.ComponentType | null>(null)
  const [penPreviewRenderer, setPenPreviewRenderer] = useState<React.ComponentType | null>(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    if (!containerRef.current) return

    let cleanup: (() => void) | undefined

    bootstrap(containerRef.current)
      .then(({ pluginManager: pm, cleanup: cleanupFn, events, createDefaultArtboard }) => {
        setPluginManager(pm)
        cleanup = cleanupFn

        // ShapeRenderer 컴포넌트 받기
        events.on<{ ShapeRenderer: React.ComponentType }>(
          'shape-renderer:ready',
          ({ ShapeRenderer }) => {
            console.log('[App] ShapeRenderer received')
            setShapeRenderer(() => ShapeRenderer)
          },
        )

        // PenPreviewRenderer 컴포넌트 받기
        events.on<{ PenPreviewLayer: React.ComponentType }>(
          'pen-preview:ready',
          ({ PenPreviewLayer }) => {
            console.log('[App] PenPreviewLayer received')
            setPenPreviewRenderer(() => PenPreviewLayer)
          },
        )

        // 이벤트 리스너가 등록된 후 렌더러들을 다시 요청
        // (이미 emit된 이벤트를 놓쳤을 수 있으므로)
        setTimeout(() => {
          // ShapePlugin에 렌더러 재전송 요청
          events.emit('request-renderers')
          // 기본 아트보드 생성
          createDefaultArtboard()
        }, 0)
      })
      .catch((error) => {
        console.error('[App] Bootstrap error:', error)
      })

    return () => {
      cleanup?.()
    }
  }, [])

  // 캔버스 컨테이너 크기 관찰
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect()
        console.log('[App] Canvas dimensions:', { width: rect.width, height: rect.height })
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    // 초기 크기 설정을 약간 지연시켜 DOM이 완전히 렌더링된 후 실행
    setTimeout(updateCanvasSize, 100)
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  const registry = pluginManager?.getRegistry()
  const slots = registry?.slots || new Map()

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col bg-background text-foreground overflow-hidden">
        {/* 상단 툴바 */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Aura Studio</h1>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* 상단 툴바 슬롯 */}
          <div className="flex items-center gap-1">
            <SlotRenderer slotId="toolbar-top" slots={slots} />
          </div>

          <div className="flex-1" />

          {/* 메뉴 슬롯 */}
          <div className="flex items-center gap-2">
            <SlotRenderer slotId="menu" slots={slots} />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측 툴바 */}
          <div className="flex flex-col gap-1 p-2 border-r border-border bg-card">
            <SlotRenderer slotId="toolbar-left" slots={slots} />
          </div>

          {/* 좌측 패널 */}
          <div className="flex">
            <SlotRenderer slotId="panel-left" slots={slots} />
          </div>

          {/* 캔버스 영역 */}
          <div ref={canvasContainerRef} className="flex-1 relative bg-gray-300">
            <div ref={containerRef} className="absolute inset-0">
              {dimensions.width > 0 && dimensions.height > 0 ? (
                <Stage
                  width={dimensions.width}
                  height={dimensions.height}
                  onMouseDown={(e) => {
                    if (pluginManager) {
                      const stage = e.target.getStage()
                      const pos = stage?.getPointerPosition()
                      if (pos) {
                        pluginManager
                          .getEventBus()
                          .emit('canvas:pointer:down', { x: pos.x, y: pos.y, button: 0 })
                      }
                    }
                  }}
                  onMouseMove={(e) => {
                    if (pluginManager) {
                      const stage = e.target.getStage()
                      const pos = stage?.getPointerPosition()
                      if (pos) {
                        pluginManager
                          .getEventBus()
                          .emit('canvas:pointer:move', { x: pos.x, y: pos.y })
                      }
                    }
                  }}
                  onMouseUp={(e) => {
                    if (pluginManager) {
                      const stage = e.target.getStage()
                      const pos = stage?.getPointerPosition()
                      if (pos) {
                        pluginManager
                          .getEventBus()
                          .emit('canvas:pointer:up', { x: pos.x, y: pos.y, button: 0 })
                      }
                    }
                  }}
                >
                  {/* ShapeRenderer */}
                  {shapeRenderer && React.createElement(shapeRenderer)}

                  {/* PenPreviewRenderer */}
                  {penPreviewRenderer && React.createElement(penPreviewRenderer)}
                </Stage>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Canvas initializing... ({dimensions.width} x {dimensions.height})
                </div>
              )}
            </div>
          </div>

          {/* 우측 패널 */}
          <div className="flex">
            <SlotRenderer slotId="panel-right" slots={slots} />
          </div>

          {/* 우측 툴바 */}
          <div className="flex flex-col gap-1 p-2 border-l border-border bg-card">
            <SlotRenderer slotId="toolbar-right" slots={slots} />
          </div>
        </div>

        {/* 하단 패널 */}
        <div className="flex">
          <SlotRenderer slotId="panel-bottom" slots={slots} />
        </div>

        {/* 상태바 */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <SlotRenderer slotId="statusbar" slots={slots} />
          </div>
          <div>Ready</div>
        </div>
      </div>
    </TooltipProvider>
  )
}

import type { PluginManager } from '@/core/plugin/PluginManager'
import { Separator } from '@/shared/components/Separator'
import { SlotRenderer } from '@/shared/components/SlotRenderer'
import { TooltipProvider } from '@/shared/components/Tooltip'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { bootstrap } from './bootstrap'

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pluginManager, setPluginManager] = useState<PluginManager | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let cleanup: (() => void) | undefined

    bootstrap(containerRef.current)
      .then(({ pluginManager: pm, cleanup: cleanupFn }) => {
        setPluginManager(pm)
        cleanup = cleanupFn
      })
      .catch((error) => {
        console.error('[App] Bootstrap error:', error)
      })

    return () => {
      cleanup?.()
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
          <div className="flex-1 relative bg-muted/20" ref={containerRef}>
            {/* Konva 캔버스가 여기에 렌더링됨 */}
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

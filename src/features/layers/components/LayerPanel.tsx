import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Separator } from '@/shared/components/Separator'
import { cn } from '@/shared/utils/cn'
import { Eye, EyeOff, Lock, Trash2, Unlock } from 'lucide-react'
import type React from 'react'
import type { LayerStore } from '../store'

interface LayerPanelProps {
  store: LayerStore
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ store }) => {
  const { layers, selectedIds, activeLayerId } = store

  const layerArray = Array.from(layers.values())

  return (
    <div className="flex h-full w-64 flex-col bg-card border-l border-border">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-sm font-semibold">레이어</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            store.addLayer({
              name: `레이어 ${layers.size + 1}`,
              type: 'vector',
              visible: true,
              locked: false,
              opacity: 1,
              transform: {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                skewX: 0,
                skewY: 0,
              },
              bounds: { x: 0, y: 0, width: 100, height: 100 },
            })
          }}
        >
          + 추가
        </Button>
      </div>

      <Separator />

      {/* 레이어 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {layerArray.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            레이어가 없습니다
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {layerArray.map((layer) => {
              const isSelected = selectedIds.has(layer.id)
              const isActive = activeLayerId === layer.id

              return (
                <button
                  key={layer.id}
                  type="button"
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors w-full',
                    isActive && 'bg-primary/10 border border-primary',
                    isSelected && !isActive && 'bg-accent',
                    !isSelected && !isActive && 'hover:bg-accent/50',
                  )}
                  onClick={() => store.selectLayer(layer.id)}
                >
                  {/* 가시성 토글 */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      store.setLayerVisibility(layer.id, !layer.visible)
                    }}
                  >
                    {layer.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </Button>

                  {/* 레이어 이름 */}
                  <div className="flex-1 min-w-0">
                    <Input
                      value={layer.name}
                      onChange={(e) => {
                        store.updateLayer(layer.id, { name: e.target.value })
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 text-xs px-2"
                    />
                  </div>

                  {/* 잠금 토글 */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      store.setLayerLocked(layer.id, !layer.locked)
                    }}
                  >
                    {layer.locked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </Button>

                  {/* 삭제 */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      store.removeLayer(layer.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

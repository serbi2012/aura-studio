import type { Plugin } from '@/core/plugin/types'
import type { Layer } from '@/types'
import { LayerPanel } from './components/LayerPanel'
import { createLayerStore } from './store'

/**
 * LayersPlugin - 레이어 관리 플러그인
 * 완전히 독립적이며 EventBus를 통해서만 통신
 */
export const LayersPlugin: Plugin = {
  id: 'layers',
  name: 'Layers System',
  version: '1.0.0',
  dependencies: [],

  async initialize(context) {
    console.log('[LayersPlugin] Initializing...')

    // 자체 스토어 생성
    const store = createLayerStore()

    // 명령 등록
    context.registerCommand({
      id: 'layer.add',
      name: 'Add Layer',
      execute: (layerData) => {
        const id = store.getState().addLayer(layerData as Omit<Layer, 'id'>)
        context.events.emit('layer:added', { id, layerData })
      },
    })

    context.registerCommand({
      id: 'layer.remove',
      name: 'Remove Layer',
      execute: (layerId) => {
        store.getState().removeLayer(layerId as string)
        context.events.emit('layer:removed', { layerId })
      },
    })

    context.registerCommand({
      id: 'layer.select',
      name: 'Select Layer',
      execute: (layerId) => {
        store.getState().selectLayer(layerId as string)
        context.events.emit('layer:selected', { layerId })
      },
    })

    // UI 슬롯 등록
    context.registerSlot('panel-right', () => <LayerPanel store={store.getState()} />, 10)

    // 단축키 등록
    context.registerHotkey({
      id: 'layer.delete',
      keys: 'Delete',
      description: 'Delete selected layers',
      handler: () => {
        const { selectedIds } = store.getState()
        for (const id of selectedIds) {
          store.getState().removeLayer(id)
        }
      },
    })

    console.log('[LayersPlugin] Initialized')
  },

  async cleanup() {
    console.log('[LayersPlugin] Cleanup')
  },
}

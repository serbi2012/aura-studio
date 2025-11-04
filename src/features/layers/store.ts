import type { Layer } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface LayerState {
  layers: Map<string, Layer>
  selectedIds: Set<string>
  activeLayerId: string | null
}

interface LayerActions {
  addLayer: (layer: Omit<Layer, 'id'>) => string
  removeLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  getLayer: (id: string) => Layer | undefined
  selectLayer: (id: string) => void
  toggleLayerSelection: (id: string) => void
  clearSelection: () => void
  setLayerVisibility: (id: string, visible: boolean) => void
  setLayerLocked: (id: string, locked: boolean) => void
  setActiveLayer: (id: string | null) => void
}

export type LayerStore = LayerState & LayerActions

export const createLayerStore = () =>
  create<LayerStore>()(
    immer((set, get) => ({
      layers: new Map(),
      selectedIds: new Set(),
      activeLayerId: null,

      addLayer: (layer) => {
        const id = crypto.randomUUID()
        const newLayer: Layer = {
          ...layer,
          id,
        }

        set((state) => {
          state.layers.set(id, newLayer)
        })

        return id
      },

      removeLayer: (id) => {
        set((state) => {
          state.layers.delete(id)
          state.selectedIds.delete(id)
          if (state.activeLayerId === id) {
            state.activeLayerId = null
          }
        })
      },

      updateLayer: (id, updates) => {
        set((state) => {
          const layer = state.layers.get(id)
          if (layer) {
            state.layers.set(id, { ...layer, ...updates })
          }
        })
      },

      getLayer: (id) => {
        return get().layers.get(id)
      },

      selectLayer: (id) => {
        set((state) => {
          state.selectedIds.clear()
          state.selectedIds.add(id)
          state.activeLayerId = id
        })
      },

      toggleLayerSelection: (id) => {
        set((state) => {
          if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id)
          } else {
            state.selectedIds.add(id)
          }
        })
      },

      clearSelection: () => {
        set((state) => {
          state.selectedIds.clear()
          state.activeLayerId = null
        })
      },

      setLayerVisibility: (id, visible) => {
        set((state) => {
          const layer = state.layers.get(id)
          if (layer) {
            state.layers.set(id, { ...layer, visible })
          }
        })
      },

      setLayerLocked: (id, locked) => {
        set((state) => {
          const layer = state.layers.get(id)
          if (layer) {
            state.layers.set(id, { ...layer, locked })
          }
        })
      },

      setActiveLayer: (id) => {
        set((state) => {
          state.activeLayerId = id
        })
      },
    })),
  )

import type { Artboard, Shape } from '@/types/vector'
import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// Immer의 Map/Set 지원 활성화
enableMapSet()

interface ShapeState {
  shapes: Map<string, Shape>
  selectedIds: Set<string>
  artboards: Map<string, Artboard>
  activeArtboardId: string | null
}

interface ShapeActions {
  // Shape CRUD
  addShape: (shape: Shape) => void
  removeShape: (id: string) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  getShape: (id: string) => Shape | undefined
  getAllShapes: () => Shape[]

  // Selection
  selectShape: (id: string) => void
  selectShapes: (ids: string[]) => void
  deselectShape: (id: string) => void
  clearSelection: () => void
  getSelectedShapes: () => Shape[]

  // Artboard
  addArtboard: (artboard: Artboard) => void
  removeArtboard: (id: string) => void
  updateArtboard: (id: string, updates: Partial<Artboard>) => void
  setActiveArtboard: (id: string | null) => void
  getArtboard: (id: string) => Artboard | undefined
}

export type ShapeStore = ShapeState & ShapeActions

export const createShapeStore = () =>
  create<ShapeStore>()(
    immer((set, get) => ({
      shapes: new Map(),
      selectedIds: new Set(),
      artboards: new Map(),
      activeArtboardId: null,

      // Shape CRUD
      addShape: (shape) => {
        set((state) => {
          state.shapes.set(shape.id, shape)
        })
      },

      removeShape: (id) => {
        set((state) => {
          state.shapes.delete(id)
          state.selectedIds.delete(id)
        })
      },

      updateShape: (id, updates) => {
        set((state) => {
          const shape = state.shapes.get(id)
          if (shape) {
            state.shapes.set(id, { ...shape, ...updates })
          }
        })
      },

      getShape: (id) => {
        return get().shapes.get(id)
      },

      getAllShapes: () => {
        return Array.from(get().shapes.values())
      },

      // Selection
      selectShape: (id) => {
        set((state) => {
          state.selectedIds.clear()
          state.selectedIds.add(id)
        })
      },

      selectShapes: (ids) => {
        set((state) => {
          state.selectedIds.clear()
          for (const id of ids) {
            state.selectedIds.add(id)
          }
        })
      },

      deselectShape: (id) => {
        set((state) => {
          state.selectedIds.delete(id)
        })
      },

      clearSelection: () => {
        set((state) => {
          state.selectedIds.clear()
        })
      },

      getSelectedShapes: () => {
        const { shapes, selectedIds } = get()
        return Array.from(selectedIds)
          .map((id) => shapes.get(id))
          .filter((shape): shape is Shape => shape !== undefined)
      },

      // Artboard
      addArtboard: (artboard) => {
        set((state) => {
          state.artboards.set(artboard.id, artboard)
          if (!state.activeArtboardId) {
            state.activeArtboardId = artboard.id
          }
        })
      },

      removeArtboard: (id) => {
        set((state) => {
          state.artboards.delete(id)
          if (state.activeArtboardId === id) {
            state.activeArtboardId = null
          }
        })
      },

      updateArtboard: (id, updates) => {
        set((state) => {
          const artboard = state.artboards.get(id)
          if (artboard) {
            state.artboards.set(id, { ...artboard, ...updates })
          }
        })
      },

      setActiveArtboard: (id) => {
        set((state) => {
          state.activeArtboardId = id
        })
      },

      getArtboard: (id) => {
        return get().artboards.get(id)
      },
    })),
  )

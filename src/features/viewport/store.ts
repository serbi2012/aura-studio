import type { Viewport } from '@/types/vector'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface ViewportState {
  viewport: Viewport
  minZoom: number
  maxZoom: number
}

interface ViewportActions {
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  resetZoom: () => void
  pan: (dx: number, dy: number) => void
  setPan: (x: number, y: number) => void
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number }
  canvasToScreen: (canvasX: number, canvasY: number) => { x: number; y: number }
}

export type ViewportStore = ViewportState & ViewportActions

export const createViewportStore = () =>
  create<ViewportStore>()(
    immer((set, get) => ({
      viewport: {
        x: 0,
        y: 0,
        zoom: 1.0,
      },
      minZoom: 0.1,
      maxZoom: 10,

      setZoom: (zoom) => {
        const { minZoom, maxZoom } = get()
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom))

        set((state) => {
          state.viewport.zoom = clampedZoom
        })
      },

      zoomIn: () => {
        const current = get().viewport.zoom
        get().setZoom(current * 1.2)
      },

      zoomOut: () => {
        const current = get().viewport.zoom
        get().setZoom(current / 1.2)
      },

      zoomToFit: () => {
        // TODO: 모든 오브젝트가 보이도록 줌 조정
        get().setZoom(1.0)
      },

      resetZoom: () => {
        set((state) => {
          state.viewport.zoom = 1.0
          state.viewport.x = 0
          state.viewport.y = 0
        })
      },

      pan: (dx, dy) => {
        set((state) => {
          state.viewport.x += dx
          state.viewport.y += dy
        })
      },

      setPan: (x, y) => {
        set((state) => {
          state.viewport.x = x
          state.viewport.y = y
        })
      },

      screenToCanvas: (screenX, screenY) => {
        const { viewport } = get()
        return {
          x: (screenX - viewport.x) / viewport.zoom,
          y: (screenY - viewport.y) / viewport.zoom,
        }
      },

      canvasToScreen: (canvasX, canvasY) => {
        const { viewport } = get()
        return {
          x: canvasX * viewport.zoom + viewport.x,
          y: canvasY * viewport.zoom + viewport.y,
        }
      },
    })),
  )

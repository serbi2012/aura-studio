import type { Command } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface HistoryState {
  undoStack: Command[]
  redoStack: Command[]
  maxSize: number
}

interface HistoryActions {
  push: (command: Command) => void
  undo: () => Promise<void>
  redo: () => Promise<void>
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export type HistoryStore = HistoryState & HistoryActions

export const createHistoryStore = (maxSize = 100) =>
  create<HistoryStore>()(
    immer((set, get) => ({
      undoStack: [],
      redoStack: [],
      maxSize,

      push: (command) => {
        set((state) => {
          // 새 명령 추가
          state.undoStack.push(command)

          // 스택 크기 제한
          if (state.undoStack.length > state.maxSize) {
            state.undoStack.shift()
          }

          // redo 스택 초기화
          state.redoStack = []
        })
      },

      undo: async () => {
        const { undoStack } = get()
        if (undoStack.length === 0) return

        const command = undoStack[undoStack.length - 1]
        if (!command) return

        if (command.undo) {
          await command.undo()

          set((state) => {
            const cmd = state.undoStack.pop()
            if (cmd) {
              state.redoStack.push(cmd)
            }
          })
        }
      },

      redo: async () => {
        const { redoStack } = get()
        if (redoStack.length === 0) return

        const command = redoStack[redoStack.length - 1]
        if (!command) return

        if (command.redo || command.execute) {
          if (command.redo) {
            await command.redo()
          } else {
            await command.execute()
          }

          set((state) => {
            const cmd = state.redoStack.pop()
            if (cmd) {
              state.undoStack.push(cmd)
            }
          })
        }
      },

      clear: () => {
        set((state) => {
          state.undoStack = []
          state.redoStack = []
        })
      },

      canUndo: () => {
        return get().undoStack.length > 0
      },

      canRedo: () => {
        return get().redoStack.length > 0
      },
    })),
  )

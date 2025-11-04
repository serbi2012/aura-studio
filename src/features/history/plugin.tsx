import type { Plugin } from '@/core/plugin/types'
import type { Command } from '@/types'
import { createHistoryStore } from './store'

/**
 * HistoryPlugin - 실행 취소/재실행 플러그인
 * 명령 패턴을 활용한 히스토리 관리
 */
export const HistoryPlugin: Plugin = {
  id: 'history',
  name: 'History System',
  version: '1.0.0',
  dependencies: [],

  async initialize(context) {
    console.log('[HistoryPlugin] Initializing...')

    // 자체 스토어 생성
    const store = createHistoryStore(100)

    // 명령 등록
    context.registerCommand({
      id: 'history.undo',
      name: 'Undo',
      execute: async () => {
        if (store.getState().canUndo()) {
          await store.getState().undo()
          context.events.emit('history:undo')
        }
      },
    })

    context.registerCommand({
      id: 'history.redo',
      name: 'Redo',
      execute: async () => {
        if (store.getState().canRedo()) {
          await store.getState().redo()
          context.events.emit('history:redo')
        }
      },
    })

    context.registerCommand({
      id: 'history.clear',
      name: 'Clear History',
      execute: () => {
        store.getState().clear()
        context.events.emit('history:cleared')
      },
    })

    // 단축키 등록
    context.registerHotkey({
      id: 'history.undo',
      keys: '$mod+Z',
      description: 'Undo',
      handler: () => {
        if (store.getState().canUndo()) {
          store.getState().undo()
        }
      },
    })

    context.registerHotkey({
      id: 'history.redo',
      keys: '$mod+Shift+Z',
      description: 'Redo',
      handler: () => {
        if (store.getState().canRedo()) {
          store.getState().redo()
        }
      },
    })

    // 다른 플러그인의 명령 실행 감지
    context.events.on<{ command: Command }>('command:executed', ({ command }) => {
      // history 명령 자체는 히스토리에 추가하지 않음
      if (command.id.startsWith('history.')) return

      // undo/redo가 있는 명령만 히스토리에 추가
      if (command.undo) {
        store.getState().push(command)
      }
    })

    console.log('[HistoryPlugin] Initialized')
  },

  async cleanup() {
    console.log('[HistoryPlugin] Cleanup')
  },
}

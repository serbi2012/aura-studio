import type { Plugin } from '@/core/plugin/types'
import { SelectTool } from './SelectTool'
import { SelectToolUI } from './SelectToolUI'

/**
 * SelectToolPlugin - 선택 도구 플러그인
 */
export const SelectToolPlugin: Plugin = {
  id: 'tool.select',
  name: 'Select Tool',
  version: '1.0.0',
  dependencies: [],

  async initialize(context) {
    console.log('[SelectToolPlugin] Initializing...')

    let currentTool: SelectTool | null = null
    let isToolActive = false

    // 도구 생성
    const tool = new SelectTool(
      // onDragStart
      (pos) => {
        context.events.emit('drag:start', pos)
      },
      // onDragMove
      (pos) => {
        context.events.emit('drag:move', pos)
      },
      // onDragEnd
      () => {
        context.events.emit('drag:end')
      },
    )

    currentTool = tool

    // 도구 등록
    context.registerTool(tool)

    // UI 등록
    context.registerSlot(
      'toolbar-left',
      () => (
        <SelectToolUI
          isActive={isToolActive}
          onActivate={() => {
            if (currentTool) {
              currentTool.onActivate?.()
              isToolActive = true
              context.events.emit('tool:activated', { toolId: tool.id })
            }
          }}
        />
      ),
      100,
    )

    // 캔버스 이벤트 구독
    context.events.on<PointerEvent>('canvas:pointer:down', (e) => {
      if (currentTool && isToolActive) {
        currentTool.onPointerDown?.(e)
      }
    })

    context.events.on<PointerEvent>('canvas:pointer:move', (e) => {
      if (currentTool && isToolActive) {
        currentTool.onPointerMove?.(e)
      }
    })

    context.events.on<PointerEvent>('canvas:pointer:up', (e) => {
      if (currentTool && isToolActive) {
        currentTool.onPointerUp?.(e)
      }
    })

    // 단축키 등록
    context.registerHotkey({
      id: 'tool.select.activate',
      keys: 'V',
      description: 'Activate Select Tool',
      handler: () => {
        if (currentTool) {
          currentTool.onActivate?.()
          isToolActive = true
          context.events.emit('tool:activated', { toolId: tool.id })
        }
      },
    })

    console.log('[SelectToolPlugin] Initialized')
  },

  async cleanup() {
    console.log('[SelectToolPlugin] Cleanup')
  },
}

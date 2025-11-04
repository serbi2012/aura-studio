import type { Command, Hotkey, MenuItem, SlotComponent, SlotId, Tool } from '@/types'
import type React from 'react'
import type { CanvasEngine } from '../engine/CanvasEngine'
import type { EventBus } from '../engine/EventBus'

/**
 * Plugin 인터페이스
 * 모든 플러그인이 구현해야 하는 기본 구조
 */
export interface Plugin {
  id: string
  name: string
  version: string
  dependencies?: string[]

  initialize(context: PluginContext): void | Promise<void>
  cleanup?(): void | Promise<void>
}

/**
 * PluginContext - 플러그인이 사용할 수 있는 API
 * 플러그인은 이 컨텍스트를 통해서만 시스템과 통신
 */
export interface PluginContext {
  // 핵심 시스템
  events: EventBus
  engine: CanvasEngine

  // 등록 API
  registerTool(tool: Tool): void
  registerCommand(command: Command): void
  registerSlot(slotId: SlotId, component: React.ComponentType, priority?: number): void
  registerMenuItem(menu: MenuItem): void
  registerHotkey(hotkey: Hotkey): void

  // 설정
  getConfig(key: string): unknown
  setConfig(key: string, value: unknown): void

  // 플러그인 확인
  hasPlugin(pluginId: string): boolean
  getPlugin(pluginId: string): Plugin | undefined
}

/**
 * PluginRegistry - 플러그인 등록 정보 저장소
 */
export interface PluginRegistry {
  tools: Map<string, Tool>
  commands: Map<string, Command>
  slots: Map<SlotId, SlotComponent[]>
  menuItems: MenuItem[]
  hotkeys: Map<string, Hotkey>
}

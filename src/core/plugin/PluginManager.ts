import type { CanvasEngine } from '../engine/CanvasEngine'
import type { EventBus } from '../engine/EventBus'
import type { Plugin, PluginContext, PluginRegistry } from './types'

/**
 * PluginManager - 플러그인 생명주기 관리
 * 플러그인 등록, 의존성 해결, 초기화를 담당
 */
export class PluginManager {
  private plugins = new Map<string, Plugin>()
  private initializedPlugins = new Set<string>()
  private registry: PluginRegistry
  private config = new Map<string, unknown>()
  private events: EventBus
  private engine: CanvasEngine

  constructor(events: EventBus, engine: CanvasEngine) {
    this.events = events
    this.engine = engine

    // 레지스트리 초기화
    this.registry = {
      tools: new Map(),
      commands: new Map(),
      slots: new Map(),
      menuItems: [],
      hotkeys: new Map(),
    }
  }

  /**
   * EventBus 접근
   */
  getEventBus(): EventBus {
    return this.events
  }

  /**
   * 플러그인 등록
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginManager] Plugin ${plugin.id} is already registered`)
      return
    }

    this.plugins.set(plugin.id, plugin)
    console.log(`[PluginManager] Registered plugin: ${plugin.name} (${plugin.id})`)
  }

  /**
   * 플러그인 등록 해제
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      console.warn(`[PluginManager] Plugin ${pluginId} not found`)
      return
    }

    // cleanup 호출
    if (plugin.cleanup) {
      await plugin.cleanup()
    }

    this.plugins.delete(pluginId)
    this.initializedPlugins.delete(pluginId)

    console.log(`[PluginManager] Unregistered plugin: ${pluginId}`)
  }

  /**
   * 모든 플러그인 초기화
   * 의존성 순서대로 초기화
   */
  async initializeAll(): Promise<void> {
    const sorted = this.topologicalSort()

    for (const pluginId of sorted) {
      await this.initializePlugin(pluginId)
    }

    console.log('[PluginManager] All plugins initialized')
    this.events.emit('plugins:initialized')
  }

  /**
   * 개별 플러그인 초기화
   */
  private async initializePlugin(pluginId: string): Promise<void> {
    if (this.initializedPlugins.has(pluginId)) {
      return
    }

    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // 의존성 체크
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.initializedPlugins.has(dep)) {
          throw new Error(`Plugin ${pluginId} depends on ${dep} which is not initialized`)
        }
      }
    }

    // 컨텍스트 생성
    const context = this.createContext(pluginId)

    // 초기화
    await plugin.initialize(context)

    this.initializedPlugins.add(pluginId)
    console.log(`[PluginManager] Initialized plugin: ${plugin.name}`)

    this.events.emit('plugin:initialized', { pluginId, plugin })
  }

  /**
   * 플러그인 컨텍스트 생성
   */
  private createContext(pluginId: string): PluginContext {
    return {
      events: this.events,
      engine: this.engine,
      pluginManager: this,

      registerTool: (tool) => {
        this.registry.tools.set(tool.id, tool)
        this.events.emit('tool:registered', { pluginId, tool })
      },

      registerCommand: (command) => {
        this.registry.commands.set(command.id, command)
        this.events.emit('command:registered', { pluginId, command })
      },

      registerSlot: (slotId, component, priority = 0) => {
        if (!this.registry.slots.has(slotId)) {
          this.registry.slots.set(slotId, [])
        }

        const slots = this.registry.slots.get(slotId)
        if (!slots) return

        slots.push({
          id: `${pluginId}-${slotId}`,
          slotId,
          priority,
          component,
        })

        // 우선순위 정렬
        slots.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

        this.events.emit('slot:registered', { pluginId, slotId })
      },

      registerMenuItem: (menu) => {
        this.registry.menuItems.push(menu)
        this.events.emit('menu:registered', { pluginId, menu })
      },

      registerHotkey: (hotkey) => {
        this.registry.hotkeys.set(hotkey.id, hotkey)
        this.events.emit('hotkey:registered', { pluginId, hotkey })
      },

      getConfig: (key) => this.config.get(`${pluginId}.${key}`),

      setConfig: (key, value) => {
        this.config.set(`${pluginId}.${key}`, value)
      },

      hasPlugin: (id) => this.plugins.has(id),

      getPlugin: (id) => this.plugins.get(id),
    }
  }

  /**
   * 위상 정렬 (의존성 순서 해결)
   */
  private topologicalSort(): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const visit = (pluginId: string) => {
      if (visited.has(pluginId)) return

      const plugin = this.plugins.get(pluginId)
      if (!plugin) return

      visited.add(pluginId)

      // 의존성 먼저 방문
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          visit(dep)
        }
      }

      result.push(pluginId)
    }

    for (const pluginId of this.plugins.keys()) {
      visit(pluginId)
    }

    return result
  }

  /**
   * 레지스트리 가져오기
   */
  getRegistry(): PluginRegistry {
    return this.registry
  }

  /**
   * 도구 실행
   */
  executeTool(toolId: string): void {
    const tool = this.registry.tools.get(toolId)
    if (tool?.onActivate) {
      tool.onActivate()
      this.events.emit('tool:activated', { toolId, tool })
    }
  }

  /**
   * 명령 실행
   */
  async executeCommand(commandId: string, ...args: unknown[]): Promise<void> {
    const command = this.registry.commands.get(commandId)
    if (command) {
      await command.execute(...args)
      this.events.emit('command:executed', { commandId, command, args })
    }
  }
}

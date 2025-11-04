import type { PluginManager } from '../plugin/PluginManager'
import type { CanvasEngine } from './CanvasEngine'
import type { EventBus } from './EventBus'

export interface BootstrapResult {
  events: EventBus
  engine: CanvasEngine
  pluginManager: PluginManager
  cleanup: () => void
}

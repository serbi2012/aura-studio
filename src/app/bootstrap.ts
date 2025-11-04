import { CanvasEngine } from '@/core/engine/CanvasEngine'
import { EventBus } from '@/core/engine/EventBus'
import { PluginManager } from '@/core/plugin/PluginManager'
import { HistoryPlugin } from '@/features/history/plugin'
import { LayersPlugin } from '@/features/layers/plugin'
import { SelectToolPlugin } from '@/features/tools/select/plugin'

/**
 * 앱 부트스트랩 - 플러그인 시스템 초기화
 */
export async function bootstrap(container: HTMLDivElement) {
  console.log('[Bootstrap] Starting...')

  // 1. 이벤트 버스 생성
  const events = new EventBus()
  const isDev = import.meta.env?.DEV ?? false
  events.setDebugMode(isDev)

  // 2. 캔버스 엔진 생성
  const engine = new CanvasEngine(
    {
      container,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    events,
  )

  await engine.initialize()

  // 3. 플러그인 매니저 생성
  const pluginManager = new PluginManager(events, engine)

  // 4. 플러그인 등록 (의존성 순서 자동 해결)
  pluginManager.register(HistoryPlugin)
  pluginManager.register(LayersPlugin)
  pluginManager.register(SelectToolPlugin)

  // 5. 모든 플러그인 초기화
  await pluginManager.initializeAll()

  // 6. 윈도우 리사이즈 핸들러
  const handleResize = () => {
    engine.resize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', handleResize)

  console.log('[Bootstrap] Complete!')

  return {
    events,
    engine,
    pluginManager,
    cleanup: () => {
      window.removeEventListener('resize', handleResize)
      engine.cleanup()
    },
  }
}

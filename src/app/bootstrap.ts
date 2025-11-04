import { CanvasEngine } from '@/core/engine/CanvasEngine'
import { EventBus } from '@/core/engine/EventBus'
import { PluginManager } from '@/core/plugin/PluginManager'
import { HistoryPlugin } from '@/features/history/plugin'
import { LayersPlugin } from '@/features/layers/plugin'
import { ShapePlugin } from '@/features/shapes/plugin'
import { PenToolPlugin } from '@/features/tools/pen/plugin'
import { SelectToolPlugin } from '@/features/tools/select/plugin'
import { ShapeToolsPlugin } from '@/features/tools/shapes/plugin'
import { ViewportPlugin } from '@/features/viewport/plugin'

/**
 * 앱 부트스트랩 - 플러그인 시스템 초기화
 */
export async function bootstrap(container: HTMLDivElement) {
  console.log('[Bootstrap] Starting...')

  // 1. 이벤트 버스 생성
  const events = new EventBus()
  const isDev = import.meta.env?.DEV ?? false
  events.setDebugMode(isDev)

  // 2. 캔버스 엔진 생성 (현재는 React-Konva 사용으로 비활성화)
  // React-Konva가 Stage를 직접 관리하므로 CanvasEngine은 사용하지 않음
  const engine = new CanvasEngine(
    {
      container,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    events,
  )

  // CanvasEngine 초기화 스킵 (React-Konva 사용)
  // await engine.initialize()

  // 3. 플러그인 매니저 생성
  const pluginManager = new PluginManager(events, engine)

  // 4. 플러그인 등록 (의존성 순서 자동 해결)
  pluginManager.register(ViewportPlugin)
  pluginManager.register(HistoryPlugin)
  pluginManager.register(LayersPlugin)
  pluginManager.register(ShapePlugin)
  pluginManager.register(SelectToolPlugin)
  pluginManager.register(ShapeToolsPlugin)
  pluginManager.register(PenToolPlugin)

  // 5. 모든 플러그인 초기화
  await pluginManager.initializeAll()

  // 6. 윈도우 리사이즈 핸들러 (React-Konva 사용으로 비활성화)
  // const handleResize = () => {
  //   engine.resize(window.innerWidth, window.innerHeight)
  // }
  // window.addEventListener('resize', handleResize)

  console.log('[Bootstrap] Complete!')

  return {
    events,
    engine,
    pluginManager,
    cleanup: () => {
      // window.removeEventListener('resize', handleResize)
      // engine.cleanup()
    },
    // 기본 아트보드 생성 함수 (App.tsx에서 호출)
    createDefaultArtboard: () => {
      // 화면 중앙에 배치될 적당한 크기의 아트보드
      const defaultArtboard = {
        id: crypto.randomUUID(),
        name: 'Artboard 1',
        x: 300,
        y: 200,
        width: 800,
        height: 600,
        backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
      }
      pluginManager.executeCommand('artboard.add', defaultArtboard)
      console.log('[Bootstrap] Default artboard created:', defaultArtboard)
    },
  }
}

# Aura Studio - 프로젝트 구조

## 📁 전체 디렉토리 구조

```
aura-studio/
├── src/
│   ├── core/                    # 핵심 시스템
│   │   ├── engine/
│   │   │   ├── EventBus.ts     # 이벤트 버스
│   │   │   └── CanvasEngine.ts # Konva 기반 캔버스 엔진
│   │   └── plugin/
│   │       ├── types.ts         # 플러그인 인터페이스
│   │       └── PluginManager.ts # 플러그인 매니저
│   │
│   ├── features/                # 기능 플러그인
│   │   ├── layers/             # 레이어 시스템
│   │   │   ├── plugin.tsx      # 플러그인 진입점
│   │   │   ├── store.ts        # Zustand 스토어
│   │   │   └── components/
│   │   │       └── LayerPanel.tsx
│   │   │
│   │   ├── history/            # 히스토리 시스템
│   │   │   ├── plugin.tsx
│   │   │   └── store.ts
│   │   │
│   │   └── tools/              # 도구들
│   │       └── select/         # 선택 도구
│   │           ├── plugin.tsx
│   │           ├── SelectTool.ts
│   │           └── SelectToolUI.tsx
│   │
│   ├── shared/                 # 공유 컴포넌트
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Separator.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── SlotRenderer.tsx
│   │   └── utils/
│   │       └── cn.ts           # className 유틸리티
│   │
│   ├── app/                    # 앱 진입점
│   │   ├── App.tsx            # 메인 앱 컴포넌트
│   │   └── bootstrap.ts       # 플러그인 초기화
│   │
│   ├── types/                  # 타입 정의
│   │   └── index.ts
│   │
│   ├── vite-env.d.ts          # Vite 타입 선언
│   ├── index.css              # 전역 스타일
│   └── main.tsx               # 엔트리 포인트
│
├── public/                     # 정적 파일
├── package.json               # 의존성
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 설정
├── tailwind.config.js         # Tailwind 설정
├── postcss.config.js          # PostCSS 설정
├── biome.json                 # Biome 설정
└── README.md                  # 프로젝트 문서
```

## 🎯 핵심 아키텍처

### 1. EventBus (이벤트 버스)
- 플러그인 간 통신의 중심
- 완전한 디커플링 보장
- 구독/발행 패턴

### 2. PluginManager (플러그인 매니저)
- 플러그인 생명주기 관리
- 의존성 자동 해결 (위상 정렬)
- 동적 로드/언로드

### 3. CanvasEngine (캔버스 엔진)
- Konva.js 기반 렌더링
- 뷰포트 관리
- 이벤트 처리

### 4. Plugin (플러그인)
- 완전히 독립적인 기능 단위
- EventBus를 통한 통신만 가능
- 의존성 명시

## 📝 플러그인 개발 가이드

### 새 플러그인 만들기

```typescript
// src/features/your-feature/plugin.tsx
export const YourPlugin: Plugin = {
  id: 'your-plugin',
  name: 'Your Plugin',
  version: '1.0.0',
  dependencies: [],  // 의존하는 플러그인 ID
  
  async initialize(context) {
    // 1. 스토어 생성 (필요시)
    const store = createYourStore()
    
    // 2. 명령 등록
    context.registerCommand({
      id: 'your.command',
      name: 'Your Command',
      execute: () => {
        // 실행 로직
      }
    })
    
    // 3. UI 등록
    context.registerSlot('panel-right', () => (
      <YourPanel />
    ))
    
    // 4. 이벤트 구독
    context.events.on('some:event', (data) => {
      // 이벤트 처리
    })
    
    // 5. 단축키 등록
    context.registerHotkey({
      id: 'your.hotkey',
      keys: '$mod+Y',
      handler: () => {
        // 핸들러
      }
    })
  }
}
```

### 플러그인 등록

```typescript
// src/app/bootstrap.ts
import { YourPlugin } from '@/features/your-feature/plugin'

pluginManager.register(YourPlugin)
```

## 🎨 UI 슬롯 시스템

사용 가능한 슬롯:
- `toolbar-left` - 좌측 세로 툴바
- `toolbar-right` - 우측 세로 툴바
- `toolbar-top` - 상단 가로 툴바
- `panel-left` - 좌측 패널
- `panel-right` - 우측 패널
- `panel-bottom` - 하단 패널
- `menu` - 메뉴바
- `statusbar` - 상태바

## 📡 이벤트 네이밍 규칙

```
도메인:액션:상태
```

예시:
- `layer:add:start`
- `layer:add:success`
- `layer:remove`
- `tool:select:activate`
- `canvas:zoom:change`

## 🚀 실행 명령어

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트
pnpm lint
pnpm lint:fix

# 포맷
pnpm format

# 테스트
pnpm test
```

## ✨ 프로젝트 완성!

모든 핵심 시스템과 기본 플러그인이 구현되었습니다:

✅ EventBus - 이벤트 기반 통신
✅ PluginManager - 플러그인 생명주기 관리  
✅ CanvasEngine - Konva 기반 렌더링
✅ LayersPlugin - 레이어 시스템
✅ HistoryPlugin - 실행 취소/재실행
✅ SelectToolPlugin - 선택 도구
✅ 모던 UI - Tailwind + Radix UI
✅ TypeScript 완벽 타입 안정성
✅ Lint & Format 통과

http://localhost:3000 에서 확인하세요!


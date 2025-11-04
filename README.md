# Aura Studio

🎨 **플러그인 기반 벡터 그래픽 에디터**

완전한 기능 독립성과 확장성을 가진 차세대 웹 기반 그래픽 에디터입니다.

## ✨ 주요 특징

- **🔌 플러그인 아키텍처**: 모든 기능이 독립된 플러그인으로 구현
- **🎯 완전한 분리**: EventBus를 통한 느슨한 결합
- **🚀 무한 확장**: 새 기능 추가 시 기존 코드 수정 불필요
- **💪 타입 안전성**: TypeScript 5.7 엄격 모드
- **⚡ 최적화**: Vite + React 18 + Konva.js

## 🛠️ 기술 스택

- **React 18** - UI 프레임워크
- **TypeScript 5.7** - 타입 시스템
- **Vite 6** - 빌드 도구
- **Konva.js** - 캔버스 렌더링
- **Zustand** - 상태 관리
- **Tailwind CSS** - 스타일링
- **Radix UI** - Headless 컴포넌트
- **Biome** - 린터/포맷터

## 🚀 시작하기

### 설치

```bash
pnpm install
```

### 개발 서버

```bash
pnpm dev
```

브라우저에서 http://localhost:3000 을 열어주세요.

### 빌드

```bash
pnpm build
```

### 미리보기

```bash
pnpm preview
```

## 📂 프로젝트 구조

```
src/
├── core/              # 핵심 시스템
│   ├── engine/       # EventBus, CanvasEngine
│   └── plugin/       # PluginManager, 플러그인 타입
├── features/         # 기능 플러그인
│   ├── layers/      # 레이어 시스템
│   ├── history/     # 히스토리 시스템
│   └── tools/       # 도구들
├── shared/          # 공유 컴포넌트
│   ├── components/  # UI 컴포넌트
│   └── utils/       # 유틸리티
├── app/             # 앱 진입점
│   ├── App.tsx
│   └── bootstrap.ts
└── types/           # 타입 정의
```

## 🎯 아키텍처

### 플러그인 시스템

모든 기능은 독립된 플러그인으로 구현됩니다:

```typescript
export const MyPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  dependencies: [],
  
  async initialize(context) {
    // 플러그인 초기화
  }
}
```

### EventBus 통신

플러그인 간 통신은 EventBus를 통해서만 이루어집니다:

```typescript
// 이벤트 구독
context.events.on('layer:added', (data) => {
  console.log('Layer added:', data)
})

// 이벤트 발행
context.events.emit('layer:added', { id, layer })
```

## 📝 새 플러그인 추가하기

1. `src/features/your-plugin/` 디렉토리 생성
2. `plugin.tsx` 파일 작성
3. `bootstrap.ts`에 플러그인 등록

```typescript
// src/app/bootstrap.ts
import { YourPlugin } from '@/features/your-plugin/plugin'

pluginManager.register(YourPlugin)
```

## 🎨 디자인 시스템

- **모던하고 심플한 UI**
- **다크 모드 지원**
- **Radix UI 기반 접근성**
- **Tailwind CSS 유틸리티**

## 🧪 테스트

```bash
pnpm test
```

## 📄 라이선스

MIT License

---

**Made with ❤️ by Aura Studio Team**


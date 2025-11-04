# 🎨 Aura Studio - 완전한 일러스트레이터 기능 명세서

## 📋 목차

1. [핵심 도구 (Tools)](#1-핵심-도구-tools)
2. [패널 시스템 (Panels)](#2-패널-시스템-panels)
3. [벡터 연산 (Path Operations)](#3-벡터-연산-path-operations)
4. [변형 시스템 (Transform)](#4-변형-시스템-transform)
5. [스타일링 (Styling)](#5-스타일링-styling)
6. [텍스트 시스템 (Text)](#6-텍스트-시스템-text)
7. [파일 관리 (File Management)](#7-파일-관리-file-management)
8. [내보내기/가져오기 (Import/Export)](#8-내보내기가져오기-importexport)
9. [효과 & 필터 (Effects & Filters)](#9-효과--필터-effects--filters)
10. [정렬 & 분포 (Align & Distribute)](#10-정렬--분포-align--distribute)
11. [스냅 & 가이드 (Snap & Guides)](#11-스냅--가이드-snap--guides)
12. [심볼 & 에셋 (Symbols & Assets)](#12-심볼--에셋-symbols--assets)
13. [아트보드 (Artboards)](#13-아트보드-artboards)
14. [고급 기능 (Advanced)](#14-고급-기능-advanced)

---

## 1. 핵심 도구 (Tools)

### 1.1 선택 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.select` | 선택 도구 | V | 오브젝트 선택 및 이동 | ✅ 완료 |
| `tool.direct-select` | 직접 선택 도구 | A | 앵커 포인트 선택 및 편집 | 🔴 HIGH |
| `tool.group-select` | 그룹 선택 도구 | - | 그룹 내 오브젝트 선택 | 🟡 MEDIUM |
| `tool.magic-wand` | 마법봉 도구 | Y | 유사 속성 오브젝트 선택 | 🟢 LOW |
| `tool.lasso` | 올가미 도구 | Q | 자유 형태 선택 | 🟡 MEDIUM |

**구현 세부사항:**
```typescript
// DirectSelectToolPlugin
- 앵커 포인트 드래그
- 베지어 핸들 조정
- 다중 포인트 선택
- 포인트 추가/삭제
- 포인트 변환 (코너 ↔ 스무스)
```

### 1.2 그리기 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.pen` | 펜 도구 | P | 베지어 패스 그리기 | 🔴 HIGH |
| `tool.curvature` | 곡률 도구 | Shift+` | 간단한 곡선 그리기 | 🟡 MEDIUM |
| `tool.pencil` | 연필 도구 | N | 자유 곡선 그리기 | 🟡 MEDIUM |
| `tool.smooth` | 스무스 도구 | - | 패스 부드럽게 | 🟡 MEDIUM |
| `tool.blob-brush` | 블롭 브러시 | Shift+B | 병합 가능한 브러시 | 🟢 LOW |
| `tool.shaper` | 쉐이퍼 도구 | Shift+N | 도형 자동 인식 | 🟢 LOW |

**구현 세부사항:**
```typescript
// PenToolPlugin
interface PenToolState {
  mode: 'create' | 'edit' | 'add' | 'delete'
  currentPath: BezierPath
  tempAnchor: AnchorPoint | null
  isDrawing: boolean
}

// 기능:
- 클릭: 코너 포인트 생성
- 클릭+드래그: 스무스 포인트 생성
- Alt+클릭: 핸들 독립 조정
- Ctrl: 각도 스냅
- Shift: 45도 제약
- 자동 패스 닫기
```

### 1.3 도형 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.rectangle` | 사각형 도구 | M | 사각형/정사각형 | 🔴 HIGH |
| `tool.rounded-rect` | 둥근 사각형 도구 | - | 모서리 둥근 사각형 | 🔴 HIGH |
| `tool.ellipse` | 원형 도구 | L | 원/타원 | 🔴 HIGH |
| `tool.polygon` | 다각형 도구 | - | N각형 | 🟡 MEDIUM |
| `tool.star` | 별 도구 | - | 별 모양 | 🟡 MEDIUM |
| `tool.line` | 선 도구 | \ | 직선 | 🟡 MEDIUM |
| `tool.arc` | 호 도구 | - | 호/부채꼴 | 🟢 LOW |
| `tool.spiral` | 나선 도구 | - | 나선형 | 🟢 LOW |
| `tool.grid` | 격자 도구 | - | 사각 격자 | 🟢 LOW |
| `tool.polar-grid` | 원형 격자 도구 | - | 원형 격자 | 🟢 LOW |

**구현 세부사항:**
```typescript
// ShapeToolsPlugin
interface ShapeToolConfig {
  shapeType: 'rectangle' | 'ellipse' | 'polygon' | 'star'
  sides?: number        // 다각형/별
  innerRadius?: number  // 별
  cornerRadius?: number // 둥근 사각형
  
  // 드래그 동작
  constrainProportions: boolean  // Shift
  fromCenter: boolean            // Alt
  snapToGrid: boolean           // Ctrl
}
```

### 1.4 텍스트 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.text` | 문자 도구 | T | 포인트/영역 텍스트 | 🔴 HIGH |
| `tool.text-path` | 패스 상의 문자 도구 | Shift+T | 패스를 따라 텍스트 | 🟡 MEDIUM |
| `tool.vertical-text` | 세로 문자 도구 | - | 세로 쓰기 | 🟢 LOW |
| `tool.touch-text` | 터치 문자 도구 | - | 터치용 텍스트 | 🟢 LOW |

### 1.5 페인트 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.paint-bucket` | 라이브 페인트 통 | K | 영역 채우기 | 🟡 MEDIUM |
| `tool.paint-select` | 라이브 페인트 선택 | Shift+L | 라이브 페인트 선택 | 🟡 MEDIUM |
| `tool.eyedropper` | 스포이드 도구 | I | 속성 샘플링 | 🔴 HIGH |
| `tool.measure` | 측정 도구 | - | 거리/각도 측정 | 🟢 LOW |

### 1.6 변형 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.rotate` | 회전 도구 | R | 오브젝트 회전 | 🔴 HIGH |
| `tool.reflect` | 대칭 도구 | O | 대칭 변환 | 🟡 MEDIUM |
| `tool.scale` | 크기 조절 도구 | S | 크기 조절 | 🔴 HIGH |
| `tool.shear` | 기울이기 도구 | - | 기울이기 변환 | 🟡 MEDIUM |
| `tool.reshape` | 리쉐이프 도구 | - | 패스 변형 | 🟢 LOW |
| `tool.width` | 폭 도구 | Shift+W | 선 폭 조절 | 🟡 MEDIUM |
| `tool.warp` | 휘기 도구 | Shift+R | 자유 변형 | 🟢 LOW |
| `tool.twirl` | 회오리 도구 | - | 회오리 효과 | 🟢 LOW |
| `tool.pucker` | 오목 도구 | - | 안쪽으로 당기기 | 🟢 LOW |
| `tool.bloat` | 볼록 도구 | - | 바깥쪽으로 밀기 | 🟢 LOW |
| `tool.scallop` | 가리비 도구 | - | 가리비 효과 | 🟢 LOW |
| `tool.crystallize` | 결정화 도구 | - | 결정 효과 | 🟢 LOW |
| `tool.wrinkle` | 주름 도구 | - | 주름 효과 | 🟢 LOW |

### 1.7 뷰 도구군
| 플러그인 ID | 이름 | 단축키 | 설명 | 우선순위 |
|------------|------|--------|------|----------|
| `tool.zoom` | 확대/축소 도구 | Z | 화면 확대/축소 | 🔴 HIGH |
| `tool.hand` | 손 도구 | H | 화면 이동 | 🔴 HIGH |
| `tool.artboard` | 아트보드 도구 | Shift+O | 아트보드 관리 | 🔴 HIGH |

---

## 2. 패널 시스템 (Panels)

### 2.1 기본 패널
| 플러그인 ID | 이름 | 설명 | 우선순위 |
|------------|------|------|----------|
| `panel.layers` | 레이어 패널 | 레이어 관리 | ✅ 완료 |
| `panel.properties` | 속성 패널 | 선택 오브젝트 속성 | 🔴 HIGH |
| `panel.transform` | 변형 패널 | 위치/크기/회전 | 🔴 HIGH |
| `panel.appearance` | 모양 패널 | 획/칠 스택 관리 | 🔴 HIGH |
| `panel.stroke` | 획 패널 | 획 상세 설정 | 🔴 HIGH |
| `panel.color` | 색상 패널 | 색상 선택 | 🔴 HIGH |
| `panel.swatches` | 색상 견본 패널 | 색상 프리셋 | 🔴 HIGH |
| `panel.gradient` | 그라디언트 패널 | 그라디언트 편집 | 🔴 HIGH |

**구현 세부사항:**
```typescript
// PropertiesPanel - 컨텍스트 기반 속성
interface PropertiesPanelState {
  selectedObjects: ShapeObject[]
  commonProperties: Partial<ShapeProperties>
  
  // 동적 섹션
  sections: {
    transform: TransformSection
    appearance: AppearanceSection
    pathfinder: PathfinderSection
    effects: EffectsSection
  }
}

// TransformPanel
interface TransformPanelControls {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  constrainProportions: boolean
  transformPattern: boolean
  transformStroke: boolean
}
```

### 2.2 고급 패널
| 플러그인 ID | 이름 | 설명 | 우선순위 |
|------------|------|------|----------|
| `panel.pathfinder` | 패스파인더 패널 | 패스 연산 | 🔴 HIGH |
| `panel.align` | 정렬 패널 | 오브젝트 정렬/분포 | 🔴 HIGH |
| `panel.transparency` | 투명도 패널 | 블렌드 모드/불투명도 | 🟡 MEDIUM |
| `panel.graphic-styles` | 그래픽 스타일 패널 | 스타일 프리셋 | 🟡 MEDIUM |
| `panel.symbols` | 심볼 패널 | 심볼 관리 | 🟡 MEDIUM |
| `panel.brushes` | 브러시 패널 | 브러시 프리셋 | 🟡 MEDIUM |
| `panel.character` | 문자 패널 | 텍스트 서식 | 🔴 HIGH |
| `panel.paragraph` | 단락 패널 | 단락 서식 | 🟡 MEDIUM |
| `panel.links` | 링크 패널 | 임베디드 이미지 관리 | 🟢 LOW |
| `panel.navigator` | 탐색기 패널 | 미니맵 | 🟢 LOW |
| `panel.info` | 정보 패널 | 오브젝트 정보 | 🟡 MEDIUM |

---

## 3. 벡터 연산 (Path Operations)

### 3.1 패스파인더 연산
| 기능 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 합치기 | `pathfinder.unite` | 두 패스 합치기 | 🔴 HIGH |
| 전면 오브젝트로 빼기 | `pathfinder.minus-front` | 전면에서 빼기 | 🔴 HIGH |
| 교차 | `pathfinder.intersect` | 교차 영역만 | 🔴 HIGH |
| 제외 | `pathfinder.exclude` | 겹치지 않는 부분 | 🔴 HIGH |
| 나누기 | `pathfinder.divide` | 패스 나누기 | 🟡 MEDIUM |
| 자르기 | `pathfinder.trim` | 숨겨진 부분 제거 | 🟡 MEDIUM |
| 병합 | `pathfinder.merge` | 같은 색상 병합 | 🟡 MEDIUM |
| 자르기 (Crop) | `pathfinder.crop` | 최상위로 자르기 | 🟡 MEDIUM |
| 아웃라인 | `pathfinder.outline` | 획을 패스로 | 🟡 MEDIUM |
| 뒤로 빼기 | `pathfinder.minus-back` | 뒤에서 빼기 | 🟡 MEDIUM |

**구현 세부사항:**
```typescript
// PathfinderPlugin
import { union, difference, intersection, xor } from '@turf/turf'

interface PathOperationConfig {
  operation: PathOperation
  sourceShapes: Shape[]
  options: {
    removeRedundantPoints: boolean
    precision: number
  }
}

// 알고리즘: Weiler-Atherton clipping 또는 Martinez-Rueda
```

### 3.2 패스 편집
| 기능 | 플러그인 | 단축키 | 우선순위 |
|------|---------|--------|----------|
| 패스 조인 | `path.join` | Ctrl+J | 🔴 HIGH |
| 평균 | `path.average` | Ctrl+Alt+J | 🟡 MEDIUM |
| 아웃라인 획 | `path.outline-stroke` | - | 🔴 HIGH |
| 오프셋 패스 | `path.offset` | - | 🟡 MEDIUM |
| 패스 단순화 | `path.simplify` | - | 🟡 MEDIUM |
| 앵커 포인트 추가 | `path.add-anchor` | + | 🔴 HIGH |
| 앵커 포인트 삭제 | `path.delete-anchor` | - | 🔴 HIGH |
| 앵커 포인트 변환 | `path.convert-anchor` | Shift+C | 🔴 HIGH |

---

## 4. 변형 시스템 (Transform)

### 4.1 기본 변형
| 기능 | 플러그인 | 단축키 | 우선순위 |
|------|---------|--------|----------|
| 이동 | `transform.move` | - | 🔴 HIGH |
| 회전 | `transform.rotate` | - | 🔴 HIGH |
| 대칭 | `transform.reflect` | - | 🔴 HIGH |
| 크기 조절 | `transform.scale` | - | 🔴 HIGH |
| 기울이기 | `transform.shear` | - | 🟡 MEDIUM |

**각 변형 재실행** 지원 (Ctrl+D)

### 4.2 고급 변형
| 기능 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 자유 변형 | `transform.free` | 자유 변형 도구 | 🔴 HIGH |
| 왜곡 | `transform.distort` | 원근 왜곡 | 🟡 MEDIUM |
| 원근 | `transform.perspective` | 원근 변형 | 🟡 MEDIUM |
| 봉투 왜곡 | `transform.envelope` | 메시/워프 | 🟢 LOW |

**구현 세부사항:**
```typescript
// TransformPlugin
interface TransformOperation {
  type: 'move' | 'rotate' | 'scale' | 'reflect' | 'shear'
  origin: Point
  parameters: TransformParams
  
  // 옵션
  transformObjects: boolean
  transformPatterns: boolean
  transformStrokes: boolean
  scaleStrokesProportionally: boolean
}

// 변형 매트릭스
class TransformMatrix {
  matrix: number[] // 3x3 매트릭스
  
  translate(dx: number, dy: number): TransformMatrix
  rotate(angle: number, origin?: Point): TransformMatrix
  scale(sx: number, sy: number, origin?: Point): TransformMatrix
  skew(angleX: number, angleY: number): TransformMatrix
  
  multiply(other: TransformMatrix): TransformMatrix
  inverse(): TransformMatrix
  apply(point: Point): Point
}
```

---

## 5. 스타일링 (Styling)

### 5.1 칠 (Fill)
| 기능 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 단색 칠 | `style.fill.solid` | 단색 | 🔴 HIGH |
| 그라디언트 칠 | `style.fill.gradient` | 선형/원형/자유형 | 🔴 HIGH |
| 패턴 칠 | `style.fill.pattern` | 패턴 | 🟡 MEDIUM |
| 메시 그라디언트 | `style.fill.mesh` | 메시 | 🟢 LOW |

**그라디언트 타입:**
```typescript
interface GradientFill {
  type: 'linear' | 'radial' | 'freeform'
  stops: ColorStop[]
  angle?: number        // linear
  center?: Point        // radial
  scale?: number        // radial
  aspectRatio?: number  // radial
  
  // 고급
  opacity: number
  blendMode: BlendMode
}

interface ColorStop {
  color: Color
  position: number  // 0-1
  midpoint?: number // 0-1
}
```

### 5.2 획 (Stroke)
| 기능 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 기본 획 | `style.stroke.basic` | 단색 획 | 🔴 HIGH |
| 대시 획 | `style.stroke.dashed` | 점선/파선 | 🔴 HIGH |
| 가변 폭 획 | `style.stroke.variable` | 폭 프로파일 | 🟡 MEDIUM |
| 브러시 획 | `style.stroke.brush` | 브러시 | 🟡 MEDIUM |
| 화살표 | `style.stroke.arrow` | 화살표 끝 | 🟡 MEDIUM |

**획 속성:**
```typescript
interface StrokeStyle {
  color: Color
  width: number
  cap: 'butt' | 'round' | 'square'
  join: 'miter' | 'round' | 'bevel'
  miterLimit: number
  
  // 대시
  dashArray: number[]
  dashOffset: number
  
  // 정렬
  alignment: 'center' | 'inside' | 'outside'
  
  // 프로파일
  widthProfile?: WidthProfile
  
  // 화살표
  startArrow?: ArrowStyle
  endArrow?: ArrowStyle
}
```

### 5.3 효과 스택
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 다중 칠/획 | 여러 칠과 획 레이어 | 🔴 HIGH |
| 효과 순서 | 효과 적용 순서 관리 | 🟡 MEDIUM |
| 불투명도 | 개별 칠/획 불투명도 | 🔴 HIGH |
| 블렌드 모드 | 블렌드 모드 | 🟡 MEDIUM |

---

## 6. 텍스트 시스템 (Text)

### 6.1 텍스트 타입
| 타입 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 포인트 텍스트 | `text.point` | 단일 지점 텍스트 | 🔴 HIGH |
| 영역 텍스트 | `text.area` | 박스 내 텍스트 | 🔴 HIGH |
| 패스 상의 텍스트 | `text.on-path` | 패스를 따라 | 🟡 MEDIUM |
| 세로 텍스트 | `text.vertical` | 세로 쓰기 | 🟢 LOW |

### 6.2 텍스트 서식
**문자 속성:**
```typescript
interface CharacterStyle {
  // 폰트
  fontFamily: string
  fontStyle: 'normal' | 'italic' | 'oblique'
  fontWeight: number
  fontSize: number
  
  // 간격
  leading: number        // 행간
  tracking: number       // 자간
  kerning: 'auto' | 'optical' | 'metrics' | number
  
  // 위치
  baseline: number       // 베이스라인 이동
  horizontalScale: number
  verticalScale: number
  
  // 스타일
  underline: boolean
  strikethrough: boolean
  allCaps: boolean
  smallCaps: boolean
  superscript: boolean
  subscript: boolean
  
  // OpenType
  ligatures: boolean
  alternates: boolean
  ordinals: boolean
  fractions: boolean
}
```

**단락 속성:**
```typescript
interface ParagraphStyle {
  alignment: 'left' | 'center' | 'right' | 'justify'
  indentLeft: number
  indentRight: number
  indentFirst: number
  spaceBefore: number
  spaceAfter: number
  
  // 하이픈
  hyphenation: boolean
  hyphenationZone: number
  
  // 컴포저
  composer: 'single-line' | 'every-line'
}
```

### 6.3 텍스트 기능
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 스레드 텍스트 | `text.threaded` | 🟡 MEDIUM |
| 텍스트 워핑 | `text.wrap` | 🟡 MEDIUM |
| 아웃라인 만들기 | `text.create-outline` | 🔴 HIGH |
| 스타일 세트 | `text.styles` | 🟡 MEDIUM |
| 글리프 패널 | `text.glyphs` | 🟢 LOW |

---

## 7. 파일 관리 (File Management)

### 7.1 기본 파일 작업
| 기능 | 플러그인 | 단축키 | 우선순위 |
|------|---------|--------|----------|
| 새로 만들기 | `file.new` | Ctrl+N | 🔴 HIGH |
| 열기 | `file.open` | Ctrl+O | 🔴 HIGH |
| 저장 | `file.save` | Ctrl+S | 🔴 HIGH |
| 다른 이름으로 저장 | `file.save-as` | Ctrl+Shift+S | 🔴 HIGH |
| 복사본 저장 | `file.save-copy` | Ctrl+Alt+S | 🟡 MEDIUM |
| 템플릿으로 저장 | `file.save-template` | - | 🟢 LOW |

**파일 포맷:**
```typescript
interface ProjectFile {
  version: string
  metadata: {
    created: Date
    modified: Date
    author: string
    title: string
    description: string
  }
  
  artboards: Artboard[]
  layers: Layer[]
  symbols: Symbol[]
  swatches: ColorSwatch[]
  graphicStyles: GraphicStyle[]
  brushes: Brush[]
  
  settings: {
    units: 'px' | 'pt' | 'in' | 'cm' | 'mm'
    colorMode: 'RGB' | 'CMYK'
    resolution: number
  }
}
```

### 7.2 자동 저장 & 버전
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 자동 저장 | `file.auto-save` | 🔴 HIGH |
| 버전 히스토리 | `file.versions` | 🟡 MEDIUM |
| 복구 | `file.recover` | 🔴 HIGH |

---

## 8. 내보내기/가져오기 (Import/Export)

### 8.1 내보내기 포맷
| 포맷 | 플러그인 | 용도 | 우선순위 |
|------|---------|------|----------|
| SVG | `export.svg` | 웹/벡터 | 🔴 HIGH |
| PNG | `export.png` | 래스터 | 🔴 HIGH |
| JPG | `export.jpg` | 래스터 | 🔴 HIGH |
| WebP | `export.webp` | 웹 최적화 | 🟡 MEDIUM |
| PDF | `export.pdf` | 인쇄 | 🔴 HIGH |
| EPS | `export.eps` | 레거시 | 🟢 LOW |
| AI | `export.ai` | Illustrator | 🟢 LOW |

**내보내기 옵션:**
```typescript
interface ExportOptions {
  format: ExportFormat
  quality: number        // 0-100
  scale: number         // 배율
  
  // SVG
  svgOptions?: {
    minify: boolean
    prettify: boolean
    decimal: number
    inlineStyles: boolean
    responsiveImage: boolean
  }
  
  // 래스터
  rasterOptions?: {
    resolution: number  // DPI
    antialiasing: boolean
    transparency: boolean
    backgroundColor?: Color
  }
  
  // PDF
  pdfOptions?: {
    version: string
    compatibility: string
    embedFonts: boolean
    subset: boolean
  }
}
```

### 8.2 가져오기
| 포맷 | 플러그인 | 우선순위 |
|------|---------|----------|
| SVG | `import.svg` | 🔴 HIGH |
| 이미지 (PNG/JPG) | `import.image` | 🔴 HIGH |
| PDF | `import.pdf` | 🟡 MEDIUM |
| AI | `import.ai` | 🟢 LOW |
| Sketch | `import.sketch` | 🟢 LOW |
| Figma | `import.figma` | 🟢 LOW |

### 8.3 에셋 내보내기
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 선택 항목 내보내기 | 선택한 오브젝트만 | 🔴 HIGH |
| 아트보드 내보내기 | 각 아트보드별로 | 🔴 HIGH |
| 일괄 내보내기 | 여러 포맷 동시 | 🟡 MEDIUM |
| 웹용 저장 | 최적화된 웹 포맷 | 🟡 MEDIUM |

---

## 9. 효과 & 필터 (Effects & Filters)

### 9.1 벡터 효과
| 효과 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 그림자 | `effect.drop-shadow` | 드롭 섀도우 | 🔴 HIGH |
| 내부 그림자 | `effect.inner-shadow` | 내부 섀도우 | 🟡 MEDIUM |
| 외부 광선 | `effect.outer-glow` | 외부 광선 | 🟡 MEDIUM |
| 내부 광선 | `effect.inner-glow` | 내부 광선 | 🟡 MEDIUM |
| 블러 | `effect.blur` | 가우시안 블러 | 🟡 MEDIUM |
| 3D 돌출 | `effect.extrude` | 3D 효과 | 🟢 LOW |
| 회전 | `effect.revolve` | 3D 회전 | 🟢 LOW |

### 9.2 래스터 효과
| 효과 | 플러그인 | 우선순위 |
|------|---------|----------|
| 블러 | `raster.blur` | 🟡 MEDIUM |
| 선명 효과 | `raster.sharpen` | 🟢 LOW |
| 픽셀화 | `raster.pixelate` | 🟢 LOW |
| 모자이크 | `raster.mosaic` | 🟢 LOW |

### 9.3 왜곡 효과
| 효과 | 플러그인 | 우선순위 |
|------|---------|----------|
| 지그재그 | `warp.zigzag` | 🟢 LOW |
| 물결 | `warp.ripple` | 🟢 LOW |
| 비틀기 | `warp.twist` | 🟢 LOW |
| 부풀리기 | `warp.bloat` | 🟢 LOW |

---

## 10. 정렬 & 분포 (Align & Distribute)

### 10.1 정렬
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 왼쪽 정렬 | `align.left` | 🔴 HIGH |
| 가운데 정렬 | `align.center-h` | 🔴 HIGH |
| 오른쪽 정렬 | `align.right` | 🔴 HIGH |
| 위쪽 정렬 | `align.top` | 🔴 HIGH |
| 중앙 정렬 | `align.center-v` | 🔴 HIGH |
| 아래쪽 정렬 | `align.bottom` | 🔴 HIGH |

**정렬 기준:**
```typescript
interface AlignOptions {
  alignTo: 'selection' | 'artboard' | 'key-object'
  distributeSpacing?: number
}
```

### 10.2 분포
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 가로 균등 분포 | `distribute.horizontal` | 🔴 HIGH |
| 세로 균등 분포 | `distribute.vertical` | 🔴 HIGH |
| 간격 균등 분포 | `distribute.spacing` | 🟡 MEDIUM |

---

## 11. 스냅 & 가이드 (Snap & Guides)

### 11.1 스냅
| 기능 | 플러그인 | 단축키 | 우선순위 |
|------|---------|--------|----------|
| 포인트 스냅 | `snap.point` | - | 🔴 HIGH |
| 그리드 스냅 | `snap.grid` | Ctrl+' | 🔴 HIGH |
| 가이드 스냅 | `snap.guide` | Ctrl+; | 🔴 HIGH |
| 픽셀 스냅 | `snap.pixel` | - | 🔴 HIGH |
| 스마트 가이드 | `snap.smart-guides` | Ctrl+U | 🔴 HIGH |

**스마트 가이드:**
```typescript
interface SmartGuides {
  // 표시 정보
  showMeasurements: boolean
  showAlignmentGuides: boolean
  showAnchorPoints: boolean
  showCenterMarks: boolean
  
  // 스냅 거리
  snapTolerance: number  // pixels
  
  // 각도 스냅
  angleSnap: boolean
  angleIncrement: number  // degrees (기본 45)
}
```

### 11.2 가이드
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 가이드 추가 | `guide.create` | 🔴 HIGH |
| 가이드 잠금 | `guide.lock` | 🔴 HIGH |
| 가이드 지우기 | `guide.clear` | 🔴 HIGH |
| 가이드를 오브젝트로 | `guide.to-object` | 🟡 MEDIUM |

### 11.3 그리드
```typescript
interface GridSettings {
  show: boolean
  snapToGrid: boolean
  
  // 간격
  gridSize: number
  subdivisions: number
  
  // 스타일
  gridColor: Color
  gridOpacity: number
  gridStyle: 'lines' | 'dots'
}
```

---

## 12. 심볼 & 에셋 (Symbols & Assets)

### 12.1 심볼
| 기능 | 플러그인 | 설명 | 우선순위 |
|------|---------|------|----------|
| 심볼 생성 | `symbol.create` | 재사용 가능한 심볼 | 🟡 MEDIUM |
| 심볼 인스턴스 | `symbol.instance` | 심볼 배치 | 🟡 MEDIUM |
| 심볼 편집 | `symbol.edit` | 마스터 편집 | 🟡 MEDIUM |
| 심볼 확장 | `symbol.expand` | 일반 오브젝트로 | 🟡 MEDIUM |
| 동적 심볼 | `symbol.dynamic` | 변수 심볼 | 🟢 LOW |

**심볼 구조:**
```typescript
interface Symbol {
  id: string
  name: string
  master: Group
  instances: SymbolInstance[]
  
  // 동적 속성
  variables: SymbolVariable[]
}

interface SymbolInstance {
  id: string
  symbolId: string
  transform: Transform
  overrides: Record<string, any>
}
```

### 12.2 에셋 라이브러리
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 색상 견본 | 프로젝트 색상 팔레트 | 🔴 HIGH |
| 문자 스타일 | 텍스트 스타일 프리셋 | 🟡 MEDIUM |
| 그래픽 스타일 | 오브젝트 스타일 프리셋 | 🟡 MEDIUM |
| 브러시 | 브러시 라이브러리 | 🟡 MEDIUM |
| 패턴 | 패턴 라이브러리 | 🟡 MEDIUM |

---

## 13. 아트보드 (Artboards)

### 13.1 아트보드 관리
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 아트보드 생성 | `artboard.create` | 🔴 HIGH |
| 아트보드 복제 | `artboard.duplicate` | 🔴 HIGH |
| 아트보드 삭제 | `artboard.delete` | 🔴 HIGH |
| 아트보드 재배열 | `artboard.rearrange` | 🟡 MEDIUM |
| 아트보드에 맞추기 | `artboard.fit-to-content` | 🟡 MEDIUM |

**아트보드 속성:**
```typescript
interface Artboard {
  id: string
  name: string
  bounds: Rect
  
  // 프리셋
  preset?: 'iphone-14' | 'ipad-pro' | 'desktop' | 'a4' | 'letter'
  
  // 설정
  showGrid: boolean
  showRulers: boolean
  backgroundColor: Color
  
  // 내보내기
  exportSettings: ExportSettings[]
}
```

### 13.2 프리셋
**디바이스:**
- iPhone (14/15, Pro, Pro Max)
- iPad (Air, Pro)
- Android (다양한 해상도)
- Desktop (1920x1080, 2560x1440...)

**인쇄:**
- A4, A3, Letter, Legal
- 명함 (90x50mm)
- 포스터 (다양한 사이즈)

---

## 14. 고급 기능 (Advanced)

### 14.1 블렌드 & 마스크
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 블렌드 | `blend.create` | 🟡 MEDIUM |
| 클리핑 마스크 | `mask.clipping` | 🔴 HIGH |
| 불투명 마스크 | `mask.opacity` | 🟡 MEDIUM |
| 컴파운드 패스 | `path.compound` | 🔴 HIGH |

**블렌드 모드:**
```typescript
type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity'
```

### 14.2 라이브 기능
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 라이브 페인트 | `live.paint` | 🟡 MEDIUM |
| 라이브 코너 | `live.corners` | 🔴 HIGH |
| 라이브 모양 | `live.shapes` | 🔴 HIGH |
| 이미지 추적 | `live.trace` | 🟢 LOW |

### 14.3 자동화
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 액션 | `action.record` | 🟢 LOW |
| 배치 처리 | `batch.process` | 🟢 LOW |
| 스크립트 | `script.run` | 🟢 LOW |
| 플러그인 API | `plugin.api` | 🔴 HIGH |

### 14.4 협업
| 기능 | 플러그인 | 우선순위 |
|------|---------|----------|
| 댓글 | `collab.comments` | 🟢 LOW |
| 실시간 협업 | `collab.realtime` | 🟢 LOW |
| 버전 비교 | `collab.diff` | 🟢 LOW |
| 공유 링크 | `collab.share` | 🟢 LOW |

---

## 📊 구현 우선순위 요약

### Phase 1: 핵심 드로잉 (HIGH Priority)
**목표: 기본적인 벡터 드로잉 가능**
- ✅ 선택 도구
- 🔴 펜 도구
- 🔴 직접 선택 도구
- 🔴 기본 도형 도구 (사각형, 원, 다각형)
- 🔴 변형 도구 (회전, 크기, 이동)
- 🔴 칠/획 기본
- 🔴 색상 시스템
- 🔴 속성 패널
- 🔴 변형 패널
- 🔴 아트보드

**예상 기간: 2-3주**

### Phase 2: 벡터 편집 (HIGH Priority)
**목표: 전문적인 벡터 편집**
- 🔴 패스파인더 (합치기, 빼기, 교차, 제외)
- 🔴 패스 편집 (조인, 아웃라인 획, 앵커 조작)
- 🔴 정렬/분포
- 🔴 그라디언트
- 🔴 획 고급 옵션
- 🔴 스냅/가이드/그리드
- 🔴 클리핑 마스크
- 🔴 그룹/잠금/숨기기

**예상 기간: 2-3주**

### Phase 3: 텍스트 & 스타일 (HIGH/MEDIUM Priority)
**목표: 텍스트 작업 및 스타일 시스템**
- 🔴 텍스트 도구 (포인트/영역)
- 🔴 문자 패널
- 🟡 단락 패널
- 🔴 텍스트 아웃라인
- 🟡 스타일 프리셋
- 🟡 색상 견본
- 🔴 스포이드 도구

**예상 기간: 1-2주**

### Phase 4: 파일 & 내보내기 (HIGH Priority)
**목표: 실용적인 파일 관리**
- 🔴 파일 저장/열기 (자체 포맷)
- 🔴 SVG 내보내기
- 🔴 PNG/JPG 내보내기
- 🔴 PDF 내보내기
- 🔴 SVG 가져오기
- 🔴 이미지 임베드
- 🔴 자동 저장

**예상 기간: 1-2주**

### Phase 5: 고급 도구 (MEDIUM Priority)
**목표: 전문가용 기능**
- 🟡 연필 도구
- 🟡 패스 상의 텍스트
- 🟡 심볼
- 🟡 브러시
- 🟡 패턴
- 🟡 투명도/블렌드 모드
- 🟡 효과 (그림자, 블러)
- 🟡 올가미 도구

**예상 기간: 2-3주**

### Phase 6: 추가 기능 (LOW Priority)
**목표: 특수 기능 및 완성도**
- 🟢 고급 변형 도구들
- 🟢 3D 효과
- 🟢 이미지 추적
- 🟢 액션/배치
- 🟢 협업 기능
- 🟢 플러그인 마켓플레이스

**예상 기간: 4주+**

---

## 🏗️ 기술 스택 제안

### 핵심 라이브러리
```json
{
  "벡터 연산": {
    "paper.js": "벡터 패스 조작",
    "@flatten-js/core": "기하학 연산",
    "martinez-polygon-clipping": "불리언 연산"
  },
  "텍스트": {
    "opentype.js": "폰트 렌더링",
    "fabric.js": "텍스트 편집"
  },
  "색상": {
    "chroma-js": "색상 조작",
    "culori": "색공간 변환"
  },
  "파일": {
    "svg-parser": "SVG 파싱",
    "html-to-image": "래스터 내보내기",
    "jspdf": "PDF 생성"
  },
  "수학": {
    "gl-matrix": "매트릭스 연산",
    "bezier-js": "베지어 계산"
  }
}
```

---

## 📐 데이터 모델

### 핵심 타입
```typescript
// Shape - 모든 벡터 오브젝트의 기본
interface Shape {
  id: string
  type: ShapeType
  name: string
  
  // 변형
  transform: TransformMatrix
  bounds: Rect
  
  // 스타일
  fills: Fill[]
  strokes: Stroke[]
  opacity: number
  blendMode: BlendMode
  
  // 구조
  parentId?: string
  locked: boolean
  visible: boolean
  
  // 타입별 데이터
  data: ShapeData
}

type ShapeType = 
  | 'path'      // 베지어 패스
  | 'rect'      // 사각형
  | 'ellipse'   // 원/타원
  | 'polygon'   // 다각형
  | 'text'      // 텍스트
  | 'image'     // 임베디드 이미지
  | 'group'     // 그룹
  | 'symbol'    // 심볼 인스턴스

// Path - 베지어 곡선
interface PathData {
  segments: PathSegment[]
  closed: boolean
  fillRule: 'nonzero' | 'evenodd'
}

interface PathSegment {
  point: Point
  handleIn?: Point   // 앵커로 들어오는 핸들
  handleOut?: Point  // 앵커에서 나가는 핸들
}

// Transform Matrix (3x3)
type TransformMatrix = [
  number, number, number,  // a, c, e (translate x)
  number, number, number,  // b, d, f (translate y)
  number, number, number   // 0, 0, 1
]
```

---

## 🎯 다음 단계

1. **Phase 1 구현** (펜 도구, 직접 선택, 도형 도구)
2. **테스트 & 피드백**
3. **Phase 2 진행** (패스파인더, 고급 편집)

각 Phase마다 독립적인 플러그인으로 구현하여 점진적 개선이 가능합니다!


# 포트폴리오 + 리눅스 교재

개인 포트폴리오 사이트. 첫 콘텐츠는 12주 리눅스 교육 교재이고,
같은 형식의 콘텐츠를 계속 추가하는 구조입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 생성
```

## 구조

```
src/pages/index.astro          포트폴리오 홈 (Starlight 레이아웃 미사용)
src/data/projects.ts           홈 카드 데이터 — 여기만 고치면 카드 추가
src/content/docs/linux/        리눅스 교재 (/linux/…)
src/components/                교재 컴포넌트 8종
src/styles/tokens.css          디자인 토큰 + Starlight 변수 매핑
```

## 교재 컴포넌트

| 컴포넌트 | 용도 |
|---|---|
| `Term` | 터미널 블록. `$`로 시작하면 입력, `#`이면 주석, 나머지는 출력으로 자동 판별 |
| `Compare` / `Win` / `Lin` | 윈도우 ↔ 리눅스 2단 비교 |
| `Hist` | 역사·유래 블록 (연도 배지 + 명조체) |
| `Note` | 콜아웃 `tip` / `warn` / `danger` / `why` |
| `Mini` / `Answer` | 절별 미니 실습 + 접이식 정답 |
| `Lab` | 주차 과제 |
| `Timeline` / `Event` | 연표 |
| `Anatomy` | 인터랙티브 해부도 (프롬프트, 권한 비트 등) |

### 주의: Term 안의 백슬래시

`code` prop은 JS 템플릿 리터럴이라 `\U` 같은 이스케이프가 소실됩니다.
윈도우 경로가 들어가면 반드시 `String.raw`를 씁니다.

```mdx
<Term code={String.raw`
PS C:\Users\me> dir
`} />
```

## 주차 추가

1. `src/content/docs/linux/week-NN.mdx` 생성
2. `astro.config.mjs` 사이드바에 항목 추가
3. `src/data/projects.ts`의 `progress.done` 갱신

## 새 포트폴리오 항목 추가

1. `src/content/docs/<이름>/` 폴더 생성
2. `astro.config.mjs` 사이드바에 추가
3. `src/data/projects.ts`에 카드 한 장 추가

## 테마

Starlight 규약을 따릅니다 — **`:root`가 다크**, `:root[data-theme="light"]`가 라이트.
일반 웹페이지와 반대 방향이므로 `tokens.css`의 블록 순서를 뒤집지 마세요.

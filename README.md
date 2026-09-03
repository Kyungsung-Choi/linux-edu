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
| `Lab` | 챕터 과제 |
| `Timeline` / `Event` | 연표 |
| `Anatomy` | 인터랙티브 해부도 (프롬프트, 권한 비트 등) |

### 주의: Term code prop 의 두 가지 함정

`code` prop 은 JS 템플릿 리터럴입니다. 두 문자를 조심해야 합니다.

**① 백슬래시** — `\U`, `\s` 같은 이스케이프로 해석돼 사라집니다.
윈도우 경로가 들어가면 `String.raw` 를 씁니다.

```mdx
<Term code={String.raw`
PS C:\Users\me> dir
`} />
```

**② 백틱** — 템플릿 리터럴을 그 자리에서 끝내버려 **빌드가 깨집니다.**
터미널 출력에 백틱이 나오는 도구가 있습니다(`fail2ban-client status` 의 트리 문자 등).
반드시 `` \` `` 로 이스케이프하세요.

```mdx
<Term code={`
$ fail2ban-client status sshd
|- Total failed:     847
\`- Currently banned: 3
`} />
```

챕터 원고를 추가한 뒤에는 아래로 전체를 점검할 수 있습니다.

```bash
grep -n '^[^|]*`- ' src/content/docs/linux/*.mdx   # 트리 문자 백틱 의심 줄
npm run build                                       # 최종 확인
```

## 챕터 추가

1. `src/content/docs/linux/chapter-NN.mdx` 생성
2. `astro.config.mjs` 사이드바에 항목 추가
3. `src/data/projects.ts`의 `progress.done` 갱신

## 새 포트폴리오 항목 추가

1. `src/content/docs/<이름>/` 폴더 생성
2. `astro.config.mjs` 사이드바에 추가
3. `src/data/projects.ts`에 카드 한 장 추가

## 테마

Starlight 규약을 따릅니다 — **`:root`가 다크**, `:root[data-theme="light"]`가 라이트.
일반 웹페이지와 반대 방향이므로 `tokens.css`의 블록 순서를 뒤집지 마세요.

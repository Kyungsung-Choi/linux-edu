# 포트폴리오 + 교재

개인 포트폴리오 사이트. 교재 두 편이 올라가 있습니다.

- `/portfolio/linux/` — 윈도우 사용자를 위한 12주 리눅스 교재
- `/portfolio/econ/` — 연준 뉴스를 읽기 위한 경제 기초 (2시간 개념 교재)

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

1. `src/content/docs/portfolio/<이름>/` 폴더 생성
2. `astro.config.mjs` 사이드바에 추가
3. `src/routeData.ts`의 `SECTIONS`에 한 줄 추가 — 사이드바·제목·이전/다음 링크가 교재별로 나뉩니다
4. `src/data/projects.ts`에 카드 한 장 추가

## 경제 교재 전용 컴포넌트

| 컴포넌트 | 용도 |
|---|---|
| `Ab` | 약자 팝오버. `<Ab k="FOMC" />`. 내용은 `src/data/econ-glossary.ts` 한 곳에서 관리하고, 없는 키를 쓰면 빌드가 멈춤 |
| `Chain` | 인과 사슬(도미노). `steps={['금리 ↑|보조설명', ...]}` |
| `Ledger` | T자 장부(대차대조표). `left`/`right` 항목에 `'국채|+100억'` |
| `Corridor` | 연준 금리 통로(천장·IORB·바닥). 숫자와 기준일을 props로 |
| `GlossaryTable` / `GlossarySearch` | 약자 사전 표와 검색창 |

한국어 문장에서 `**(괄호)**입니다`처럼 굵은 글씨가 문장부호로 끝나고 바로 글자가 붙으면
마크다운이 굵게 처리하지 못합니다. 이런 곳은 `<strong>…</strong>`을 씁니다.

## 테마

Starlight 규약을 따릅니다 — **`:root`가 다크**, `:root[data-theme="light"]`가 라이트.
일반 웹페이지와 반대 방향이므로 `tokens.css`의 블록 순서를 뒤집지 마세요.

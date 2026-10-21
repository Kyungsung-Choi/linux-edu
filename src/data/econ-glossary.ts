/**
 * 연준 경제 읽기 — 약자 사전 (단일 출처)
 *
 * 본문의 <Ab k="..."> 팝오버와 /portfolio/econ/glossary/ 페이지가 모두 이 표를 읽는다.
 * 약자를 추가하면 두 곳에 동시에 반영된다. 본문에서 없는 키를 쓰면 빌드가 실패한다.
 */
export interface GlossaryEntry {
  /** 영문 풀네임 */
  full: string;
  /** 우리말 이름 */
  ko: string;
  /** 한 줄 설명 (비전공자용) */
  desc: string;
  /** 사전 페이지의 묶음 */
  cat: '경제 지표' | '연준과 정책' | '연준의 장부' | '금융시장' | '뉴스 표기';
  /** 처음 자세히 다루는 챕터 (링크용) */
  ch: 1 | 2 | 3 | 4 | 5;
}

export const glossary: Record<string, GlossaryEntry> = {
  // ── 경제 지표 ──────────────────────────────────────────
  GDP: {
    full: 'Gross Domestic Product',
    ko: '국내총생산',
    desc: '한 나라 안에서 일정 기간 새로 만들어진 모든 상품·서비스의 가치. 나라 경제의 "연봉".',
    cat: '경제 지표', ch: 1,
  },
  CPI: {
    full: 'Consumer Price Index',
    ko: '소비자물가지수',
    desc: '가계가 사는 물건·서비스 장바구니의 가격 변화. 뉴스에서 가장 많이 나오는 물가 지표.',
    cat: '경제 지표', ch: 1,
  },
  PCE: {
    full: 'Personal Consumption Expenditures Price Index',
    ko: '개인소비지출 물가지수',
    desc: '연준이 2% 목표를 잴 때 공식적으로 쓰는 물가 지표. CPI보다 범위가 넓다.',
    cat: '경제 지표', ch: 1,
  },
  PPI: {
    full: 'Producer Price Index',
    ko: '생산자물가지수',
    desc: '기업이 물건을 만들 때 드는 가격의 변화. 시간이 지나 소비자물가로 번지는 경향이 있다.',
    cat: '경제 지표', ch: 1,
  },
  NFP: {
    full: 'Nonfarm Payrolls',
    ko: '비농업 부문 고용자 수',
    desc: '농업을 뺀 일자리가 한 달 동안 몇 개 늘었는지. 매달 첫째 주 금요일 발표되는 "고용보고서"의 간판 숫자.',
    cat: '경제 지표', ch: 1,
  },
  BLS: {
    full: 'Bureau of Labor Statistics',
    ko: '미국 노동통계국',
    desc: 'CPI와 고용보고서를 발표하는 미국 노동부 산하 기관.',
    cat: '경제 지표', ch: 1,
  },
  NBER: {
    full: 'National Bureau of Economic Research',
    ko: '전미경제연구소',
    desc: '미국의 경기침체 시작·종료 시점을 공식적으로 "판정"하는 민간 연구기관.',
    cat: '경제 지표', ch: 1,
  },

  // ── 연준과 정책 ────────────────────────────────────────
  Fed: {
    full: 'Federal Reserve System',
    ko: '연방준비제도 (연준)',
    desc: '미국의 중앙은행. 달러를 발행하고 기준금리를 정한다.',
    cat: '연준과 정책', ch: 2,
  },
  FOMC: {
    full: 'Federal Open Market Committee',
    ko: '연방공개시장위원회',
    desc: '연준 안에서 기준금리를 실제로 결정하는 12명 위원회. 1년에 8번 정례회의를 연다.',
    cat: '연준과 정책', ch: 2,
  },
  FFR: {
    full: 'Federal Funds Rate',
    ko: '연방기금금리',
    desc: '은행끼리 하룻밤 돈을 빌려줄 때의 금리. 미국 "기준금리"라고 부르는 것의 정체.',
    cat: '연준과 정책', ch: 2,
  },
  EFFR: {
    full: 'Effective Federal Funds Rate',
    ko: '실효 연방기금금리',
    desc: '목표범위 안에서 실제로 거래된 연방기금금리의 평균값. 뉴욕 연준이 매일 발표한다.',
    cat: '연준과 정책', ch: 2,
  },
  SEP: {
    full: 'Summary of Economic Projections',
    ko: '경제전망요약',
    desc: '3·6·9·12월 회의 때 FOMC 참석자들이 내놓는 성장·물가·금리 전망. "점도표"가 여기 들어 있다.',
    cat: '연준과 정책', ch: 2,
  },
  BOK: {
    full: 'Bank of Korea',
    ko: '한국은행',
    desc: '우리나라 중앙은행. 금융통화위원회가 기준금리를 정한다.',
    cat: '연준과 정책', ch: 2,
  },
  ECB: {
    full: 'European Central Bank',
    ko: '유럽중앙은행',
    desc: '유로를 쓰는 나라들의 중앙은행.',
    cat: '연준과 정책', ch: 2,
  },
  BOJ: {
    full: 'Bank of Japan',
    ko: '일본은행',
    desc: '일본의 중앙은행.',
    cat: '연준과 정책', ch: 2,
  },

  // ── 연준의 장부 ────────────────────────────────────────
  QE: {
    full: 'Quantitative Easing',
    ko: '양적완화',
    desc: '금리를 더 내릴 수 없을 때 중앙은행이 장기 국채 등을 대량으로 사들여 돈을 푸는 정책.',
    cat: '연준의 장부', ch: 3,
  },
  QT: {
    full: 'Quantitative Tightening',
    ko: '양적긴축',
    desc: 'QE로 불린 장부를 다시 줄이는 정책. 보통 만기 된 채권을 재투자하지 않는 방식으로 한다.',
    cat: '연준의 장부', ch: 3,
  },
  RMP: {
    full: 'Reserve Management Purchases',
    ko: '지급준비금 관리 매입',
    desc: '은행 준비금이 모자라지 않게 단기국채를 꾸준히 사는 운영. 2025년 12월 도입. 경기부양 목적이 아니다.',
    cat: '연준의 장부', ch: 3,
  },
  SOMA: {
    full: 'System Open Market Account',
    ko: '공개시장계정',
    desc: '연준이 사들인 국채·MBS를 보관하는 장부상의 계정. 뉴욕 연준이 운용한다.',
    cat: '연준의 장부', ch: 3,
  },
  MBS: {
    full: 'Mortgage-Backed Securities',
    ko: '주택저당증권',
    desc: '수많은 주택담보대출을 묶어 채권처럼 만든 것. 연준이 QE 때 대량으로 샀다.',
    cat: '연준의 장부', ch: 3,
  },
  IORB: {
    full: 'Interest on Reserve Balances',
    ko: '지급준비금 이자율',
    desc: '은행이 연준에 맡겨둔 준비금에 연준이 주는 이자. 시장금리를 목표범위에 붙잡아 두는 핵심 장치.',
    cat: '연준의 장부', ch: 3,
  },
  TGA: {
    full: 'Treasury General Account',
    ko: '재무부 일반계정',
    desc: '미국 정부(재무부)가 연준에 갖고 있는 통장. 세금이 들어오면 늘고, 그만큼 은행 준비금이 줄어든다.',
    cat: '연준의 장부', ch: 3,
  },

  // ── 금융시장 ───────────────────────────────────────────
  Repo: {
    full: 'Repurchase Agreement',
    ko: '환매조건부매매 (레포)',
    desc: '채권을 담보로 맡기고 하루~며칠 돈을 빌린 뒤 되사오는 거래. 금융회사들의 매일 쓰는 자금줄.',
    cat: '금융시장', ch: 4,
  },
  'ON RRP': {
    full: 'Overnight Reverse Repurchase Agreement Facility',
    ko: '익일물 역레포',
    desc: '머니마켓펀드 등이 하룻밤 연준에 돈을 맡기고 이자를 받는 창구. 시장금리의 "바닥" 역할.',
    cat: '금융시장', ch: 4,
  },
  SRF: {
    full: 'Standing Repo Facility',
    ko: '상설 레포 기구',
    desc: '급할 때 금융기관이 국채를 맡기고 연준에서 하룻밤 돈을 빌리는 창구. 시장금리의 "천장" 역할.',
    cat: '금융시장', ch: 4,
  },
  SOFR: {
    full: 'Secured Overnight Financing Rate',
    ko: '담보부 익일물 금리',
    desc: '국채를 담보로 하룻밤 빌리는 레포 거래의 대표 금리. 2023년 종료된 LIBOR를 대신하는 기준 금리.',
    cat: '금융시장', ch: 4,
  },
  LIBOR: {
    full: 'London Interbank Offered Rate',
    ko: '런던 은행 간 금리',
    desc: '과거의 대표 기준금리. 조작 스캔들 이후 폐지되고 SOFR로 대체됐다.',
    cat: '금융시장', ch: 4,
  },
  MMF: {
    full: 'Money Market Fund',
    ko: '머니마켓펀드',
    desc: '단기국채·레포 같은 아주 짧은 자산에만 투자하는 펀드. 사실상 "이자 주는 현금 통장".',
    cat: '금융시장', ch: 4,
  },
  'T-bill': {
    full: 'Treasury Bill',
    ko: '단기국채',
    desc: '만기 1년 이하의 미국 국채. RMP가 사들이는 대상.',
    cat: '금융시장', ch: 4,
  },
  'T-note': {
    full: 'Treasury Note',
    ko: '중기국채',
    desc: '만기 2~10년의 미국 국채. 뉴스의 "10년물 국채금리"가 여기에 속한다.',
    cat: '금융시장', ch: 4,
  },
  'T-bond': {
    full: 'Treasury Bond',
    ko: '장기국채',
    desc: '만기 20~30년의 미국 국채.',
    cat: '금융시장', ch: 4,
  },
  DXY: {
    full: 'U.S. Dollar Index',
    ko: '달러인덱스',
    desc: '유로·엔 등 주요 6개 통화 대비 달러의 평균 가치. 오르면 "달러 강세".',
    cat: '금융시장', ch: 2,
  },

  // ── 뉴스 표기 ──────────────────────────────────────────
  bp: {
    full: 'basis point',
    ko: '베이시스 포인트',
    desc: '0.01%포인트. 금리 0.25%포인트 인상 = 25bp 인상.',
    cat: '뉴스 표기', ch: 2,
  },
  YoY: {
    full: 'Year over Year',
    ko: '전년 동월 대비',
    desc: '1년 전 같은 달과 비교한 변화율. 물가 뉴스의 기본 표기.',
    cat: '뉴스 표기', ch: 1,
  },
  MoM: {
    full: 'Month over Month',
    ko: '전월 대비',
    desc: '바로 전 달과 비교한 변화율. 최근 흐름을 볼 때 쓴다.',
    cat: '뉴스 표기', ch: 1,
  },
  QoQ: {
    full: 'Quarter over Quarter',
    ko: '전분기 대비',
    desc: '바로 전 분기와 비교한 변화율. 한국 GDP 뉴스는 보통 이 기준이다.',
    cat: '뉴스 표기', ch: 1,
  },
  SAAR: {
    full: 'Seasonally Adjusted Annual Rate',
    ko: '계절조정 연율',
    desc: '한 분기의 변화가 1년 내내 이어진다고 가정해 1년치로 환산한 값. 미국 GDP 뉴스의 기본 표기.',
    cat: '뉴스 표기', ch: 1,
  },
};

export interface Project {
  slug: string;
  /** 어느 구역에 나오는지: portfolio(제작한 교재·과정) / library(계속 쌓이는 자료) */
  section: 'portfolio' | 'library';
  title: string;
  kind: string;
  summary: string;
  tags: string[];
  href: string;
  status: '진행 중' | '완료';
  progress?: { done: number; total: number };
  year: number;
  /** true면 카드를 눌렀을 때 새 창(탭)으로 연다 */
  newWindow?: boolean;
}

/** 항목을 추가하려면 이 배열에 객체 하나만 넣으면 된다. section 으로 포트폴리오/자료실을 가른다. */
export const projects: Project[] = [
  {
    slug: 'linux',
    section: 'portfolio',
    title: '윈도우 사용자를 위한 리눅스 입문',
    kind: '교육 커리큘럼',
    summary:
      'GUI만 써온 사람을 위한 12주 과정. 명령어 암기가 아니라 왜 그렇게 만들어졌는지를 가르칩니다. 각 설계 결정의 역사적 배경과 절별 실습을 함께 담았습니다.',
    tags: ['Ubuntu 24.04', '서버 운영', '보안 하드닝'],
    href: '/portfolio/linux/',
    status: '완료',
    progress: { done: 12, total: 12 },
    year: 2026,
  },
  {
    slug: 'econ',
    section: 'portfolio',
    title: '연준 뉴스를 읽기 위한 경제 기초',
    kind: '교육 교재',
    summary:
      '경제 비전공자를 위한 2시간 개념 교재. 거시경제 지표에서 연준의 금리·장부 정책(QE·QT·RMP), 국채·레포 시장까지 뉴스에 필요한 만큼만, 각 개념이 왜 생겼는지부터 설명합니다.',
    tags: ['거시경제', '통화정책', '금융시장', '약자 사전'],
    href: '/portfolio/econ/',
    status: '완료',
    progress: { done: 5, total: 5 },
    year: 2026,
  },
  {
    slug: 'press',
    section: 'portfolio',
    title: '언론기사 브리핑',
    kind: '매일 업데이트',
    summary:
      '해외 경제·비즈니스 기사를 쉬운 한국어로 요약해 날짜별로 쌓아 둡니다. 새 창에서 날짜를 골라 그날의 신문 형태 요약을 읽을 수 있습니다.',
    tags: ['기사 요약', '날짜별 아카이브', '쉬운 한국어'],
    href: '/portfolio/press/',
    status: '진행 중',
    year: 2026,
    newWindow: true,
  },
  {
    slug: 'ai-tips',
    section: 'library',
    title: 'AI UI 구성 TIP',
    kind: 'TIP 모음',
    summary:
      'AI에게 화면을 시킬 때 도움이 되는 팁. UI 컴포넌트 이름과 웹사이트 시안을 많이 보면 왜 좋은지 설명하고, 눌러서 들어가 볼 수 있는 참고 사이트를 모았습니다.',
    tags: ['UI 컴포넌트', '웹 디자인 참고', '프롬프트 팁'],
    href: '/portfolio/ai-tips/',
    status: '진행 중',
    year: 2026,
  },
];

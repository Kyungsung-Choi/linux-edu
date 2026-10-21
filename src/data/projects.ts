export interface Project {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  tags: string[];
  href: string;
  status: '진행 중' | '완료';
  progress?: { done: number; total: number };
  year: number;
}

/** 포트폴리오 항목을 추가하려면 이 배열에만 한 줄 넣으면 된다. */
export const projects: Project[] = [
  {
    slug: 'linux',
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
];

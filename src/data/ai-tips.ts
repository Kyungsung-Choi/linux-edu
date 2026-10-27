export interface TipLink {
  name: string;
  href: string;
  desc: string;
}

export interface TipGroup {
  title: string;
  lead: string;
  links: TipLink[];
}

/** AI UI 구성 TIP 페이지의 링크 모음. 항목을 늘리려면 이 배열에 한 줄씩 넣으면 된다. */
export const uiTipGroups: TipGroup[] = [
  {
    title: 'React UI 컴포넌트 문서',
    lead: '버튼, 카드, 모달, 탭 같은 화면 부품(컴포넌트)이 이름과 함께 정리된 문서입니다. 이름을 알아야 AI에게 정확히 시킬 수 있습니다.',
    links: [
      { name: 'shadcn/ui', href: 'https://ui.shadcn.com/', desc: '요즘 가장 많이 쓰는 컴포넌트 모음. 복사해서 바로 쓸 수 있고 AI에게 이름을 대기 좋습니다.' },
      { name: 'MUI', href: 'https://mui.com/', desc: '구글 Material 디자인 기반. 컴포넌트 종류가 아주 많습니다.' },
      { name: 'Ant Design', href: 'https://ant.design/', desc: '관리자 화면, 표, 폼에 강합니다.' },
      { name: 'Chakra UI', href: 'https://chakra-ui.com/', desc: '가볍고 배우기 쉬운 컴포넌트 라이브러리.' },
      { name: 'Radix UI', href: 'https://www.radix-ui.com/', desc: '접근성이 좋은 기본 부품. shadcn/ui의 바탕입니다.' },
      { name: 'Mantine', href: 'https://mantine.dev/', desc: '컴포넌트와 훅이 풍부한 라이브러리.' },
    ],
  },
  {
    title: '컴포넌트를 모아 보는 곳',
    lead: '완성된 부품을 구경하고 가져다 쓸 수 있는 모음 사이트입니다.',
    links: [
      { name: '21st.dev', href: 'https://21st.dev/', desc: 'shadcn 기반 컴포넌트를 모아 둔 커뮤니티.' },
      { name: 'Magic UI', href: 'https://magicui.design/', desc: '애니메이션이 들어간 랜딩 페이지용 부품.' },
      { name: 'Aceternity UI', href: 'https://ui.aceternity.com/', desc: '눈에 띄는 효과가 있는 부품 모음.' },
      { name: 'Flowbite', href: 'https://flowbite.com/', desc: 'Tailwind CSS 기반 부품 모음.' },
      { name: 'daisyUI', href: 'https://daisyui.com/', desc: 'Tailwind CSS 위에 얹는 컴포넌트 모음.' },
      { name: 'Tailwind Plus (Tailwind UI)', href: 'https://tailwindcss.com/plus', desc: 'Tailwind 제작사의 공식 부품·템플릿(유료).' },
    ],
  },
  {
    title: '웹사이트 시안·디자인 영감',
    lead: '잘 만든 사이트와 시안을 많이 볼수록 "이런 화면에는 이런 부품을 쓰는구나"가 감각으로 남습니다.',
    links: [
      { name: 'Awwwards', href: 'https://www.awwwards.com/', desc: '수상작 사이트 모음.' },
      { name: 'One Page Love', href: 'https://onepagelove.com/', desc: '원페이지 사이트 모음. 포트폴리오 참고용.' },
      { name: 'Dribbble', href: 'https://dribbble.com/', desc: '디자이너들의 시안 모음.' },
      { name: 'Behance', href: 'https://www.behance.net/', desc: '디자인 작업물 포트폴리오 모음.' },
      { name: 'Mobbin', href: 'https://mobbin.com/', desc: '실제 앱 화면 모음(일부 유료).' },
      { name: 'Land-book', href: 'https://land-book.com/', desc: '랜딩 페이지 모음.' },
      { name: 'Godly', href: 'https://godly.website/', desc: '감각적인 웹사이트 모음.' },
      { name: 'Refero', href: 'https://refero.design/', desc: '실제 서비스 화면 레퍼런스.' },
    ],
  },
];

export const uiTipSteps: string[] = [
  'shadcn/ui 같은 문서에서 컴포넌트 목록을 한 번 쭉 훑어봅니다.',
  'One Page Love나 Awwwards에서 마음에 드는 사이트 3~5개를 저장합니다.',
  '"이건 어떤 컴포넌트로 만들었을까?" 하고 이름을 붙여 봅니다 (Card, Tabs, Dialog 등).',
  'AI에게 시킬 때 그 이름으로 요청합니다.',
];

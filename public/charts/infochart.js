/* 블로그용 동적 인포그래픽. <div class="ic" data-chart="이름"> 자리를 찾아 차트를 그린다.
   스크롤로 화면에 들어오면 막대가 자라고 숫자가 올라가며, 마우스를 올리거나 눌러 설명을 볼 수 있다.
   자바스크립트가 꺼져 있으면 자리 안에 넣어 둔 이미지가 그대로 보인다. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 숫자 올라가기 -----------------------------------------------------
  function parts(t) {
    var m = String(t).match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
    if (!m) return null;
    var num = m[2], dec = (num.split('.')[1] || '').length;
    return { pre: m[1], val: parseFloat(num.replace(/,/g, '')), dec: dec, comma: num.indexOf(',') > -1, suf: m[3] };
  }
  function fmt(p, v) {
    var s = v.toFixed(p.dec);
    if (p.comma) { var a = s.split('.'); a[0] = a[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = a.join('.'); }
    return p.pre + s + p.suf;
  }
  function countUp(el, text, delay) {
    var p = parts(text);
    if (!p || reduce) { el.textContent = text; return; }
    var t0 = null, dur = 1200;
    el.textContent = fmt(p, 0);
    function step(ts) {
      if (t0 === null) t0 = ts + delay;
      var k = Math.min(1, Math.max(0, (ts - t0) / dur));
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(p, p.val * e);
      if (k < 1) requestAnimationFrame(step); else el.textContent = text;
    }
    requestAnimationFrame(step);
  }

  // ---- 공통 틀 -----------------------------------------------------------
  function card(c, inner) {
    return '<div class="ic__card' + (c.cls ? ' ic__card--' + c.cls : '') + '"><button type="button" class="ic__replay" aria-label="애니메이션 다시 보기">↻ 다시 보기</button>' +
      '<div class="ic__kicker"><i></i>' + c.kicker + '</div><div class="ic__t" role="heading" aria-level="3">' + c.title + '</div>' +
      '<div class="ic__sub">' + c.sub + '</div>' + inner + '</div>';
  }
  function pills(list) {
    if (!list) return '';
    return '<div class="ic__pills">' + list.map(function (p) {
      return '<span class="ic__pill' + (p.cls ? ' ic__pill--' + p.cls : '') + '">' + p.html + '</span>';
    }).join('') + '</div>';
  }
  var HINT = '막대를 누르거나 마우스를 올려 보세요.';
  function info(txt) { return '<div class="ic__info" aria-live="polite" data-default="' + txt + '">' + txt + '</div>'; }

  // ---- 차트 종류 ---------------------------------------------------------
  function vbars(c) {
    var max = c.max, H = 200;
    var cols = c.items.map(function (it, i) {
      var h = Math.max(5, it.v / max * H);
      return '<div class="ic__bar' + (it.cls ? ' ic__bar--' + it.cls : '') + '" tabindex="0" role="button" aria-label="' + it.label.replace(/<br>/g, ' ') + ' ' + it.text + '" data-i="' + i + '" style="--h:' + h + 'px;transition-delay:' + (i * 0.12) + 's">' +
        '<b class="ic__v" data-text="' + it.text + '">' + it.text + '</b><div class="ic__col" style="transition-delay:' + (i * 0.12) + 's"></div></div>';
    }).join('');
    var labs = c.items.map(function (it) { return '<div class="' + (it.cls ? 'on' : '') + '">' + it.label + '</div>'; }).join('');
    return card(c, pills(c.pills) + '<div class="ic__bars">' + cols + '</div><div class="ic__labels">' + labs + '</div>' + info(c.hint || HINT));
  }

  function hbars(c) {
    var rows = c.items.map(function (it, i) {
      return '<div class="ic__hr' + (it.cls ? ' ic__hr--' + it.cls : '') + '" tabindex="0" role="button" data-i="' + i + '">' +
        '<div class="ic__hn">' + it.label + '</div><div class="ic__hw"><div class="ic__hbar" style="--w:' + (it.v / c.max * 76) + '%;--d:' + (i * 0.09) + 's"></div>' +
        '<b class="ic__hv" data-text="' + it.text + '">' + it.text + '</b></div></div>';
    }).join('');
    return card(c, '<div class="ic__hb">' + rows + '</div>' + info(c.hint || HINT));
  }

  function stack(c) {
    var segs = c.segs.map(function (s, i) {
      return '<div class="ic__seg ic__seg--' + s.cls + '" tabindex="0" role="button" data-i="' + i + '" style="--g:' + s.g + '">' + s.html + '</div>';
    }).join('');
    var ls = '<div class="ic__segl">' + c.segs.map(function (s) { return '<span>' + (s.cap || '') + '</span>'; }).join('') + '</div>';
    var head = c.big ? '<div class="ic__bignote">' + c.big.note + '</div><div class="ic__big" data-text="' + c.big.text + '">' + c.big.text + '</div>' : '';
    var two = c.two ? '<div class="ic__two">' + c.two.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>' : '';
    return card(c, pills(c.pills) + head + '<div class="ic__stack" style="' + (c.h ? 'height:' + c.h + 'px' : '') + '">' + segs + '</div>' + ls + info(c.hint || HINT) + two);
  }

  function timeline(c) {
    var X = function (d) { return (d / 365 * 100) + '%'; };
    var html = '<div class="ic__tl"><div class="ic__tr"></div><div class="ic__tf"></div>' +
      '<div class="ic__dot" style="left:0;border-color:#14173a"></div><div class="ic__dot" style="left:' + X(180) + ';border-color:#c13dff"></div><div class="ic__dot" style="left:100%;border-color:#ff5a6e"></div>' +
      '<div class="ic__tt ic__tt--0"><small>0일</small><b>상장</b></div>' +
      '<div class="ic__tt ic__tt--180" style="left:' + X(180) + ';top:10px">일반 주주<b>최대 180일</b></div>' +
      '<div class="ic__tt ic__tt--365" style="left:100%;top:0">창업자 · 0.5% 이상 주주<b>최대 365일</b></div></div>' +
      '<input class="ic__range" type="range" min="0" max="365" value="0" step="1" aria-label="상장 후 지난 날짜">' +
      '<div class="ic__day"><span>슬라이더를 움직여 보세요</span><span>상장 후 <b>0</b>일</span></div>' +
      '<div class="ic__state"><div class="ic__st" data-g="a"><b>일반 주주</b><span>묶여 있음</span></div><div class="ic__st" data-g="f"><b>창업자 · 0.5% 이상 주주</b><span>묶여 있음</span></div></div>' +
      '<div class="ic__info" style="margin-top:12px"><b>실적 발표 조건에 따라 더 일찍 풀릴 수 있고, 주간사가 앞당겨 풀어 줄 수도 있습니다.</b><br>일반 주주: 2027년 1분기 실적 후 2거래일 또는 180일 중 빠른 날 / 창업자 등: 2027년 3분기 실적 후 2거래일 또는 365일 중 빠른 날</div>';
    return card(c, html);
  }

  function table(c) {
    var th = '<tr>' + c.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
    var tb = c.rows.map(function (r, ri) {
      return '<tr class="ic__rv" style="--d:' + (ri * 0.08) + 's">' + r.map(function (v, i) {
        var a = '';
        if (!c.cls && i === r.length - 1) a += ' data-text="' + v + '"';
        if (c.cls && i > 0) a += ' data-l="' + c.head[i] + '"';
        return '<td' + a + '>' + v + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return card(c, pills(c.pills) + '<div class="ic__tw"><table><thead>' + th + '</thead><tbody>' + tb + '</tbody></table></div>' + (c.note ? '<div class="ic__nt">' + c.note + '</div>' : ''));
  }

  // 카드 묶음(핵심 숫자, 주의 사항, 위험 목록)
  function cards(c) {
    var g = c.items.map(function (it, i) {
      return '<div class="ic__k ic__rv' + (it.warn ? ' ic__k--warn' : '') + '" style="--d:' + (i * 0.07) + 's">' +
        (it.tag ? '<span class="tag">' + it.tag + '</span>' : '') + (it.lab ? '<div class="lab">' + it.lab + '</div>' : '') +
        (it.big ? '<div class="big' + (it.dk ? ' dk' : '') + '" data-text="' + it.big + '">' + it.big + '</div>' : '') +
        (it.head ? '<div class="head">' + it.head + '</div>' : '') + '<div class="txt">' + it.text + '</div></div>';
    }).join('');
    var chk = c.check ? '<div class="ic__chk ic__rv" style="--d:.8s"><b>' + c.check.title + '</b><ul>' + c.check.items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' : '';
    return card(c, '<div class="ic__grid' + (c.one ? ' one' : '') + '" style="--c:' + (c.cols || 3) + '">' + g + '</div>' + chk + (c.note ? '<div class="ic__nt">' + c.note + '</div>' : ''));
  }

  // 진행 단계
  function steps(c) {
    return card(c, '<div class="ic__steps">' + c.items.map(function (it, i) {
      return '<div class="ic__st2 ic__rv ' + (it.cls || '') + '" style="--d:' + (i * 0.18) + 's"><div class="d">' + it.d + '</div><div class="h">' + it.h + '</div><div class="t">' + it.t + '</div></div>';
    }).join('') + '</div>');
  }

  // 있음 / 비어 있음
  function have(c) {
    function col(k, o) {
      return '<div class="ic__col2 ic__col2--' + k + ' ic__rv" style="--d:' + (k === 'y' ? 0 : .15) + 's"><div class="h">' + o.title + '</div><ul>' +
        o.items.map(function (t) { return '<li><span>' + t + '</span></li>'; }).join('') + '</ul></div>';
    }
    return card(c, '<div class="ic__two2">' + col('y', c.yes) + col('n', c.no) + '</div>' + (c.note ? '<div class="ic__nt">' + c.note + '</div>' : ''));
  }

  // 기간 막대(간트)
  function gantt(c) {
    var a = c.from, b = c.to, W = b - a;
    var ax = '<div class="ic__ax">' + c.ticks.map(function (y) { return '<span style="left:' + ((y - a) / W * 100) + '%">' + y + '</span>'; }).join('') + '</div>';
    var rows = c.items.map(function (it, i) {
      var l = (it.s - a) / W * 100, w = (it.e - it.s) / W * 100;
      var mk = (it.marks || []).map(function (m) { return '<i class="ic__gm" style="left:' + ((m - a) / W * 100) + '%"></i>'; }).join('');
      return '<div class="ic__gr" tabindex="0" role="button" data-i="' + i + '"><div class="ic__gn">' + it.label + '</div><div class="ic__gt">' +
        '<div class="ic__gb' + (it.soft ? ' ic__gb--soft' : '') + '" style="left:' + l + '%;width:' + w + '%;--d:' + (i * 0.1) + 's">' + it.end + '</div>' + mk + '</div></div>';
    }).join('');
    return card(c, '<div class="ic__gantt">' + ax + rows + '</div>' + info(c.hint || HINT));
  }

  // ---- 데이터 ------------------------------------------------------------
  var CH = {
    revenue: { t: vbars, kicker: 'REVENUE', title: '매출이 폭발적으로 늘었다', sub: '단위: 억 달러 (2026년은 상반기 6개월 합계)', max: 162.9,
      pills: [{ html: '2026 상반기 = 2025 상반기(11.6억)의 약 <em data-count="14">14</em>배' }],
      items: [
        { label: '2023', v: .41, text: '0.41억', tip: '<b>2023년</b> 매출은 0.41억 달러였습니다.' },
        { label: '2024', v: 3.86, text: '3.86억', tip: '<b>2024년</b> 매출 3.86억 달러. 전년의 약 9.4배입니다(제 계산).' },
        { label: '2025', v: 45.9, text: '45.9억', tip: '<b>2025년</b> 매출 45.9억 달러. 전년의 약 11.9배입니다(제 계산).' },
        { label: '2026 상반기<br>(1~6월)', v: 162.9, text: '162.9억 달러', cls: 'hot', tip: '<b>2026년 상반기 6개월</b>만으로 2025년 한 해 매출의 약 3.5배입니다. 2분기 매출은 1년 전보다 1,368% 늘었다고 회사가 밝혔습니다.' }] },
    loss: { t: stack, kicker: 'NET LOSS', title: "손실 807억 달러, 대부분 '장부상' 손실", sub: '단위: 억 달러 (2026년 상반기 순손실의 구성)', h: 72,
      big: { note: '순손실 합계', text: '807.5억 달러' },
      pills: [{ html: '현금이 나간 것이 아닙니다', cls: 'soft' }],
      segs: [
        { cls: 'hot', g: 723.9, html: '평가 손실 723.9억', cap: '전환사채 등 평가 손실 (장부상)', tip: '<b>전환사채 등 평가 손실 723.9억 달러.</b> 회사 가치가 오르면 "나중에 주식으로 바꿔 줄 의무"의 가치도 올라 장부에 손실로 잡힙니다. 현금은 나가지 않았고, 상장하며 사채가 주식으로 바뀌면 사라집니다.' },
        { cls: 'soft', g: 83.6, html: '83.6억', cap: '그 밖', tip: '<b>그 밖 83.6억 달러.</b> 이 안에 본업 영업손실 6.9억 달러가 들어 있습니다.' }],
      two: ['이 가운데 본업 영업손실 <b class="v">6.9억 달러</b>', '평가 손실은 현금이 나가지 않으며,<br>상장 때 사채가 주식으로 바뀌면 사라집니다.'] },
    oploss: { t: vbars, kicker: 'OPERATING LOSS', title: '본업 손실은 줄고 있다', sub: '영업손실, 단위: 억 달러', max: 80.6,
      pills: [{ html: '2025년 손실에는 저작권 합의금 <b>15억 달러</b> 포함', cls: 'line' }],
      items: [
        { label: '2024', v: 29.8, text: '-29.8억', tip: '<b>2024년</b> 영업손실 29.8억 달러.' },
        { label: '2025', v: 80.6, text: '-80.6억', tip: '<b>2025년</b> 영업손실 80.6억 달러. 책 저자 집단소송 합의금 15억 달러가 포함돼 있습니다.' },
        { label: '2025 상반기', v: 21.4, text: '-21.4억', tip: '<b>2025년 상반기</b> 영업손실 21.4억 달러.' },
        { label: '2026 상반기', v: 6.9, text: '-6.9억 달러', cls: 'cool', tip: '<b>2026년 상반기</b> 영업손실 6.9억 달러. 1년 전 같은 기간(21.4억)보다 크게 줄었습니다.' }] },
    customers: { t: vbars, kicker: 'CUSTOMERS', title: '큰 기업 고객이 빠르게 늘었다', sub: '연 10만 달러 넘게 쓰는 고객 수, 단위: 곳', max: 11900,
      items: [
        { label: '2023', v: 20, text: '약 20곳', tip: '<b>2023년</b> 약 20곳.' },
        { label: '2024', v: 200, text: '약 200곳', tip: '<b>2024년</b> 약 200곳. 전년의 약 10배입니다(제 계산).' },
        { label: '2025', v: 1500, text: '약 1,500곳', tip: '<b>2025년 말</b> 약 1,500곳. 전년의 약 7.5배입니다(제 계산).' },
        { label: '2026 최근', v: 11900, text: '11,900곳 이상', cls: 'hot', tip: '<b>최근</b> 11,900곳 이상. 연 100만 달러 이상은 1,900곳 넘고, 미국 매출 상위 500대 기업의 절반 넘게가 고객입니다.' }] },
    cash: { t: vbars, kicker: 'CASH vs COMMITMENT', title: '가진 현금보다 약속이 훨씬 크다', sub: '단위: 억 달러 (약정 = 해지가 어려운 컴퓨팅 사용 약속)', max: 4758,
      pills: [{ html: '현금의 약 <em data-count="3.6">3.6</em>배 (제 계산)' }],
      items: [
        { label: '현금+단기투자<br>(2026.6.30)', v: 1316, text: '1,316억 달러', cls: 'navy', tip: '<b>현금 1,124억 + 단기투자 193억</b> = 약 1,316억 달러(2026년 6월 30일 기준).' },
        { label: '컴퓨팅 약정<br>(임대료 제외, 제 계산)', v: 4758, text: '4,758억 달러', cls: 'hot', tip: '<b>컴퓨팅 약정 약 4,758억 달러</b>(제 계산). 월스트리트저널이 보도한 4,750억 달러 이상과 맞습니다. 서류의 약정 총액 칸은 비어 있습니다.' },
        { label: '브로드컴 장비<br>임대료(5년)', v: 1612, text: '1,612억 달러', cls: 'amber', tip: '<b>브로드컴 장비 임대료</b> 5년간 1,612억 달러.' }] },
    commitments: { t: hbars, kicker: 'WHO GETS HOW MUCH', title: '누구에게 얼마를 쓰기로 했나', sub: "단위: 억 달러 (서류의 '최소·최대' 표시 기준)", max: 1612,
      hint: '줄을 누르거나 마우스를 올려 보세요. 구글 추가 TPU 1,250~1,500억은 별도입니다.',
      items: [
        { label: '브로드컴 장비 임대료(5년)', v: 1612, text: '1,612억 달러', cls: 'hot', tip: '<b>브로드컴</b> 장비 임대료 5년 1,612억 달러. 최대 420억 달러의 전환사채 발행도 가능합니다.' },
        { label: '스페이스X.AI (최대)', v: 1205, text: '1,205억 달러', cls: 'hot', tip: '<b>스페이스X.AI</b> 최대 1,205억 달러(2029년까지). 2027년 초 이후 90일 전에 알리면 해지할 수 있습니다.' },
        { label: '구글 (최소)', v: 1145, text: '1,145억 달러', cls: 'hot', tip: '<b>구글</b> 최소 1,145억 달러(2026년 4월~2033년 7월). 추가 TPU 1,250~1,500억 달러는 별도입니다.' },
        { label: '아마존 (최소)', v: 1100, text: '1,100억 달러', cls: 'hot', tip: '<b>아마존</b> 최소 1,100억 달러(~2036년 4월).' },
        { label: '마이크로소프트 (최소)', v: 449, text: '449억 달러', tip: '<b>마이크로소프트</b> 최소 449억 달러(~2033년 5월).' },
        { label: '엔스케일', v: 446, text: '446억 달러', tip: '<b>엔스케일</b> 약 446억 달러.' },
        { label: '람다', v: 413, text: '413억 달러', tip: '<b>람다</b> 413억 달러.' },
        { label: 'AMD (200억 이상)', v: 200, text: '200억 달러', tip: '<b>AMD</b> 200억 달러 이상. 칩을 받는 일정에 맞춰 최대 50억 달러어치 주식을 살 수 있는 약속도 있습니다.' }] },
    voting: { t: stack, kicker: 'VOTING POWER', title: '투표권은 창업자 회사에 모여 있다', sub: '단위: % (회사 전체 투표권 비율)', h: 120,
      segs: [
        { cls: 'dark', g: 50.1, html: '<div class="ic__vs"><small>창업자 7명의 회사 (F종)</small><strong class="y" data-text="50.1%">50.1%</strong><span>고정</span></div>', tip: '<b>F종은 딱 1주</b>인데 창업자 7명의 회사(Founder LLC)가 들고 있고, 새 주식이 나와도 회사 전체 투표권의 50.1%를 고정으로 가집니다.' },
        { cls: 'lav', g: 49.9, html: '<div class="ic__vs"><small>A종 주주 전체</small><strong class="p" data-text="49.9%">49.9%</strong><span>최대</span></div>', tip: '<b>A종은 1주 1표</b>이지만 투표권이 모두 합쳐도 최대 49.9%입니다.' }],
      two: ['<b class="v">T종 1주</b>를 가진 \'장기이익신탁\'은<br>이사회 과반을 뽑고 해임합니다.', '일반 투자자가 사는 <b class="c">A종</b>은<br>중요한 결정에 영향을 주기 어렵습니다.'] },
    lockup: { t: timeline, kicker: 'LOCK-UP', title: '팔 수 있는 주식이 늘어나는 시점(락업)', sub: '단위: 일 (상장일을 0일로 본 최대 보호예수 기간)' },
    table: { t: table, kicker: 'KEY NUMBERS', title: '핵심 재무 숫자 한눈에 보기', sub: '단위: 억 달러 (원화로 환산하지 않음)',
      head: ['항목', '2024년', '2025년', '2025 상반기', '2026 상반기'],
      rows: [['매출', '3.86', '45.9', '11.6', '162.9'], ['컴퓨팅·인프라 비용', '25.2', '73.3', '23.3', '89.5'], ['영업손실', '-29.8', '-80.6', '-21.4', '-6.9'], ['순손실', '-83', '-420', '-130', '-807']] }
  };


  CH.glance = { t: cards, kicker: 'AT A GLANCE', title: '한눈에 보는 앤스로픽 상장 신청서', sub: '핵심 숫자 6가지 (단위: 달러)', cols: 3,
    items: [
      { lab: '종목 · 거래소', big: 'ANT', dk: 1, text: '나스닥 상장 신청, A종 보통주' },
      { lab: '2026 상반기 매출', big: '162.9억', text: '1년 전 같은 기간의 약 14배 (2025년 한 해는 45.9억)' },
      { lab: '본업 손실(영업손실)', big: '6.9억', text: '1년 전 같은 기간 21.4억에서 크게 줄었음' },
      { lab: '순손실', big: '807억', text: '대부분 장부상 평가 손실이라 현금이 나간 것은 아님' },
      { lab: '컴퓨팅 사용 약속', big: '수천억', text: '대부분 중간에 그만둘 수 없고, 회사도 현금이 많이 빠져나갈 것이라고 밝힘' },
      { lab: '창업자 7명 회사의 투표권', big: '50.1%', text: '고정 비율이라 일반 주주가 큰 결정에 영향을 주기 어려움' }] };

  CH.stages = { t: steps, kicker: 'TIMELINE', title: '상장 신청서는 어디까지 왔나', sub: '지금은 가격이 비어 있는 첫 공개 버전',
    items: [
      { d: '2026년 6월 1일', h: '비공개 초안 제출', t: '공개 전에 SEC에 먼저 낸 서류' },
      { d: '2026년 10월 26일', h: '공개 버전(Form S-1) 제출', t: '이 글이 읽은 서류. 공모가와 주식 수는 비어 있음', cls: 'now' },
      { d: '앞으로', h: '가격이 담긴 수정 서류(S-1/A)', t: '빈칸이 채워지면 그때 달라진 숫자를 다시 비교', cls: 'fut' },
      { d: '언론 보도(서류에는 없음)', h: '11월 중순 상장 가능성', t: '월스트리트저널이 사정을 아는 사람들에게서 들은 이야기. <em>확인된 일정이 아님</em>', cls: 'fut' }] };

  CH.filing = { t: have, kicker: 'IN THE FILING', title: '서류에 있는 것, 아직 비어 있는 것', sub: '첫 공개 버전의 빈칸',
    yes: { title: '✓ 서류에 적힌 것', items: ['파는 주식은 <b>A종 보통주</b>', '종목 이름표(티커) <b>ANT</b>, 거래소 <b>나스닥</b>', '새로 찍어 파는 주식 + 기존 주주가 파는 주식', '파는 기존 주주: <b>공동창업자 5명</b><small>톰 브라운, 잭 클라크, 재러드 캐플런, 샘 맥캔들리시, 크리스토퍼 올라 (판 돈은 본인에게)</small>', '회사가 받은 돈의 쓰임: 설비 구입, 채용, 다른 회사 인수 등 일반 사업'] },
    no: { title: '✕ 아직 비어 있는 것', items: ['<b>공모가</b> (처음 파는 1주 가격)', '<b>공모 주식 수</b>', '<b>조달 금액</b>'] },
    note: '기업가치 1조 5천억~2조 달러, 조달 목표 약 1,000억 달러라는 보도가 있지만 <b>서류에는 없습니다.</b>' };

  CH.ladder = { t: hbars, kicker: 'BIG CUSTOMERS', title: '연간 사용액별 고객 수', sub: '단위: 곳 (2026년 최근 기준, "이상")', max: 11900, hint: '줄을 누르거나 마우스를 올려 보세요.',
    items: [
      { label: '연 10만 달러 이상', v: 11900, text: '11,900곳 이상', cls: 'hot', tip: '<b>연 10만 달러 이상 11,900곳 이상.</b> 미국 매출 상위 500대 기업의 절반 넘게가 여기 속합니다.' },
      { label: '연 100만 달러 이상', v: 1900, text: '1,900곳 이상', cls: 'hot', tip: '<b>연 100만 달러 이상 1,900곳 넘음.</b>' },
      { label: '연 1,000만 달러 이상', v: 250, text: '약 250곳', cls: 'hot', tip: '<b>연 1,000만 달러 이상 약 250곳.</b> 2026년 1~9월에 매출의 10%를 넘은 단일 고객은 없어 특정 고객 의존도는 낮습니다.' }] };

  CH.cautions = { t: cards, kicker: 'WATCH OUT', title: '고객 쪽에서 조심할 점 3가지', sub: '회사가 서류에 직접 적은 내용', cols: 3,
    items: [
      { tag: '1', head: '최신 모델 의존', warn: 1, text: '최근 6개월 안에 나온 모델이 9월 분기 매출의 <b>80% 넘게</b>. 새 모델을 꾸준히 못 내놓으면 매출이 흔들릴 수 있음' },
      { tag: '2', head: '연말연시 지출 감소', warn: 1, text: '연말연시 2주간 고객 지출이 직전 2주보다 <b>약 20% 감소</b>' },
      { tag: '3', head: '규칙 위반 고객 매출', warn: 1, text: '올해 1~9월 매출의 <b>약 5~7%</b>는 이용 규칙을 어긴 것으로 나중에 확인된 고객에게서 나왔다고 추정. 엄격히 집행하면 그만큼 줄 수 있음' }] };

  CH.cashmix = { t: stack, kicker: 'CASH', title: '가진 돈: 현금과 단기투자', sub: '단위: 억 달러 (2026년 6월 30일 기준)', h: 64,
    big: { note: '합계', text: '약 1,316억 달러' },
    segs: [
      { cls: 'dark', g: 1124, html: '현금 1,124억', cap: '현금', tip: '<b>현금 1,124억 달러.</b>' },
      { cls: 'soft', g: 193, html: '193억', cap: '곧 현금으로 바꿀 수 있는 단기투자', tip: '<b>단기투자 193억 달러.</b> 곧 현금으로 바꿀 수 있는 투자입니다.' }],
    two: ['총부채 <b class="v">1,175억 달러</b> 대부분은 앞서 말한 <b>장부상 평가 항목</b>', '실제로 빌린 돈은 아마존 전환사채 <b class="v">62억 달러</b>'] };

  CH.funding = { t: table, cls: 'plain', kicker: 'FUNDING', title: '돈을 구하는 길과 붙은 조건', sub: '빚은 적지만 새 대출에는 지켜야 할 조건이 붙었음',
    head: ['수단', '규모', '핵심 조건'],
    rows: [
      ['<b>아마존 전환사채</b>', '실제 빌린 돈 62억 달러', '주식 약 18.4억 주(N종)로 바뀔 수 있음. 아마존 지분은 <b class="n">12%를 넘지 않게</b> 제한'],
      ['<b>신용한도(대출)</b>', '최대 150억 달러', '2026년 9월 계약, 만기 2031년 9월 4일. 회사 자산 대부분이 담보이고 <b class="n">2026년 4분기부터 현금성 자산을 50억 달러 아래로 떨어뜨리면 안 됨</b>'],
      ['<b>브로드컴</b>', '최대 420억 달러', '전환사채를 발행할 수 있음'],
      ['<b>AMD</b>', '최대 50억 달러어치', '칩을 받는 일정에 맞춰 주식을 살 수 있음']],
    note: '회사는 2023~2025년 영업과 투자로 현금이 계속 빠져나갔고 앞으로도 크게 빠져나갈 것이라고 밝혔지만, <b>최소 앞으로 12개월은 버틸 돈</b>이 있다고 설명합니다.' };

  CH.terms = { t: gantt, kicker: 'CONTRACT TERMS', title: '약정은 언제까지 이어지나', sub: '서류에 적힌 기간 (끝나는 시점 기준, 시작이 적히지 않은 곳은 흐리게)', from: 2026, to: 2037, ticks: [2026, 2028, 2030, 2032, 2034, 2036],
    hint: '줄을 누르거나 마우스를 올려 보세요. 노란 표시는 해지 가능 시작 시점입니다.',
    items: [
      { label: '구글 (최소)', s: 2026.25, e: 2033.55, end: '2033.7', tip: '<b>구글</b> 2026년 4월~2033년 7월, 최소 1,145억 달러. 추가 TPU 1,250~1,500억 달러는 별도입니다.' },
      { label: '아마존 (최소)', s: 2026, e: 2036.3, end: '~2036.4', soft: 1, tip: '<b>아마존</b> 2036년 4월까지, 최소 1,100억 달러. 시작 시점은 서류에 표시되지 않았습니다.' },
      { label: '마이크로소프트 (최소)', s: 2026, e: 2033.4, end: '~2033.5', soft: 1, tip: '<b>마이크로소프트</b> 2033년 5월까지, 최소 449억 달러. 시작 시점은 서류에 표시되지 않았습니다.' },
      { label: '스페이스X.AI (최대)', s: 2026, e: 2030, end: '~2029', soft: 1, marks: [2027.1], tip: '<b>스페이스X.AI</b> 2029년까지, 최대 1,205억 달러. 2027년 초 이후 90일 전에 알리면 해지할 수 있습니다(노란 표시).' }] };

  CH.kinds = { t: table, cls: 'plain', kicker: 'SHARE CLASSES', title: '주식 종류별로 누가 갖고 무엇을 하나', sub: '투표권이 한곳에 모이도록 주식을 나눠 두었음',
    head: ['종류', '누가 갖나', '투표권', '하는 일'],
    rows: [
      ['<span class="ic__chip">A</span>A종', '일반 투자자가 사는 주식', '1주 1표 · 전체를 합쳐도 최대 <b class="n">49.9%</b>', '이번에 파는 주식'],
      ['<span class="ic__chip ic__chip--f">F</span>F종', '창업자 7명의 회사(Founder LLC), <b>딱 1주</b>', '회사 전체의 <b class="n">50.1% 고정</b>', '새 주식이 나와도 비율 유지'],
      ['<span class="ic__chip ic__chip--t">T</span>T종', '장기이익신탁, <b>딱 1주</b>', '이사회 과반을 뽑고 해임', '수탁자 5명, 회사와 돈 문제가 얽히지 않은 사람들'],
      ['<span class="ic__chip ic__chip--n">N</span>N종', '투자자 우선주·전환사채가 바뀌는 쪽', '<b class="n">투표권 없음</b>', '아마존 전환사채(약 18.4억 주), 공익펀드 지급분']],
    note: '앤스로픽은 <b>공익법인(PBC)</b>이라 이사회가 주주 이익과 공익 목적을 같이 고려해야 합니다. 이 주식을 산다는 것은 회사 운영 참여가 아니라 이익 증가에 거는 것입니다.' };

  CH.dilution = { t: table, cls: 'plain', kicker: 'DILUTION', title: '내 몫이 묽어질 수 있는 요인', sub: '희석 = 주식 수가 늘어 1주가 차지하는 회사 몫이 줄어드는 것',
    head: ['요인', '규모', '설명'],
    rows: [
      ['<b>공익펀드 지급(이미 넘김)</b>', 'N종 8억 4,684만 주', '완전히 늘어난 뒤 총 주식의 <b class="n">5%</b>'],
      ['<b>공익펀드 추가 지급</b>', '최대 2%', '주가가 직전 기준보다 50% 오를 때마다(조건 있음) 이사회가 더 줄 수 있음'],
      ['<b>아마존 전환사채</b>', '약 18.4억 주', 'N종으로 바뀔 수 있음'],
      ['<b>AMD</b>', '최대 50억 달러어치', '칩을 받는 일정에 맞춰 주식을 살 수 있음'],
      ['<b>창업자 기부 서약</b>', '개인 지분의 80%', '법적 구속력이 없고 취소할 수 있음. 기부받은 쪽이 팔면 시장에 풀리는 물량이 늘 수 있음']],
    note: '총 주식 수는 공익펀드 5%에서 거꾸로 계산하면 약 169억 주입니다(제 계산). 창업자 1명이 A종 2.3억~2.4억 주를 가지고 있습니다.' };

  CH.risks = { t: cards, kicker: 'RISKS', title: '회사가 직접 적은 위험 10가지', sub: '위험요인은 약 94쪽. 일반 투자자가 알아야 할 것만 뽑음', cols: 2, one: 0,
    items: [
      { tag: '1', head: 'AI 모델 경쟁', text: '계속 앞서야 하며 경쟁이 매우 치열함' },
      { tag: '2', head: '컴퓨터 설비', text: '구하지 못하거나 비싸질 수 있음' },
      { tag: '3', head: '핵심 인력 의존', text: '창업자 등에 크게 의존함' },
      { tag: '4', head: '짧은 역사', text: '과거 성장이 미래를 보장하지 않음' },
      { tag: '5', head: 'AI 오용·오작동', warn: 1, text: '모델이 스스로를 지키려는 듯 행동하거나 협박 같은 행동을 한 시험 사례, 치명적인 사고 가능성이 적혀 있음. 소송을 당하면 보험으로 다 막지 못할 수 있음' },
      { tag: '6', head: '저작권 소송', warn: 1, text: '2025년 9월 책 저자 집단소송에서 합의금 <b>15억 달러</b>(2026년 7월 법원 승인). 다른 청구도 있음' },
      { tag: '7', head: '규제 변화', text: '각국 규제가 바뀔 수 있음' },
      { tag: '8', head: '자금 압박', text: '빚에 붙은 조건과 큰 약정 때문에 생길 수 있음' },
      { tag: '9', head: '약한 주주 권리', text: '공익 목적이 수익과 부딪칠 수 있음' },
      { tag: '10', head: '물량 부담', text: '락업이 풀리거나 새 주식이 나오면 주가에 부담이 될 수 있음' }],
    check: { title: '숫자로 직접 따져 볼 것 4가지', items: ['약정 규모 대비 매출', '4분기부터 지켜야 하는 현금 50억 달러 조건', '최신 모델에 대한 매출 의존도', '락업 해제 날짜'] } };

  CH.known = { t: have, kicker: 'KNOWN vs UNKNOWN', title: '지금 알 수 있는 것과 없는 것', sub: '가격이 나오기 전에는 "비싸다·싸다"를 말할 수 없음',
    yes: { title: '✓ 서류로 확인되는 것', items: ['매출이 <b>매우 빠르게</b> 늘고 있음', '<b>본업 손실</b>이 줄고 있음', '현금은 많지만 <b>미래 설비 약속</b>이 훨씬 큼', '일반 주주의 <b>투표권이 약함</b>', '희석과 락업 해제 같은 <b>물량 요인</b>이 있음'] },
    no: { title: '✕ 확인할 수 없는 것', items: ['공모가', '공모 주식 수', '9월 말 분기 매출과 연환산 매출<small>1년치로 환산한 매출</small>', '약정 총액의 최종 수치', '상장 뒤 지분표 일부', '주가수익비율(PER)·주가매출비율(PSR) 같은 지표<small>가격이 없어 계산 불가</small>'] },
    note: '수정 서류(S-1/A)가 나오면 빈칸이 채워지니 <b>그때 달라진 숫자를 다시 비교</b>하는 것이 좋습니다.' };

  // ---- 연결 --------------------------------------------------------------
  function play(root, c) {
    root.classList.remove('is-in');
    void root.offsetWidth;
    root.classList.add('is-in');
    var d = 0;
    root.querySelectorAll('[data-text]').forEach(function (el, i) { countUp(el, el.getAttribute('data-text'), i * 120); });
    root.querySelectorAll('em[data-count]').forEach(function (el) {
      var t = el.getAttribute('data-count'); countUp(el, t, 500);
    });
    if (c.t === timeline) { var r = root.querySelector('.ic__range'); r.value = 0; tl(root); }
  }

  function tl(root) {
    var r = root.querySelector('.ic__range'), v = +r.value;
    root.querySelector('.ic__tf').style.width = (v / 365 * 100) + '%';
    root.querySelector('.ic__day b').textContent = v;
    var a = root.querySelector('[data-g="a"]'), f = root.querySelector('[data-g="f"]');
    function set(el, open, openTxt) { el.classList.toggle('is-open', open); el.querySelector('span').textContent = open ? openTxt : '묶여 있음'; }
    set(a, v >= 180, '팔 수 있는 주식이 늘어날 수 있음');
    set(f, v >= 365, '팔 수 있는 주식이 늘어날 수 있음');
  }

  function bindInfo(root, c) {
    var box = root.querySelector('.ic__info');
    if (!box || !c.items && !c.segs) return;
    var list = c.items || c.segs;
    var els = root.querySelectorAll('[data-i]');
    function show(i) {
      els.forEach(function (e) { e.classList.toggle('is-sel', +e.getAttribute('data-i') === i); });
      box.innerHTML = list[i].tip; box.classList.add('is-hit');
    }
    function reset() {
      els.forEach(function (e) { e.classList.remove('is-sel'); });
      box.innerHTML = box.getAttribute('data-default'); box.classList.remove('is-hit');
    }
    els.forEach(function (e) {
      var i = +e.getAttribute('data-i');
      e.addEventListener('mouseenter', function () { show(i); });
      e.addEventListener('focus', function () { show(i); });
      e.addEventListener('click', function () { show(i); });
      e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); show(i); } });
    });
    root.addEventListener('mouseleave', function () { if (!root.contains(document.activeElement)) reset(); });
  }

  function init(root) {
    var c = CH[root.getAttribute('data-chart')];
    if (!c) return;
    root.innerHTML = c.t(c);
    bindInfo(root, c);
    root.querySelector('.ic__replay').addEventListener('click', function () { play(root, c); });
    var r = root.querySelector('.ic__range');
    if (r) r.addEventListener('input', function () { tl(root); });
    if (reduce || !('IntersectionObserver' in window)) { root.classList.add('is-in'); root.querySelectorAll('em[data-count]').forEach(function (e) { e.textContent = e.getAttribute('data-count'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); play(root, c); } });
    }, { threshold: 0.3 });
    io.observe(root);
  }

  function run() { document.querySelectorAll('.ic[data-chart]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

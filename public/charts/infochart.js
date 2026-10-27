/* 블로그용 동적 인포그래픽. <div class="ic" data-chart="이름"> 자리를 찾아 차트를 그린다.
   스크롤로 화면에 들어오면 막대가 자라고 숫자가 올라가며, 마우스를 올리거나 눌러 설명을 볼 수 있다.
   자바스크립트가 꺼져 있으면 자리 안에 넣어 둔 이미지가 그대로 보인다. */
(function () {
  var SRC = '출처: 앤스로픽 Form S-1 (SEC, 2026-10-26) · 투자 권유 아님';
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
  function card(c, inner, extraSrc) {
    return '<div class="ic__card"><button type="button" class="ic__replay" aria-label="애니메이션 다시 보기">↻ 다시 보기</button>' +
      '<div class="ic__kicker"><i></i>' + c.kicker + '</div><div class="ic__t" role="heading" aria-level="3">' + c.title + '</div>' +
      '<div class="ic__sub">' + c.sub + '</div>' + inner + '<div class="ic__src">' + (extraSrc || SRC) + '</div></div>';
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
    var tb = c.rows.map(function (r) {
      return '<tr>' + r.map(function (v, i) { return '<td' + (i === r.length - 1 ? ' data-text="' + v + '"' : '') + '>' + v + '</td>'; }).join('') + '</tr>';
    }).join('');
    return card(c, '<div class="ic__tw"><table><thead>' + th + '</thead><tbody>' + tb + '</tbody></table></div>');
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

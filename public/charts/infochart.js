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
    return '<div class="ic__card' + (c.cls ? ' ic__card--' + c.cls : '') + '">' +
      '<div class="ic__kicker"><i></i>' + c.kicker + '</div><div class="ic__t" role="heading" aria-level="3">' + c.title + '</div>' +
      '<div class="ic__sub">' + c.sub + '</div>' + inner + '</div>';
  }
  function pills(list) {
    if (!list) return '';
    return '<div class="ic__pills">' + list.map(function (p) {
      return '<span class="ic__pill' + (p.cls ? ' ic__pill--' + p.cls : '') + '">' + p.html + '</span>';
    }).join('') + '</div>';
  }
  function nt(c) { return c.note ? '<div class="ic__nt">' + c.note + '</div>' : ''; }

  // ---- 차트 종류 ---------------------------------------------------------
  function vbars(c) {
    var max = c.max, H = 200;
    var cols = c.items.map(function (it, i) {
      var h = Math.max(5, it.v / max * H);
      return '<div class="ic__bar' + (it.cls ? ' ic__bar--' + it.cls : '') + '" role="img" aria-label="' + it.label.replace(/<br>/g, ' ') + ' ' + it.text + '" data-i="' + i + '" style="--h:' + h + 'px;transition-delay:' + (i * 0.12) + 's">' +
        '<b class="ic__v" data-text="' + it.text + '">' + it.text + '</b><div class="ic__col" style="transition-delay:' + (i * 0.12) + 's"></div></div>';
    }).join('');
    var labs = c.items.map(function (it) { return '<div class="' + (it.cls ? 'on' : '') + '">' + it.label + '</div>'; }).join('');
    return card(c, pills(c.pills) + '<div class="ic__bars' + (c.items.length > 7 ? ' ic__bars--dense' : '') + '">' + cols + '</div><div class="ic__labels' + (c.items.length > 7 ? ' ic__labels--dense' : '') + '">' + labs + '</div>' + nt(c));
  }

  function hbars(c) {
    var rows = c.items.map(function (it, i) {
      return '<div class="ic__hr' + (it.cls ? ' ic__hr--' + it.cls : '') + '" data-i="' + i + '">' +
        '<div class="ic__hn">' + it.label + '</div><div class="ic__hw"><div class="ic__hbar" style="--w:' + (it.v / c.max * 76) + '%;--d:' + (i * 0.09) + 's"></div>' +
        '<b class="ic__hv" data-text="' + it.text + '">' + it.text + '</b></div></div>';
    }).join('');
    return card(c, '<div class="ic__hb">' + rows + '</div>' + nt(c));
  }

  function stack(c) {
    var segs = c.segs.map(function (s, i) {
      return '<div class="ic__seg ic__seg--' + s.cls + '" data-i="' + i + '" style="--g:' + s.g + '">' + s.html + '</div>';
    }).join('');
    var ls = '<div class="ic__segl">' + c.segs.map(function (s) { return '<span>' + (s.cap || '') + '</span>'; }).join('') + '</div>';
    var head = c.big ? '<div class="ic__bignote">' + c.big.note + '</div><div class="ic__big" data-text="' + c.big.text + '">' + c.big.text + '</div>' : '';
    var two = c.two ? '<div class="ic__two">' + c.two.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>' : '';
    return card(c, pills(c.pills) + head + '<div class="ic__stack" style="' + (c.h ? 'height:' + c.h + 'px' : '') + '">' + segs + '</div>' + ls + nt(c) + two);
  }

  function timeline(c) {
    var X = function (d) { return (d / 365 * 100) + '%'; };
    var html = '<div class="ic__tl"><div class="ic__tr"></div><div class="ic__tf"></div>' +
      '<div class="ic__dot" style="left:0;border-color:#14173a"></div><div class="ic__dot" style="left:' + X(180) + ';border-color:#c13dff"></div><div class="ic__dot" style="left:100%;border-color:#ff5a6e"></div>' +
      '<div class="ic__tt ic__tt--0"><small>0일</small><b>상장</b></div>' +
      '<div class="ic__tt ic__tt--180" style="left:' + X(180) + ';top:10px">일반 주주<b>최대 180일</b></div>' +
      '<div class="ic__tt ic__tt--365" style="left:100%;top:0">창업자 · 0.5% 이상 주주<b>최대 365일</b></div></div>' +
      '<div class="ic__nt" style="margin-top:14px"><b>실적 발표 조건에 따라 더 일찍 풀릴 수 있고, 주간사가 앞당겨 풀어 줄 수도 있습니다.</b><br>일반 주주: 2027년 1분기 실적 후 2거래일 또는 180일 중 빠른 날 / 창업자 등: 2027년 3분기 실적 후 2거래일 또는 365일 중 빠른 날</div>';
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
      return '<div class="ic__gr" data-i="' + i + '"><div class="ic__gn">' + it.label + '</div><div class="ic__gt">' +
        '<div class="ic__gb' + (it.soft ? ' ic__gb--soft' : '') + '" style="left:' + l + '%;width:' + w + '%;--d:' + (i * 0.1) + 's">' + it.end + '</div>' + mk + '</div></div>';
    }).join('');
    return card(c, '<div class="ic__gantt">' + ax + rows + '</div>' + nt(c));
  }

  // ---- 선 그래프(여러 계열, 음수·빈칸 허용)와 음수 막대 ------------------------
  var PAL = ['#6d4aff', '#12c2a5', '#ffb020', '#ff5a6e', '#14173a', '#8b90a8'];
  function niceTicks(lo, hi, n) {
    var span = (hi - lo) || 1, step = Math.pow(10, Math.floor(Math.log10(span / n))), err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    var t = []; for (var v = Math.floor(lo / step) * step; v <= hi + step * 0.999; v += step) t.push(+v.toFixed(6));
    return t;
  }
  function fmtN(v, u) {
    var a = Math.abs(v), s = a >= 100 ? Math.round(v).toLocaleString('en-US') : (Math.round(v * 10) / 10).toString();
    return s + (u || '');
  }
  function xlab(l, x, y) {
    var p = l.split('<br>');
    return '<text x="' + x + '" y="' + y + '" class="xa">' + p[0] + '</text>' + (p[1] ? '<text x="' + x + '" y="' + (y + 13) + '" class="xa">' + p[1] + '</text>' : '');
  }
  function lines(c) {
    var sm = innerWidth < 640, W = sm ? 360 : 640, H = sm ? 250 : 290, L = sm ? 36 : 48, Rr = sm ? 46 : 64, T = 16, B = 36, fs = sm ? 10.5 : 13;
    var all = []; c.series.forEach(function (s) { s.vals.forEach(function (v) { if (v != null) all.push(v); }); });
    var lo = Math.min(0, c.min != null ? c.min : Math.min.apply(null, all)), hi = c.max != null ? c.max : Math.max.apply(null, all);
    var ticks = niceTicks(lo, hi, 4); lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]);
    var n = c.labels.length;
    var X = function (i) { return L + (W - L - Rr) * (n === 1 ? .5 : i / (n - 1)); };
    var Y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var g = ticks.map(function (t) {
      return '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" class="' + (t === 0 ? 'z' : 'g') + '"/>' +
        '<text x="' + (L - 6) + '" y="' + (Y(t) + 4) + '" class="ya">' + fmtN(t, c.unit) + '</text>';
    }).join('');
    var xl = c.labels.map(function (l, i) { return (sm && n > 8 && i % 2 && i !== n - 1) ? '' : xlab(l, X(i), H - B + 16); }).join('');
    var ends = [];
    var body = c.series.map(function (s, si) {
      var col = s.color || PAL[si % PAL.length], pts = [], segs = [], cur = [];
      s.vals.forEach(function (v, i) {
        if (v == null) { if (c.gaps && cur.length) { segs.push(cur); cur = []; } }  // 빈 분기는 기본적으로 건너뛰어 잇는다
        else { cur.push([X(i), Y(v)]); pts.push([X(i), Y(v), v]); }
      });
      if (cur.length) segs.push(cur);
      var d = segs.map(function (sg) { return 'M' + sg.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'); }).join(' ');
      var dots = pts.map(function (p, k) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="' + col + '" style="--d:' + (k * 0.06) + 's"/>'; }).join('');
      // 숫자 표시: 같은 분기에 다른 선이 바로 위에 있으면 점 아래에 쓴다
      var lbl = (c.series.length === 1 || s.all) ? pts.map(function (p) {
        var i = Math.round((p[0] - L) / ((W - L - Rr) / Math.max(1, n - 1))), below = false;
        c.series.forEach(function (o, oi) { var ov = o.vals[i]; if (oi !== si && ov != null && (o.all || c.series.length === 1) && ov >= p[2] && Y(ov) > p[1] - 22 && !(ov === p[2] && oi > si)) below = true; });
        if (p[1] - 9 < T) below = true;
        return '<text x="' + p[0].toFixed(1) + '" y="' + (below ? p[1] + fs + 6 : p[1] - 9).toFixed(1) + '" class="pv" fill="' + col + '">' + fmtN(p[2], c.unit) + '</text>';
      }).join('') : '';
      var last = pts[pts.length - 1];
      if (last && c.series.length > 1 && !s.all) ends.push({ x: last[0], y: last[1], t: fmtN(last[2], c.unit), col: col });
      return '<path d="' + d + '" pathLength="1" class="ln" stroke="' + col + '" style="--d:' + (si * 0.15) + 's"/>' + dots + lbl;
    }).join('');
    ends.sort(function (a, b) { return a.y - b.y; });
    for (var k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < fs + 2) ends[k].y = ends[k - 1].y + fs + 2;
    var et = ends.map(function (e) { return '<text x="' + (e.x + 8) + '" y="' + (e.y + 4) + '" class="ev" fill="' + e.col + '">' + e.t + '</text>'; }).join('');
    var leg = c.series.length > 1 ? '<div class="ic__leg">' + c.series.map(function (s, si) { return '<span><i style="background:' + (s.color || PAL[si % PAL.length]) + '"></i>' + s.name + '</span>'; }).join('') + '</div>' : '';
    return card(c, pills(c.pills) + leg + '<svg class="ic__lsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + c.title.replace(/"/g, '') + '" style="font-size:' + fs + 'px">' + g + xl + body + et + '</svg>' + nt(c));
  }
  function pnbars(c) {
    var sm = innerWidth < 640, W = sm ? 360 : 640, fs = sm ? 9.5 : 12.5;
    var vs = c.items.map(function (it) { return it.v; }), lo = Math.min(0, Math.min.apply(null, vs)), hi = Math.max(0, Math.max.apply(null, vs));
    var T = 22, B = 36 + (lo < 0 ? fs + 6 : 0), H = (sm ? 230 : 270) + (lo < 0 ? fs + 6 : 0);
    var n = c.items.length, slot = W / n, bw = slot * 0.64;
    var Y = function (v) { return T + (H - T - B) * (1 - (v - lo) / ((hi - lo) || 1)); }, z = Y(0);
    var bars = c.items.map(function (it, i) {
      var x = slot * i + (slot - bw) / 2, y = Math.min(Y(it.v), z), h = Math.max(1.5, Math.abs(Y(it.v) - z)), neg = it.v < 0;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" class="pb' + (neg ? ' neg' : '') + (it.cls ? ' ' + it.cls : '') + '" style="--d:' + (i * 0.06) + 's"/>' +
        '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (neg ? y + h + fs + 2 : y - 5).toFixed(1) + '" class="pv' + (neg ? ' negt' : '') + '">' + it.text + '</text>' +
        xlab(it.label, (x + bw / 2).toFixed(1), H - 36 + 16);
    }).join('');
    return card(c, pills(c.pills) + '<svg class="ic__lsvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + c.title.replace(/"/g, '') + '" style="font-size:' + fs + 'px"><line x1="0" x2="' + W + '" y1="' + z + '" y2="' + z + '" class="z"/>' + bars + '</svg>' + nt(c));
  }

  // ---- 데이터 ------------------------------------------------------------
  var CH = {
    revenue: { t: vbars, kicker: 'REVENUE', title: '매출이 폭발적으로 늘었다', sub: '단위: 억 달러 (2026년은 상반기 6개월 합계)', max: 162.9,
      pills: [{ html: '2026 상반기 = 2025 상반기(11.6억)의 약 <em data-count="14">14</em>배' }],
      note: '2026년 상반기 6개월 매출은 2025년 한 해의 약 <b>3.5배</b>이고, 2분기(4~6월) 매출은 1년 전보다 <b>1,368%</b> 늘었다고 회사가 밝혔습니다.',
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
      note: '※ 구글 추가 TPU 1,250~1,500억 달러는 별도입니다.',
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

  CH.ladder = { t: hbars, kicker: 'BIG CUSTOMERS', title: '연간 사용액별 고객 수', sub: '단위: 곳 (2026년 최근 기준, "이상")', max: 11900,
    note: '미국 매출 상위 500대 기업의 <b>절반 넘게</b>가 연 10만 달러 이상 고객입니다. 2026년 1~9월에 매출의 10%를 넘은 단일 고객은 없어 특정 고객 의존도는 낮습니다.',
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
    note: '<b>노란 표시</b>는 스페이스X.AI 약정을 해지할 수 있게 되는 시점(2027년 초 이후, 90일 전 통보)입니다. 아마존·마이크로소프트·스페이스X.AI는 시작 시점이 서류에 표시되지 않았습니다.',
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
  }

  CH.fomc_glance = { t: cards, kicker: 'AT A GLANCE', title: '10월 FOMC, 숫자 4개로 보기', sub: '2026년 10월 28일(현지시간) 결정', cols: 2,
    items: [
      { lab: '기준금리 목표 범위', big: '3.75~4.00%', dk: 1, text: '연준이 그대로 유지했습니다 (9월에 0.25%p 인상)' },
      { lab: '표결 (찬성 : 반대)', big: '10 : 2', text: '반대 2표는 모두 0.25%p 인상을 원했습니다' },
      { lab: '9월 소비자물가 (1년 전 대비)', big: '3.7%', text: '연준 목표 2%보다 높습니다 (Fortune 보도)' },
      { lab: '경기 표현 (성명)', big: '강한', text: '9월 "견조한(solid)"에서 "강한(strong)"으로 올랐습니다' }] };

  CH.fomc_vote = { t: stack, kicker: 'VOTE', title: '표결은 10대 2, 반대는 모두 인상 쪽', sub: '단위: 명 (FOMC 투표 위원 12명)', h: 110,
    segs: [
      { cls: 'dark', g: 10, html: '<div class="ic__vs"><small>동결 찬성</small><strong class="y" data-text="10명">10명</strong><span>3.75~4.00% 유지</span></div>', tip: '<b>10명</b>이 금리를 그대로 두는 안에 찬성했습니다.' },
      { cls: 'hot', g: 2, html: '<div class="ic__vs"><small>반대</small><strong class="p" data-text="2명">2명</strong></div>', tip: '<b>리사 쿡 이사, 베스 해맥 클리블랜드 연은 총재.</b> 0.25%p 인상을 원했습니다. 이유는 확인한 자료에 나오지 않습니다.' }],
    two: ['<b class="v">쿡 이사</b>의 반대는<br>예상 밖이었다고 Fortune이 전했습니다.', '<b class="c">해맥 총재</b>의 반대는<br>회의 전부터 예상됐습니다.'] };

  CH.fomc_infl = { t: hbars, kicker: 'INFLATION', title: '물가는 연준 목표 2%보다 높다', sub: '단위: % (2026년 9월, 1년 전 대비 상승률)', max: 3.7,
    note: '소비자물가 상승은 주로 휘발유 때문이고, 근원물가(식품·에너지 제외)는 예상보다 높았다고 Fortune이 전했습니다.',
    items: [
      { label: '소비자물가', v: 3.7, text: '3.7%', cls: 'hot', tip: '<b>소비자물가</b> 1년 전보다 3.7% 상승.' },
      { label: '근원물가', v: 2.6, text: '2.6%', tip: '<b>근원물가</b> 1년 전보다 2.6% 상승.' },
      { label: '연준 목표', v: 2, text: '2.0%', cls: 'cool', tip: '연준이 장기적으로 잡은 물가 목표는 2%입니다.' }] };

  CH.fomc_words = { t: table, kicker: 'STATEMENT', title: '성명에서 달라진 것과 그대로인 것', sub: '2026년 9월 → 10월 (요지, 원문 전문 아님)', cls: 'plain',
    head: ['항목', '9월', '10월'],
    rows: [['경기 표현', '견조한(solid)', '<b>강한(strong)</b>'],
      ['물가 표현', '여전히 높다', '여전히 높다 (그대로)'],
      ['정보가 더 필요하다는 문장', '없음', '<b>새로 들어감</b>'],
      ['마지막 문장', '"물가 안정을 이루겠다"', '같은 문장 (그대로)']] };

  CH.fomc_sched = { t: table, kicker: 'SCHEDULE', title: '2027년부터 회의 방식이 바뀐다', sub: '단위: 회 (연 8회 회의 중 구성, 워시 의장 설명 기준)', cls: 'plain',
    head: ['연도', '전체 회의', '금리 결정 회의', '전략 논의 회의'],
    rows: [['2026', '8', '8', '0'], ['2027', '8', '7 (제 계산)', '1'], ['2028 (전망)', '8', '6', '2']],
    note: '전략 논의 회의에서는 금리 표결과 성명이 없을 것으로 예상됩니다. 회의 뒤 무엇을 알릴지는 워시 의장도 "아직 분명하지 않다"고 했습니다.' };

  CH.fomc_known = { t: have, kicker: 'KNOWN / UNKNOWN', title: '지금 알 수 있는 것, 아직 모르는 것', sub: '12월 회의 전 상황',
    yes: { title: '✓ 알 수 있는 것', items: ['금리는 <b>3.75~4.00%로 동결</b>', '표결은 <b>10대 2</b>, 반대는 모두 인상 쪽', '9월 소비자물가 <b>3.7%</b>, 목표 2%보다 높음', '회의 전 인상 확률은 10% 미만이었음'] },
    no: { title: '✕ 아직 모르는 것', items: ['12월에 <b>실제로 올릴지</b>', '12월 인상 확률의 구체적 숫자', '쿡·해맥이 반대한 <b>이유</b>', '그날 주가·금리의 정확한 움직임'] },
    note: '회의 뒤 12월 인상 가능성이 높다는 보도가 나왔지만 구체적 확률은 확인하지 못했습니다.' };

  CH.al_glance = { t: cards, kicker: 'AT A GLANCE', title: '알파벳 3분기, 숫자 4개로 보기', sub: '2026년 3분기(7~9월), 단위는 항목마다 표시', cols: 2,
    items: [
      { lab: '매출 (단위: 억 달러)', big: '1,275.8', dk: 1, text: '1년 전보다 25% 늘었습니다 (회사 발표)' },
      { lab: '구글 클라우드 매출 (단위: 억 달러)', big: '307.1', text: '103% 늘어 2배가 됐습니다 (회사 발표)' },
      { lab: '잉여현금흐름 (단위: 억 달러)', big: '-90.7', text: '2분기 연속 적자. 시장 예상은 약 -27억 달러였습니다' },
      { lab: '실적 발표 뒤 시간외 주가 (10/28)', big: '약 -10%', text: '출처마다 8.5%~11% 하락으로 다르게 전했습니다' }] };

  CH.al_growth = { t: hbars, kicker: 'GROWTH', title: '클라우드만 2배, 나머지는 한 자릿수에서 10%대', sub: '단위: % (2026년 3분기 매출, 1년 전 대비 성장률)', max: 103,
    note: '구글 서비스 전체는 963.0억 달러로 11% 늘었고, 총매출은 1,275.8억 달러로 25% 늘었습니다(회사 발표).',
    items: [
      { label: '구글 클라우드', v: 103, text: '103%', cls: 'hot', tip: '<b>구글 클라우드</b> 매출 307.1억 달러, 1년 전(151.6억)의 약 2배입니다.' },
      { label: '검색 및 기타', v: 12, text: '12%', tip: '<b>검색 및 기타</b> 633.5억 달러. 2분기 17%, 1분기 19%보다 낮아졌습니다(Yahoo Finance 보도).' },
      { label: '구독·플랫폼·기기', v: 11, text: '11%', tip: '<b>구독·플랫폼·기기</b> 142.9억 달러.' },
      { label: '유튜브 광고', v: 9, text: '9%', tip: '<b>유튜브 광고</b> 112.1억 달러.' },
      { label: '구글 네트워크', v: 1, text: '1%', tip: '<b>구글 네트워크</b> 74.6억 달러.' }] };

  CH.al_cloud = { t: table, kicker: 'GOOGLE CLOUD', title: '클라우드는 매출도 이익률도 크게 올랐다', sub: '단위: 억 달러 (이익률은 %, 회사 발표 기준)', cls: 'plain',
    head: ['항목', '2025년 3분기', '2026년 3분기'],
    rows: [['매출', '151.6', '<b>307.1</b> (+103%)'], ['영업이익', '35.9', '<b>111.2</b>'], ['영업이익률', '23.7%', '<b>36.2%</b>'],
      ['수주잔고(계약했지만 아직 매출로 안 잡은 금액)', '5,140 (2분기 말, 보도 기준)', '<b>5,610</b>']],
    note: '수주잔고의 약 55%는 앞으로 24개월 안에 매출이 될 것이라고 CFO가 밝혔습니다. TPU(구글이 만든 AI 전용 칩) 시스템 판매 금액은 공개되지 않았습니다.' };

  CH.al_miss = { t: table, kicker: 'ACTUAL vs EXPECTED', title: '클라우드는 예상보다 좋고 나머지는 못 미쳤다', sub: '단위: 억 달러 (주당순이익만 달러). 예상치는 LSEG·FactSet 집계를 인용한 보도 기준', cls: 'plain',
    head: ['항목', '실제', '시장 예상'],
    rows: [['매출', '1,275.8', '1,282.2'], ['검색 및 기타', '633.5', '649.6'], ['광고 전체', '820.1', '834.0'],
      ['구글 클라우드', '<b>307.1</b>', '287.0'], ['영업이익', '405.8', '431.9'], ['설비투자', '513.6', '550.9'],
      ['잉여현금흐름', '<b>-90.7</b>', '-27.0'], ['조정 주당순이익 (달러)', '2.67', '3.02']],
    note: '조정 주당순이익 2.67달러는 Reuters가 전한 값이고, 회사의 공식 희석 주당순이익은 2.12달러입니다. 보도마다 예상치가 조금씩 다릅니다.' };

  CH.al_cash = { t: table, kicker: 'CASH', title: '투자는 2배로 늘고 돈은 마이너스가 됐다', sub: '단위: 억 달러 (회사 발표 기준)', cls: 'plain',
    head: ['항목', '비교 시점', '2026년 3분기'],
    rows: [['설비투자(서버·데이터센터 등)', '239.5 (2025년 3분기)', '<b>513.6</b> (약 2.1배, 제 계산)'],
      ['영업현금흐름', '484.1 (2025년 3분기)', '422.9'],
      ['잉여현금흐름', '-58.6 (2026년 2분기)', '<b>-90.7</b>'],
      ['자사주 매입', '115.0 (2025년 3분기)', '<b>0</b>'],
      ['장기부채', '465.5 (2025년 말)', '<b>1,251.0</b>'],
      ['현금·유가증권', '1,268.4 (2025년 말)', '2,651.0']],
    note: '잉여현금흐름이 적자인 이유로 회사는 TPU 재고 쌓기와 유럽연합(EU) 과징금 52억 달러 지급을 들었습니다.' };

  CH.al_qa = { t: table, kicker: 'EARNINGS CALL', title: '애널리스트 질문 7개와 답변 요지', sub: '2026년 10월 28일 컨퍼런스콜 (제3자 녹취록 요약)', cls: 'plain',
    head: ['질문자 (소속)', '질문', '답변 요지'],
    rows: [['더그 앤무스 (JP모건)', '검색 둔화는 AI 화면의 광고가 적어서인가', '쉰들러: 환율이 가장 큰 요인. EU 소액면세 폐지, 월드컵 효과 사라짐, AI 모드는 아직 광고 수익이 낮음'],
      ['브라이언 노왁 (모건스탠리)', '에이전트 상품이 전체 이용자에게 가려면', '피차이: 기업용 먼저, 소비자용은 올해 안에 제미나이 앱부터. CFO: 4분기에도 검색 성장률 비교 부담이 있음'],
      ['에릭 셰리든 (골드만삭스)', '컴퓨팅 자원은 어떻게 배분하나', '피차이: 사업별 투자수익률 틀로 배분. 쿠리안: TPU 고객 100곳 이상, 고객사 데이터센터에도 제공'],
      ['로스 샌들러 (바클레이즈)', 'TPU 시스템의 매출·이익률은', 'CFO: 제품별 수치는 비공개. 수주잔고 → 재고 → 납품 때 현금. 매출 일부는 이미 잡혔고 2027년까지 더 늘 것'],
      ['저스틴 포스트 (BofA)', '에이전트 검색이 검색을 해치나', '쉰들러: 새 광고·상거래 기회. 쿠리안: 재고는 계약이 있을 때만 쌓음'],
      ['마크 슐믹 (얼라이언스번스타인)', 'TPU 제외 클라우드 성장률은', '쿠리안: "매우 강하다"고만 하고 숫자는 주지 않음'],
      ['마이클 네이선슨 (모펫나단슨)', '경쟁사와의 협력은', '피차이: TPU·클라우드는 플랫폼으로 경쟁사에도 제공']] };

  CH.al_media = { t: table, kicker: 'MEDIA & ANALYSTS', title: '평가는 대체로 클라우드는 합격, 현금은 걱정', sub: '언론 보도와 애널리스트 발언 요지 (2026년 10월 28~29일)', cls: 'plain',
    head: ['누가', '평가 요지'],
    rows: [['Reuters', '검색 부진으로 매출이 예상에 못 미쳤고 현금 소진이 커졌다. 시간외 약 10% 하락'],
      ['CNBC', '이익·매출 모두 예상 미달(4년 만의 더블 미스). 하락폭이 역대 최대 실적 후 하락이 될 수 있다고 전함'],
      ['댄 아이브스 (보도 표기 Yorkville Ives)', '"기다려 온 클라우드 실적"이라며 수요 걱정은 덜었다고 평가'],
      ['데이브 웨그너 (Aptus)', '클라우드는 할 일을 했지만 "문제는 나머지". 검색이 다시 빨라져야 주가가 오를 것'],
      ['제레미 솔츠버그 (Check Capital)', '내년 설비투자가 3,000억 달러 가까이 되면 시장이 놀랄 수 있다'],
      ['번스타인 (애널리스트 메모)', '제미나이 4를 실적이 약해서 서둘러 낸 것은 아닌지 의문'],
      ['닉 존스 (BNP파리바)', '검색 매출 2% 부족이 AI 앱에 밀린다는 우려를 키운다'],
      ['루크 랭고 (독립 애널리스트)', '평가손실은 "회계상 잡음". 다만 이제 주주 돈으로 AI 투자를 한다고 지적'],
      ['조나단 웨버 (Cash Flow Club)', '매도는 과민 반응이고 지금 가격은 매력적']] };

  CH.al_vs = { t: table, kicker: 'ALPHABET vs MICROSOFT', title: '같은 날 발표, 주가는 반대로 움직였다', sub: '단위: 억 달러 (회사 발표, FXStreet 보도 기준)', cls: 'plain',
    head: ['항목', '알파벳', '마이크로소프트'],
    rows: [['매출', '1,275.8 (+25%)', '922.8 (+20%)'], ['클라우드 매출 성장률', '구글 클라우드 +103%', '애저(Azure) +48%'],
      ['설비투자', '513.6', '452'], ['잉여현금흐름', '<b>-90.7</b>', '<b>+186</b>'],
      ['실적 발표 뒤 주가', '<b>시간외 약 -10%</b>', '<b>3~5% 상승</b> (시간외)']],
    note: '두 회사 모두 AI 클라우드 수요는 강했습니다. 갈린 것은 설비투자를 하고도 남는 현금이 있었는가라고 보도들은 풀이했습니다.' };

  CH.al_known = { t: have, kicker: 'KNOWN / UNKNOWN', title: '지금 알 수 있는 것, 아직 모르는 것', sub: '2026년 10월 29일 기준',
    yes: { title: '✓ 알 수 있는 것', items: ['매출 <b>1,275.8억 달러(+25%)</b>, 클라우드 <b>+103%</b>', '잉여현금흐름 <b>-90.7억 달러</b>, 자사주 매입 0', '2026년 설비투자 안내 <b>1,950~2,050억 달러</b> 유지', '발표 직후 시간외 주가 <b>약 -10%</b>'] },
    no: { title: '✕ 아직 모르는 것', items: ['10월 29일 <b>정규장 종가</b>', 'TPU 시스템 <b>매출 금액</b>', '<b>2027년 설비투자</b> 정확한 금액 (4분기 콜에서 공개 예정)', '실적 뒤 애널리스트들의 <b>목표주가 변경</b>'] },
    note: '주가가 싼지 비싼지는 이 글에서 판단하지 않습니다.' };

  // ---- 아마존·인텔 3분기 (2026-10-30) -----------------------------------
  CH.ai_glance = { t: cards, kicker: 'AT A GLANCE', title: '아마존·인텔 3분기, 숫자 4개로 보기', sub: '2026년 3분기(7~9월), 단위는 항목마다 표시', cols: 2,
    items: [
      { lab: '아마존 3분기 매출 (단위: 억 달러)', big: '2,019', dk: 1, text: '1년 전보다 12% 늘었습니다 (회사 공시)' },
      { lab: '아마존 최근 12개월 잉여 현금 흐름 (단위: 억 달러)', big: '-424', text: '1년 전에는 +148억 달러였습니다 (회사 공시)' },
      { lab: '인텔 3분기 매출 (단위: 억 달러)', big: '165', text: '1년 전보다 21% 늘었습니다 (회사 공시)' },
      { lab: '인텔 4분기 매출 전망 (단위: 억 달러)', big: '150~160', text: '3분기 실적 165억 달러보다 낮습니다 (회사 전망)' }] };

  CH.ai_growth = { t: hbars, kicker: 'GROWTH', title: '클라우드(AWS)만 39%, 나머지는 한 자릿수', sub: '단위: % (2026년 3분기 매출, 1년 전 대비 성장률)', max: 39,
    note: '전체 매출은 2,019억 달러로 12% 늘었습니다. 프라임데이가 2분기로 옮겨 가서, 회사는 이 영향을 빼면 약 4%포인트 더 높았을 것이라고 설명합니다.',
    items: [
      { label: 'AWS(클라우드)', v: 39, text: '39%', cls: 'hot', tip: '<b>AWS</b> 매출 460억 달러. 연 환산 1,840억 달러 규모입니다. "거의 5년 만에 가장 빠른 성장"은 회사 표현입니다.' },
      { label: '아마존 전체', v: 12, text: '12%', tip: '<b>전체 매출</b> 2,019억 달러, 1년 전 1,802억 달러.' },
      { label: '북미', v: 6, text: '6%', tip: '<b>북미</b> 매출 1,129억 달러.' },
      { label: '해외', v: 5, text: '5%', tip: '<b>해외</b> 매출 431억 달러. 환율 영향을 빼면 8%입니다.' }] };

  CH.ai_profit = { t: table, kicker: 'PROFIT', title: '영업이익은 크게 늘었는데 순이익은 줄었다', sub: '단위: 억 달러 (2026년 3분기, 회사 공시 기준)', cls: 'plain',
    head: ['항목', '2025년 3분기', '2026년 3분기'],
    rows: [['영업이익 (전체)', '174', '<b>281</b> (영업이익률 13.9%, 역대 최고)'], ['AWS 영업이익', '114', '<b>178</b>'], ['북미 영업이익', '48', '<b>87</b>'], ['해외 영업이익', '12', '<b>16</b>'], ['순이익', '212', '<b>207</b>']],
    note: '순이익이 준 이유로 공시는, 1년 전 3분기에 앤스로픽 투자에서 생긴 세전 이익 95억 달러가 영업 외 수익에 들어 있었다는 점을 듭니다.' };

  CH.ai_cash = { t: vbars, kicker: 'CASH', title: '번 현금보다 설비 구입이 더 컸다', sub: '단위: 억 달러 (최근 12개월, 회사 공시 기준)', max: 2200,
    pills: [{ html: '잉여 현금 흐름 = 1,683 - 2,107 = <b>-424억 달러</b>', cls: 'soft' }],
    note: '설비 구입(순액)은 1년 전 1,159억 달러에서 82% 늘었고, 공시는 이 증가를 주로 인공지능(AI) 투자라고 설명합니다. 잉여 현금 흐름은 1년 전 +148억 달러였습니다.',
    items: [
      { label: '영업<br>현금 흐름', v: 1683, text: '1,683' },
      { label: '설비 구입<br>(순액)', v: 2107, text: '2,107', cls: 'hot' }] };

  CH.ai_intel = { t: vbars, kicker: 'INTEL SEGMENTS', title: '서버용 칩 부문이 78% 늘었고 PC 부문은 줄었다', sub: '단위: 억 달러 (2026년 3분기 매출, 괄호는 1년 전 대비)', max: 90,
    note: '부문 매출을 모두 더하면 전체 165억 달러와 맞지 않습니다. 부문 사이의 내부 거래가 따로 빠지기 때문입니다.',
    items: [
      { label: '데이터센터<br>·AI', v: 73, text: '73 (+78%)', cls: 'hot' },
      { label: 'PC<br>·피지컬 AI', v: 81, text: '81 (-5%)' },
      { label: '파운드리<br>(위탁생산)', v: 67, text: '67 (+58%)' }] };

  CH.ai_outlook = { t: table, kicker: 'OUTLOOK', title: '4분기 전망은 3분기 실적보다 낮다', sub: '단위는 항목마다 표시 (인텔, 회사 보도자료 기준)', cls: 'plain',
    head: ['항목', '3분기 실적', '4분기 전망'],
    rows: [['매출 (억 달러)', '165', '<b>150~160</b>'], ['조정 주당순이익 (달러)', '0.52', '<b>0.25</b> (약 48%, 제 계산)'], ['조정 매출총이익률 (%)', '44.1', '<b>38.0</b>'], ['GAAP 주당순이익 (달러)', '0.60', '<b>0.10</b>']],
    note: '콜에서 인텔은 낮은 전망의 이유로 PC 시장 둔화와 이스라엘 공장 사고(4분기 매출 약 3억 달러, 매출총이익률 약 2%포인트 영향)를 들었습니다(로이터). PC 부문 4분기 매출은 20%대 중반 줄 것으로 전했습니다.' };

  CH.ai_known = { t: have, kicker: 'KNOWN / UNKNOWN', title: '지금 알 수 있는 것, 아직 모르는 것', sub: '2026년 10월 30일 기준',
    yes: { title: '✓ 알 수 있는 것', items: ['아마존 매출 <b>2,019억 달러(+12%)</b>, AWS <b>+39%</b>, 잉여 현금 흐름 <b>-424억 달러</b>', '인텔 매출 <b>165억 달러(+21%)</b>, 4분기 전망 <b>150~160억 달러</b>', '시장 예상: 아마존은 소폭 미달, 인텔 4분기 전망은 크게 낮음', '인텔 전망이 낮은 이유로 경영진이 든 <b>PC 둔화와 공장 사고</b>'] },
    no: { title: '✕ 아직 모르는 것', items: ['30일 <b>정규장 종가</b>와 애널리스트 <b>목표주가 변경</b>', '시간외 하락폭의 <b>정확한 값</b> (출처마다 다름)', '인텔 이스라엘 공장 사고 영향의 <b>최종 규모</b> (회사 추정)', '아마존 설비 투자의 <b>수익이 돌아오는 시점</b>'] },
    note: '주가가 싼지 비싼지는 이 글에서 판단하지 않습니다.' };

  CH.ai_call_am = { t: table, kicker: 'EARNINGS CALL · AMAZON', title: '애널리스트 질문 6개와 답변 요지', sub: '2026년 10월 29일 컨퍼런스콜 (제3자 전사본 Quartr, MarketBeat 게재)', cls: 'plain',
    head: ['질문자 (소속)', '질문', '답변 요지'],
    rows: [['저스틴 포스트 (뱅크오브아메리카)', 'AWS 분기 증가폭이 둔해진 이유, 4분기 설비 공급, 연료비', '재시: AI 수요는 강하지만 설비 증설 시기가 고르지 않음. 올사브스키: 4분기 연료·화물비가 3분기보다 높고 일부는 판매자 수수료로 상쇄'],
      ['브라이언 노왁 (모건스탠리)', '"매출 1조 달러 사업이 둘 나올 수 있다"는 전망의 근거, 2027년 로봇 목표', '재시: 대형 고객의 예약 용량 약정, 추론 비용 하락, 에이전트 앱 성장. 로봇은 물류망에 100만 대 이상. 2027년 목표 답변은 전사본에서 끊김'],
      ['마크 마하니 (에버코어 ISI)', 'AWS 이익률이 유지될지, 신선식품 배송', '올사브스키: AWS 이익률은 전망하지 않음, AI 비중과 부품 비용이 변수. 생필품 구매 수량이 나머지 매장보다 약 3배 빠르게 증가'],
      ['에릭 셰리든 (골드만삭스)', '베드록(AI 모델 서비스) 기회, 트레이니움 칩 외부 판매', '재시: 고객 대부분이 여러 모델을 씀, 베드록은 "EC2만큼 커질 수 있음", 칩 외부 판매는 2027년 말 시작'],
      ['더그 앤무스 (JP모건)', '40% 이상 성장에 필요한 투자, 서버 수명', '재시: "평생에 한 번 있는 기회", 투자 계획은 자체 자금으로 감당 가능'],
      ['로스 샌들러 (바클레이즈)', '베드록이 추론 서비스로 옮겨 가면 매출·이익률은', '재시: 직접 보유·장기 임차한 용량이 외부 임대보다 이익률이 좋음']],
    note: '경영진 발언: 재시 CEO "AWS는 2027년과 2028년 매년 40%를 넘게 성장할 수 있다", "이 계획은 자금을 댈 수 있다". 올사브스키 CFO "AWS 영업이익률은 38.7%" (공시 숫자와 같음), "AI의 빠른 성장은 회사 전체 이익률에 압박". 전사본이라 일부 답변은 중간에 끊겨 있고, 수주잔고 5,780억 달러 등 공시에 없는 숫자는 전사본 기준입니다.' };

  CH.ai_call_in = { t: table, kicker: 'EARNINGS CALL · INTEL', title: '인텔 경영진이 콜에서 한 말', sub: '2026년 10월 29일 컨퍼런스콜 (로이터 보도와 MarketBeat 전사본 요약)', cls: 'plain',
    head: ['누가', '말한 내용'],
    rows: [['립부 탄 CEO', '"고객 수요를 맞추지 못해 실망스럽다". 당면 과제로 제조 공급 부족과 "전례 없는 메모리 부족"을 꼽음 (로이터)'],
      ['립부 탄 CEO', '인텔 3와 18A 공정 수율이 모두 개선, 18A는 두 자릿수 속도로 개선 (전사본)'],
      ['데이비드 진스너 CFO', 'PC 시장 규모가 2026년 약 12%, 2027년 약 10% 줄 것으로 봄. 재고 조정은 적어도 1분기까지 (전사본)'],
      ['데이비드 진스너 CFO', '10월 이스라엘 키랴트 갓 공장 사고로 두 분기 동안 약 6억 달러 매출이 줄고, 4분기 매출 전망이 약 3억 달러·매출총이익률이 약 2%포인트 낮아짐. 1분기에도 비슷한 영향 (로이터)'],
      ['데이비드 진스너 CFO', '올해 설비투자 200억 달러, 2027년에는 크게 늘 것. 올해 플러스 현금 흐름은 기대하지 않으며 내년에도 "그런 상황은 아닐 것" (로이터, 전사본)'],
      ['질문한 애널리스트', '티머시 아쿠리(UBS), 벤 레이츠(멜리우스), 조지프 무어(모건스탠리), 스테이시 래스건(번스타인), 비벡 아리아(뱅크오브아메리카), 할란 서(JP모건), CJ 뮤즈(캔터 피츠제럴드)']],
    note: '전사본 요약이 AI 생성이라 오류가 있을 수 있어, 숫자는 공시와 로이터로 맞춰 쓰고 애널리스트별 질문 내용은 적지 않았습니다. 공시 보도자료에는 이스라엘 공장 사고 언급이 없고 콜과 보도에서 나온 내용입니다.' };

  CH.ai_miss = { t: table, kicker: 'ACTUAL vs EXPECTED', title: '실제와 시장 예상: 아마존은 소폭 미달, 인텔은 이익은 웃고 전망은 울었다', sub: '단위는 항목마다 표시. 예상치는 FactSet·LSEG 집계를 인용한 보도 기준', cls: 'plain',
    head: ['항목', '실제', '시장 예상'],
    rows: [['아마존 매출 (억 달러)', '2,019', '2,022'], ['아마존 주당순이익 (달러)', '1.89', '1.97'], ['아마존 순이익 (억 달러)', '207', '215'], ['아마존 광고 매출 (억 달러)', '196', '208'],
      ['인텔 조정 주당순이익 (달러)', '<b>0.52</b>', '0.40'], ['인텔 4분기 매출 전망 (억 달러)', '150~160', '약 171'], ['인텔 4분기 조정 주당순이익 전망 (달러)', '0.25', '0.43~0.44']],
    note: '보도마다 예상치가 조금씩 다릅니다(아마존 주당순이익 1.96~1.97, 인텔 4분기 조정 주당순이익 0.43~0.44). 아마존 4분기 전망은 중간값이 시장 예상보다 낮았다고 포천이 전했습니다.' };

  CH.ai_media = { t: table, kicker: 'MEDIA & ANALYSTS', title: '평가는 갈렸다: 아마존은 클라우드 합격, 현금은 걱정', sub: '언론 보도와 애널리스트·투자자 발언 요지 (2026년 10월 29~30일)', cls: 'plain',
    head: ['누가', '평가 요지'],
    rows: [['포천 (Fortune)', 'AWS는 39.3% 성장했지만 AI 투자와 광고 부진(+12%)이 가렸고, 4분기 전망 중간값이 시장 예상보다 낮았다. 우려로 AI 거품 논란과 앤스로픽이 아마존 클라우드에 최소 1,100억 달러를 약정한 점을 꼽음'],
      ['야후 파이낸스 (FactSet 집계)', '매출·순이익·광고 매출 모두 예상을 소폭 밑돌았고 AWS는 성장이 빨라졌다'],
      ['24/7 월스트리트', '낙관론: AWS 재가속과 2027~2028년 40% 초과 성장 전망이 매출·주당순이익 미달보다 크다. 비관론: 마이너스 잉여 현금 흐름, 부채·이자 비용, 메모리 칩 공급 불안'],
      ['로이터 (인텔)', '인텔은 현금 소진과 약한 4분기 전망으로 시간외 23% 하락. 엔비디아·브로드컴·AMD 등 반도체주도 1~6% 내림'],
      ['제이 골드버그 (Seaport Research Partners)', '"어떤 결과도 충분히 좋지 않고, 나쁜 결과는 더 크게 벌을 받는다"'],
      ['헨디 수산토 (Gabelli Funds, 포트폴리오 매니저)', '"키랴트 갓 공장 폭발은 안타까운 일이고 인텔의 생산 능력을 낮췄다"']],
    note: '아마존에 대해서는 이름이 밝혀진 애널리스트의 발표 직후 평가를 제가 찾은 기사에서 확인하지 못했습니다. 목표주가 변경도 확인하지 못했습니다.' };

  CH.ai_stock = { t: table, kicker: 'STOCK REACTION', title: '발표 직후 주가: 아마존 -6~7%, 인텔은 -14~23%', sub: '2026년 10월 29일 (미국 동부시간). 출처마다 숫자가 달라 범위로 표시', cls: 'plain',
    head: ['종목', '정규장 종가', '발표 뒤 시간외'],
    rows: [['아마존', '243.79달러 (-4.25%)', '<b>약 -6%~-7%</b> (포천 6% 초과, 야후 7% 초과, MarketBeat 오후 8시 225.87달러 -7.35%)'], ['인텔', '92.07달러 (-3.62%)', '<b>약 -14%~-23%</b> (로이터 -23%, 다른 보도 -14·-18·-21%)']],
    note: '시간외 거래는 시각에 따라 크게 흔들려 한 숫자로 확정하기 어렵습니다. 30일 정규장 종가는 확인하지 못했습니다.' };

  CH.ai_korea_mkt = { t: table, kicker: 'KOREA MARKET', title: '한국 반도체 대형주: 발표 다음 날 장 초반 약세', sub: '단위: 원 (2026년 10월 29~30일, 한국 시간)', cls: 'plain',
    head: ['종목', '29일 종가', '30일 장 초반 (오전 9시 51분)'],
    rows: [['삼성전자', '232,000 (-4.13%)', '<b>222,000 (-4.31%)</b>'], ['SK하이닉스', '1,526,000 (+2.62%)', '<b>1,408,500 (-7.70%)</b>']],
    note: '장 초반 등락률은 시각에 따라 달라, 다른 기사에서는 삼성전자 -3.0~-3.1%, SK하이닉스 -6.4~-7.8%로 나왔습니다. 30일 정규장 종가는 확인하지 못했습니다. 삼성전자는 3분기 사상 최대 실적에도 반도체 이익이 기대에 못 미쳐 29일에 내렸고, SK하이닉스는 28일에 약 11% 올랐습니다(Investing.com).' };

  CH.ai_korea = { t: cards, kicker: 'KOREA SEMICONDUCTORS', title: '두 기업 실적이 한국 반도체 주식에 미칠 영향', sub: '아래 해석은 제 판단이며 투자 권유가 아닙니다', cols: 1, one: true,
    items: [
      { tag: '단기', head: '심리 악재', text: '아마존의 현금 흐름과 인텔의 낮은 전망이 "AI 투자가 돈이 되나"라는 걱정을 키워 발표 다음 날 장 초반 삼성전자와 SK하이닉스가 약했습니다. 삼성 실적과 알파벳 발표가 겹쳐서 아마존·인텔 때문이라고 단정할 수는 없습니다.' },
      { tag: '중기 · 긍정', head: '서버용 메모리 수요 신호', text: '아마존은 올해 설비 투자 약 2,200억 달러를 유지했고 2027년에는 더 늘 것이라고 했습니다. AWS 수주잔고 5,780억 달러(전사본 기준)와 함께 서버용 메모리 수요에 우호적인 신호입니다 (제 해석).' },
      { tag: '중기 · 부담', head: 'PC용 메모리 수요', text: '인텔은 PC 시장이 2026년 약 12%, 2027년 약 10% 줄 것으로 봤습니다(전사본). PC용 메모리 수요에는 부담입니다. 반면 탄 CEO가 말한 "전례 없는 메모리 부족"은 메모리 공급이 빠듯하다는 신호입니다 (제 해석).' },
      { tag: '위험', head: '서버 증설 병목', text: '인텔의 서버용 CPU 공급 부족과 이스라엘 공장 사고로 서버 증설이 늦어지면 메모리 수요 시점도 밀릴 수 있습니다 (제 해석).' },
      { tag: '확인 지점', head: '다음에 볼 것', text: '아마존의 2027년 설비 투자 금액(4분기 콜), 인텔 공장 복구, 메모리 가격과 공급 전망입니다.' }] };






  // ---- a3: 알파벳 3년 분석 (gen_charts.py가 만든 구역, 직접 고치지 말 것) ----
  CH.a3_glance = {"kicker": "AT A GLANCE", "title": "3년 사이 알파벳, 숫자 6개로 보기", "sub": "2023년 4분기 → 2026년 3분기 (분기 기준, 단위는 항목마다 표시)", "cols": 3, "items": [{"lab": "분기 매출", "big": "1,275.8억 달러", "text": "3년 전 863.1억 달러에서 약 48% 늘었습니다 (제 계산)."}, {"lab": "구글 클라우드 매출", "big": "307.1억 달러", "text": "3년 전 91.9억 달러의 약 3.3배입니다 (제 계산)."}, {"lab": "클라우드 영업이익률", "big": "36.2%", "text": "3년 전 9.4%였습니다. 이제 서비스 부문(40.7%)에 가까워졌습니다."}, {"lab": "분기 설비투자", "big": "513.6억 달러", "text": "3년 전 110.2억 달러의 약 4.7배입니다 (제 계산).", "warn": 1}, {"lab": "잉여현금흐름(분기)", "big": "-90.7억 달러", "text": "번 현금보다 투자가 많아 2분기 연속 마이너스입니다. 3년 전 4분기는 +79억 달러였습니다.", "warn": 1}, {"lab": "제미나이 앱 월 사용자", "big": "10억 명", "text": "2025년 2분기 4.5억 명에서 1년여 만에 2배 넘게 늘었다고 회사가 밝혔습니다."}]}; CH.a3_glance.t = cards;
  CH.a3_timeline = {"kicker": "AI MILESTONES", "title": "3년 동안 나온 AI 모델과 기능", "sub": "컨퍼런스콜·보도자료에서 회사가 밝힌 출시 시점", "items": [{"d": "2023.12", "h": "제미나이 1.0", "t": "\"제미나이 시대\" 시작. 검색 실험판 SGE에 적용"}, {"d": "2024.5", "h": "AI 개요 출시", "t": "검색 결과 맨 위 AI 요약. 10월 월 10억 명"}, {"d": "2024.12", "h": "제미나이 2.0", "t": "\"에이전트 시대용\" 모델, 추론 모델 Flash Thinking"}, {"d": "2025.3", "h": "제미나이 2.5 · AI 모드", "t": "챗봇 순위 1위. 대화형 검색 AI 모드 실험 시작"}, {"d": "2025.12", "h": "제미나이 3", "t": "\"가장 빠르게 채택된 모델\". 4분기 검색 17% 성장"}, {"d": "2026.4", "h": "TPU 8세대 · 외부 판매", "cls": "hot", "t": "학습용 8t, 추론용 8i. 고객 데이터센터에 TPU 공급"}, {"d": "2026.10", "h": "제미나이 4", "cls": "hot", "t": "Argon(10월 중순), Carbon(10월 28일 발표)"}]}; CH.a3_timeline.t = steps;
  CH.a3_rev = {"kicker": "REVENUE", "title": "분기 매출이 3년 새 약 1.5배가 됐다", "sub": "단위: 억 달러 (분기 매출, 회사 발표)", "max": 1275.77, "items": [{"label": "'23<br>4Q", "v": 863.1, "text": "863"}, {"label": "'24<br>1Q", "v": 805.39, "text": "805"}, {"label": "'24<br>2Q", "v": 847.42, "text": "847"}, {"label": "'24<br>3Q", "v": 882.68, "text": "883"}, {"label": "'24<br>4Q", "v": 964.69, "text": "965"}, {"label": "'25<br>1Q", "v": 902.34, "text": "902"}, {"label": "'25<br>2Q", "v": 964.28, "text": "964"}, {"label": "'25<br>3Q", "v": 1023.46, "text": "1,023"}, {"label": "'25<br>4Q", "v": 1138.28, "text": "1,138"}, {"label": "'26<br>1Q", "v": 1098.96, "text": "1,099"}, {"label": "'26<br>2Q", "v": 1197.96, "text": "1,198"}, {"label": "'26<br>3Q", "v": 1275.77, "text": "1,276", "cls": "hot"}], "pills": [{"html": "2026년 3분기 = 2023년 4분기의 약 <em data-count=\"1.48\">1.48</em>배 (제 계산)"}], "note": "4분기는 연말 광고 성수기라 1분기보다 높게 나옵니다. 2025년 3분기에 처음 1,000억 달러를 넘었고, 13분기 연속 두 자릿수 성장이라고 회사가 밝혔습니다."}; CH.a3_rev.t = vbars;
  CH.a3_mix = {"kicker": "REVENUE MIX", "title": "검색은 완만히, 클라우드는 가파르게 올랐다", "sub": "단위: 억 달러 (사업별 분기 매출, 회사 발표)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "검색 및 기타", "vals": [480.2, 461.56, 485.09, 493.85, 540.34, 507.02, 541.9, 565.67, 630.73, 603.99, 632.71, 633.5], "color": "#6d4aff"}, {"name": "구글 클라우드", "vals": [91.92, 95.74, 103.47, 113.53, 119.55, 122.6, 136.24, 151.57, 176.64, 200.28, 247.68, 307.09], "color": "#12c2a5"}, {"name": "구독·플랫폼·기기", "vals": [107.94, 87.39, 93.12, 106.56, 116.33, 103.79, 112.03, 128.7, 135.78, 123.84, 129.11, 142.9], "color": "#ffb020"}, {"name": "유튜브 광고", "vals": [92.0, 80.9, 86.63, 89.21, 104.73, 89.27, 97.96, 102.61, 113.83, 98.83, 110.55, 112.07], "color": "#ff5a6e"}, {"name": "네트워크 광고", "vals": [82.97, 74.13, 74.44, 75.48, 79.54, 72.56, 73.54, 73.54, 78.28, 69.71, 73.03, 74.55], "color": "#8b90a8"}], "note": "매출 비중은 클라우드가 11%에서 24%로 오르고 검색은 56%에서 50%로 내려갔습니다(제 계산). 3년 배율은 클라우드 3.34배, 구독·기기 1.32배, 검색 1.32배, 유튜브 광고 1.22배, 네트워크 0.90배입니다(제 계산)."}; CH.a3_mix.t = lines;
  CH.a3_yoy = {"kicker": "GROWTH", "title": "검색은 두 자릿수를 지켰고 클라우드는 가속했다", "sub": "단위: % (1년 전 같은 분기 대비 매출 증가율, 회사 발표 숫자로 제 계산)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "%", "series": [{"name": "구글 클라우드", "vals": [25.66, 28.44, 28.84, 34.98, 30.06, 28.06, 31.67, 33.51, 47.75, 63.36, 81.8, 102.61], "color": "#12c2a5"}, {"name": "전체", "vals": [13.49, 15.41, 13.59, 15.09, 11.77, 12.04, 13.79, 15.95, 17.99, 21.79, 24.23, 24.65], "color": "#14173a"}, {"name": "검색", "vals": [12.71, 14.36, 13.8, 12.17, 12.52, 9.85, 11.71, 14.54, 16.73, 19.13, 16.76, 11.99], "color": "#6d4aff"}, {"name": "구독·기기", "vals": [22.71, 17.89, 14.37, 27.79, 7.77, 18.77, 20.31, 20.78, 16.72, 19.32, 15.25, 11.03], "color": "#ffb020"}, {"name": "유튜브 광고", "vals": [15.53, 20.87, 13.02, 12.19, 13.84, 10.35, 13.08, 15.02, 8.69, 10.71, 12.85, 9.22], "color": "#ff5a6e"}], "note": "클라우드 성장률은 2025년 3분기 34%에서 4개 분기 만에 103%가 됐습니다. 2026년 2분기부터 TPU 시스템 판매 매출이 들어 있습니다. 검색은 2026년 1분기 19%가 가장 높았습니다."}; CH.a3_yoy.t = lines;
  CH.a3_search = {"kicker": "SEARCH", "title": "AI가 검색을 죽인다? 검색 매출은 오히려 늘었다", "sub": "단위: 억 달러 (검색 및 기타 광고 매출, 분기)", "max": 633.5, "items": [{"label": "'23<br>4Q", "v": 480.2, "text": "480"}, {"label": "'24<br>1Q", "v": 461.56, "text": "462"}, {"label": "'24<br>2Q", "v": 485.09, "text": "485"}, {"label": "'24<br>3Q", "v": 493.85, "text": "494"}, {"label": "'24<br>4Q", "v": 540.34, "text": "540"}, {"label": "'25<br>1Q", "v": 507.02, "text": "507"}, {"label": "'25<br>2Q", "v": 541.9, "text": "542"}, {"label": "'25<br>3Q", "v": 565.67, "text": "566"}, {"label": "'25<br>4Q", "v": 630.73, "text": "631"}, {"label": "'26<br>1Q", "v": 603.99, "text": "604"}, {"label": "'26<br>2Q", "v": 632.71, "text": "633"}, {"label": "'26<br>3Q", "v": 633.5, "text": "634", "cls": "hot"}], "pills": [{"html": "'23년 4분기 대비 약 <em data-count=\"32\">32</em>% 증가 (제 계산)"}], "note": "2025년 4분기 17%, 2026년 1분기 19%로 가속했다가 3분기 12%로 낮아졌습니다. 회사는 환율, 전년 가속의 기저, EU 소액면세 폐지, 수익화가 낮은 AI 모드 질의 급증을 이유로 들었습니다."}; CH.a3_search.t = vbars;
  CH.a3_clicks = {"kicker": "PAID CLICKS", "title": "2026년엔 광고 클릭 수가 크게 늘고 단가 상승은 둔해졌다", "sub": "단위: % (1년 전 대비 변화, 10-Q·10-K 공시)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "%", "series": [{"name": "유료 클릭 수", "vals": [7, 5, 6, 4, 5, 2, 4, 7, 6, 13, 13, 8], "color": "#6d4aff", "all": 1}, {"name": "클릭당 단가(CPC)", "vals": [1, 8, 7, 8, 7, 7, 8, 7, 7, 5, 3, 4], "color": "#ffb020", "all": 1}], "note": "4분기 점은 분기 숫자가 공시되지 않아 그해 연간 변화율입니다. 유료 클릭은 검색·지도·지메일 등의 광고가 눌린 횟수, 클릭당 단가는 광고주가 클릭 한 번에 낸 평균 금액입니다. 회사는 \"클릭과 단가 목표로 사업을 관리하지 않는다\"고 했습니다."}; CH.a3_clicks.t = lines;
  CH.a3_aisearch = {"kicker": "AI IN SEARCH", "title": "AI 개요와 AI 모드는 이렇게 커졌다", "sub": "경영진이 콜에서 밝힌 숫자 (월 사용자 등)", "cls": "plain", "head": ["시점", "회사가 밝힌 숫자"], "rows": [["2024년 1분기", "AI 개요 본 검색 적용 시작, 이미 수십억 건 처리. 응답 비용 처음보다 80% 감소"], ["2024년 3분기", "AI 개요 월 10억 명 이상. 쿼리당 비용 18개월 새 90% 이상 감소"], ["2025년 1분기", "AI 개요 월 15억 명. AI 모드 실험 시작(질의가 기존 검색의 약 2배 길이)"], ["2025년 2분기", "AI 개요 월 20억 명. AI 모드 월 1억 명(미국·인도)"], ["2025년 3분기", "AI 모드 하루 7,500만 명, 40개 언어. 전체 질의 증가율이 더 높아짐"], ["2025년 4분기", "미국 AI 모드 이용자당 질의 출시 후 2배, 질의 길이 3배"], ["2026년 2분기", "AI 모드 월 10억 명. AI 개요와 하나의 검색으로 통합"], ["2026년 3분기", "질의 증가율 5년 만에 최고. 월 시각검색 500억 건. AI 모드 광고 해외 확대"]], "note": "AI 개요가 붙은 질의의 광고 수익화율은 기존 검색과 \"거의 같다\"고 2024년 3분기부터 반복해 밝혔습니다. 반면 AI 모드는 2026년 3분기에 \"수익화가 낮다\"고 인정했습니다."}; CH.a3_aisearch.t = table;
  CH.a3_cloud = {"kicker": "GOOGLE CLOUD", "title": "클라우드 매출이 3년 새 3.3배", "sub": "단위: 억 달러 (구글 클라우드 부문 매출, 분기)", "max": 307.09, "items": [{"label": "'23<br>4Q", "v": 91.92, "text": "91.9"}, {"label": "'24<br>1Q", "v": 95.74, "text": "95.7"}, {"label": "'24<br>2Q", "v": 103.47, "text": "103"}, {"label": "'24<br>3Q", "v": 113.53, "text": "114"}, {"label": "'24<br>4Q", "v": 119.55, "text": "120"}, {"label": "'25<br>1Q", "v": 122.6, "text": "123"}, {"label": "'25<br>2Q", "v": 136.24, "text": "136"}, {"label": "'25<br>3Q", "v": 151.57, "text": "152"}, {"label": "'25<br>4Q", "v": 176.64, "text": "177"}, {"label": "'26<br>1Q", "v": 200.28, "text": "200"}, {"label": "'26<br>2Q", "v": 247.68, "text": "248"}, {"label": "'26<br>3Q", "v": 307.09, "text": "307", "cls": "hot"}], "pills": [{"html": "3년 새 약 <em data-count=\"3.3\">3.3</em>배 (제 계산)"}], "note": "2026년 2분기부터 고객 데이터센터에 납품한 TPU 시스템 판매가 매출에 들어갑니다. 회사는 TPU를 빼도 성장이 \"매우 강하다\"고 했지만 따로 숫자를 밝히지 않았습니다."}; CH.a3_cloud.t = vbars;
  CH.a3_cloudm = {"kicker": "CLOUD MARGIN", "title": "적자 직전이던 클라우드가 이익률 36%가 됐다", "sub": "단위: % (구글 클라우드 영업이익 ÷ 매출, 제 계산)", "max": 36.21413917743983, "items": [{"label": "'23<br>4Q", "v": 9.399, "text": "9%"}, {"label": "'24<br>1Q", "v": 9.4, "text": "9%"}, {"label": "'24<br>2Q", "v": 11.327, "text": "11%"}, {"label": "'24<br>3Q", "v": 17.15, "text": "17%"}, {"label": "'24<br>4Q", "v": 17.507, "text": "18%"}, {"label": "'25<br>1Q", "v": 17.757, "text": "18%"}, {"label": "'25<br>2Q", "v": 20.743, "text": "21%"}, {"label": "'25<br>3Q", "v": 23.712, "text": "24%"}, {"label": "'25<br>4Q", "v": 30.078, "text": "30%"}, {"label": "'26<br>1Q", "v": 32.944, "text": "33%"}, {"label": "'26<br>2Q", "v": 35.586, "text": "36%"}, {"label": "'26<br>3Q", "v": 36.214, "text": "36%", "cls": "hot"}], "note": "영업이익은 8.6억 달러에서 111.2억 달러로 약 13배가 됐습니다 (제 계산). 2024년 3분기 CFO는 \"이익률 30% 가까운 경쟁사를 따라잡을 수 있나\"는 질문을 받았는데, 2025년 4분기에 30%를 넘었습니다."}; CH.a3_cloudm.t = vbars;
  CH.a3_backlog = {"kicker": "BACKLOG", "title": "앞으로 받을 클라우드 계약 잔고가 5배로", "sub": "단위: 억 달러 (분기 말 수주잔고, 회사 발표. 2025년 2분기부터 콜에서 공개)", "max": 5610, "items": [{"label": "'25<br>2Q", "v": 1060, "text": "1,060억"}, {"label": "'25<br>3Q", "v": 1550, "text": "1,550억"}, {"label": "'25<br>4Q", "v": 2400, "text": "2,400억"}, {"label": "'26<br>1Q", "v": 4620, "text": "4,620억"}, {"label": "'26<br>2Q", "v": 5140, "text": "5,140억"}, {"label": "'26<br>3Q", "v": 5610, "text": "5,610억 달러", "cls": "hot"}], "pills": [{"html": "5개 분기 만에 약 <em data-count=\"5.3\">5.3</em>배 (제 계산)"}], "note": "수주잔고는 계약은 했지만 아직 매출로 잡지 않은 금액입니다. 2026년 1분기에 TPU 하드웨어 판매 계약이 더해지며 거의 2배가 됐습니다. 회사는 잔고의 55% 남짓을 2년 안에 매출로 인식할 것으로 봅니다."}; CH.a3_backlog.t = vbars;
  CH.a3_yt = {"kicker": "YOUTUBE & SUBSCRIPTIONS", "title": "유튜브 광고보다 구독·기기 매출이 빨리 컸다", "sub": "단위: 억 달러 (분기 매출, 회사 발표)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "구독·플랫폼·기기", "vals": [107.94, 87.39, 93.12, 106.56, 116.33, 103.79, 112.03, 128.7, 135.78, 123.84, 129.11, 142.9], "color": "#ffb020", "all": 1}, {"name": "유튜브 광고", "vals": [92.0, 80.9, 86.63, 89.21, 104.73, 89.27, 97.96, 102.61, 113.83, 98.83, 110.55, 112.07], "color": "#ff5a6e", "all": 1}], "note": "3년 사이 유튜브 광고는 22%, 구독·플랫폼·기기는 32% 늘었습니다(제 계산). 4분기는 연말 광고와 픽셀폰 판매로 높게 나옵니다."}; CH.a3_yt.t = lines;
  CH.a3_tokens = {"kicker": "API TOKENS", "title": "고객이 쓰는 제미나이 토큰이 1년 새 4배", "sub": "단위: 억 토큰/분 (고객이 API로 직접 쓰는 자사 모델 처리량, 회사 발표)", "max": 320, "items": [{"label": "'25<br>3Q", "v": 70, "text": "70억"}, {"label": "'25<br>4Q", "v": 100, "text": "100억"}, {"label": "'26<br>1Q", "v": 160, "text": "160억"}, {"label": "'26<br>2Q", "v": 220, "text": "220억"}, {"label": "'26<br>3Q", "v": 320, "text": "약 320억", "cls": "hot"}], "note": "토큰은 AI가 글을 읽고 쓰는 단위입니다(한국어 한 글자가 대략 1~2토큰). 구글 제품 전체의 월간 처리량은 2025년 5월 480조, 7월 980조, 10월 1,300조 토큰(1년 새 20배 이상)이라고 밝혔고, 이후로는 분당 API 수치만 공개했습니다."}; CH.a3_tokens.t = vbars;
  CH.a3_geminiapp = {"kicker": "GEMINI APP", "title": "제미나이 앱 월 사용자 10억 명", "sub": "단위: 억 명 (월간 활성 사용자, 회사 발표. 2026년 1분기는 밝히지 않음)", "max": 10, "items": [{"label": "'25<br>2Q", "v": 4.5, "text": "4.5억"}, {"label": "'25<br>3Q", "v": 6.5, "text": "6.5억"}, {"label": "'25<br>4Q", "v": 7.5, "text": "7.5억"}, {"label": "'26<br>2Q", "v": 9.5, "text": "9.5억"}, {"label": "'26<br>3Q", "v": 10, "text": "10억 명", "cls": "hot"}], "note": "2025년 4월 미국 법무부 재판에서 제미나이의 하루 사용자가 3,500만 명이라는 숫자가 공개돼 챗GPT에 크게 뒤진다는 질문을 받았습니다. 2026년 3분기 회사는 제미나이 앱을 \"구글 역사상 가장 빠르게 성장한 제품\"이라고 했습니다."}; CH.a3_geminiapp.t = vbars;
  CH.a3_aimetrics = {"kicker": "AI METRICS", "title": "AI 지표는 분기마다 기준을 바꿔 가며 커졌다", "sub": "경영진이 콜에서 밝힌 숫자 (단위는 칸마다 표시)", "cls": "plain", "head": ["시점", "개발자·기업", "사내 AI 코드", "비용"], "rows": [["2024년 2분기", "제미나이 개발자 150만 명", "-", "AI 개요 모델 2배로 키우고 건당 비용 유지"], ["2024년 3분기", "API 호출 6개월 새 14배", "신규 코드 4분의 1 이상", "쿼리당 비용 90% 이상↓"], ["2024년 4분기", "개발자 440만 명, Vertex 사용 20배", "-", "-"], ["2025년 1분기", "AI Studio·API 활성 사용자 200%↑", "30% 이상", "-"], ["2025년 2분기", "개발자 900만 명, 8.5만 개 기업", "에이전트 코딩 도입", "-"], ["2025년 3분기", "개발자 1,300만 명", "거의 절반", "-"], ["2025년 4분기", "12만 개 기업, 상위 20개 SaaS의 95%", "약 50%(코딩 에이전트)", "2025년 서비스 단가 78%↓"], ["2026년 1분기", "고객 330곳이 각 1조 토큰 이상", "\"자율 디지털 태스크포스\"", "AI 응답 비용 30% 이상↓"], ["2026년 3분기", "포천 100의 약 90%, 지식노동 좌석 1억 개", "Argon으로 코드 35%↑·오류 30%↓", "-"]]}; CH.a3_aimetrics.t = table;
  CH.a3_tpu = {"kicker": "TPU", "title": "자체 AI 칩 TPU는 해마다 한 세대씩", "sub": "회사가 밝힌 성능 (비교 기준은 칸마다 다름)", "cls": "plain", "head": ["세대", "발표", "회사 설명"], "rows": [["5세대 v5p", "'24년 1분기", "정식 출시. 제미나이가 TPU로 학습·서비스"], ["6세대 Trillium", "'24년 2분기", "칩당 최고 성능 약 5배, 에너지 효율 67%↑ (v5e 대비)"], ["7세대 Ironwood", "'25년 1분기", "첫 추론 전용 TPU. 연산 10배 이상, 전력 효율 약 2배"], ["8세대 8t·8i", "'26년 1분기", "학습용 8t 성능 최대 2.7배, 추론용 8i 달러당 성능 80%↑"], ["외부 판매", "'26년 1~3분기", "고객 데이터센터 납품. 앤트로픽, 애플, 시타델 증권 등 약 100곳. 오라클·Crux AI(블랙스톤 합작)와 공급 제휴"]], "note": "앤트로픽은 2025년 3분기에 TPU를 최대 100만 개 쓰겠다고 밝혔습니다. 메타와는 파이토치(PyTorch) 모델을 TPU에서 돌리는 Torch TPU를 함께 만들었습니다."}; CH.a3_tpu.t = table;
  CH.a3_mood = {"kicker": "MANAGEMENT VIEW", "title": "경영진이 본 시장: 비용 절감에서 공급 부족으로", "sub": "분기별 컨퍼런스콜 발언 요약", "cls": "plain", "head": ["분기", "경영진이 말한 환경"], "rows": [["'23년 4분기", "\"비용 구조를 지속적으로 재설계\". 소비자 가격 민감, 클라우드 고객 비용 절감은 대부분 끝남"], ["'24년 1분기", "첫 배당·자사주 700억 달러. 아시아 온라인 소매업체 광고가 성장 견인"], ["'24년 2분기", "\"과소 투자 위험이 과잉 투자 위험보다 훨씬 크다\"(피차이)"], ["'24년 3분기", "새 CFO \"효율로 투자 재원 마련\". 반독점 재판 구제책은 \"지나치게 광범위\""], ["'24년 4분기", "클라우드 \"수요가 공급 용량보다 많다\". 딥시크는 \"효율로 보면 우리가 앞선다\""], ["'25년 1분기", "관세·거시 불안 \"면역은 아니다\". 미국 소액면세 폐지로 광고 역풍"], ["'25년 2분기", "\"2026년이 에이전트가 널리 쓰이는 해\". AI 인재 전쟁에도 유지율 양호"], ["'25년 3분기", "AI가 검색의 \"확장의 순간\"을 만든다. 공급 부족 2026년까지"], ["'25년 4분기", "밤잠 못 이루는 것은 \"연산 용량, 전력·부지·공급망\""], ["'26년 1분기", "\"수요를 맞췄다면 클라우드 매출이 더 높았을 것\". 공급망 가격 상승"], ["'26년 2분기", "1년 전보다 \"더 낙관적\". 코딩 모델은 \"개선이 필요하다\"고 인정"], ["'26년 3분기", "제미나이 4로 \"프런티어 선두\". 다른 회사 용량을 빌려 쓰는 가교 전략"]]}; CH.a3_mood.t = table;
  CH.a3_qa = {"kicker": "ANALYST Q&A", "title": "애널리스트가 3년 내내 물은 것", "sub": "12번의 콜 질의응답을 주제별로 묶음 (질문자 소속은 증권사)", "cls": "plain", "head": ["주제", "대표 질문", "회사 답의 변화"], "rows": [["AI가 검색을 잠식하나", "저스틴 포스트(BofA) '23.4Q, 지안 리(에버코어) '24.1Q", "\"검색에 긍정적인 순간\" → \"잠식 증거 없음\"('25.4Q) → \"질의 증가율 5년 최고\"('26.3Q)"], ["AI 검색의 광고 수익화", "더그 앤머스(JP모건) 거의 매 분기", "AI 개요 \"거의 같은 수익화율\" → AI 모드 시험 → AI 모드 \"수익화 낮다\", 광고 해외 확대('26.3Q)"], ["설비투자 규모와 수익률", "로스 샌들러(바클레이스) '24.2Q 과잉 투자 질문", "\"과소 투자가 더 위험\" → 수요>공급 → \"자본비용을 크게 웃도는 ROIC\"('26.3Q)"], ["제미나이 사용자 vs 챗GPT", "샌들러 '24.3Q(챗GPT 주 2.5억), '25.1Q(제미나이 DAU 3,500만)", "구체 숫자 회피 → 월 4.5억('25.2Q) → 10억('26.3Q)"], ["클라우드 이익률", "마크 마헤이니(에버코어) '24.3Q", "\"규모와 효율\" → 30% 돌파('25.4Q) → 36%('26.3Q)"], ["TPU 외부 판매", "브라이언 노웍(모건스탠리) '26.1Q, 샌들러 '26.3Q", "\"클라우드 고객 지원의 일부\" → 하드웨어 판매 시작, 마진은 \"공개 안 함\""], ["에이전트 쇼핑", "노웍 '25.3Q, 에릭 셰리든(골드만) '26.1Q", "\"검색에 추가되는 것\" → UCP(에이전트 결제 표준)에 아마존·메타·MS 합류"], ["자본 조달", "앤머스 '26.2Q", "\"영업현금 → 부채 → 주식 순\", 추가 주식 발행 계획 없음(ATM 제외)"]]}; CH.a3_qa.t = table;
  CH.a3_margin = {"kicker": "OPERATING MARGIN", "title": "투자가 늘어도 영업이익률은 30%대를 지켰다", "sub": "단위: % (영업이익 ÷ 매출, 회사 발표 숫자로 제 계산)", "max": 36.121423891679406, "items": [{"label": "'23<br>4Q", "v": 27.456, "text": "27%"}, {"label": "'24<br>1Q", "v": 31.627, "text": "32%"}, {"label": "'24<br>2Q", "v": 32.363, "text": "32%"}, {"label": "'24<br>3Q", "v": 32.312, "text": "32%"}, {"label": "'24<br>4Q", "v": 32.106, "text": "32%"}, {"label": "'25<br>1Q", "v": 33.918, "text": "34%"}, {"label": "'25<br>2Q", "v": 32.429, "text": "32%"}, {"label": "'25<br>3Q", "v": 30.512, "text": "31%"}, {"label": "'25<br>4Q", "v": 31.569, "text": "32%"}, {"label": "'26<br>1Q", "v": 36.121, "text": "36%", "cls": "hot"}, {"label": "'26<br>2Q", "v": 34.033, "text": "34%"}, {"label": "'26<br>3Q", "v": 31.805, "text": "32%"}], "note": "2023년 4분기는 사무실 정리 비용 12억 달러, 2025년 3분기는 EC(유럽연합 집행위원회) 과징금 35억 달러, 2025년 4분기는 웨이모 주식보상 비용 21억 달러가 이익률을 낮췄습니다. 최고는 2026년 1분기 36.1%였습니다."}; CH.a3_margin.t = vbars;
  CH.a3_capex = {"kicker": "CAPEX", "title": "분기 설비투자가 110억에서 514억 달러로", "sub": "단위: 억 달러 (부동산·장비 구매 현금 지출, 분기)", "max": 513.55, "items": [{"label": "'23<br>4Q", "v": 110.19, "text": "110"}, {"label": "'24<br>1Q", "v": 120.12, "text": "120"}, {"label": "'24<br>2Q", "v": 131.86, "text": "132"}, {"label": "'24<br>3Q", "v": 130.61, "text": "131"}, {"label": "'24<br>4Q", "v": 142.76, "text": "143"}, {"label": "'25<br>1Q", "v": 171.97, "text": "172"}, {"label": "'25<br>2Q", "v": 224.46, "text": "224"}, {"label": "'25<br>3Q", "v": 239.53, "text": "240"}, {"label": "'25<br>4Q", "v": 278.51, "text": "279"}, {"label": "'26<br>1Q", "v": 356.74, "text": "357"}, {"label": "'26<br>2Q", "v": 449.24, "text": "449"}, {"label": "'26<br>3Q", "v": 513.55, "text": "514", "cls": "hot"}], "pills": [{"html": "연간: 2023년 323억 → 2024년 525억 → 2025년 914억 → 2026년 전망 1,950~2,050억 달러"}], "note": "투자의 약 60~65%가 서버(내용연수 약 6년), 나머지가 데이터센터·네트워크(7~40년)입니다. 2027년은 \"크게 증가\"한다고만 밝혔습니다."}; CH.a3_capex.t = vbars;
  CH.a3_dep = {"kicker": "DEPRECIATION", "title": "감가상각비가 2.5배로 늘어 이익을 누른다", "sub": "단위: 억 달러 (부동산·장비 감가상각, 분기 현금흐름표)", "max": 83.69, "items": [{"label": "'23<br>4Q", "v": 33.16, "text": "33.2"}, {"label": "'24<br>1Q", "v": 34.13, "text": "34.1"}, {"label": "'24<br>2Q", "v": 37.08, "text": "37.1"}, {"label": "'24<br>3Q", "v": 39.85, "text": "39.9"}, {"label": "'24<br>4Q", "v": 42.05, "text": "42.1"}, {"label": "'25<br>1Q", "v": 44.87, "text": "44.9"}, {"label": "'25<br>2Q", "v": 49.98, "text": "50"}, {"label": "'25<br>3Q", "v": 56.11, "text": "56.1"}, {"label": "'25<br>4Q", "v": 60.4, "text": "60.4"}, {"label": "'26<br>1Q", "v": 64.82, "text": "64.8"}, {"label": "'26<br>2Q", "v": 71.04, "text": "71"}, {"label": "'26<br>3Q", "v": 83.69, "text": "83.7", "cls": "hot"}], "note": "감가상각은 큰 장비 값을 몇 년에 나눠 비용으로 잡는 것입니다. 2025년 한 해 211억 달러(38% 증가)였고 2026년엔 \"크게 증가\"한다고 회사가 밝혔습니다."}; CH.a3_dep.t = vbars;
  CH.a3_fcf = {"kicker": "FREE CASH FLOW", "title": "잉여현금흐름이 2분기 연속 마이너스", "sub": "단위: 억 달러 (영업현금흐름 − 설비투자, 회사 발표 숫자로 제 계산)", "items": [{"label": "'23<br>4Q", "v": 78.96, "text": "79"}, {"label": "'24<br>1Q", "v": 168.36, "text": "168"}, {"label": "'24<br>2Q", "v": 134.54, "text": "135"}, {"label": "'24<br>3Q", "v": 176.37, "text": "176"}, {"label": "'24<br>4Q", "v": 248.37, "text": "248"}, {"label": "'25<br>1Q", "v": 189.53, "text": "190"}, {"label": "'25<br>2Q", "v": 53.01, "text": "53"}, {"label": "'25<br>3Q", "v": 244.61, "text": "245"}, {"label": "'25<br>4Q", "v": 245.51, "text": "246"}, {"label": "'26<br>1Q", "v": 101.16, "text": "101"}, {"label": "'26<br>2Q", "v": -58.55, "text": "-58.6"}, {"label": "'26<br>3Q", "v": -90.65, "text": "-90.7"}], "note": "2026년 3분기에는 2018년 EC 과징금 52억 달러 납부와 TPU 시스템 재고 축적이 겹쳤습니다. 2023년 4분기는 세금 105억 달러를 몰아 내 낮았습니다."}; CH.a3_fcf.t = pnbars;
  CH.a3_ni = {"kicker": "NET INCOME", "title": "순이익 선은 투자한 회사 주가 따라 출렁였다", "sub": "단위: 억 달러 (분기, 회사 발표)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "순이익", "vals": [206.87, 236.62, 236.19, 263.01, 265.36, 345.4, 281.96, 349.79, 344.55, 625.78, 1121.93, 264.68], "color": "#6d4aff"}, {"name": "영업이익", "vals": [236.97, 254.72, 274.25, 285.21, 309.72, 306.06, 312.71, 312.28, 359.34, 396.96, 407.7, 405.76], "color": "#14173a"}], "note": "영업이익은 꾸준히 올랐지만 순이익은 2026년 1·2분기에 크게 뛰었다가 3분기에 내려왔습니다. 주당순이익은 2분기 9.11달러, 3분기 2.12달러였습니다."}; CH.a3_ni.t = lines;
  CH.a3_bs = {"kicker": "BALANCE SHEET", "title": "자산은 2.5배, 장기부채는 9배", "sub": "단위: 억 달러 (분기 말, 회사 발표)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "총자산", "vals": [4023.92, 4073.5, 4147.7, 4302.66, 4502.56, 4753.74, 5020.53, 5364.69, 5952.81, 7039.19, 9219.83, 10033.12], "color": "#14173a"}, {"name": "부동산·장비(순)", "vals": [1343.45, 1431.82, 1511.55, 1612.7, 1710.36, 1850.62, 2032.31, 2237.87, 2465.97, 2810.2, 3212.12, 3728.27], "color": "#6d4aff"}, {"name": "현금·유가증권", "vals": [1109.16, 1080.9, 1007.25, 932.3, 956.57, 953.28, 951.48, 984.96, 1268.43, 1268.4, 2424.74, 2650.98], "color": "#12c2a5"}, {"name": "장기부채", "vals": [132.53, 132.28, 132.38, 122.97, 108.83, 108.86, 236.07, 216.07, 465.47, 775.01, 981.65, 1251.02], "color": "#ff5a6e"}], "note": "2026년 2분기에 현금이 크게 는 것은 회사채와 주식 발행 때문입니다. 현금·유가증권 2,651억 달러에는 SpaceX 등 시장성 지분 904억 달러가 들어 있습니다. 자기자본은 2,834억에서 6,775억 달러가 됐습니다."}; CH.a3_bs.t = lines;
  CH.a3_funding = {"kicker": "FUNDING 2026", "title": "2026년, 회사채에 주식 발행까지 더해 약 1,300억 달러를 모았다", "sub": "단위: 억 달러 (2026년 1~9월 조달액, 10-Q 공시)", "max": 808, "items": [{"label": "회사채(달러·외화)", "v": 808, "text": "808억", "cls": "hot"}, {"label": "보통주 공모(6월)", "v": 205, "text": "205억"}, {"label": "강제전환 우선주(6월)", "v": 190, "text": "190억"}, {"label": "수시 주식 발행(ATM, 3분기)", "v": 124, "text": "124억"}], "note": "합계 약 1,327억 달러입니다(제 계산). 우선주는 연 6.25% 배당을 주고 2029년 5월 보통주로 바뀝니다. 수시 발행(ATM)은 최대 400억 달러 중 276억 달러가 남았습니다. 자사주 매입은 2026년 1분기부터 0입니다."}; CH.a3_funding.t = hbars;
  CH.a3_return = {"kicker": "BUYBACK", "title": "자사주 매입은 2026년에 0이 됐다", "sub": "단위: 억 달러 (분기 자사주 매입 현금 지출, 회사 발표)", "items": [{"label": "'23<br>4Q", "v": 161.91, "text": "162"}, {"label": "'24<br>1Q", "v": 156.96, "text": "157"}, {"label": "'24<br>2Q", "v": 156.84, "text": "157"}, {"label": "'24<br>3Q", "v": 152.91, "text": "153"}, {"label": "'24<br>4Q", "v": 161.91, "text": "162"}, {"label": "'25<br>1Q", "v": 150.68, "text": "151"}, {"label": "'25<br>2Q", "v": 136.38, "text": "136"}, {"label": "'25<br>3Q", "v": 115.04, "text": "115"}, {"label": "'25<br>4Q", "v": 54.99, "text": "55"}, {"label": "'26<br>1Q", "v": 0.0, "text": "0"}, {"label": "'26<br>2Q", "v": 0.0, "text": "0"}, {"label": "'26<br>3Q", "v": 0.0, "text": "0"}], "note": "배당은 2024년 2분기 주당 0.20달러로 시작해 해마다 5%씩 올려 0.22달러입니다(분기 약 25억\\~29억 달러). 2026년 6월 이후에는 우선주 배당도 나갑니다."}; CH.a3_return.t = pnbars;
  CH.a3_capexcomp = {"kicker": "BIG TECH CAPEX", "title": "네 회사 설비투자가 함께 치솟았다", "sub": "단위: 억 달러 (분기 설비투자, 각사 실적 보도자료)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "아마존", "vals": [145.88, 149.25, 176.2, 226.2, 278.34, 250.19, 321.83, 350.95, 395.22, 442.03, 542.08, 772.59], "color": "#ffb020"}, {"name": "알파벳", "vals": [110.19, 120.12, 131.86, 130.61, 142.76, 171.97, 224.46, 239.53, 278.51, 356.74, 449.24, 513.55], "color": "#6d4aff"}, {"name": "마이크로소프트", "vals": [97.35, 109.52, 138.73, 149.23, 158.04, 167.45, 170.79, 193.94, 298.76, 308.76, 358.02, 393.67], "color": "#12c2a5"}, {"name": "메타", "vals": [75.9, 64.0, 84.7, 92.0, 148.4, 136.9, 170.1, 193.7, 221.4, 198.4, 310.8, 349.1], "color": "#ff5a6e"}], "note": "12분기 합계는 아마존 4,051억, 알파벳 2,870억, 마이크로소프트 2,544억, 메타 2,045억 달러입니다(제 계산). 회사마다 기준이 조금 다릅니다: 알파벳·아마존은 장비 구매 현금 지출, 마이크로소프트는 금융리스를 뺀 장비 취득, 메타는 금융리스 원금 포함. 마이크로소프트는 회계연도(7\\~6월)를 달력 분기에 맞췄습니다."}; CH.a3_capexcomp.t = lines;
  CH.a3_cloudcomp = {"kicker": "CLOUD RACE", "title": "클라우드 성장률: 구글이 애저를 제치고 맨 위로", "sub": "단위: % (1년 전 대비 매출 증가율, 각사 보도자료)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "%", "series": [{"name": "구글 클라우드", "vals": [25.66, 28.44, 28.84, 34.98, 30.06, 28.06, 31.67, 33.51, 47.75, 63.36, 81.8, 102.61], "color": "#6d4aff"}, {"name": "마이크로소프트 애저", "vals": [30.0, 31.0, 29.0, 33.0, 31.0, 33.0, 39.0, 40.0, 39.0, 40.0, 43.0, 48.0], "color": "#12c2a5"}, {"name": "아마존 AWS", "vals": [13.0, 17.0, 19.0, 19.0, 19.0, 17.0, 17.5, 20.0, 24.0, 28.0, 37.0, 39.0], "color": "#ffb020"}], "note": "애저(Azure)는 매출 금액 없이 성장률만 공개합니다. 구글 클라우드에는 워크스페이스(업무용 앱)와 2026년부터 TPU 시스템 판매가 들어 있어 세 회사 숫자의 범위가 같지 않습니다."}; CH.a3_cloudcomp.t = lines;
  CH.a3_compfin = {"kicker": "PEERS", "title": "영업이익률: 마이크로소프트가 가장 높고 알파벳이 그다음", "sub": "단위: % (영업이익 ÷ 매출, 각사 보도자료로 제 계산)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "%", "series": [{"name": "마이크로소프트", "vals": [43.55, 44.59, 43.12, 46.65, 45.55, 45.65, 44.9, 48.91, 47.11, 46.32, 45.11, 49.73], "color": "#12c2a5"}, {"name": "메타", "vals": [40.84, 37.91, 38.0, 42.74, 48.28, 41.49, 43.02, 40.08, 41.32, 40.62, 30.88, 20.11], "color": "#ff5a6e"}, {"name": "알파벳", "vals": [27.46, 31.63, 32.36, 32.31, 32.11, 33.92, 32.43, 30.51, 31.57, 36.12, 34.03, 31.81], "color": "#6d4aff"}, {"name": "아마존", "vals": [7.76, 10.68, 9.93, 10.95, 11.29, 11.82, 11.45, 9.66, 11.72, 13.17, 13.71, 13.92], "color": "#ffb020"}], "note": "3년 매출 증가율은 알파벳 48%, 마이크로소프트 49%, 메타 61%, 아마존 19%입니다(제 계산, 4분기는 연말 성수기라 아마존·메타가 낮게 보임). 메타의 2026년 3분기 20%는 청소년 소송 합의 비용 98.9억 달러 반영 값입니다(빼면 약 35%, 제 계산)."}; CH.a3_compfin.t = lines;
  CH.a3_risks = {"kicker": "RISKS", "title": "눈여겨볼 부담과 위험", "sub": "공시(10-Q)와 콜에서 회사가 직접 밝힌 내용", "cols": 2, "items": [{"tag": "현금", "head": "잉여현금흐름 마이너스", "text": "2026년 2·3분기 연속 마이너스. 회사는 투자 사이클 동안 압박이 이어진다고 했습니다.", "warn": 1}, {"tag": "약정", "head": "구매 약정 9,240억 달러", "text": "장비·재고·전력 등 미래 구매 약정과 착수 전 리스 1,520억 달러. 최대치이며 줄 수 있다고 밝혔습니다.", "warn": 1}, {"tag": "부채", "head": "장기부채 1,251억 달러", "text": "1년 전 216억 달러에서 크게 늘었습니다. '26년 3분기 발행 회사채 평균 이자율은 5.55%입니다."}, {"tag": "공급", "head": "연산 부족", "text": "전력·부지·부품 부족으로 수요를 다 못 맞추고, 다른 회사 용량을 빌려 4분기 클라우드 이익률이 낮아질 수 있습니다."}, {"tag": "검색", "head": "AI 모드 수익화", "text": "AI 모드 질의가 빠르게 느는데 광고 수익화는 낮다고 인정했습니다. 2026년 3분기 검색 성장률이 12%로 내려왔습니다."}, {"tag": "법", "head": "반독점 판결", "text": "검색 독점 최종 판결(2025년 12월: 검색 데이터 공유 등)에 항소 중. 광고기술은 매각 대신 행위 제한(2026년 9월). EU 과징금이 이어집니다."}, {"tag": "평가", "head": "지분 평가 변동", "text": "SpaceX 등 보유 지분 가격에 따라 순이익이 수백억 달러씩 오르내립니다."}, {"tag": "경쟁", "head": "모델 경쟁", "text": "회사 스스로 코딩 모델은 '개선이 필요하다'고 인정했습니다('26년 2분기). 제미나이 4가 반격입니다."}]}; CH.a3_risks.t = cards;
  CH.a3_known = {"kicker": "KNOWN vs UNKNOWN", "title": "공시와 콜로 알 수 있는 것, 없는 것", "sub": "2026년 10월 31일 기준", "yes": {"title": "알 수 있는 것", "items": ["12분기 매출·이익·현금흐름·설비투자(공시)", "사업별 매출과 클라우드 이익률", "경영진이 밝힌 AI 사용 지표의 흐름", "2026년 주식·채권 조달 규모", "경쟁 3사의 매출·설비투자·클라우드 성장률"]}, "no": {"title": "알 수 없는 것", "items": ["TPU 판매를 뺀 클라우드 성장률과 TPU 마진", "AI 모드 광고 수익화율 숫자", "\"한 비상장 회사\" 지분의 이름과 가치", "제미나이 앱 수익(구독·광고) 규모", "2027년 설비투자 금액"]}, "note": "경영진이 밝히는 AI 지표는 분기마다 기준(월 사용자, 분당 토큰 등)이 바뀌어 같은 잣대로 길게 비교하기 어렵습니다."}; CH.a3_known.t = have;
  CH.a3_aiusers = {"kicker": "AI USERS", "title": "AI 개요·AI 모드·제미나이 앱, 모두 월 10억 명 넘게", "sub": "단위: 억 명 (월간 사용자, 경영진이 콜에서 밝힌 시점만 표시)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "억", "series": [{"name": "AI 개요", "vals": [null, null, null, 10, null, 15, 20, null, null, null, null, null], "color": "#6d4aff", "all": 1}, {"name": "AI 모드", "vals": [null, null, null, null, null, null, 1, null, null, null, 10, null], "color": "#12c2a5", "all": 1}, {"name": "제미나이 앱", "vals": [null, null, null, null, null, null, 4.5, 6.5, 7.5, null, 9.5, 10], "color": "#ffb020", "all": 1}], "note": "AI 개요는 2025년 2분기 \"20억 명 이상\" 뒤로 숫자를 다시 밝히지 않았습니다. AI 모드는 2025년 3분기 \"하루 7,500만 명\"처럼 기준이 다른 숫자도 있어 월 사용자만 표시했습니다. 빈 칸은 회사가 밝히지 않은 분기입니다."}; CH.a3_aiusers.t = lines;
  CH.a3_devs = {"kicker": "DEVELOPERS", "title": "제미나이로 개발하는 사람이 1년여 만에 9배", "sub": "단위: 만 명 (제미나이·생성 모델로 개발한 개발자, 회사 발표)", "max": 1300, "items": [{"label": "'24<br>2Q", "v": 150, "text": "150만"}, {"label": "'24<br>4Q", "v": 440, "text": "440만"}, {"label": "'25<br>2Q", "v": 900, "text": "900만"}, {"label": "'25<br>3Q", "v": 1300, "text": "1,300만 명", "cls": "hot"}], "note": "2026년 2분기에는 \"매달 900만 명 이상이 개발\"이라고 기준을 바꿔 밝혀 그래프에 넣지 않았습니다."}; CH.a3_devs.t = vbars;
  CH.a3_code = {"kicker": "AI CODING", "title": "구글 사내 코드의 절반을 AI가 쓴다", "sub": "단위: % (새로 작성되는 코드 중 AI가 만든 비율, 경영진 발언)", "max": 50, "items": [{"label": "'24<br>3Q", "v": 25, "text": "25%↑"}, {"label": "'25<br>1Q", "v": 30, "text": "30%↑"}, {"label": "'25<br>3Q", "v": 45, "text": "거의 절반"}, {"label": "'25<br>4Q", "v": 50, "text": "약 50%", "cls": "hot"}], "note": "'25년 3분기 '거의 절반'은 막대 높이를 45%로 그렸습니다. 2026년 3분기에는 제미나이 4 Argon을 쓴 팀이 코드를 35% 더 많이, 오류는 30% 적게 냈다고 밝혔습니다."}; CH.a3_code.t = vbars;
  CH.a3_subs = {"kicker": "PAID SUBSCRIPTIONS", "title": "유료 구독 3.5억 건", "sub": "단위: 억 건 (유튜브·구글 원 등 소비자 유료 구독, 회사 발표)", "max": 3.5, "items": [{"label": "'25<br>1Q", "v": 2.7, "text": "2.7억"}, {"label": "'25<br>3Q", "v": 3.0, "text": "3억"}, {"label": "'25<br>4Q", "v": 3.25, "text": "3.25억"}, {"label": "'26<br>1Q", "v": 3.5, "text": "3.5억 건", "cls": "hot"}], "note": "유튜브 뮤직·프리미엄 가입자(체험 포함)는 2024년 1분기 1억 명, 2025년 1분기 1.25억 명, 2026년 3분기 1.5억 명이라고 밝혔습니다. 2026년 2·3분기 전체 유료 구독 숫자는 밝히지 않았습니다."}; CH.a3_subs.t = vbars;
  CH.a3_ocfcap = {"kicker": "CASH vs CAPEX", "title": "설비투자 선이 영업현금 선을 넘어섰다", "sub": "단위: 억 달러 (분기, 회사 발표)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "영업현금흐름", "vals": [189.15, 288.48, 266.4, 306.98, 391.13, 361.5, 277.47, 484.14, 524.02, 457.9, 390.69, 422.9], "color": "#12c2a5"}, {"name": "설비투자", "vals": [110.19, 120.12, 131.86, 130.61, 142.76, 171.97, 224.46, 239.53, 278.51, 356.74, 449.24, 513.55], "color": "#ff5a6e"}], "note": "두 선의 차이가 잉여현금흐름입니다. 2026년 2분기부터 설비투자가 영업현금흐름보다 커졌습니다."}; CH.a3_ocfcap.t = lines;
  CH.a3_oie = {"kicker": "OTHER INCOME", "title": "기타손익: 보유 지분 평가가 순이익을 흔들었다", "sub": "단위: 억 달러 (분기 기타손익, 회사 발표)", "items": [{"label": "'23<br>4Q", "v": 7.15, "text": "7.2"}, {"label": "'24<br>1Q", "v": 28.43, "text": "28.4"}, {"label": "'24<br>2Q", "v": 1.26, "text": "1.3"}, {"label": "'24<br>3Q", "v": 31.85, "text": "31.9"}, {"label": "'24<br>4Q", "v": 12.71, "text": "12.7"}, {"label": "'25<br>1Q", "v": 111.83, "text": "112"}, {"label": "'25<br>2Q", "v": 26.62, "text": "26.6"}, {"label": "'25<br>3Q", "v": 127.59, "text": "128"}, {"label": "'25<br>4Q", "v": 31.83, "text": "31.8"}, {"label": "'26<br>1Q", "v": 377.16, "text": "377"}, {"label": "'26<br>2Q", "v": 979.83, "text": "980"}, {"label": "'26<br>3Q", "v": -82.21, "text": "-82.2"}], "note": "2026년 2분기 980억 달러는 SpaceX와 \"한 비상장 회사\" 지분 평가익이고, 3분기 -82억 달러는 상장한 SpaceX 주가 하락 손실입니다. 회사는 비상장 회사의 이름을 밝히지 않았습니다."}; CH.a3_oie.t = pnbars;
  CH.a3_emp = {"kicker": "HEADCOUNT", "title": "직원 수는 줄었다가 AI 인재 채용으로 다시 늘었다", "sub": "단위: 만 명 (분기 말 직원 수, 회사 발표)", "max": 20.4757, "items": [{"label": "'23<br>4Q", "v": 18.2502, "text": "18.3"}, {"label": "'24<br>1Q", "v": 18.0895, "text": "18.1"}, {"label": "'24<br>2Q", "v": 17.9582, "text": "18.0"}, {"label": "'24<br>3Q", "v": 18.1269, "text": "18.1"}, {"label": "'24<br>4Q", "v": 18.3323, "text": "18.3"}, {"label": "'25<br>1Q", "v": 18.5719, "text": "18.6"}, {"label": "'25<br>2Q", "v": 18.7103, "text": "18.7"}, {"label": "'25<br>3Q", "v": 19.0167, "text": "19.0"}, {"label": "'25<br>4Q", "v": 19.082, "text": "19.1"}, {"label": "'26<br>1Q", "v": 19.4668, "text": "19.5"}, {"label": "'26<br>2Q", "v": 19.8933, "text": "19.9"}, {"label": "'26<br>3Q", "v": 20.4757, "text": "20.5", "cls": "hot"}], "note": "2024년 2분기 17.96만 명이 가장 적었고 2026년 3분기 20.48만 명입니다. 3년 동안 매출은 48% 늘었는데 직원은 12% 늘었습니다(제 계산)."}; CH.a3_emp.t = vbars;
  CH.a3_cloudrev = {"kicker": "CLOUD REVENUE", "title": "덩치는 아직 AWS가 크다", "sub": "단위: 억 달러 (분기 매출, 각사 보도자료)", "labels": ["'23<br>4Q", "'24<br>1Q", "'24<br>2Q", "'24<br>3Q", "'24<br>4Q", "'25<br>1Q", "'25<br>2Q", "'25<br>3Q", "'25<br>4Q", "'26<br>1Q", "'26<br>2Q", "'26<br>3Q"], "unit": "", "series": [{"name": "아마존 AWS", "vals": [242.0, 250.0, 263.0, 275.0, 288.0, 293.0, 309.0, 330.0, 356.0, 376.0, 422.0, 460.0], "color": "#ffb020", "all": 1}, {"name": "구글 클라우드", "vals": [91.92, 95.74, 103.47, 113.53, 119.55, 122.6, 136.24, 151.57, 176.64, 200.28, 247.68, 307.09], "color": "#6d4aff", "all": 1}], "note": "AWS와 구글 클라우드의 매출 차이는 '23년 4분기 2.6배에서 '26년 3분기 1.5배로 줄었습니다(제 계산). 영업이익률은 2026년 3분기 AWS 약 39%, 구글 클라우드 36.2%입니다(AWS는 제 계산). 계약 잔고는 구글 클라우드 5,610억 달러, 마이크로소프트 상업용 잔여 계약(RPO) 6,770억 달러입니다."}; CH.a3_cloudrev.t = lines;
  // ---- a3 끝 ----

  function init(root) {
    var c = CH[root.getAttribute('data-chart')];
    if (!c) return;
    root.innerHTML = c.t(c);
    if (reduce || !('IntersectionObserver' in window)) { root.classList.add('is-in'); root.querySelectorAll('em[data-count]').forEach(function (e) { e.textContent = e.getAttribute('data-count'); }); return; }
    var io = new IntersectionObserver(function (es) {
      // 화면보다 긴 도표(모바일의 긴 표)는 30%가 한 번에 안 보일 수 있어, 화면 높이의 40% 이상 보이면 시작한다
      es.forEach(function (e) { if (e.isIntersecting && (e.intersectionRatio >= 0.3 || e.intersectionRect.height > innerHeight * 0.4)) { io.disconnect(); play(root, c); } });
    }, { threshold: [0, 0.1, 0.2, 0.3] });
    io.observe(root);
  }

  function run() { document.querySelectorAll('.ic[data-chart]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

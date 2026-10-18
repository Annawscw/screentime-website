/* ==== dashboard.js — the Reality Check page. ==== */

(function () {
  'use strict';

  var shell = document.getElementById('dashboard');
  if (!shell) return;

  /* ------------------------------------------------------------- STORAGE */

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  var log  = read('screenLog', {});
  var goal = read('screenGoal', 3);

  /* ---------------------------------------------------------------- DATES */

  function dayKey(d) {
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }
  function daysAgo(n) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
  }
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* -------------------------------------------------------------- ELEMENTS */

  var elHoursValue = document.getElementById('hours-value');
  var elSlider     = document.getElementById('hours-slider');
  var elGoal       = document.getElementById('goal-input');
  var elBtnLog     = document.getElementById('btn-log');
  var elChart      = document.getElementById('chart');
  var elAvg        = document.getElementById('avg-value');
  var elAvgNote    = document.getElementById('avg-note');
  var elStreak     = document.getElementById('streak-value');
  var elStreakNote = document.getElementById('streak-note');
  var elCost       = document.getElementById('cost-text');
  var elExport     = document.getElementById('btn-export');
  var elDelete     = document.getElementById('btn-delete');

  /* ---------------------------------------------------------------- CHART */

  function niceStep(max) {
    var rough = max / 4;
    var steps = [0.5, 1, 2, 3, 4, 5, 6];
    for (var i = 0; i < steps.length; i++) if (rough <= steps[i]) return steps[i];
    return 6;
  }

  function svg(tag, attrs, text) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function isNarrow() {
    return window.matchMedia('(max-width: 640px)').matches;
  }

  function renderChart(days) {
    var W = 720, BASE = 226, TOP = 18, LEFT = 42, RIGHT = 708;
    var H = BASE - TOP;
    var narrow = isNarrow();
    var fsAxis = narrow ? 20 : 11;
    var fsDay  = narrow ? 19 : 10;
    if (narrow) LEFT = 58;

    var highest = days.reduce(function (m, d) {
      return d.hours !== null && d.hours > m ? d.hours : m;
    }, 0);
    var step = niceStep(Math.max(highest, goal, 1));
    var maxH = Math.ceil(Math.max(highest, goal, 1) / step) * step;
    if (maxH <= 0) maxH = step;

    var y = function (v) { return BASE - (v / maxH) * H; };

    var s = svg('svg', {
      viewBox: '0 0 ' + W + ' 260', width: '100%', role: 'img',
      'aria-label': 'Bar chart of your logged screen time over the last ' +
                    days.length + ' days'
    });

    for (var v = 0; v <= maxH + 0.001; v += step) {
      s.appendChild(svg('line', { x1: LEFT, y1: y(v), x2: RIGHT, y2: y(v),
        stroke: 'var(--edge)', 'stroke-width': 1 }));
      s.appendChild(svg('text', { x: LEFT - 8, y: y(v) + fsAxis * 0.36,
        'text-anchor': 'end', fill: 'var(--muted)', 'font-size': fsAxis,
        'font-family': 'system-ui' }, (Math.round(v * 10) / 10) + 'h'));
    }

    var slot = (RIGHT - LEFT) / days.length;
    var barW = slot * 0.6;

    days.forEach(function (d, i) {
      var cx = LEFT + slot * i + slot / 2;
      var x  = cx - barW / 2;

      if (d.hours === null) {
        s.appendChild(svg('rect', { x: x, y: BASE - 4, width: barW, height: 4,
          rx: 2, fill: 'var(--edge)', opacity: '.5' }));
      } else {
        var top = y(d.hours);
        var bar = svg('rect', {
          'class': 'bar', x: x, y: top, width: barW,
          height: Math.max(BASE - top, 2), rx: 5,
          fill: d.hours > goal ? 'var(--coral)' : 'var(--mint)', tabindex: 0
        });
        bar.appendChild(svg('title', {},
          d.key + ' — ' + d.hours + ' hour' + (d.hours === 1 ? '' : 's')));
        s.appendChild(bar);
      }

      if (narrow || i % 2 === 0) {
        s.appendChild(svg('text', { x: cx, y: 250, 'text-anchor': 'middle',
          fill: 'var(--muted)', 'font-size': fsDay, 'font-family': 'system-ui' },
          DAY_NAMES[d.date.getDay()]));
      }
    });

    s.appendChild(svg('line', { x1: LEFT, y1: y(goal), x2: RIGHT, y2: y(goal),
      stroke: 'var(--amber)', 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
    var gl = svg('text', { x: LEFT + 6, y: y(goal) - 7, 'text-anchor': 'start',
      fill: 'var(--amber)', 'font-size': fsAxis, 'font-weight': 600,
      'font-family': 'system-ui', 'paint-order': 'stroke',
      stroke: 'var(--ink)', 'stroke-width': 4, 'stroke-linejoin': 'round'
    }, 'goal ' + goal + 'h');
    s.appendChild(gl);

    elChart.innerHTML = '';
    elChart.appendChild(s);
  }

  /* -------------------------------------------------------------- SUMMARIES */

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  function renderSummaries(days) {
    var last7   = days.slice(-7);
    var logged7 = last7.filter(function (d) { return d.hours !== null; });

    var avg = logged7.length
      ? logged7.reduce(function (t, d) { return t + d.hours; }, 0) / logged7.length
      : null;

    if (avg === null) {
      elAvg.textContent = '—';
      elAvgNote.innerHTML = 'Nothing logged in the last seven days yet. ' +
        'Log today and this fills in.';
    } else {
      elAvg.textContent = avg.toFixed(1) + 'h';
      var diff = avg - goal;
      var over = diff > 0.05;
      elAvgNote.innerHTML = 'You are <strong style="color:var(--' +
        (over ? 'coral' : 'mint') + ')">' + Math.abs(diff).toFixed(1) + 'h ' +
        (over ? 'over' : 'under') + '</strong> your goal' +
        (over ? '.' : '. Solid.') +
        '<br><span>Based on ' +
        plural(logged7.length, 'logged day') + ' this week. The NZ average for ' +
        '13–17 year olds on social media alone is about 2.5h a day.</span>';
    }

    var streak = 0;
    for (var i = days.length - 1; i >= 0; i--) {
      var h = days[i].hours;
      if (h === null) { if (i === days.length - 1) continue; break; }
      if (h <= goal) streak++; else break;
    }
    elStreak.textContent = streak;
    elStreak.style.color = streak > 0 ? 'var(--mint)' : 'var(--muted)';
    elStreakNote.textContent = streak === 0
      ? 'days under your goal right now. One day resets it.'
      : streak === 1
        ? 'day under your goal. Day two is the hard one.'
        : 'days under your goal in a row. Keep it.';

    var weekTotal = logged7.reduce(function (t, d) { return t + d.hours; }, 0);
    if (!logged7.length) {
      elCost.innerHTML = 'Log a few days and this will show you what those ' +
        'hours add up to in episodes, books and runs.';
    } else {
      var yearDays = avg * 365 / 24;
      elCost.innerHTML = 'That is <strong>' + weekTotal.toFixed(1) +
        ' hours</strong> this week — about <strong>' +
        plural(Math.round(weekTotal / 0.75), 'episode') + '</strong>, or <strong>' +
        (weekTotal / 6).toFixed(1) + ' books</strong>, or <strong>' +
        plural(Math.round(weekTotal / 0.5), 'half-hour run') +
        '</strong>. At this rate that is roughly <strong>' +
        plural(Math.round(yearDays), 'full day') + '</strong> of your year. ' +
        '(This week so far: ' + (weekTotal / 24).toFixed(1) + ' days.)';
    }
  }

  function fill(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderGreeting() {
    var q       = read('quizResult', null);
    var withRes = document.getElementById('greeting-result');
    var noRes   = document.getElementById('greeting-none');

    if (!withRes || !noRes) return;

    if (!q) {
      withRes.hidden = true;
      noRes.hidden   = false;
      return;
    }
    withRes.hidden = false;
    noRes.hidden   = true;

    fill('greet-profile', q.profileName);
    fill('greet-score',   q.score + ' out of ' + q.max);
    fill('greet-date',    q.date);
  }

  /* --------------------------------------------------------------- RENDER */

  function buildDays() {
    var out = [];
    var span = isNarrow() ? 7 : 14;
    for (var i = span - 1; i >= 0; i--) {
      var d = daysAgo(i);
      var k = dayKey(d);
      out.push({ date: d, key: k, hours: (k in log) ? log[k] : null });
    }
    return out;
  }

  function renderAll() {
    var days = buildDays();
    renderChart(days);
    renderSummaries(days);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderAll, 150);
  });

  /* ---------------------------------------------------------------- EVENTS */

  elSlider.addEventListener('input', function () {
    elHoursValue.textContent = parseFloat(elSlider.value).toFixed(1) + 'h';
  });

  elBtnLog.addEventListener('click', function () {
    var key   = dayKey(new Date());
    var hours = parseFloat(elSlider.value);
    var had   = key in log;

    log[key] = hours;
    var saved = write('screenLog', log);

    renderAll();

    elBtnLog.textContent = !saved
      ? 'Could not save — storage is blocked'
      : had ? 'Updated today ✓' : 'Logged ✓';
    setTimeout(function () { elBtnLog.textContent = 'Log today'; }, 1800);
  });

  elGoal.addEventListener('change', function () {
    var v = parseFloat(elGoal.value);
    if (isNaN(v) || v < 0.5) v = 0.5;
    if (v > 12) v = 12;
    elGoal.value = v;
    goal = v;
    write('screenGoal', goal);
    renderAll();
  });

  elExport.addEventListener('click', function () {
    var data = JSON.stringify({
      exported: new Date().toISOString(),
      goal: goal, log: log, quizResult: read('quizResult', null)
    }, null, 2);
    var url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'my-screen-time-' + dayKey(new Date()) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  elDelete.addEventListener('click', function () {
    if (elDelete.dataset.armed !== 'yes') {
      elDelete.dataset.armed = 'yes';
      elDelete.textContent = 'Tap again to delete everything';
      setTimeout(function () {
        elDelete.dataset.armed = 'no';
        elDelete.textContent = 'Delete everything';
      }, 4000);
      return;
    }
    try {
      localStorage.removeItem('screenLog');
      localStorage.removeItem('screenGoal');
      localStorage.removeItem('quizResult');
    } catch (e) {}
    log = {};
    goal = 3;
    elGoal.value = 3;
    elDelete.dataset.armed = 'no';
    elDelete.textContent = 'Deleted ✓';
    setTimeout(function () { elDelete.textContent = 'Delete everything'; }, 1800);
    renderGreeting();
    renderAll();
  });

  /* ----------------------------------------------------------------- START */

  elGoal.value = goal;
  var todayHours = log[dayKey(new Date())];
  if (todayHours !== undefined) elSlider.value = todayHours;
  elHoursValue.textContent = parseFloat(elSlider.value).toFixed(1) + 'h';

  renderGreeting();
  renderAll();
})();

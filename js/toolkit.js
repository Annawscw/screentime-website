/* ==== toolkit.js — the Addiction buster page. ==== */

(function () {
  'use strict';

  var page = document.getElementById('toolkit');
  if (!page) return;

  /* ================================================== 1. FLIP CARDS === */

  var cards = document.querySelectorAll('.flip');

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var open = card.getAttribute('aria-pressed') === 'true';
      card.setAttribute('aria-pressed', open ? 'false' : 'true');
    });
  });

  /* ===================================================== 2. FILTERS === */

  var filterBox = document.getElementById('filters');

  if (filterBox) {
    filterBox.querySelectorAll('.filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBox.querySelectorAll('.filter').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });

        var want = btn.dataset.cat;

        cards.forEach(function (card) {
          var chip = card.querySelector('.chip');
          var cat  = chip ? chip.textContent.trim().toLowerCase() : '';

          card.hidden = !(want === 'all' || cat === want);

          card.setAttribute('aria-pressed', 'false');
        });
      });
    });
  }

  /* ================================================= 3. FOCUS TIMER === */

  var elStart = document.getElementById('btn-timer-start');
  var elReset = document.getElementById('btn-timer-reset');
  var elTime  = document.getElementById('timer-time');
  var elMode  = document.getElementById('timer-mode');
  var elRing  = document.getElementById('timer-fill');
  var elDone  = document.getElementById('sessions-today');

  if (elStart && elTime && elRing) {
    var WORK = 25 * 60, BREAK = 5 * 60;
    var RING = 2 * Math.PI * 88;

    var mode = 'work';
    var remaining = WORK;
    var endAt = null;
    var ticker = null;

    elRing.setAttribute('stroke-dasharray', RING);

    function todayKey() {
      var d = new Date();
      return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    function sessionsToday() {
      try { return +(localStorage.getItem('focus-' + todayKey()) || 0); }
      catch (e) { return 0; }
    }

    function paint() {
      var total = mode === 'work' ? WORK : BREAK;
      var m = Math.floor(remaining / 60);
      var s = Math.floor(remaining % 60);

      elTime.firstChild.nodeValue = m + ':' + String(s).padStart(2, '0');

      if (elMode) elMode.textContent = mode === 'work' ? 'Focus' : 'Break';
      elRing.setAttribute('stroke', mode === 'work' ? 'var(--mint)' : 'var(--amber)');
      elRing.style.strokeDashoffset = String(RING * (1 - remaining / total));
    }

    function tick() {
      remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      paint();
      if (remaining > 0) return;

      stop();
      if (mode === 'work') {
        var n = sessionsToday() + 1;
        try { localStorage.setItem('focus-' + todayKey(), n); } catch (e) {}
        if (elDone) elDone.textContent = n;
        mode = 'break'; remaining = BREAK;
      } else {
        mode = 'work'; remaining = WORK;
      }
      paint();
    }

    function start() {
      endAt = Date.now() + remaining * 1000;
      ticker = setInterval(tick, 250);
      elStart.textContent = '⏸ Pause';
    }

    function stop() {
      clearInterval(ticker); ticker = null;
      elStart.textContent = '▶ Start';
    }

    elStart.addEventListener('click', function () { ticker ? stop() : start(); });

    elReset.addEventListener('click', function () {
      stop(); mode = 'work'; remaining = WORK; paint();
    });

    if (elDone) elDone.textContent = sessionsToday();
    paint();
  }

  /* ============================================== 4. 7-DAY CHALLENGE === */

  var challenge = document.getElementById('challenge');
  var note      = document.getElementById('challenge-note');

  if (challenge) {
    var rows = challenge.querySelectorAll('.day-row');

    var saved = [];
    try { saved = JSON.parse(localStorage.getItem('challenge')) || []; }
    catch (e) { saved = []; }

    function paintChallenge() {
      rows.forEach(function (row, i) {
        var on = !!saved[i];
        row.setAttribute('aria-pressed', on ? 'true' : 'false');
        var box = row.querySelector('.day-box');
        if (box) box.textContent = on ? '✓' : '';
      });

      if (!note) return;
      var done = saved.filter(Boolean).length;
      if (done === 7) {
        note.innerHTML = '🎉 <strong>All seven done.</strong> Pick the two that made the biggest difference and just keep those.';
        note.classList.add('note-done');
      } else {
        note.textContent = done + ' of 7 done. They do not have to be on consecutive days.';
        note.classList.remove('note-done');
      }
    }

    rows.forEach(function (row, i) {
      row.addEventListener('click', function () {
        saved[i] = !saved[i];
        try { localStorage.setItem('challenge', JSON.stringify(saved)); } catch (e) {}
        paintChallenge();
      });
    });

    paintChallenge();
  }

  /* =============================================== 5. WIND-DOWN PLAN === */

  var elBed  = document.getElementById('bedtime');
  var elLine = document.getElementById('timeline');

  if (elBed && elLine) {
    var STEPS = [
      { before: 90, label: 'Last scroll',        text: 'Say what you are doing to whoever you are talking to, then put it down. Ending on your own terms is the whole point.' },
      { before: 60, label: 'Phone goes out',     text: 'Onto its charger, outside the bedroom. This one step does more than every other step combined.' },
      { before: 45, label: 'Something analogue', text: 'Shower, food, tidy, guitar, stretch, chat. Anything where your hands are busy and nothing is scrolling.' },
      { before: 25, label: 'Tomorrow, on paper', text: 'Write down the three things you have to do tomorrow. Half of lying awake is your brain refusing to let go of a list.' },
      { before: 15, label: 'Read something',     text: 'Paper if you have it. Ten pages is plenty — it is about the transition, not the reading.' },
      { before: 0,  label: 'Lights out',         text: 'Actual bedtime. If you are still awake in 20 minutes, that is normal. Do not go and get the phone.' }
    ];

    function minusMinutes(hhmm, mins) {
      var p = hhmm.split(':');
      var total = (+p[0]) * 60 + (+p[1]) - mins;
      while (total < 0) total += 1440;
      var h = Math.floor(total / 60) % 24;
      return String(h).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
    }

    function pretty(hhmm) {
      var p = hhmm.split(':');
      var h = +p[0];
      return (h % 12 === 0 ? 12 : h % 12) + ':' + p[1] + (h >= 12 ? 'pm' : 'am');
    }

    function renderTimeline() {
      var bed = elBed.value || '22:30';
      try { localStorage.setItem('bedtime', bed); } catch (e) {}

      elLine.innerHTML = STEPS.map(function (s) {
        return '<li><time>' + pretty(minusMinutes(bed, s.before)) + '</time>' +
               '<span><strong>' + s.label + '</strong><br>' +
               '<span style="color:var(--muted);font-size:.94rem">' + s.text + '</span>' +
               '</span></li>';
      }).join('');
    }

    try {
      var savedBed = localStorage.getItem('bedtime');
      if (savedBed) elBed.value = savedBed;
    } catch (e) {}

    elBed.addEventListener('change', renderTimeline);
    renderTimeline();
  }
})();

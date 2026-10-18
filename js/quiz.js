/* ==== quiz.js — the quiz engine AND the results page. ==== */

(function () {
  'use strict';

  var shell = document.getElementById('quiz');
  if (!shell) return;

  /* ------------------------------------------------------------- STATE --- */

  var current = 0;
  var answers = new Array(QUESTIONS.length).fill(null);

  /* ---------------------------------------------------------- ELEMENTS --- */

  var elBar     = document.getElementById('progress-bar');
  var elCount   = document.getElementById('q-count');
  var elDim     = document.getElementById('q-dim');
  var elText    = document.getElementById('q-text');
  var elOptions = document.getElementById('options');
  var elBack    = document.getElementById('btn-back');
  var elNext    = document.getElementById('btn-next');
  var elResults = document.getElementById('results');
  var elActive  = document.getElementById('quiz-active');

  /* --------------------------------------------------------- RENDERING --- */

  function renderQuestion() {
    var q = QUESTIONS[current];

    elBar.style.width = (current / QUESTIONS.length * 100) + '%';
    elCount.textContent = 'Question ' + (current + 1) + ' of ' + QUESTIONS.length;
    if (elDim) elDim.textContent = DIMENSIONS[q.dim].label;
    elText.textContent = q.text;

    elOptions.innerHTML = '';

    q.opts.forEach(function (label, value) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.setAttribute('aria-pressed', answers[current] === value ? 'true' : 'false');
      btn.innerHTML = '<span class="key" aria-hidden="true">' + (value + 1) + '</span>' +
                      '<span>' + label + '</span>';

      btn.addEventListener('click', function () {
        answers[current] = value;

        Array.prototype.forEach.call(elOptions.children, function (child, i) {
          child.setAttribute('aria-pressed', i === value ? 'true' : 'false');
        });

        elNext.disabled = false;
        setTimeout(next, 260);
      });

      elOptions.appendChild(btn);
    });

    elBack.disabled = current === 0;
    elNext.disabled = answers[current] === null;
    elNext.textContent = current === QUESTIONS.length - 1 ? 'See my result →' : 'Next →';
  }

  function next() {
    if (answers[current] === null) return;
    if (current < QUESTIONS.length - 1) {
      current++;
      renderQuestion();
      elText.focus();
    } else {
      finish();
    }
  }

  function back() {
    if (current === 0) return;
    current--;
    renderQuestion();
    elText.focus();
  }

  /* ----------------------------------------------------------- SCORING --- */

  function score(ans) {
    var total = 0;
    var dims = {};

    Object.keys(DIMENSIONS).forEach(function (k) {
      dims[k] = { points: 0, max: 0 };
    });

    QUESTIONS.forEach(function (q, i) {
      var v = ans[i] || 0;
      total += v;
      dims[q.dim].points += v;
      dims[q.dim].max += 3;
    });

    Object.keys(dims).forEach(function (k) {
      dims[k].pct = dims[k].max ? Math.round(dims[k].points / dims[k].max * 100) : 0;
    });

    var profile = PROFILES.find(function (p) {
      return total >= p.min && total <= p.max;
    }) || PROFILES[PROFILES.length - 1];

    return { total: total, max: QUESTIONS.length * 3, dims: dims, profile: profile };
  }

  /* ----------------------------------------------------------- RESULTS --- */

  function finish() {
    var r = score(answers);

    try {
      localStorage.setItem('quizResult', JSON.stringify({
        score: r.total, max: r.max, profile: r.profile.id,
        profileName: r.profile.name, date: new Date().toISOString().slice(0, 10)
      }));
    } catch (e) { }

    renderResults(r);
  }

  function renderResults(r) {
    elActive.hidden = true;
    elResults.hidden = false;

    var pct = r.total / r.max;
    var C = 2 * Math.PI * 74;

    var dimKeys = Object.keys(r.dims).sort(function (a, b) {
      return r.dims[b].pct - r.dims[a].pct;
    });

    var dimHTML = dimKeys.map(function (k) {
      return '<div class="dim-bar">' +
               '<div class="row"><span>' + DIMENSIONS[k].label + '</span>' +
               '<strong>' + r.dims[k].pct + '%</strong></div>' +
               '<div class="track"><div class="fill" data-pct="' + r.dims[k].pct +
               '" style="background:' + DIMENSIONS[k].colour + '"></div></div>' +
             '</div>';
    }).join('');

    var actionHTML = r.profile.actions.map(function (a) {
      return '<div class="card action-card"><h4>' + a.title + '</h4><p>' + a.text + '</p></div>';
    }).join('');

    var helpHTML = r.profile.showHelp
      ? '<div class="help-note">' +
          '<h4 style="margin-top:0">Worth saying out loud</h4>' +
          '<p style="margin-bottom:.6rem">This site is not a diagnosis and it is not a substitute for talking to a person. If any of this is weighing on you:</p>' +
          '<ul style="margin:0;padding-left:1.1rem;color:var(--muted)">' +
            '<li><strong>Youthline</strong> — 0800 376 633, or free text 234</li>' +
            '<li><strong>1737</strong> — call or text, any time, free</li>' +
            '<li>Your school counsellor, or any adult you trust</li>' +
          '</ul>' +
        '</div>'
      : '';

    elResults.innerHTML =
      '<div class="grid grid-2" style="align-items:center">' +
        '<div class="dial-wrap">' +
          '<svg class="dial" width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">' +
            '<circle class="dial-track" cx="90" cy="90" r="74" fill="none" stroke-width="14"/>' +
            '<circle class="dial-fill" id="dial-fill" cx="90" cy="90" r="74" fill="none" ' +
              'stroke-width="14" stroke="' + r.profile.colour + '" ' +
              'stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/>' +
          '</svg>' +
          '<div class="dial-text">' + r.total + '<small>out of ' + r.max + '</small></div>' +
        '</div>' +
        '<div>' +
          '<p class="eyebrow">Your profile</p>' +
          '<h2 style="color:' + r.profile.colour + ';margin-bottom:.5rem">' + r.profile.name + '</h2>' +
          '<p style="font-size:1.15rem">' + r.profile.headline + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="card card-hard" style="margin-top:2rem">' +
        '<p style="max-width:70ch;margin:0">' + r.profile.body + '</p>' +
      '</div>' +

      '<h3 style="margin-top:3rem">Where it shows up most</h3>' +
      '<p class="lede" style="margin-bottom:1.5rem">Your total matters less than the shape of it. ' +
        'The bar at the top is the area worth starting with.</p>' +
      dimHTML +

      '<h3 style="margin-top:3rem">Three things to try this week</h3>' +
      '<div class="grid grid-3" style="margin-bottom:2rem">' + actionHTML + '</div>' +

      helpHTML +

      '<div class="btn-row" style="margin-top:2rem">' +
        '<a class="btn btn-primary" href="Addiction buster.html">Open the Addiction buster!→</a>' +
        '<a class="btn" href="Reality Check.html">Go to Reality check!</a>' +
        '<button class="btn btn-ghost" type="button" id="btn-retake">Retake the quiz</button>' +
      '</div>';

    requestAnimationFrame(function () {
      var fill = document.getElementById('dial-fill');
      if (fill) fill.style.strokeDashoffset = String(C * (1 - pct));
      elResults.querySelectorAll('.fill').forEach(function (bar) {
        bar.style.width = bar.dataset.pct + '%';
      });
    });

    document.getElementById('btn-retake').addEventListener('click', function () {
      current = 0;
      answers = new Array(QUESTIONS.length).fill(null);
      elResults.hidden = true;
      elActive.hidden = false;
      renderQuestion();
      window.scrollTo({ top: 0 });
    });

    elResults.focus();
    window.scrollTo({ top: shell.offsetTop - 80, behavior: 'smooth' });
  }

  /* -------------------------------------------------------------- INIT --- */

  elNext.addEventListener('click', next);
  elBack.addEventListener('click', back);

  document.addEventListener('keydown', function (e) {
    if (!elResults.hidden) return;
    if (e.key >= '1' && e.key <= '4') {
      var btn = elOptions.children[+e.key - 1];
      if (btn) btn.click();
    }
    if (e.key === 'ArrowLeft')  back();
    if (e.key === 'ArrowRight') next();
  });

  renderQuestion();

  window.scoreQuiz = score;
})();

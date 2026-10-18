/* ==== app.js — shared behaviour for every page. ==== */

(function () {
  'use strict';

  document.documentElement.setAttribute('data-theme', 'dark');

  try { localStorage.removeItem('theme'); } catch (e) {}
})();

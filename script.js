(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });
  }

  // One entrance reveal per element. Nothing repeats on scroll.
  var risers = document.querySelectorAll('.rise');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(risers, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(risers, function (el) { io.observe(el); });
  }

  // Contact form. No server, so this composes a mail draft.
  // Validation runs here so the user sees errors before their mail app opens.
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    var checks = [
      { id: 'cf-name', err: 'err-name', ok: function (v) { return v.trim().length > 0; } },
      { id: 'cf-email', err: 'err-email', ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
      { id: 'cf-msg', err: 'err-msg', ok: function (v) { return v.trim().length > 0; } }
    ];

    function validate(c, showError) {
      var field = document.getElementById(c.id);
      var msg = document.getElementById(c.err);
      var good = c.ok(field.value);
      if (showError) {
        msg.classList.toggle('show', !good);
        field.setAttribute('aria-invalid', good ? 'false' : 'true');
      } else if (good) {
        msg.classList.remove('show');
        field.setAttribute('aria-invalid', 'false');
      }
      return good;
    }

    checks.forEach(function (c) {
      var field = document.getElementById(c.id);
      field.addEventListener('blur', function () { validate(c, true); });
      field.addEventListener('input', function () { validate(c, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      var allGood = true;
      checks.forEach(function (c) {
        var good = validate(c, true);
        if (!good) { allGood = false; if (!firstBad) firstBad = document.getElementById(c.id); }
      });
      if (!allGood) {
        status.textContent = 'Please fix the fields marked above.';
        if (firstBad) firstBad.focus();
        return;
      }
      var name = document.getElementById('cf-name').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var body = document.getElementById('cf-msg').value.trim();
      var subject = 'Portfolio enquiry from ' + name;
      var text = body + '\n\nFrom: ' + name + '\nReply to: ' + email;
      status.textContent = 'Opening your email app. If nothing happens, write to nisarg0708@gmail.com directly.';
      window.location.href = 'mailto:nisarg0708@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(text);
    });
  }
})();

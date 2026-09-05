(function () {
  "use strict";

  var digits = String((window.HAWKINS && window.HAWKINS.phone) || "").replace(/\D/g, "");
  var hasPhone = digits.length === 10;

  document.documentElement.classList.toggle("has-phone", hasPhone);

  if (hasPhone) {
    var href = "tel:+1" + digits;
    var pretty = "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
    document.querySelectorAll("[data-call]").forEach(function (el) {
      if (el.tagName === "A") {
        el.setAttribute("href", href);
      }
      var num = el.querySelector("[data-call-number]");
      if (num) num.textContent = pretty;
    });
  } else {
    document.querySelectorAll("a[data-call]").forEach(function (el) {
      el.removeAttribute("href");
    });
  }

  var next = document.getElementById("form-next");
  if (next) {
    next.value = window.location.origin + "/thanks";
  }

  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
})();

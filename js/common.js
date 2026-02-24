// js/common.js
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     HEADER dropdown
  ========================= */
  (() => {
    const hd = document.getElementById("hd");
    const dd = document.getElementById("hd_dd");
    if (!hd || !dd) return;

    const its = Array.from(hd.querySelectorAll(".hd_it"));
    const btns = Array.from(hd.querySelectorAll(".hd_btn"));
    const mns = Array.from(dd.querySelectorAll(".hd_mn"));

    let curKey = null;

    const setOn = (key) => {
      curKey = key;

      its.forEach((it) => it.classList.toggle("isOn", it.getAttribute("data_key") === key));
      mns.forEach((mn) => mn.classList.toggle("isOn", mn.getAttribute("data_key") === key));

      hd.classList.add("isOpen");
      dd.setAttribute("aria-hidden", "false");

      btns.forEach((b) => {
        b.setAttribute("aria-expanded", b.getAttribute("data_key") === key ? "true" : "false");
      });
    };

    const close = () => {
      curKey = null;

      its.forEach((it) => it.classList.remove("isOn"));
      mns.forEach((mn) => mn.classList.remove("isOn"));

      hd.classList.remove("isOpen");
      dd.setAttribute("aria-hidden", "true");

      btns.forEach((b) => b.setAttribute("aria-expanded", "false"));
    };

    its.forEach((it) => {
      const key = it.getAttribute("data_key");
      it.addEventListener("mouseenter", () => setOn(key));
      it.addEventListener("focusin", () => setOn(key));
    });

    btns.forEach((btn) => {
      const key = btn.getAttribute("data_key");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (hd.classList.contains("isOpen") && curKey === key) close();
        else setOn(key);
      });
    });

    hd.addEventListener("mouseleave", close);

    document.addEventListener("click", (e) => {
      if (!hd.classList.contains("isOpen")) return;
      if (!hd.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hd.classList.contains("isOpen")) close();
    });
  })();


  /* =========================
     BEST RANK (1초 자동)
     - panel class: .br_pn (통일)
  ========================= */
  (() => {
    const root = document.getElementById("br");
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".br_it"));
    if (items.length === 0) return;

    const autoMs = 1000;
    let idx = 0;
    let timer = null;

    const setA11y = () => {
      items.forEach((it, i) => {
        const btn = it.querySelector(".br_btn");
        const pan = it.querySelector(".br_pn");
        if (!btn || !pan) return;

        if (!btn.id) btn.id = `br_btn_${i}`;
        if (!pan.id) pan.id = `br_pn_${i}`;

        btn.setAttribute("aria-controls", pan.id);
        btn.setAttribute("aria-expanded", it.classList.contains("isOn") ? "true" : "false");

        pan.setAttribute("role", "region");
        pan.setAttribute("aria-labelledby", btn.id);
        pan.setAttribute("aria-hidden", it.classList.contains("isOn") ? "false" : "true");
      });
    };

    const setOn = (n) => {
      items.forEach((it, i) => {
        const on = i === n;
        it.classList.toggle("isOn", on);

        const btn = it.querySelector(".br_btn");
        const pan = it.querySelector(".br_pn");
        if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
        if (pan) pan.setAttribute("aria-hidden", on ? "false" : "true");
      });

      idx = n;
    };

    const next = () => setOn((idx + 1) % items.length);

    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      timer = setInterval(next, autoMs);
    };

    const initIdx = Math.max(0, items.findIndex((it) => it.classList.contains("isOn")));
    setOn(initIdx);
    setA11y();
    start();

    items.forEach((it, i) => {
      const btn = it.querySelector(".br_btn");
      if (!btn) return;

      btn.addEventListener("click", () => {
        setOn(i);
      });

      it.addEventListener("mouseenter", stop);
      it.addEventListener("mouseleave", start);
      it.addEventListener("focusin", stop);
      it.addEventListener("focusout", start);
    });
  })();


  /* =========================
     HISTORY (scroll -> horizontal)
  ========================= */
  (() => {
    const hs = document.getElementById("hs");
    const vp = document.getElementById("hs_v");
    const tr = document.getElementById("hs_tr");
    const pEl = document.getElementById("hs_p");
    const dEl = document.getElementById("hs_d");

    if (!hs || !vp || !tr || !pEl || !dEl) return;

    let hsTop = 0;
    let range = 1;
    let dist = 0;
    let dotMax = 0;
    let ticking = false;

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const update = () => {
      const rect = hs.getBoundingClientRect();
      hsTop = rect.top + window.scrollY;

      const trW = tr.scrollWidth;
      const vpW = vp.clientWidth;

      dist = Math.max(0, trW - vpW);

      const h = dist + window.innerHeight;
      hs.style.height = h + "px";
      range = Math.max(1, h - window.innerHeight);

      dotMax = Math.max(0, pEl.clientWidth - dEl.offsetWidth);
    };

    const draw = () => {
      ticking = false;

      const p = clamp01((window.scrollY - hsTop) / range);

      tr.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
      dEl.style.transform = `translate3d(${p * dotMax}px, -50%, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(draw);
    };

    update();
    draw();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { update(); draw(); }, { passive: true });
    window.addEventListener("load", () => { update(); draw(); });
  })();
});
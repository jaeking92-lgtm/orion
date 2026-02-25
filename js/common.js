// js/common.js
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     HEADER dropdown (WORKING)
     - hd.isOpen / dd.isOpen 모두 토글
     - .hd_it.isOn / .hd_btn.isOn / .hd_mn.isOn 통일
     - click / hover / focus / outside / ESC 안정화
  ========================= */
  (() => {
    const hd = document.getElementById("hd");
    const dd = document.getElementById("hd_dd");
    if (!hd || !dd) return;

    const its = Array.from(hd.querySelectorAll(".hd_it"));
    const btns = Array.from(hd.querySelectorAll(".hd_btn"));
    const mns = Array.from(dd.querySelectorAll(".hd_mn"));
    if (btns.length === 0 || mns.length === 0) return;

    let curKey = null;
    let leaveTimer = null;

    const getKey = (el) => el.getAttribute("data_key");

    const setOpenState = (open) => {
      hd.classList.toggle("isOpen", open);
      dd.classList.toggle("isOpen", open);
      dd.setAttribute("aria-hidden", open ? "false" : "true");
    };

    const openMenu = (key) => {
      if (!key) return;
      curKey = key;
      setOpenState(true);

      its.forEach((it) => it.classList.toggle("isOn", getKey(it) === key));
      btns.forEach((b) => b.classList.toggle("isOn", getKey(b) === key));
      mns.forEach((mn) => mn.classList.toggle("isOn", getKey(mn) === key));

      btns.forEach((b) => {
        b.setAttribute("aria-expanded", getKey(b) === key ? "true" : "false");
      });
    };

    const closeMenu = () => {
      curKey = null;
      setOpenState(false);

      its.forEach((it) => it.classList.remove("isOn"));
      btns.forEach((b) => b.classList.remove("isOn"));
      mns.forEach((mn) => mn.classList.remove("isOn"));

      btns.forEach((b) => b.setAttribute("aria-expanded", "false"));
    };

    const cancelLeave = () => {
      if (!leaveTimer) return;
      clearTimeout(leaveTimer);
      leaveTimer = null;
    };

    const scheduleLeave = () => {
      cancelLeave();
      leaveTimer = setTimeout(() => closeMenu(), 160);
    };

    // hover/focus로 오픈
    its.forEach((it) => {
      const key = getKey(it);
      it.addEventListener("mouseenter", () => openMenu(key));
      it.addEventListener("focusin", () => openMenu(key));
    });

    // click 토글
    btns.forEach((btn) => {
      const key = getKey(btn);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const alreadyOpen = hd.classList.contains("isOpen") && curKey === key;
        if (alreadyOpen) closeMenu();
        else openMenu(key);
      });

      // 열려있는 상태에서 hover로 메뉴만 변경
      btn.addEventListener("mouseenter", () => {
        if (hd.classList.contains("isOpen")) openMenu(key);
      });

      btn.addEventListener("focus", () => openMenu(key));
    });

    // hd/dd 위에 있으면 닫기 예약 취소
    hd.addEventListener("mouseenter", cancelLeave);
    dd.addEventListener("mouseenter", cancelLeave);

    // hd/dd에서 벗어나면 닫기 예약
    hd.addEventListener("mouseleave", scheduleLeave);
    dd.addEventListener("mouseleave", scheduleLeave);

    // dd 내부 클릭은 닫히지 않게
    dd.addEventListener("click", (e) => e.stopPropagation());

    // 바깥 클릭 닫기
    document.addEventListener("click", (e) => {
      if (!hd.classList.contains("isOpen")) return;

      const t = e.target;
      if (!hd.contains(t) && !dd.contains(t)) closeMenu();
    });

    // ESC 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hd.classList.contains("isOpen")) closeMenu();
    });
  })();


  /* =========================
     PRODUCT SLIDER (pd) - FIXED CENTER ARROWS
     - 버튼이 슬라이더 밖에 있으면(추천 구조) 버튼은 고정, 카드만 이동
     - .pd_stage가 없으면 JS가 자동으로 stage를 만들어 slider를 감쌈
     - 5개 기준: 3번째(인덱스2)를 항상 크게(pd_it_m / pd_card_m) 유지
     - click / drag / swipe / keyboard
  ========================= */
  (() => {
    const pd = document.getElementById("pd") || document.querySelector(".pd");
    if (!pd) return;

    const slider = pd.querySelector(".pd_slider");
    if (!slider) return;

    // stage 보장(없으면 생성해서 slider를 감싸기)
    let stage = pd.querySelector(".pd_stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "pd_stage";
      slider.parentNode.insertBefore(stage, slider);
      stage.appendChild(slider);
    }

    // 버튼 찾기(밖에 있든 안에 있든 찾아서 stage로 이동)
    let btnPrev =
      stage.querySelector(".pd_ar_l") ||
      pd.querySelector(".pd_ar_l") ||
      slider.querySelector(".pd_ar_l");
    let btnNext =
      stage.querySelector(".pd_ar_r") ||
      pd.querySelector(".pd_ar_r") ||
      slider.querySelector(".pd_ar_r");

    if (btnPrev && btnPrev.parentNode !== stage) stage.appendChild(btnPrev);
    if (btnNext && btnNext.parentNode !== stage) stage.appendChild(btnNext);

    // 전환 on/off
    const enableTransition = () => {
      slider.style.transition = "transform 320ms ease";
    };
    const disableTransition = () => {
      slider.style.transition = "none";
    };

    // ✅ 가운데를 항상 크게 유지(기본 5개 → index 2)
    const applyCenterSize = () => {
      const items = Array.from(slider.children).filter((n) =>
        n.classList ? n.classList.contains("pd_it") : false
      );

      if (items.length === 0) return;

      const centerIndex = items.length >= 5 ? 2 : Math.floor(items.length / 2);

      items.forEach((it, i) => {
        const card = it.querySelector(".pd_card");

        if (i === centerIndex) {
          it.classList.add("pd_it_m");
          it.classList.remove("pd_it_s");

          if (card) {
            card.classList.add("pd_card_m");
            card.classList.remove("pd_card_s");
          }
        } else {
          it.classList.remove("pd_it_m");
          it.classList.add("pd_it_s");

          if (card) {
            card.classList.remove("pd_card_m");
            card.classList.add("pd_card_s");
          }
        }
      });
    };

    // ✅ 실제 한 칸 이동거리(space-between/gap/가변폭 대응)
    const getStep = () => {
      const items = Array.from(slider.children).filter((n) =>
        n.classList ? n.classList.contains("pd_it") : false
      );
      if (items.length < 2) return 0;

      const a = items[0].getBoundingClientRect();
      const b = items[1].getBoundingClientRect();
      return b.left - a.left;
    };

    const rotateNext = () => {
      const first = slider.firstElementChild;
      if (first) slider.appendChild(first);
    };

    const rotatePrev = () => {
      const last = slider.lastElementChild;
      if (last) slider.insertBefore(last, slider.firstElementChild);
    };

    let isAnimating = false;

    const goNext = () => {
      if (isAnimating) return;
      isAnimating = true;

      disableTransition();
      slider.style.transform = "translate3d(0,0,0)";
      // reflow
      void slider.offsetWidth;

      const step = getStep();
      if (!step) {
        isAnimating = false;
        return;
      }

      enableTransition();
      slider.style.transform = `translate3d(${-step}px,0,0)`;

      const onEnd = () => {
        slider.removeEventListener("transitionend", onEnd);

        disableTransition();
        rotateNext();
        applyCenterSize();
        slider.style.transform = "translate3d(0,0,0)";
        void slider.offsetWidth;

        isAnimating = false;
      };

      slider.addEventListener("transitionend", onEnd);
    };

    const goPrev = () => {
      if (isAnimating) return;
      isAnimating = true;

      disableTransition();
      rotatePrev();
      applyCenterSize();
      void slider.offsetWidth;

      const step = getStep();
      if (!step) {
        isAnimating = false;
        return;
      }

      // 한 칸 왼쪽으로 밀린 상태에서 시작 → 0으로 애니메이션
      slider.style.transform = `translate3d(${-step}px,0,0)`;
      void slider.offsetWidth;

      enableTransition();
      slider.style.transform = "translate3d(0,0,0)";

      const onEnd = () => {
        slider.removeEventListener("transitionend", onEnd);
        disableTransition();
        isAnimating = false;
      };

      slider.addEventListener("transitionend", onEnd);
    };

    // init
    applyCenterSize();
    disableTransition();
    slider.style.transform = "translate3d(0,0,0)";

    if (btnPrev)
      btnPrev.addEventListener("click", (e) => {
        e.preventDefault();
        goPrev();
      });

    if (btnNext)
      btnNext.addEventListener("click", (e) => {
        e.preventDefault();
        goNext();
      });

    // 키보드(스테이지 포커스 가능)
    stage.setAttribute("tabindex", "0");
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    });

    // Drag / Swipe
    let startX = 0;
    let curX = 0;
    let dragging = false;

    const onDown = (clientX) => {
      if (isAnimating) return;
      dragging = true;
      startX = clientX;
      curX = clientX;
      disableTransition();
    };

    const onMove = (clientX) => {
      if (!dragging) return;
      curX = clientX;
      const dx = curX - startX;
      slider.style.transform = `translate3d(${dx}px,0,0)`;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;

      const dx = curX - startX;
      const threshold = 60;

      if (dx <= -threshold) {
        slider.style.transform = "translate3d(0,0,0)";
        goNext();
      } else if (dx >= threshold) {
        slider.style.transform = "translate3d(0,0,0)";
        goPrev();
      } else {
        enableTransition();
        slider.style.transform = "translate3d(0,0,0)";
        slider.addEventListener("transitionend", () => disableTransition(), { once: true });
      }
    };

    slider.addEventListener("mousedown", (e) => onDown(e.clientX));
    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", onUp);

    slider.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        onDown(e.touches[0].clientX);
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        onMove(e.touches[0].clientX);
      },
      { passive: true }
    );

    slider.addEventListener("touchend", onUp);

    // resize 시 center 클래스 재적용(간격/폭 재계산 대비)
    window.addEventListener(
      "resize",
      () => {
        applyCenterSize();
        disableTransition();
        slider.style.transform = "translate3d(0,0,0)";
      },
      { passive: true }
    );
  })();


  /* =========================
     BEST RANK (1초 자동)
     - panel class: .br_pn
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

      btn.addEventListener("click", () => setOn(i));

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
    window.addEventListener(
      "resize",
      () => {
        update();
        draw();
      },
      { passive: true }
    );
    window.addEventListener("load", () => {
      update();
      draw();
    });
  })();
});
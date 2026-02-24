document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("hd");
  const dd = document.getElementById("hd_dd");

  if (!header || !dd) return;

  const btns = header.querySelectorAll(".hd_btn");
  const panels = dd.querySelectorAll(".hd_mn");

  const getKey = (el) => el.getAttribute("data_key");

  const openMenu = (key) => {
    dd.classList.add("isOpen");
    dd.setAttribute("aria-hidden", "false");

    btns.forEach((b) => b.classList.toggle("isOn", getKey(b) === key));
    panels.forEach((p) => p.classList.toggle("isOn", getKey(p) === key));
  };

  const closeMenu = () => {
    dd.classList.remove("isOpen");
    dd.setAttribute("aria-hidden", "true");

    btns.forEach((b) => b.classList.remove("isOn"));
    panels.forEach((p) => p.classList.remove("isOn"));
  };

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = getKey(btn);

      const alreadyOpen = dd.classList.contains("isOpen") && btn.classList.contains("isOn");
      if (alreadyOpen) closeMenu();
      else openMenu(key);
    });

    // 열려있는 상태에서 메뉴만 바꿔치기 (hover)
    btn.addEventListener("mouseenter", () => {
      if (dd.classList.contains("isOpen")) openMenu(getKey(btn));
    });
  });

  // 헤더 밖 클릭하면 닫기
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target) && !dd.contains(e.target)) closeMenu();
  });

  // ESC 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
});
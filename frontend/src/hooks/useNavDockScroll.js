import { useEffect } from "react";
function useNavDockScroll() {
  useEffect(() => {
    const nav = document.querySelector(".premium-nav-dock");
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle("scrolled", window.scrollY > 50);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}
export {
  useNavDockScroll
};

import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import { useCart } from "../context/CartContext";

const REVEAL_SELECTOR = [
  ".section-heading",
  ".benefits-strip > div",
  ".about-hero .container",
  ".category-card",
  ".catalog-showcase-head",
  ".catalog-showcase-card",
  ".product-card",
  ".philosophy-image",
  ".philosophy-copy",
  ".philosophy-person",
  ".testimonial-card",
  ".checkout-flow",
  ".newsletter",
  ".about-story > img",
  ".about-story-copy",
  ".about-story-copy > p",
  ".about-story-copy > .btn",
  ".values-grid > div",
  ".page-hero.compact",
  ".catalog-toolbar",
  ".filters",
  ".product-detail-grid",
  ".cart-layout",
  ".checkout-layout",
  ".contact-grid > *",
].join(",");

export default function Layout() {
  const { pathname } = useLocation();
  const { toast } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return undefined;

    // Keep observer state local to this effect. This is important in React
    // StrictMode, where effects are mounted, cleaned up and mounted again.
    // A DOM data-* flag survives that cleanup and can leave sections hidden.
    const registered = new Set();
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const supportsObserver = typeof window.IntersectionObserver === "function";

    const reveal = (element) => {
      if (!element?.isConnected) return;
      element.classList.add("is-visible");
    };

    const revealObserver =
      supportsObserver && !reduceMotion
        ? new IntersectionObserver(
            (entries, observer) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                reveal(entry.target);
                observer.unobserve(entry.target);
              });
            },
            {
              threshold: 0.08,
              rootMargin: "0px 0px -5% 0px",
            },
          )
        : null;

    const register = () => {
      const items = [...main.querySelectorAll(REVEAL_SELECTOR)];

      items.forEach((element, index) => {
        if (registered.has(element)) return;
        registered.add(element);

        element.classList.add("motion-reveal");
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 6, 5) * 45}ms`,
        );

        if (!revealObserver) {
          reveal(element);
          return;
        }

        revealObserver.observe(element);
      });
    };

    register();

    // Product/content data arrives asynchronously from the CMS. Register any
    // newly-rendered cards and sections without hiding already-visible content.
    const mutationObserver = new MutationObserver(() => register());
    mutationObserver.observe(main, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      revealObserver?.disconnect();

      // Clean up the classes so the second StrictMode effect run can bind
      // everything again correctly instead of leaving opacity: 0 elements.
      registered.forEach((element) => {
        element.classList.remove("motion-reveal", "is-visible");
        element.style.removeProperty("--reveal-delay");
      });
      registered.clear();
    };
  }, [pathname]);

  return (
    <div className="app-shell">
      <Header />
      <main key={pathname} className="page-transition">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

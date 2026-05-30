"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type OverlayScrollbarsModule = typeof import("overlayscrollbars");

const instances = new Map<HTMLElement, ReturnType<OverlayScrollbarsModule["OverlayScrollbars"]>>();

function isScrollableElement(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const canScrollY = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
  const canScrollX = /(auto|scroll)/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
  const forced = element.dataset.osScroll === "true";

  return forced || canScrollX || canScrollY;
}

function cleanupDisconnected() {
  for (const [element, instance] of instances) {
    if (!element.isConnected) {
      instance.destroy();
      instances.delete(element);
    }
  }
}

export function OverlayScrollbarsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    let observer: MutationObserver | null = null;

    void import("overlayscrollbars").then(({ OverlayScrollbars }) => {
      if (disposed) return;

      const applyTheme = () => {
        const theme = document.documentElement.dataset.theme === "dark" ? "os-theme-dark" : "os-theme-light";

        const candidates = Array.from(
          document.querySelectorAll<HTMLElement>([
            "[data-os-scroll]",
            ".overflow-y-auto",
            ".overflow-x-auto",
            ".overflow-auto",
          ].join(",")),
        );

        for (const element of candidates) {
          if (!isScrollableElement(element)) {
            const existing = instances.get(element);
            if (existing) {
              existing.destroy();
              instances.delete(element);
            }
            continue;
          }

          const existing = instances.get(element);
          if (existing) {
            existing.options({ scrollbars: { theme, autoHide: "leave" } });
            existing.update(true);
            continue;
          }

          const instance = OverlayScrollbars(element, {
            scrollbars: {
              theme,
              autoHide: "leave",
              autoHideDelay: 250,
              clickScroll: true,
              dragScroll: true,
            },
          });

          instances.set(element, instance);
        }

        cleanupDisconnected();
      };

      applyTheme();

      observer = new MutationObserver(() => {
        applyTheme();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "data-theme", "style"],
      });
    });

    return () => {
      disposed = true;
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
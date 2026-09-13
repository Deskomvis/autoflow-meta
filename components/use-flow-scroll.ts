'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export function useFlowScroll(
  ref: RefObject<HTMLDivElement | null>,
  active: number,
  setActive: (step: number) => void,
  count: number,
) {
  const step = useRef(active);
  const [direction, setDirection] = useState('forward');
  const selectStep = useCallback((next: number) => {
    setDirection(next < step.current ? 'backward' : 'forward');
    step.current = next;
    setActive(next);
  }, [setActive]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastWheel = 0;
    let consumed = false;
    let wheelDirection = 0;
    let previousWheelDelta = 0;
    let touchY = 0;
    let touchX = 0;
    let touchConsumed = false;
    let touchEligible = false;

    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle('flow-in-view', entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(element);

    function ready() {
      const bounds = element!.getBoundingClientRect();
      return !reduced.matches && !document.querySelector('[role="dialog"]') &&
        bounds.top <= window.innerHeight * 0.82 &&
        bounds.bottom >= window.innerHeight * 0.18;
    }
    function keepFlowVisible() {
      const bounds = element!.getBoundingClientRect();
      if (bounds.top < 12 || bounds.bottom > window.innerHeight - 12) {
        element!.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    const canMove = (delta: number) => delta > 0 ? step.current < count - 1 : step.current > 0;

    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || !ready()) return;
      const now = performance.now();
      const direction = Math.sign(event.deltaY);
      const magnitude = Math.abs(event.deltaY);
      const isWheelStep = event.deltaMode !== 0 || magnitude >= 40;
      const restarted = magnitude >= 4 && magnitude > previousWheelDelta * 1.8;
      if (
        now - lastWheel > 100 ||
        direction !== wheelDirection ||
        isWheelStep ||
        restarted
      ) consumed = false;
      wheelDirection = direction;
      lastWheel = now;
      previousWheelDelta = magnitude;
      if (consumed) { event.preventDefault(); return; }
      if (!canMove(event.deltaY)) return;
      event.preventDefault();
      selectStep(step.current + direction);
      consumed = true;
      keepFlowVisible();
    }
    function touchStart(event: TouchEvent) {
      touchEligible = event.touches.length === 1 && ready();
      touchConsumed = false;
      if (!touchEligible) return;
      touchY = event.touches[0].clientY;
      touchX = event.touches[0].clientX;
    }
    function touchMove(event: TouchEvent) {
      if (!touchEligible || event.touches.length !== 1) return;
      const delta = touchY - event.touches[0].clientY;
      if (Math.abs(event.touches[0].clientX - touchX) > Math.abs(delta)) return;
      if (touchConsumed) { event.preventDefault(); return; }
      if (!canMove(delta)) return;
      event.preventDefault();
      if (Math.abs(delta) < 8) return;
      selectStep(step.current + Math.sign(delta));
      touchConsumed = true;
      keepFlowVisible();
    }
    window.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: false });
    return () => {
      observer.disconnect();
      window.removeEventListener('wheel', wheel);
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
    };
  }, [count, ref, selectStep]);

  return { selectStep, direction };
}

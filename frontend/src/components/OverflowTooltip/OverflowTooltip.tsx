import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type OverflowTooltipProps = {
  tooltip: string;
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function OverflowTooltip({
  tooltip,
  children,
  className = '',
  as: Component = 'span',
}: OverflowTooltipProps) {
  const ref = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const checkOverflow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setIsOverflowing(
      el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    window.addEventListener('resize', checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, tooltip]);

  const showTooltip = () => {
    if (!isOverflowing || !ref.current || !tooltip.trim()) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    setVisible(true);
  };

  const hideTooltip = () => setVisible(false);

  return (
    <>
      <Component
        ref={ref}
        className={className}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={isOverflowing ? 0 : undefined}
      >
        {children}
      </Component>
      {visible &&
        isOverflowing &&
        createPortal(
          <div
            role="tooltip"
            className="overflow-tooltip"
            style={{ left: coords.x, top: coords.y }}
          >
            {tooltip}
          </div>,
          document.body,
        )}
    </>
  );
}

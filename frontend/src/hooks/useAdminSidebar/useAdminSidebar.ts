import { useCallback, useEffect, useState } from 'react';

const MOBILE_MQ = '(max-width: 767px)';
const COMPACT_MQ = '(max-width: 1023px)';

function readMobile() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches;
}

function readCompact() {
  return typeof window !== 'undefined' && window.matchMedia(COMPACT_MQ).matches;
}

export function useAdminSidebar() {
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(readMobile);
  const [isCompact, setIsCompact] = useState(() => readCompact() && !readMobile());

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_MQ);
    const compact = window.matchMedia(COMPACT_MQ);

    const sync = () => {
      const mobileMatches = mobile.matches;
      setIsMobile(mobileMatches);
      setIsCompact(compact.matches && !mobileMatches);
      if (!mobileMatches) setMobileOpen(false);
    };

    sync();
    mobile.addEventListener('change', sync);
    compact.addEventListener('change', sync);
    return () => {
      mobile.removeEventListener('change', sync);
      compact.removeEventListener('change', sync);
    };
  }, []);

  const collapsed = isCompact || userCollapsed;
  const showCollapseToggle = !isMobile && !isCompact;

  const toggleCollapsed = useCallback(() => {
    if (showCollapseToggle) setUserCollapsed((c) => !c);
  }, [showCollapseToggle]);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return {
    collapsed,
    isMobile,
    mobileOpen,
    showCollapseToggle,
    toggleCollapsed,
    openMobile,
    closeMobile,
  };
}

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * A hook that automatically closes the mobile sidebar when navigation occurs.
 * This provides a better UX by closing the sidebar after the user clicks a link,
 * without requiring explicit click handlers on each navigation item.
 */
export function useLayoutSidebarMobileClose() {
  const location = useLocation();
  const sidebarControls = useSidebar();
  const isFirstMount = useRef(true);

  // Store sidebar controls in a ref to avoid effect retriggers
  const sidebarControlsRef = useRef(sidebarControls);
  sidebarControlsRef.current = sidebarControls;

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const { isMobile, openMobile, setOpenMobile } = sidebarControlsRef.current;
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [location]);
}
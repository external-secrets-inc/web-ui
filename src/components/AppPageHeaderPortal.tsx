import { useLayout } from '@/context/LayoutContext';
import { createPortal } from 'react-dom';

interface AppPageHeaderPortalProps {
  children: React.ReactNode;
}

/**
 * AppPageHeaderPortal renders its children into the header slot element
 * This allows page components to render content in the header from within the component itself
 */
const AppPageHeaderPortal: React.FC<AppPageHeaderPortalProps> = ({ children }) => {
  const { headerSlotElement } = useLayout();

  if (!headerSlotElement) return null;

  return createPortal(children, headerSlotElement);
};

export default AppPageHeaderPortal;
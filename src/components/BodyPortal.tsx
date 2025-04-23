import React from 'react';
import { createPortal } from 'react-dom';

interface BodyPortalProps {
  children: React.ReactNode;
}

/**
 * A reusable component that renders its children directly into the document.body
 * using React Portal. This is useful for elements like modals, tooltips, or dev tools
 * that need to escape the regular DOM hierarchy.
 */
const BodyPortal: React.FC<BodyPortalProps> = ({ children }) => {
  return createPortal(children, document.body);
};

export default BodyPortal;
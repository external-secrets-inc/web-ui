import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// The shape of the dynamic breadcrumb data. We'll key it by pathname.
type Breadcrumbs = Record<string, string>;

interface BreadcrumbsContextType {
  breadcrumbs: Breadcrumbs;
  setBreadcrumb: (pathname: string, label: string) => void;
  clearBreadcrumb: (pathname: string) => void;
}

const BreadcrumbsContext = createContext<
  BreadcrumbsContextType | undefined
>(undefined);

export const BreadcrumbsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumbs>({});

  const setBreadcrumb = (pathname: string, label: string) => {
    setBreadcrumbs((prev) => ({ ...prev, [pathname]: label }));
  };

  const clearBreadcrumb = (pathname: string) => {
    setBreadcrumbs((prev) => {
      const newCrumbs = { ...prev };
      delete newCrumbs[pathname];
      return newCrumbs;
    });
  };

  return (
    <BreadcrumbsContext.Provider
      value={{ breadcrumbs, setBreadcrumb, clearBreadcrumb }}
    >
      {children}
    </BreadcrumbsContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbsContext);
  if (!context) {
    throw new Error(
      "useBreadcrumbs must be used within a BreadcrumbsProvider"
    );
  }
  return context;
};

// A helper hook for pages to easily set their breadcrumb
export const useSetBreadcrumb = (
  pathname: string,
  label: string | undefined
) => {
  const { setBreadcrumb, clearBreadcrumb } = useBreadcrumbs();

  useEffect(() => {
    if (label) {
      setBreadcrumb(pathname, label);
    }
    // Cleanup function to remove the breadcrumb when the component unmounts
    return () => {
      clearBreadcrumb(pathname);
    };
  }, [pathname, label, setBreadcrumb, clearBreadcrumb]);
};

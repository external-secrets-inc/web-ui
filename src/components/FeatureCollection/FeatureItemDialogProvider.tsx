// TODO:
// This is non a accessible dialog, but it was a pain to do it the accessible
// way. Eventually investigate the best practice to deal with these complex
// redundant dialogs that are triggered from multiple places.
// Ref: https://github.com/radix-ui/primitives/discussions/1234

import { Dialog } from "@radix-ui/react-dialog";
import { createContext, useContext, useState, useEffect } from "react";
import { trackFeatureItemDialogOpened } from "@/analytics";
import FeatureItemDialogContent from "./FeatureItemDialogContent";

interface DialogState {
  isOpen: boolean;
  featureID: string;
  featureName: string;
  featureStatus: string;
  featureType: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  activeTab: string;
}

interface DialogContext {
  openFeatureItemDialog: (props: Omit<DialogState, "isOpen"> & { activeTab?: string }) => void;
  closeDialog: () => void;
  setActiveTab: (tab: string) => void;
}

const DialogContext = createContext<DialogContext | null>(null);

export function FeatureItemDialogProvider({
  children,
  setFeatureID,
  onDeleteFeature,
  manifest,
  applyCommand
}: {
  children: React.ReactNode;
  setFeatureID: (id: string) => void;
  onDeleteFeature: (id: string) => void;
  manifest?: string;
  applyCommand?: string;
}) {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    featureID: '',
    featureName: '',
    featureStatus: '',
    featureType: '',
    featureDescription: '',
    manifest: manifest || '',
    applyCommand: applyCommand || '',
    activeTab: 'details'
  });

  // Sync manifest/applyCommand updates
  useEffect(() => {
    if (state.isOpen) {
      setState(prev => ({
        ...prev,
        manifest: manifest || prev.manifest,
        applyCommand: applyCommand || prev.applyCommand
      }));
    }
  }, [manifest, applyCommand, state.isOpen]);

  const api = {
    openFeatureItemDialog: (props: Omit<DialogState, "isOpen"> & { activeTab?: string }) => {
      setFeatureID(props.featureID);
      setState({
        ...props,
        isOpen: true,
        activeTab: props.activeTab || 'details'
      });
      trackFeatureItemDialogOpened(props.featureType, props.featureID, props.featureName);
    },
    closeDialog: () => {
      setState(prev => ({ ...prev, isOpen: false }));
      setFeatureID('');
    },
    setActiveTab: (tab: string) => setState(prev => ({ ...prev, activeTab: tab }))
  };

  return (
    <DialogContext.Provider value={api}>
      {children}
      {state.isOpen && (
        <Dialog open onOpenChange={(open) => !open && api.closeDialog()}>
          <FeatureItemDialogContent
            {...state}
            setActiveTab={api.setActiveTab}
            isPending={['PENDING_REGISTRATION', 'PROVISIONING'].includes(state.featureStatus)}
            onDeleted={() => {
              onDeleteFeature(state.featureID);
              api.closeDialog();
            }}
          />
        </Dialog>
      )}
    </DialogContext.Provider>
  );
}

export const useFeatureItemDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useFeatureItemDialog must be used within FeatureItemDialogProvider');
  return context;
};
import { Button } from "@/components/ui/button";
import { useFeatureItemDialog } from "./FeatureItemDialogProvider";
import FeatureItemDropdownMenu from "./FeatureItemDropdownMenu";

interface FeatureCollectionTableActionsProps {
  featureID: string;
  featureName: string;
  featureStatus: string;
  featureType: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  onDeleteFeature: (featureID: string) => void;
}

export function FeatureCollectionTableActions(props: FeatureCollectionTableActionsProps) {
  const { openFeatureItemDialog } = useFeatureItemDialog();
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(props.featureStatus.toUpperCase());

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openFeatureItemDialog({
              ...props,
              activeTab: 'apply'
            });
          }}
        >
          Apply
        </Button>
      )}
      <FeatureItemDropdownMenu
        {...props}
        onDeleteFeature={() => props.onDeleteFeature(props.featureID)}
      />
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { forwardRef } from "react";
import { STATUS_MAP } from "@/components/FeatureCollection/FeatureCollection.constants";
import FeatureItemDropdownMenu from "./FeatureItemDropdownMenu";
import { useFeatureItemDialog } from "./FeatureItemDialogProvider";

interface FeatureItemCardProps {
  featureType: string;
  featureName: string;
  featureID: string;
  featureStatus: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  onDeleteFeature: (featureID: string) => void;
}

const FeatureItemCard = forwardRef<HTMLDivElement, FeatureItemCardProps>(({
  featureType,
  featureName,
  featureID,
  featureStatus,
  featureDescription,
  manifest,
  applyCommand,
  onDeleteFeature,
  ...props
}, ref) => {
  const { openFeatureItemDialog } = useFeatureItemDialog();
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(featureStatus.toUpperCase());

  const handleFeatureItemOpenDialog = (tab = 'details') => {
    openFeatureItemDialog({
      featureID,
      featureName,
      featureStatus,
      featureType,
      featureDescription,
      manifest,
      applyCommand,
      activeTab: tab
    });
  };

  return (
    <Card
      ref={ref}
      className="group flex flex-col relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all cursor-pointer"
      onClick={() => handleFeatureItemOpenDialog()}
      asChild
      {...props}
    >
      <div>
        <CardHeader className="text-left">
          <CardTitle className="flex">
            <div className="grow">{featureName}</div>
            <FeatureItemDropdownMenu
              className="absolute top-4 right-4"
              featureType={featureType}
              featureName={featureName}
              featureID={featureID}
              featureStatus={featureStatus}
              featureDescription={featureDescription}
              manifest={manifest}
              applyCommand={applyCommand}
              onDeleteFeature={() => onDeleteFeature(featureID)}
            />
          </CardTitle>
          <div className="text-sm text-muted-foreground">{featureID}</div>
        </CardHeader>
        <CardFooter className='mt-auto gap-2'>
          <span className='flex gap-2 items-center'>
            {STATUS_MAP[featureStatus].icon}
            {STATUS_MAP[featureStatus].text}
          </span>
          {isPending && (
            <Button
              size="default"
              variant="secondary"
              className="ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleFeatureItemOpenDialog('apply');
              }}
            >
              Apply
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
});

FeatureItemCard.displayName = 'FeatureItemCard';

export default FeatureItemCard;
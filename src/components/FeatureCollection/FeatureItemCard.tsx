import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureItemDropdownMenu from "./FeatureItemDropdownMenu";
import FeatureItemOpenAction from "./FeatureItemOpenAction";
import { forwardRef, useState } from "react";
import { STATUS_MAP } from "@/components/FeatureCollection/FeatureCollection.constants";

interface FeatureItemCardProps {
  featureType: string;
  featureName: string;
  featureID: string;
  featureStatus: string;
  featureDescription: string;
  manifest: string;
  applyCommand: string;
  setFeatureID: (value: string) => void;
  onDeleteFeature: (featureID: string) => void;
  defaultOpen?: boolean;
  defaultActiveTab?: string;
}

const FeatureItemCard = forwardRef<HTMLDivElement, FeatureItemCardProps>(({
  featureType,
  featureName,
  featureID,
  featureStatus,
  featureDescription,
  manifest,
  applyCommand,
  setFeatureID,
  onDeleteFeature,
  defaultOpen = false,
  defaultActiveTab = 'details',
  ...props
}, ref) => {
  const [mainDialogOpen, setMainDialogOpen] = useState(defaultOpen);
  const [mainActiveTab, setMainActiveTab] = useState(defaultActiveTab);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyActiveTab, setApplyActiveTab] = useState('apply');

  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(featureStatus.toUpperCase());

  return (
    <FeatureItemOpenAction
      featureID={featureID}
      featureName={featureName}
      featureStatus={featureStatus}
      featureType={featureType}
      featureDescription={featureDescription}
      manifest={manifest}
      applyCommand={applyCommand}
      setFeatureID={setFeatureID}
      onDeleteFeature={onDeleteFeature}
      isOpen={mainDialogOpen}
      onOpenChange={setMainDialogOpen}
      activeTab={mainActiveTab}
      onActiveTabChange={setMainActiveTab}
    >
      <Card
        ref={ref}
        className="group flex flex-col relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all cursor-pointer"
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
                setFeatureID={setFeatureID}
                onDeleteFeature={() => onDeleteFeature(featureID)}
              />
            </CardTitle>
            <div className="text-sm text-slate-500">{featureID}</div>
          </CardHeader>
          <CardFooter className='mt-auto gap-2'>
            <span className='flex gap-2 items-center'>
              {STATUS_MAP[featureStatus].icon}
              {STATUS_MAP[featureStatus].text}
            </span>
            {isPending && (
              <FeatureItemOpenAction
                featureID={featureID}
                featureName={featureName}
                featureStatus={featureStatus}
                featureType={featureType}
                featureDescription={featureDescription}
                manifest={manifest}
                applyCommand={applyCommand}
                setFeatureID={setFeatureID}
                onDeleteFeature={onDeleteFeature}
                isOpen={applyDialogOpen}
                onOpenChange={setApplyDialogOpen}
                activeTab={applyActiveTab}
                onActiveTabChange={setApplyActiveTab}
              >
                <Button
                  size="default"
                  className="ml-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  Apply
                </Button>
              </FeatureItemOpenAction>
            )}
          </CardFooter>
        </div>
      </Card>
    </FeatureItemOpenAction>
  );
});

FeatureItemCard.displayName = 'FeatureItemCard';

export default FeatureItemCard;
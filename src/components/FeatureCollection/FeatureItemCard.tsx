import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureItemDropdownMenu from "./FeatureItemDropdownMenu";
import { forwardRef } from "react";

interface FeatureItemCardProps {
  featureType: string;
  featureName: string;
  featureID: string;
  status: {
    text: string;
    icon: React.ReactNode;
  };
  isPending: boolean;
  onPreviewYaml: () => void;
  onDelete: () => void;
  onApply: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const FeatureItemCard = forwardRef<HTMLDivElement, FeatureItemCardProps>(({
  featureType,
  featureName,
  featureID,
  status,
  isPending,
  onPreviewYaml,
  onDelete,
  onApply,
  ...props
}, ref) => {
  return (
    <Card
      ref={ref}
      className="group flex flex-col relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all"
      asChild
      {...props}
    >
      <div>
        <CardHeader className="text-left">
          <CardTitle className="flex">
            <div className="grow">{featureName}</div>
            <FeatureItemDropdownMenu
              featureType={featureType}
              featureName={featureName}
              featureID={featureID}
              onPreviewYaml={onPreviewYaml}
              onDelete={onDelete}
            />
          </CardTitle>
          <div className="text-sm text-slate-500">{featureID}</div>
        </CardHeader>
        <CardFooter className='mt-auto gap-2'>
          <span className='flex gap-2 items-center'>
            {status.icon}
            {status.text}
          </span>
          {isPending &&
            <Button
              size="default"
              className="ml-auto"
              onClick={onApply}
            >
              Apply
            </Button>
          }
        </CardFooter>
      </div>
    </Card>
  );
});

FeatureItemCard.displayName = 'FeatureItemCard';

export default FeatureItemCard;
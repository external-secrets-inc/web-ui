import { trackAddNewFeatureClicked, trackFeatureCreated } from "@/analytics";
import { FeatureNewItemProps } from "@/components/FeatureCollection/FeatureCollection.interfaces";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { NewFeatureForm } from "./NewFeatureForm";

const FeatureNewItem = ({
  colSpan,
  featureType,
  performCreate,
  variant = 'card'
}: FeatureNewItemProps) => {
  const [showForm, setShowForm] = useState(false)

  const handleAddNewFeatureClick = () => {
    trackAddNewFeatureClicked(featureType);
    setShowForm(true)
  }

  if (variant === 'row') {
    return showForm ? (
      <TableRow>
        <TableCell colSpan={colSpan}>
          <NewFeatureForm
            featureType={featureType}
            performCreate={performCreate}
            onCancel={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false)
              trackFeatureCreated(featureType)
            }}
          />
        </TableCell>
      </TableRow>
    ) : (
      <TableRow
        onClick={handleAddNewFeatureClick}
        className="cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <TableCell colSpan={colSpan}>
          <div className="flex items-center">
            <PlusIcon className="inline-block mr-2" />
            New {featureType}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Card
      className={
        showForm
          ? "border-solid"
          : "p-4 border-2 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:bg-muted/15 border-dashed shadow-none light transition-all"
      }
      onClick={!showForm ? handleAddNewFeatureClick : undefined}
    >
      {showForm ? (
        <NewFeatureForm
          featureType={featureType}
          performCreate={performCreate}
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            trackFeatureCreated(featureType)
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlusIcon className="inline-block mr-2" />
          New {featureType}
        </div>
      )}
    </Card>
  );
}

export default FeatureNewItem;
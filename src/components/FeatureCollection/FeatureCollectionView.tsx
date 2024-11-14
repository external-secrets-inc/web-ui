import { useCallback } from 'react';
import { DataGrid, DataTable } from "@/components/ui/DataProvider";
import FeatureItemCard from "@/components/FeatureCollection/FeatureItemCard";
import FeatureNewItem from "@/components/FeatureCollection/FeatureNewItem";
import { TransformedFeatureData } from "./FeatureCollection.interfaces";
import { useFeatureItemDialog } from "./FeatureItemDialogProvider";
import { cn } from "@/lib/utils"

type FeatureCollectionViewProps = {
  view: "grid" | "table";
  colSpan?: number;
  featureType: string;
  featureDescription: string;
  manifestData: string;
  applyCommand: string;
  onDeleteFeature: (featureID: string) => void;
  performCreate: ({featureName} : {featureName: string}) => void;
}

function FeatureCollectionView({
  view,
  colSpan,
  featureType,
  featureDescription,
  manifestData,
  applyCommand,
  onDeleteFeature,
  performCreate,
  className
}: FeatureCollectionViewProps & { className?: string }) {
  const { openFeatureItemDialog } = useFeatureItemDialog();

  const handleRowClick = useCallback((row: TransformedFeatureData) => {
    openFeatureItemDialog({
      featureID: row.id,
      featureName: row.name,
      featureStatus: row.status,
      featureType,
      featureDescription,
      manifest: manifestData,
      applyCommand,
      activeTab: 'details'
    });
  }, [openFeatureItemDialog, featureType, featureDescription, manifestData, applyCommand]);

  return view === "grid" ? (
    <DataGrid
      className={cn(className)}
      renderItem={(item: TransformedFeatureData) => (
        <FeatureItemCard
          key={item.id}
          featureID={item.id}
          featureName={item.name}
          featureStatus={item.status}
          featureType={featureType}
          featureDescription={featureDescription}
          manifest={manifestData}
          applyCommand={applyCommand}
          onDeleteFeature={onDeleteFeature}
        />
      )}
    >
      <FeatureNewItem
        featureType={featureType}
        performCreate={performCreate}
        variant="card"
      />
    </DataGrid>
  ) : (
    <DataTable
      className={cn(className)}
      onRowClick={handleRowClick}
      rowsAppend={
        <FeatureNewItem
          colSpan={colSpan}
          featureType={featureType}
          performCreate={performCreate}
          variant="row"
        />
      }
    />
  );
}

export default FeatureCollectionView;
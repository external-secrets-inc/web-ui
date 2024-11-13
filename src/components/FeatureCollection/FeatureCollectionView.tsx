import { useCallback } from 'react';
import { DataGrid, DataTable } from "@/components/ui/DataProvider";
import FeatureItemCard from "@/components/FeatureCollection/FeatureItemCard";
import FeatureNewItem from "@/components/FeatureCollection/FeatureNewItem";
import { TransformedFeatureData } from "./FeatureCollection.interfaces";
import type { NewFeatureFormProps } from "./FeatureCollection.interfaces";
import { useFeatureItemDialog } from "./FeatureItemDialogProvider";

type FeatureCollectionViewProps<T extends NewFeatureFormProps> = {
  view: "grid" | "table";
  colSpan?: number;
  featureType: string;
  featureDescription: string;
  manifestData: string;
  applyCommand: string;
  onDeleteFeature: (featureID: string) => void;
  performCreate: ({featureName} : {featureName: string}) => void;
  Form: React.ComponentType<T>;
  formProps?: Partial<T>;
}

function FeatureCollectionView<T extends NewFeatureFormProps>({
  view,
  colSpan,
  featureType,
  featureDescription,
  manifestData,
  applyCommand,
  onDeleteFeature,
  performCreate,
  Form,
  formProps,
}: FeatureCollectionViewProps<T>) {
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
        Form={Form}
        formProps={formProps}
      />
    </DataGrid>
  ) : (
    <DataTable
      onRowClick={handleRowClick}
      rowsAppend={
        <FeatureNewItem
          colSpan={colSpan}
          featureType={featureType}
          performCreate={performCreate}
          Form={Form}
          formProps={formProps}
          variant="row"
        />
      }
    />
  );
}

export default FeatureCollectionView;
import { useState } from 'react';
import DataGrid from "@/components/ui/DataGrid";
import { type ColumnDef, SortingState } from "@tanstack/react-table";
import FeatureItem from "@/components/FeatureCollection/FeatureItem";
import FeatureNewItem from "@/components/FeatureCollection/FeatureNewItem";
import { TransformedFeatureData, FeatureData } from "./FeatureCollection.interfaces";
import type { NewFeatureFormProps } from "./FeatureCollection.interfaces";

type FeatureCellValue = string | number;

const columns: ColumnDef<TransformedFeatureData, FeatureCellValue>[] = [
  {
    id: 'index',
    header: 'Created date',
    accessorFn: row => row.index,
    enableSorting: true,
  },
  {
    id: 'name',
    header: 'Name',
    accessorFn: row => row.name,
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: row => row.status,
  },
  {
    id: 'id',
    header: 'ID',
    accessorFn: row => row.id,
  }
];

interface FeatureCollectionProps<T extends NewFeatureFormProps> {
  data: FeatureData[];
  featureType: string;
  featureDescription: string;
  onDeleteFeature: (featureID: string) => void;
  setFeatureID: (value: string) => void;
  applyCommand?: string;
  manifestData?: string;
  performCreate: ({featureName} : {featureName: string}) => void;
  Form: React.ComponentType<T>;
  formProps?: Partial<T>;
}

function FeatureCollection<T extends NewFeatureFormProps>({
  data,
  featureType,
  featureDescription,
  onDeleteFeature,
  setFeatureID,
  applyCommand = '',
  manifestData = '',
  performCreate,
  Form,
  formProps,
}: FeatureCollectionProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([{
    id: 'index',
    desc: false
  }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const transformedFeatureData: TransformedFeatureData[] = data.map((item, index) => ({
    id: item.id,
    name: item.name,
    status: item.current_status,
    index: index
  }));

  return (
    <DataGrid
      columns={columns}
      data={transformedFeatureData}
      sorting={sorting}
      onSortingChange={setSorting}
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      newItem={
        <FeatureNewItem
          featureType={featureType}
          performCreate={performCreate}
          Form={Form}
          formProps={formProps}
        />
      }
      renderItem={(item: TransformedFeatureData, key: string) => (
        <FeatureItem
          key={key}
          featureID={item.id}
          featureName={item.name}
          featureStatus={item.status}
          featureType={featureType}
          featureDescription={featureDescription}
          manifest={manifestData}
          applyCommand={applyCommand}
          setFeatureID={setFeatureID}
          onDeleteFeature={onDeleteFeature}
        />
      )}
    />
  );
}

export default FeatureCollection;
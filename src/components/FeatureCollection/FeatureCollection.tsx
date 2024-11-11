import { useState } from 'react';
import { DataProvider, DataGrid, DataTable, DataSearch, DataSort } from "@/components/ui/DataProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Table } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
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
  const [sorting] = useState([{ id: 'index', desc: false }]);
  const [view, setView] = useState<"grid" | "table">("grid");

  const transformedFeatureData: TransformedFeatureData[] = data.map((item, index) => ({
    id: item.id,
    name: item.name,
    status: item.current_status,
    index: index
  }));

  return (
    <DataProvider
      data={transformedFeatureData}
      columns={columns}
      initialSort={{ id: 'index', desc: false }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-x-4 gap-y-2 flex-wrap">
          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "grid" | "table")}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <Table className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center gap-x-4">
            <DataSearch />
            <DataSort />
          </div>
        </div>

        {view === "grid" ? (
          <DataGrid
            renderItem={(item: TransformedFeatureData) => (
              <FeatureItem
                key={item.id}
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
          >
            <FeatureNewItem
              featureType={featureType}
              performCreate={performCreate}
              Form={Form}
              formProps={formProps}
            />
          </DataGrid>
        ) : (
          <DataTable />
        )}
      </div>
    </DataProvider>
  );
}

export default FeatureCollection;
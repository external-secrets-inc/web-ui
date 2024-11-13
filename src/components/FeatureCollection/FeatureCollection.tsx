import { useState, useMemo } from 'react';
import { DataProvider, DataSearch, DataSort } from "@/components/ui/DataProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, Table } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import FeatureItemDropdownMenu from "./FeatureItemDropdownMenu";
import { TransformedFeatureData, FeatureData, FeatureCollectionProps } from "./FeatureCollection.interfaces";
import { STATUS_MAP } from "./FeatureCollection.constants";
import { FeatureItemDialogProvider } from "./FeatureItemDialogProvider";
import FeatureCollectionView from "./FeatureCollectionView";

function FeatureCollection({
  data,
  featureType,
  featureDescription,
  onDeleteFeature,
  setFeatureID,
  applyCommand = '',
  manifestData = '',
  performCreate,
}: FeatureCollectionProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const columnHelper = useMemo(() => createColumnHelper<TransformedFeatureData>(), []);

  const columns = useMemo(() => [
    columnHelper.accessor('index', {
      header: 'Index',
      enableSorting: true,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: props => {
        const status = props.getValue();
        const statusInfo = STATUS_MAP[status];
        return (
          <span className="flex items-center gap-2">
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        );
      }
    }),
    columnHelper.accessor('id', {
      header: 'ID',
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          <FeatureItemDropdownMenu
            featureType={featureType}
            featureName={props.row.original.name}
            featureID={props.row.original.id}
            featureStatus={props.row.original.status}
            featureDescription={featureDescription}
            manifest={manifestData}
            applyCommand={applyCommand}
            onDeleteFeature={() => onDeleteFeature(props.row.original.id)}
          />
        </div>
      )
    })
  ], [columnHelper, featureType, featureDescription, manifestData, applyCommand, onDeleteFeature]);

  const transformedFeatureData = useMemo(() => data.map((item: FeatureData, index: number) => ({
    id: item.id,
    name: item.name,
    status: item.current_status,
    index: index + 1
  })), [data]);

  return (
    <FeatureItemDialogProvider
      onDeleteFeature={onDeleteFeature}
      setFeatureID={setFeatureID}
      manifest={manifestData}
      applyCommand={applyCommand}
    >
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

          <FeatureCollectionView
            view={view}
            colSpan={columns.length}
            featureType={featureType}
            featureDescription={featureDescription}
            manifestData={manifestData}
            applyCommand={applyCommand}
            onDeleteFeature={onDeleteFeature}
            performCreate={performCreate}
          />
        </div>
      </DataProvider>
    </FeatureItemDialogProvider>
  );
}

export default FeatureCollection;
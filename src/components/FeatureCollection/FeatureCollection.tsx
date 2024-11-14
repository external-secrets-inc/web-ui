import { useState, useMemo } from 'react';
import { DataProvider, DataSearch, DataSort } from "@/components/ui/DataProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LucideLayoutGrid, LucideTableProperties } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { TransformedFeatureData, FeatureData, FeatureCollectionProps } from "./FeatureCollection.interfaces";
import { STATUS_MAP } from "./FeatureCollection.constants";
import { FeatureItemDialogProvider } from "./FeatureItemDialogProvider";
import { FeatureCollectionTableActions } from "./FeatureCollectionTableActions";
import FeatureCollectionView from "./FeatureCollectionView";

interface FeatureTableMeta {
  renderRowActions?: (row: TransformedFeatureData) => React.ReactNode;
}

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
    columnHelper.accessor('id', {
      header: 'ID',
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
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className='flex justify-end'>
          {(props.table.options.meta as FeatureTableMeta)?.renderRowActions?.(props.row.original)}
        </div>
      )
    })
  ], [columnHelper]);

  const transformedFeatureData = useMemo(() => data.map((item: FeatureData, index: number) => ({
    id: item.id,
    name: item.name,
    status: item.current_status,
    index: index + 1
  })), [data]);

  const featureTableMeta: FeatureTableMeta = {
    renderRowActions: (row) => (
      <FeatureCollectionTableActions
        featureID={row.id}
        featureName={row.name}
        featureStatus={row.status}
        featureType={featureType}
        featureDescription={featureDescription}
        manifest={manifestData}
        applyCommand={applyCommand}
        onDeleteFeature={onDeleteFeature}
      />
    )
  };

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
            <ToggleGroup
              variant='outline'
              type="single"
              value={view}
              onValueChange={(value) => value && setView(value as "grid" | "table")}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LucideLayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <LucideTableProperties className="h-4 w-4" />
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
            featureTableMeta={featureTableMeta}
          />
        </div>
      </DataProvider>
    </FeatureItemDialogProvider>
  );
}

export default FeatureCollection;
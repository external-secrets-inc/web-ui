import { createColumnHelper } from '@tanstack/react-table';

export interface FilterState {
  provider: string[]; // GCP, Amazon, Azure
  policy?: string | undefined;
  secretName?: string | undefined;
  policyStatus?: string | undefined; // compliant or non-compliant
  duplicates?: string | undefined; // contains or not
  lastAccess?: string | undefined; // ascending, descending, or date
  lastRotation?: string | undefined; // ascending, descending, or date
  accessors?: string | undefined; // contains or not
}

export interface AuditTableData {
  secret: string;
  lastRotation: string;
  policies: string;
  duplicates: number;
  lastAccess: string;
  accessors: number;
};

// Create column helper
const columnHelper = createColumnHelper<AuditTableData>();

// Define columns
export const columns = [
  columnHelper.accessor('secret', {
    header: 'Secret',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('lastRotation', {
    header: 'Last Rotation',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format date
  }),
  columnHelper.accessor('policies', {
    header: 'Policies',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('duplicates', {
    header: 'Duplicates',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('lastAccess', {
    header: 'Last Access',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(), // Format date
  }),
  columnHelper.accessor('accessors', {
    header: 'Accessors',
    cell: (info) => info.getValue(),
  }),
];

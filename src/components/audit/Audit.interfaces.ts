import { createColumnHelper } from '@tanstack/react-table';

export interface FilterState {
  provider: string[]; // GCP, Amazon, Azure
  policy: string[];
  secretName: string[];
  policyStatus: boolean | null; // compliant or non-compliant
  duplicates: boolean | null; // contains or not
  lastAccess: string | null; // ascending, descending, or date
  lastRotation: string | null; // ascending, descending, or date
  accessors: boolean | null; // contains or not
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

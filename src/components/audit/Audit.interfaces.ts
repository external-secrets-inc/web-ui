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

// export interface TableData {
//   secret: string;
//   lastRotation: string;
//   policies: string;
//   duplicates: number;
//   lastAccess: string;
//   accessors: string;
// };

// export const columns: ColumnDef<TableData>[] = [
//   {
//     accessorKey: 'secret',
//     header: 'Secret',
//   },
//   {
//     accessorKey: 'lastRotation',
//     header: 'Last Rotation',
//   },
//   {
//     accessorKey: 'policies',
//     header: 'Policies',
//   },
//   {
//     accessorKey: 'duplicates',
//     header: 'Duplicates',
//   },
//   {
//     accessorKey: 'lastAccess',
//     header: 'Last Access',
//   },
//   {
//     accessorKey: 'accessors',
//     header: 'Accessors',
//   },
// ];

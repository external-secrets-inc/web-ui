# UI Components

All generic, reusable UI components live in this `components/ui/` folder, regardless of their source. Treat this folder as our proto Design System.

## Installed Components
- From shadcn: `npx shadcn@latest add`
- Use kebab-case: `button.tsx`, `dropdown-menu.tsx` (automatically named like so when installed from shadcn CLI)

## Custom UI Components
- Our own implementation of reusable UI components
- Also live in `components/ui/`
- Use PascalCase: `DataGrid.tsx`, `DataTable.tsx`

## Multi-File Components
When a component requires more than one file (e.g., separate interfaces file, utilities, constants):
- Create a folder using PascalCase: `ComponentName/`
- Place all related files inside: `ComponentName.tsx`, `ComponentName.interfaces.ts`, etc.
- Export via barrel file: `index.ts`

Example:
```
components/
└── ui/
    ├── button.tsx              # shadcn (single file)
    ├── dialog.tsx              # shadcn (single file)
    ├── DataGrid.tsx            # custom (single file)
    └── CodeViewerSheet/        # custom (multi-file)
        ├── CodeViewerSheet.tsx
        ├── CodeViewerSheet.interfaces.ts
        └── index.ts            # exports component and types
```

Import stays clean:
```tsx
import { CodeViewerSheet } from "@/components/ui/CodeViewerSheet";
```

## Rules
- Zero business logic
- Pure presentational components
- Highly reusable
- Style with Tailwind
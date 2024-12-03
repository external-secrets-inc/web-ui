# UI Components

All generic, reusable UI components live in this `components/ui/` folder, regardless of their source. Treat this folder as our proto Design System.

## Installed Components
- From shadcn: `npx shadcn@latest add`
- Use kebab-case: `button.tsx`, `dropdown-menu.tsx` (automatically named like so when installed from shadcn CLI)

## Custom UI Components
- Our own implementation of reusable UI components
- Also live in `components/ui/`
- Use PascalCase: `DataGrid.tsx`, `DataTable.tsx`

## Structure
```
components/
└── ui/
    ├── button.tsx        # shadcn
    ├── dialog.tsx        # shadcn
    ├── DataGrid.tsx      # custom
    └── DataTable.tsx     # custom
```

## Rules
- Zero business logic
- Pure presentational components
- Highly reusable
- Style with Tailwind
# Loading State Hooks

This directory contains hooks that help manage loading states in the application, particularly for React Query operations.

## Overview

The loading hooks in this directory provide a way to automatically handle loading states when fetching data or performing mutations. They integrate with the `LoadingContext` to show either full-page or dialog-specific loading indicators.

## Available Hooks

### `useLoadingQuery`

This hook wraps React Query's `useQuery` hook and automatically manages loading states.

```tsx
const { data, isError } = useLoadingQuery(
  {
    queryKey: ['my-data'],
    queryFn: fetchMyData,
    // other React Query options
  },
  'page' // Can be 'page', 'dialog', or 'none'
);
```

### `useLoadingMutation`

This hook wraps React Query's `useMutation` hook and automatically manages loading states.

```tsx
const { mutate } = useLoadingMutation(
  {
    mutationFn: updateMyData,
    onSuccess: () => {
      toast.success('Data updated successfully');
    },
    // other React Query options
  },
  'dialog' // Can be 'page', 'dialog', or 'none'
);
```

## Loading Types

- `page`: Shows a full-page loading overlay, covering the entire page content except for the top bar and heading.
- `dialog`: Shows a loading overlay within dialog content, useful for form submissions.
- `none`: Does not show any loading indicator, but still performs the query or mutation.

## Benefits

- Improves user experience by providing immediate feedback during data fetching and mutations
- Reduces perceived waiting time by showing loading states
- Allows for more responsive UI by providing clear visual feedback when operations are in progress
- Prevents accidental double-submissions in forms
- Centralizes loading state management across the application

## How It Works

1. The `LoadingProvider` wraps your application and provides loading state context
2. The loading hooks update this context based on the loading state of queries and mutations
3. The `PageLoading` and `DialogLoading` components read from this context and display appropriate loading indicators
4. The loading hooks automatically clean up their loading states when components unmount

## Migration Guide

To migrate existing React Query usage to use these loading hooks:

1. Replace `useQuery` with `useLoadingQuery`
2. Replace `useMutation` with `useLoadingMutation`
3. Remove any manual loading state management related to these operations

Example:

```tsx
// Before
const [isLoading, setIsLoading] = useState(false);
const { data } = useQuery({
  queryKey: ['my-data'],
  queryFn: fetchMyData,
  onSettled: () => setIsLoading(false),
});

// After
const { data } = useLoadingQuery({
  queryKey: ['my-data'],
  queryFn: fetchMyData,
}, 'page');
```

For more complex use cases, refer to the example implementations in `src/services/audit/queries/useGetPoliciesWithLoading.ts` and `src/services/audit/mutations/useCreatePolicyWithLoading.ts`.

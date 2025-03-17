import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

/**
 * Custom hook that wraps React Query's useMutation and automatically manages
 * loading state based on mutation status.
 */
export function useLoadingMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog'
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { setPageLoading, setDialogLoading } = useLoading();

  const result = useMutation<TData, TError, TVariables, TContext>(options);

  useEffect(() => {
    const isLoading = result.isPending;

    if (loadingType === 'page') {
      setPageLoading(isLoading);
    } else if (loadingType === 'dialog') {
      setDialogLoading(isLoading);
    }

    // Clean up loading state when component unmounts
    return () => {
      if (loadingType === 'page') {
        setPageLoading(false);
      } else if (loadingType === 'dialog') {
        setDialogLoading(false);
      }
    };
  }, [result.isPending, loadingType, setPageLoading, setDialogLoading]);

  return result;
}

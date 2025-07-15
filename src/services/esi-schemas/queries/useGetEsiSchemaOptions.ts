import { useQuery } from '@tanstack/react-query';
import { OptionUtils, processApiResponses } from '@/components/EsiSchemaForm/EsiSchemaForm.utils';
import type { UISchemaField, SelectOption, OneOfApiOption, AnyOfApiOption } from '@/components/EsiSchemaForm/EsiSchemaForm.interfaces';
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';

async function getEsiSchemaOptions(apiOptions: (OneOfApiOption | AnyOfApiOption)[]) {
  const headers = await getAuthHeaders();
  const requests = apiOptions.map(option => axiosInstance.get(option.href, {
    headers,
    backend: 'ESO_SERVER',
  }));
  const responses = await Promise.all(requests);
  return responses;
}

export function useGetEsiSchemaOptions(
  field: UISchemaField,
  { enabled: isEnabled = true } = {}
) {
  const apiOptions =
    // one-off (select)
    field.type === 'one-of' || field.type === 'select'
      ? OptionUtils.getOneOfApiOptions(field)
      // any-of (multi-select)
      : OptionUtils.getAnyOfApiOptions(field);

  const queryKey = ['selectOptions', ...apiOptions.map(o => o.href)];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => getEsiSchemaOptions(apiOptions),
    enabled: apiOptions.length > 0 && isEnabled,
  });

  const options: SelectOption[] = data ? processApiResponses(apiOptions, data) : [];

  return {
    options,
    isLoading,
    isError,
    error,
  };
}
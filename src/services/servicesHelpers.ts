import { toast } from 'sonner';
import { AxiosError, isAxiosError } from 'axios';
import { ApiHttpError, ApiWrapperOptions } from '@/types';

function parseErrorResponse(data: string): string {
  try {
    const parsedError = JSON.parse(data);
    if (parsedError.errors && parsedError.errors.body) {
      return parsedError.errors.body.replace(/^ERROR:\s*/, '');
    }
  } catch {
    // If parsing fails, return the original data
  }
  return data;
}
export async function apiWrapper<T>(
  apiCall: () => Promise<T>,
  options: ApiWrapperOptions
): Promise<T> {
  const { defaultError, suppressToast = false } = options;
  try {
    return await apiCall();
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    let responseError = null;

    if (isAxiosError(error) && typeof error?.request?.response === 'string') {
      responseError = parseErrorResponse(error.request.response);
    } else if (error.message) {
      responseError = error.message;
    }

    if (!suppressToast) {
      toast.error(`${defaultError}`, { description: responseError });
    }

    throw error; // Re-throw the error to allow further handling in the component
  }
}

export function handleDefaultApiHttpError(error: AxiosError<ApiHttpError>, defaultMessage: string = "An error occurred") {
  let fastApiError = undefined
  if(error.request.response) {
    const response = JSON.parse(error.request.response)
    if(Array.isArray(response.detail)) {
      fastApiError = response.detail.map((d: {type:string, msg: string, loc:string[]}) => d.msg + ": " + d.loc[1]).join("; ")
    } else {
      fastApiError = response.detail
    }
  }

  return toast.error(fastApiError || error.response?.data?.errors?.body || defaultMessage)
}

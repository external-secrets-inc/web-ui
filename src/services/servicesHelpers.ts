import { toast } from 'sonner';
import { isAxiosError } from 'axios';

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

export async function apiWrapper<T>(apiCall: () => Promise<T>, defaultError: string, show: boolean): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    let responseError = null;

    if (isAxiosError(error) && typeof error?.request?.response === 'string') {
      responseError = parseErrorResponse(error.request.response);
    } else if (error.message) {
      responseError = error.message;
    }
    if(show){
      toast.error(`${defaultError}`, { description: responseError });
    }
    throw error; // Re-throw the error to allow further handling in the component
  }
}
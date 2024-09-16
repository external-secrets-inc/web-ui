import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtDecode } from 'jwt-decode';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getTenantIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token); // Use jwt_decode here
    return decoded?.TenantId || null;
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
}
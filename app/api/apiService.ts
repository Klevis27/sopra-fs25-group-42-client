import { getCookie } from "@/utils/cookies";
import {getApiDomain} from "@/utils/domain";
import {ApplicationError} from "@/types/error";

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  private async processResponse<T>(res: Response, errorMessage: string): Promise<T> {
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorInfo = await res.json();
        if (errorInfo?.message) {
          errorDetail = errorInfo.message;
        } else {
          errorDetail = JSON.stringify(errorInfo);
        }
      } catch {
        // If parsing fails, keep using res.statusText
      }
      const detailedMessage = `${errorMessage} (${res.status}: ${errorDetail})`;
      const error: ApplicationError = new Error(detailedMessage) as ApplicationError;
      error.info = JSON.stringify(
          { status: res.status, statusText: res.statusText },
          null,
          2,
      );
      error.status = res.status;
      throw error;
    }
    return res.headers.get("Content-Type")?.includes("application/json")
        ? await res.json() as Promise<T>
        : Promise.resolve(res as T);
  }

  private getAuthHeaders(token?: string) {
    const accessToken = token || getCookie("accessToken");  // Default to cookie if token not passed
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  public async get<T>(endpoint: string, token?: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });
    return this.processResponse<T>(res, "An error occurred while fetching the data.\n");
  }

  public async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(res, "An error occurred while posting the data.\n");
  }

  public async put<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(res, "An error occurred while updating the data.\n");
  }

  public async delete<T>(endpoint: string, token?: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    });
    return this.processResponse<T>(res, "An error occurred while deleting the data.\n");
  }
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, ...init } = options;

    // Build URL with query params
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Set headers
    const headers = new Headers(init.headers ?? {});

    // Only set Content-Type if body is present and not FormData
    if (
      init.body !== undefined &&
      !headers.has("Content-Type") &&
      !(init.body instanceof FormData)
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(url.toString(), {
      ...init,
      headers,
      credentials: "include", // Send cookies (Better-Auth session)
    });

    if (!response.ok) {
      // Try to parse error message
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message || errorData.error || response.statusText;
      } catch (e) {
        // Ignore JSON parse error, stick with status text
      }

      // Attach status and endpoint to error for debugging
      const error = new Error(String(errorMessage));
      Object.assign(error, {
        status: response.status,
        endpoint,
        statusText: response.statusText,
      });
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const result = await response.json();

    // If result is in standard ApiResponse format, return the inner data
    if (
      result &&
      typeof result === "object" &&
      result.success === true &&
      "data" in result
    ) {
      return result.data as T;
    }

    return result as T;
  }

  get<T>(
    endpoint: string,
    params?: RequestOptions["params"],
    options?: Omit<RequestOptions, "params">,
  ) {
    return this.request<T>(endpoint, { ...options, method: "GET", params });
  }

  post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, "body">) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, "body">,
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(
    endpoint: string,
    params?: RequestOptions["params"],
    options?: Omit<RequestOptions, "params">,
  ) {
    return this.request<T>(endpoint, { ...options, method: "DELETE", params });
  }
}

export const api = new ApiClient(API_URL);

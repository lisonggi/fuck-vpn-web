import { enqueueSnackbar } from "notistack";

export interface Result<T> {
    message: string
    body?: T
}

export class ApiError extends Error {
    code: number;
    result: Result<string>;

    constructor(code: number, result: Result<string>) {
        super(result.message);
        this.code = code;
        this.result = result;
    }
}

export interface ApiRequestOptions extends RequestInit {
    silent?: boolean
}

function createFetch(baseUrl: string) {
    return async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
        const { silent = false, ...fetchOptions } = options;
        const url = `${baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: fetchOptions.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(fetchOptions.headers || {})
                },
                body: fetchOptions.body
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({ message: response.statusText || '请求失败' })) as Result<string>;
                const error = new ApiError(response.status, {
                    message: result.message || response.statusText || '请求失败',
                    body: result.body
                });

                throw error;
            }

            return await response.json();
        } catch (e) {
            let error: ApiError;
            if (e instanceof ApiError) {
                error = e;
            } else if (e instanceof TypeError) {
                error = new ApiError(500, { message: e.message || '网络异常，请检查连接。' });
            } else {
                const message = e instanceof Error ? e.message : '未知错误';
                error = new ApiError(500, { message });
            }

            if (!silent) {
                let displayMessage = error.result.message;
                if (error.result.body) {
                    displayMessage += `-${error.result.body}`;
                }
                enqueueSnackbar(displayMessage, { variant: "error" });
            }
            throw error;
        }
    }
};

export const AppApi = createFetch("/api")
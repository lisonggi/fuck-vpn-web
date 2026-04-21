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
function mapHttpStatusToCN(status: number): string {
    switch (status) {
        case 400:
            return '请求参数错误';
        case 401:
            return '未登录或登录已过期';
        case 403:
            return '没有权限访问';
        case 404:
            return '接口不存在';
        case 408:
            return '请求超时';
        case 429:
            return '请求过于频繁';
        case 500:
            return '服务器内部错误';
        case 502:
            return '网关错误';
        case 503:
            return '服务不可用';
        case 504:
            return '网关超时';
        default:
            return `请求失败 (${status})`;
    }
}

function mapFetchError(e: unknown): ApiError {
    if (e instanceof TypeError) {
        const msg = e.message.toLowerCase();

        if (msg.includes('failed to fetch') || msg.includes('Bad Gateway')) {
            return new ApiError(0, { message: '无法连接服务器' });
        }

        if (msg.includes('networkerror')) {
            return new ApiError(0, { message: '网络错误，请检查网络连接' });
        }

        if (msg.includes('abort')) {
            return new ApiError(0, { message: '请求已取消' });
        }

        return new ApiError(0, { message: '网络异常' });
    }

    if (e instanceof Error) {
        return new ApiError(0, { message: e.message });
    }

    return new ApiError(0, { message: '未知错误' });
}
function createFetch(baseUrl: string) {
    return async function request<T>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        const { silent = false, ...fetchOptions } = options;
        const url = `${baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: fetchOptions.method ?? 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(fetchOptions.headers ?? {})
                },
                body: fetchOptions.body
            });

            if (!response.ok) {
                let result: Result<string> | null = null;

                try {
                    result = await response.json();
                } catch {
                    // 非 JSON 响应
                }

                throw new ApiError(response.status, {
                    message:
                        result?.message ||
                        mapHttpStatusToCN(response.status),
                    body: result?.body
                });
            }

            return await response.json();
        } catch (e) {
            const error =
                e instanceof ApiError ? e : mapFetchError(e);

            if (!silent) {
                let msg = error.result.message;
                if (error.result.body) {
                    msg += ` - ${error.result.body}`;
                }
                enqueueSnackbar(msg, { variant: 'error' });
            }

            throw error;
        }
    };
}

export const AppApi = createFetch("/api")
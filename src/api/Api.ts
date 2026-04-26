
export interface Result<T> {
    message: string
    body: T
}

export class ApiError<T> extends Error {
    code: number;
    result: Result<T>;

    constructor(code: number, result: Result<T>) {
        super(result.message);
        this.code = code;
        this.result = result;
    }
}

export interface ApiRequestOptions extends RequestInit {
    silent?: boolean
}

function createFetch(baseUrl: string) {
    return async function request<T>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        const url = `${baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: options.method ?? 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers ?? {})
                },
                body: options.body
            });
            if (response.ok) {
                return await response.json();
            }
            throw new ApiError(response.status, await response.json());
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            } else if (e instanceof TypeError) {
                throw new ApiError(0, {
                    message: "网络错误",
                    body: null
                });
            }
            throw new ApiError(500, {
                message: "未知错误",
                body: null
            });
        }
    };
}

export const AppApi = createFetch("/api")
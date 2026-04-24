import { AppApi, type ApiRequestOptions, type Result } from "./Api"

export interface UserConfigResponse{
 username: string
}

export interface UserUpdateConfigRequest extends UserConfigResponse {
    password: string
}


export const AuthApi = () => {
    const login = async (user:UserUpdateConfigRequest, options?: ApiRequestOptions) => {
        return (await AppApi<Result<UserConfigResponse>>("/auth/login", { method: "POST", body: JSON.stringify(user), ...(options || {}) })).body as UserConfigResponse;
    }
    const logout = async (options?: ApiRequestOptions) => {
        return (await AppApi<Result<undefined>>("/auth/logout", { method: "DELETE", ...(options || {}) })).body;
    }
    const me = async (options?: ApiRequestOptions) => {
        return (await AppApi<Result<UserConfigResponse>>("/auth/me", { method: "GET", ...(options || {}) })).body as UserConfigResponse;
    }
    const updateConfig = async (user: UserUpdateConfigRequest, options?: ApiRequestOptions) => {
        return (await AppApi<Result<UserUpdateConfigRequest>>("/auth/updateConfig", { method: "PUT", body: JSON.stringify(user), ...(options || {}) })).body as UserUpdateConfigRequest;
    }
    return { login, logout, me, updateConfig }
}

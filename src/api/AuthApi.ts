import { AppApi, type ApiRequestOptions, type Result } from "./Api"

export interface UserName{
 username: string
}

export interface User extends UserName {
    password: string
}

export interface Token extends UserName{
    token: string
}
export const AuthApi = () => {
    const login = async (user:User, options?: ApiRequestOptions) => {
        return (await AppApi<Result<Token>>("/auth/login", { method: "POST", body: JSON.stringify(user), ...(options || {}) })).body as Token;
    }
    const logout = async (options?: ApiRequestOptions) => {
        return (await AppApi<Result<undefined>>("/auth/logout", { method: "DELETE", ...(options || {}) })).body;
    }
    const me = async (options?: ApiRequestOptions) => {
        return (await AppApi<Result<Token>>("/auth/me", { method: "GET", ...(options || {}) })).body as Token;
    }
    const updateConfig = async (user: User, options?: ApiRequestOptions) => {
        return (await AppApi<Result<User>>("/auth/updateConfig", { method: "PUT", body: JSON.stringify(user), ...(options || {}) })).body as User;
    }
    return { login, logout, me, updateConfig }
}

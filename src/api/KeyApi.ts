import { AppApi, type Result } from "./Api"


export interface KeyConfigResponse {
    configUpdating: boolean,
    checking: boolean,
    config: {
        autoFill: boolean,
        keySize: number
    }
}
export interface KeyUpdateConfigRequest {
    autoFill?: boolean,
    keySize?: number
}

export const KeyApi = (id: string) => {
    const getKeyConfig = async () => {
        const result = await AppApi<Result<KeyConfigResponse>>(`/${id}/getKeyConfig`)
        return result.body as KeyConfigResponse
    }
    const getKeys = async () => {
        const result = await AppApi<Result<string[]>>(`/${id}/getKeys`)
        return result.body as string[]
    }
    const refreshKeys = async () => {
        const result = await AppApi<Result<KeyConfigResponse>>(`/${id}/refreshKeys`, { method: "POST" })
        return result.body as KeyConfigResponse
    }
    const updateKeyConfig = async (config: KeyUpdateConfigRequest) => {
        const result = await AppApi<Result<KeyConfigResponse>>(`/${id}/updateKeyConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
        return result.body as KeyConfigResponse
    }
    return { getKeyConfig, getKeys, refreshKeys, updateKeyConfig }
}
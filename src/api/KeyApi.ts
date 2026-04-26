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
    const getConfig = async () => {
        const result = await AppApi<Result<KeyConfigResponse>>(`/${id}/getKeyConfig`)
        return result.body as KeyConfigResponse
    }
    const getAllItem = async () => {
        const result = await AppApi<Result<string[]>>(`/${id}/getKeys`)
        return result.body as string[]
    }
    const refresh = async () => {
        const result = await AppApi<Result<KeyConfigResponse>>(`/${id}/refreshKeys`, { method: "POST" })
        return result.body as KeyConfigResponse
    }
    const updateConfig = async (config: KeyUpdateConfigRequest) => {
        const result = await AppApi<Result<KeyConfigResponse>>(`/${id}/updateKeyConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
        return result.body as KeyConfigResponse
    }
    return { getConfig, getAllItem, refresh, updateConfig }
}
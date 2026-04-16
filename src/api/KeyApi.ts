import { AppApi, type Result } from "./Api"


export interface KeyState {
    configUpdating: boolean,
    checking: boolean,
    keyConfig: KeyConfig
}
export interface KeyConfig {
    autoFill: boolean,
    keySize: number
}

export const KeyApi = (id: string) => {
    const getKeyState = async () => {
        const result = await AppApi<Result<KeyState>>(`/${id}/getKeyState`)
        return result.body as KeyState
    }
    const getKeys = async () => {
        const result = await AppApi<Result<string[]>>(`/${id}/getKeys`)
        return result.body as string[]
    }
    const refreshKeys = async () => {
        await AppApi<Result<undefined>>(`/${id}/refreshKeys`, { method: "POST" })
    }
    const updateKeyConfig = async (config: KeyConfig) => {
         await AppApi<Result<KeyConfig>>(`/${id}/updateKeyConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
    }
    return { getKeyState, getKeys, refreshKeys, updateKeyConfig }
}
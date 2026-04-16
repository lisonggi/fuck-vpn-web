import { AppApi, type Result } from "./Api"

export interface UpdateStateConfig {
    enabled: boolean
}

export interface PluginStateConfig extends UpdateStateConfig {
    configUpdating: boolean
}

export interface PluginInfo extends UpdateStateConfig {
    keyService: boolean
    info: {
        id: string
        name: string
        version: string
        author: string | null;
        description: string | null
    }
}

export const PluginApi = () => {
    const getAllPlugin = async () => {
        const result: Result<PluginInfo[]> = await AppApi<Result<PluginInfo[]>>("/plugin/getallplugin")
        return result.body as PluginInfo[]
    }
    const updateStateConfig = async (id: string, config: UpdateStateConfig) => {
        return await AppApi<Result<PluginStateConfig>>(`/${id}/updateStateConfig`, {
            method: 'PUT',
            body: JSON.stringify(config)
        });
    };

    return { getAllPlugin, updateStateConfig }
}
import { AppApi, type Result } from "./Api"

export interface PluginUpdateConfigRequest {
    enabled: boolean
}

type ServiceType = "NODE" | "KEY"
export interface PluginInfo {
    id: string
    name: string
    version: string
    author?: string;
    description?: string
    serviceType: ServiceType
}
export interface PluginConfigResponse {
    enabled: boolean
    configUpdating: boolean
    pluginInfo: PluginInfo
}

export const PluginApi = () => {
    const getAllPluginConfig = async () => {
        const result: Result<PluginConfigResponse[]> = await AppApi<Result<PluginConfigResponse[]>>("/plugin")
        return result.body as PluginConfigResponse[]
    }
    const updatePluginConfig = async (id: string, config: PluginUpdateConfigRequest) => {
        const result: Result<PluginConfigResponse> = await AppApi<Result<PluginConfigResponse>>(`/plugin/${id}`, {
            method: 'PUT',
            body: JSON.stringify(config)
        })
        return result.body as PluginConfigResponse
    };

    return { getAllPluginConfig, updatePluginConfig }
}
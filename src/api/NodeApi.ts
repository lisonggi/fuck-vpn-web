import { AppApi, type Result } from "./Api"


export interface NodeConfigResponse {
    configUpdating: boolean,
    generating: boolean,
    nextTime?: number,
    config: {
        autoRefresh: boolean,
        delayMilliseconds: number
    }
}

export interface NodeUpdateConfigRequest {
    autoRefresh?: boolean,
    delayMilliseconds?: number
}

export const NodeApi = (id: string) => {
    const getNodeConfig = async () => {
        const result = await AppApi<Result<NodeConfigResponse>>(`/${id}/getNodeConfig`)
        return result.body as NodeConfigResponse
    }
    const getNodes = async () => {
        const result = await AppApi<Result<string[]>>(`/${id}/getNodes`)
        return result.body as string[]
    }
    const refreshNodes = async () => {
        const result = await AppApi<Result<NodeConfigResponse>>(`/${id}/refreshNodes`, { method: "POST" })
        return result.body as NodeConfigResponse
    }
    const updateNodeConfig = async (config: NodeUpdateConfigRequest) => {
        const result = await AppApi<Result<NodeConfigResponse>>(`/${id}/updateNodeConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
        return result.body as NodeConfigResponse
    }
    return { getNodeConfig, getNodes, refreshNodes, updateNodeConfig }
}
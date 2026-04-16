import { AppApi, type Result } from "./Api"


export interface NodeState {
    configUpdating: boolean,
    generating: boolean,
    nextTime?: number,
    nodeTaskConfig: NodeTaskConfig
}

export interface NodeTaskConfig {
    autoRefresh: boolean,
    delayMilliseconds: number
}

export const NodeApi = (id: string) => {
    const getNodeState = async () => {
        const result = await AppApi<Result<NodeState>>(`/${id}/getNodeState`)
        return result.body as NodeState
    }
    const getNodes = async () => {
        const result = await AppApi<Result<string[]>>(`/${id}/getNodes`)
        return result.body as string[]
    }
    const refreshNodes = async () => {
        await AppApi<Result<undefined>>(`/${id}/refreshNodes`, { method: "POST" })
    }
    const updateNodeConfig = async (config: NodeTaskConfig) => {
        await AppApi<Result<undefined>>(`/${id}/updateNodeConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
    }
    return { getNodeState, getNodes, refreshNodes, updateNodeConfig }
}
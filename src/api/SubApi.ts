import { AppApi, type Result } from "./Api"

export interface SubConfig {
    enabled: boolean
}

export interface Subscription {
    name: string | null
    enabled: boolean
    expireAt: string | null
    usageLimit: number | null
}

export interface SubData {
    uuid: string
    subscription: Subscription
}

export interface SubRecord {
    ip: string
    time: number
}

export type SubRequest = {
    name?: string
    enabled?: boolean
    expireAt?: string | null
    usageLimit?: number | null
}

export const SubApi = (id: string) => {
    const getSubConfig = async () => {
        const result = await AppApi<Result<SubConfig>>(`/${id}/getSubConfig`)
        return result.body as SubConfig
    }

    const updateSubConfig = async (config: SubConfig) => {
        const result = await AppApi<Result<SubConfig>>(`/${id}/updateSubConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
        return result.body as SubConfig
    }

    const getAllSub = async () => {
        const result = await AppApi<Result<Record<string, Subscription>>>(`/${id}/getAllSub`)
        return result.body as Record<string, Subscription>
    }

    const addSub = async (subscription: SubRequest) => {
        const result = await AppApi<Result<SubData>>(`/${id}/addSub`, {
            method: "POST",
            body: JSON.stringify(subscription)
        })
        return result.body as SubData
    }

    const getSub = async (uuid: string) => {
        const result = await AppApi<Result<SubData>>(`/${id}/getSub/${uuid}`)
        return result.body as SubData
    }

    const getRecords = async (uuid: string) => {
        const result = await AppApi<Result<SubRecord[]>>(`/${id}/getRecords/${uuid}`)
        return result.body as SubRecord[]
    }

    const updateSub = async (uuid: string, subscription: SubRequest) => {
        const result = await AppApi<Result<SubData>>(`/${id}/updateSub/${uuid}`, {
            method: "PUT",
            body: JSON.stringify(subscription)
        })
        return result.body as SubData
    }

    const removeSub = async (uuid: string) => {
        const result = await AppApi<Result<SubData>>(`/${id}/removeSub/${uuid}`, {
            method: "DELETE"
        })
        return result.body as SubData
    }

    return {
        getSubConfig,
        updateSubConfig,
        getAllSub,
        addSub,
        getSub,
        getRecords,
        updateSub,
        removeSub,
    }
}

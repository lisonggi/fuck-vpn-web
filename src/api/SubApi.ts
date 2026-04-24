import { AppApi, type Result } from "./Api"

export interface UpdateConfigRequest {
    enabled: boolean
    sort?: string | null
}

export interface AddItemRequest {
    name: string
    enabled: boolean
    expireAt: number | null
    usageLimit: number | null
    sort: string | null
}
export interface UpdateItemRequest {
    uuid: string,
    name: string
    enabled: boolean
    expireAt: number | null
    usageLimit: number | null
    sort: string | null
}

export interface ConfigResponse {
    enabled: boolean
    sort?: string
}
export interface ItemResponse {
    uuid: string,
    name: string
    enabled: boolean
    expireAt: number | null
    usageLimit: number | null
    sort: string | null
}
export interface Record {
    ip: string
    time: number
    userAgent: string
}
export interface RecordResponse {
    uuid: string,
    records: Record[]
}

export const SubApi = (id: string) => {
    const getSubConfig = async () => {
        const result = await AppApi<Result<ConfigResponse>>(`/${id}/getSubConfig`)
        return result.body as ConfigResponse
    }

    const updateSubConfig = async (config: UpdateConfigRequest) => {
        const result = await AppApi<Result<ConfigResponse>>(`/${id}/updateSubConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
        return result.body as ConfigResponse
    }

    const getAllSub = async () => {
        const result = await AppApi<Result<ItemResponse[]>>(`/${id}/getAllSub`)
        return result.body as ItemResponse[]
    }

    const addSub = async (subscription: AddItemRequest) => {
        const result = await AppApi<Result<ItemResponse>>(`/${id}/addSub`, {
            method: "POST",
            body: JSON.stringify(subscription)
        })
        return result.body as ItemResponse
    }

    const getSubRecords = async (uuid: string) => {
        const result = await AppApi<Result<RecordResponse>>(`/${id}/getSubRecords/${uuid}`)
        return result.body as RecordResponse
    }

    const updateSub = async (subData: UpdateItemRequest) => {
        const result = await AppApi<Result<ItemResponse>>(`/${id}/updateSub`, {
            method: "PUT",
            body: JSON.stringify(subData)
        })
        return result.body as ItemResponse
    }

    const deleteSub = async (uuid: string) => {
        const result = await AppApi<Result<ItemResponse>>(`/${id}/deleteSub/${uuid}`, {
            method: "DELETE"
        })
        return result.body as ItemResponse
    }

    return {
        getSubConfig,
        updateSubConfig,
        getAllSub,
        addSub,
        getSubRecords,
        updateSub,
        deleteSub,
    }
}

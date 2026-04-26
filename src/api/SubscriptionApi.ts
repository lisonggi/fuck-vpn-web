import { AppApi, type Result } from "./Api"
export interface SubscriptionConfigModel {
    enabled?: boolean
    successTip?: string | null
    sort?: string | null
}
export interface SubscriptionItemModel {
    uuid?: string
    name?: string
    enabled?: boolean
    expireAt?: number | null
    usageLimit?: number | null
    sort?: string | null
}
interface SubscriptionItemRecordModel {
    ip: string
    time: number
    userAgent: string
}
export interface RecordResponse {
    uuid: string,
    records: SubscriptionItemRecordModel[]
}


export const SubscriptionApi = (id: string) => {
    const getConfig = async () => {
        const result = await AppApi<Result<Required<SubscriptionConfigModel>>>(`/${id}/getSubConfig`)
        return result.body
    }

    const updateConfig = async (config: SubscriptionConfigModel) => {
        const result = await AppApi<Result<Required<SubscriptionConfigModel>>>(`/${id}/updateSubConfig`, {
            method: "PUT",
            body: JSON.stringify(config)
        })
        return result.body
    }

    const getAllItem = async () => {
        const result = await AppApi<Result<Required<SubscriptionItemModel>[]>>(`/${id}/getAllSub`)
        return result.body
    }

    const addItem = async (item: Omit<SubscriptionItemModel, "uuid">) => {
        const result = await AppApi<Result<Required<SubscriptionItemModel>>>(`/${id}/addSub`, {
            method: "POST",
            body: JSON.stringify(item)
        })
        return result.body
    }

    const getRecords = async (uuid: string) => {
        const result = await AppApi<Result<RecordResponse>>(`/${id}/getSubRecords/${uuid}`)
        return result.body
    }

    const updateItem = async (subData: SubscriptionItemModel) => {
        const result = await AppApi<Result<Required<SubscriptionItemModel>>>(`/${id}/updateSub`, {
            method: "PUT",
            body: JSON.stringify(subData)
        })
        return result.body
    }

    const deleteItem = async (uuid: string) => {
        const result = await AppApi<Result<Required<SubscriptionItemModel>>>(`/${id}/deleteSub/${uuid}`, {
            method: "DELETE"
        })
        return result.body
    }

    return {
        getConfig,
        updateConfig,
        getAllItem,
        addItem,
        getRecords,
        updateItem,
        deleteItem
    }
}

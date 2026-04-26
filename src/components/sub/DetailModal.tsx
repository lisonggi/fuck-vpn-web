import { Button } from "@mui/material"
import { useState } from "react"
import { useModal } from "../../hooks/useModal"
import { AcitonWindow } from "../common/AcitonWindow"
import { RecordsModal } from "./RecordsModal"
import type { SubscriptionApi, SubscriptionItemModel } from "../../api/SubscriptionApi"
import { FormModal } from "./FormModal"

interface DetailModalProps {
    item: Required<SubscriptionItemModel>
    remove: () => void
    onSave?: (item: SubscriptionItemModel) => Promise<Required<SubscriptionItemModel>>
    onDelete?: (uuid: string) => Promise<Required<SubscriptionItemModel>>
}
export function DetailModal({ remove, item, onSave, onDelete, api }: DetailModalProps & {
    api: ReturnType<typeof SubscriptionApi>
}) {
    const modal = useModal()
    const [newData, setNewData] = useState(item)
    const handleSave = async (item: Omit<SubscriptionItemModel, "uuid">) => {
        if (onSave) {
            const result = await onSave({ uuid: newData.uuid, ...item })
            setNewData(result)
            return Promise.resolve(result)
        }
        return Promise.reject()
    }
    const handleDelete = async () => {
        if (onDelete && newData.uuid != undefined) {
            const result = await onDelete(newData.uuid)
            remove()
            return Promise.resolve(result)
        }
        return Promise.reject()
    }

    const openEditModal = () => {
        modal.open(({ remove }) => <FormModal remove={remove} title="编辑订阅" item={newData} onSave={(formData) => handleSave(formData)} onDelete={() => handleDelete()} />, { onMaskClick: () => { } })
    }
    const openRecordsModal = () => {
        if (newData.uuid != undefined) {
            const uuid = newData.uuid
            modal.open(({ remove }) => <RecordsModal remove={remove} uuid={uuid} api={api} />)
        }
    }


    return <AcitonWindow title={newData.name ?? "订阅"} closeWindow={{ onClose: () => remove() }}>
        <div className="flex flex-col gap-3 p-3">
            <div className="flex-1 grid grid-cols-[auto_auto_1fr] gap-x-3">
                <div>UUID</div>
                <div>:</div>
                {newData.uuid}

                <div className="text-nowrap">名称</div>
                <div>:</div>
                {newData.name}

                <div className="text-nowrap">状态</div>
                <div>:</div>
                {newData.enabled ? "已启用" : "已禁用"}

                <div className="text-nowrap">使用上限</div>
                <div>:</div>
                {newData.usageLimit ?? "无限制"}

                <div className="text-nowrap">使用期限</div>
                <div>:</div>
                {newData.expireAt ? new Date(newData.expireAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "无限制"}
                <div className="text-nowrap">排序</div>
                <div>:</div>
                {newData.sort ?? "默认排序"}
            </div>
            <div className="flex justify-end gap-3">
                {
                    onSave && <Button color="success" variant="contained" onClick={() => openEditModal()}>编辑</Button>
                }
                <Button color="primary" variant="contained" onClick={() => openRecordsModal()}>记录</Button>
            </div>
        </div>
    </AcitonWindow>
}
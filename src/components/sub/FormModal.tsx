import { useMemo, useState } from "react"
import { AcitonWindow } from "../common/AcitonWindow"
import { Box, Button, Switch, TextField } from "@mui/material"
import type { SubscriptionItemModel } from "../../api/SubscriptionApi"
export interface FormModalProps {
    title: string
    item: Required<Omit<SubscriptionItemModel, "uuid">>,
    onSave?: (item: Required<Omit<SubscriptionItemModel, "uuid">>) => Promise<unknown>
    onDelete?: () => Promise<unknown>
    remove: () => void
}

function nameValidation(value?: string) {
    if (!value || value.trim().length === 0) {
        return false
    } else {
        return true
    }
}
function usageLimitValidation(value: string) {
    const v = value.trim()
    return (v.length === 0 || /^[1-9]\d*$/.test(v))
}
export function FormModal({ remove, title, item: data, onSave, onDelete }: FormModalProps) {
    const [newData, setNewData] = useState(data)
    const [loading, setLoading] = useState(false)
    const handleSave = async () => {
        if (onSave) {
            setLoading(true)
            await onSave(newData).then(() => {
                if (remove) {
                    remove()
                }
            }).finally(() => {
                setLoading(false)
            })
        }
    }
    const handleDelete = async () => {
        if (onDelete) {
            setLoading(true)
            await onDelete().then(() => {
                if (remove) {
                    remove()
                }
            }).finally(() => {
                setLoading(false)
            })
        }
    }
    const isChanges = useMemo(() => {
        return JSON.stringify(newData) !== JSON.stringify(data)
    }, [newData, data])
    return <AcitonWindow title={title} closeWindow={{ onClose: () => remove(), disabled: loading }}>
        <Box component="form" className="flex flex-col gap-3 p-3" onSubmit={handleSave}>
            <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                <div>启用</div>
                <Switch disabled={loading} checked={newData.enabled} onChange={(event) => {
                    setNewData((prev => {
                        return {
                            ...prev, enabled: event.target.checked
                        }
                    }))
                }} />
                <div>名称</div>
                <TextField
                    size="small"
                    required
                    disabled={loading}
                    value={newData.name}
                    onChange={(event) => {
                        setNewData((prev => ({
                            ...prev, name: event.target.value
                        })))
                    }}
                    error={!nameValidation(newData.name)}

                    helperText={
                        !nameValidation(newData.name) ? "名称不能为空" : null
                    } />
                <div>次数</div>
                <TextField
                    size="small"
                    disabled={loading}
                    type="text"
                    placeholder="无限制 请留空"
                    value={newData.usageLimit ?? ""}
                    onChange={(event) => {
                        const value = event.target.value
                        if (!usageLimitValidation(value)) return
                        setNewData((prev => ({
                            ...prev,
                            usageLimit: value === "" ? null : Number(value)
                        })))
                    }}
                />
                <div>有效期</div>
                <TextField
                    size="small"
                    disabled={loading}
                    type="datetime-local"
                    value={newData.expireAt ? new Date(newData.expireAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(event) => {
                        const value = event.target.value
                        setNewData(prev => ({
                            ...prev,
                            expireAt: value ? new Date(value).getTime() : null
                        }))
                    }}
                />
                <div>排序</div>
                <TextField
                    size="small"
                    type="text"
                    disabled={loading}
                    value={newData.sort ?? ""}
                    onChange={(event) => {
                        setNewData((prev => ({
                            ...prev,
                            sort: event.target.value.trim() || null
                        }
                        )))
                    }}
                    placeholder="用,分割排序"
                />
            </div>
            <div className="flex justify-end gap-3">
                {
                    onDelete && <Button loading={loading} color="error" variant="contained" onClick={() => handleDelete()}>删除</Button>
                }
                {
                    onSave && <Button disabled={!isChanges || !nameValidation(newData.name) || newData.usageLimit != null && !usageLimitValidation(String(newData.usageLimit))} type="submit" loading={loading} color="primary" variant="contained" onClick={() => handleSave()}>保存</Button>
                }
            </div>
        </Box>
    </AcitonWindow>
}
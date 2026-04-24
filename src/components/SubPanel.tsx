import { Box, Button, Divider, FormControlLabel, IconButton, Switch, TextField, Tooltip, Typography } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack"
import { useMemo, useState } from "react"
import { SubApi, type AddItemRequest, type ItemResponse, type UpdateConfigRequest, type UpdateItemRequest } from "../api/SubApi"

import { CopyIcon, DocsIcon, HourglassIcon, PowerIcon, SettingsIcon } from "../assets/icons/Icons"

import { useModal } from "../hooks/useModal"
import { AcitonCard } from "./AcitonCard"
import { AppIconButton } from "./AppIconButton"
import { AppWindow } from "./AppWindow"
import { EmptyState } from "./EmptyState"
import { IconText } from "./IconText"


function getUseSubApiUrl(pluginId: string, uuid: string) {
    return `${window.location.origin}/api/${pluginId}/useSub/${uuid}`
}

interface FormModalProps extends DetailModalProps {
    title: string
}

interface DetailModalProps {
    item: ItemResponse
    remove: () => void
    onSave?: (subData: UpdateItemRequest) => Promise<ItemResponse>
    onDelete?: (uuid: string) => Promise<ItemResponse>
}

function SettingsModal({ remove, config, save }: { remove: () => void, config: UpdateConfigRequest, save: (config: UpdateConfigRequest) => Promise<UpdateConfigRequest> }) {
    const [newConfig, setNewConfig] = useState<UpdateConfigRequest>(config)
    const [saveLoading, setSaveLoading] = useState(false)
    const isChanges = useMemo(() => {
        return JSON.stringify(newConfig) !== JSON.stringify(config)
    }, [config, newConfig])
    const handleSave = () => {
        setSaveLoading(true)
        save(newConfig).then(() => {
            remove()
        }).finally(() => {
            setSaveLoading(false)
        })
    }
    console.log(newConfig.sort)
    return <AppWindow title="订阅设置" closeWindow={{ onClose: () => remove(), disabled: saveLoading }}>
        <div className="p-3 min-w-80 flex flex-col gap-3">
            <Typography component={"div"} sx={{ fontSize: "0.9rem" }}>
                开启时才能使用订阅功能
            </Typography>
            <FormControlLabel
                control={<Switch disabled={saveLoading} checked={newConfig.enabled} onChange={(event) => setNewConfig({ ...newConfig, enabled: event.target.checked })} />}
                label="开关"
            />
            <TextField
                size="small"
                label="默认排序"
                type="text"
                disabled={saveLoading}
                value={newConfig.sort ?? ""}
                onChange={(event) => {
                    setNewConfig((prev => ({
                        ...prev,
                        sort: event.target.value.trim() || null
                    })))
                }}
                placeholder="用,分割排序" />
            <div className="flex gap-3 justify-end">
                <Button disabled={!isChanges} loading={saveLoading} color="success" variant="contained" onClick={handleSave}>保存</Button>
            </div>
        </div>
    </AppWindow >
}
function RecordsModal({ remove, uuid, api }: { remove: () => void, uuid: string, api: ReturnType<typeof SubApi> }) {
    const recordsData = useQuery({
        queryKey: [uuid],
        queryFn: () => api.getSubRecords(uuid)
    })
    return <AppWindow title="记录" closeWindow={{ onClose: () => remove() }}>
        {<div className="p-3 max-h-100 overflow-auto">
            {recordsData.isLoading ?
                <IconText Icon={HourglassIcon} text="正在加载" /> :
                recordsData.isError ? <IconText Icon={HourglassIcon} text="加载失败" /> :
                    <div className="flex-1 overflow-auto">
                        {recordsData.data.records.map((item, index) =>
                            <div>
                                {index > 0 && <Divider />}
                                <div><Typography color="info" sx={{ fontSize: "1.2rem" }}>{item.ip}</Typography></div>
                                <div><Typography sx={{ fontSize: "0.9rem" }}>{new Date(item.time - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}</Typography></div>
                                <div><Typography sx={{ fontSize: "0.9rem" }}>{item.userAgent}</Typography></div>
                            </div>
                        )}
                    </div>
            }
        </div>}
    </AppWindow>
}

function DetailModal({ remove, item: subData, onSave, onDelete, api }: DetailModalProps & {
    api: ReturnType<typeof SubApi>
}) {
    const modal = useModal()
    const [newSubData, setNewSubData] = useState(subData)
    const handleSave = async (subData: UpdateItemRequest) => {
        if (onSave) {
            const result = await onSave(subData)
            setNewSubData(result)
            return Promise.resolve(result)
        }
        return Promise.reject()
    }
    const handleDelete = async (uuid: string) => {
        if (onDelete) {
            const result = await onDelete(uuid)
            remove()
            return Promise.resolve(result)
        }
        return Promise.reject()
    }

    const openEditModal = () => {
        modal.open(({ remove }) => <FormModal remove={remove} title="编辑订阅" item={newSubData} onSave={(subData) => handleSave(subData)} onDelete={(uuid) => handleDelete(uuid)} />, { onMaskClick: () => { } })
    }
    const openRecordsModal = () => {
        modal.open(({ remove }) => <RecordsModal remove={remove} uuid={newSubData.uuid} api={api} />)
    }


    return <AppWindow title={newSubData.name ?? "订阅"} closeWindow={{ onClose: () => remove() }}>
        <div className="flex flex-col gap-3 p-3">
            <div className="flex-1 grid grid-cols-[auto_auto_1fr] gap-x-3">
                <div>UUID</div>
                <div>:</div>
                {newSubData.uuid}

                <div className="text-nowrap">名称</div>
                <div>:</div>
                {newSubData.name}

                <div className="text-nowrap">状态</div>
                <div>:</div>
                {newSubData.enabled ? "已启用" : "已禁用"}

                <div className="text-nowrap">使用上限</div>
                <div>:</div>
                {newSubData.usageLimit ?? "无限制"}

                <div className="text-nowrap">使用期限</div>
                <div>:</div>
                {newSubData.expireAt ? new Date(newSubData.expireAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "无限制"}
                <div className="text-nowrap">排序</div>
                <div>:</div>
                {newSubData.sort ?? "默认排序"}
            </div>
            <div className="flex justify-end gap-3">
                {
                    onSave && <Button color="success" variant="contained" onClick={() => openEditModal()}>编辑</Button>
                }
                <Button color="primary" variant="contained" onClick={() => openRecordsModal()}>记录</Button>
            </div>
        </div>
    </AppWindow>
}

function nameValidation(value: string) {
    if (value.trim().length === 0) {
        return false
    } else {
        return true
    }
}
function usageLimitValidation(value: string) {
    const v = value.trim()
    return (v.length === 0 || /^[1-9]\d*$/.test(v))
}
function FormModal({ remove, title, item: subData, onSave, onDelete }: FormModalProps) {
    const [newSubData, setNewSubData] = useState<UpdateItemRequest>({ ...subData })
    const [loading, setLoading] = useState(false)
    const handleSave = async () => {
        if (onSave) {
            setLoading(true)
            await onSave(newSubData).then(() => {
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
            await onDelete(newSubData.uuid).then(() => {
                if (remove) {
                    remove()
                }
            }).finally(() => {
                setLoading(false)
            })
        }
    }
    const isChanges = useMemo(() => {
        return JSON.stringify(newSubData) !== JSON.stringify(subData)
    }, [newSubData, subData])
    return <AppWindow title={title} closeWindow={{ onClose: () => remove(), disabled: loading }}>
        <Box component="form" className="flex flex-col gap-3 p-3" onSubmit={handleSave}>
            <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                <div>启用</div>
                <Switch disabled={loading} checked={newSubData.enabled} onChange={(event) => {
                    setNewSubData((prev => {
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
                    value={newSubData.name}
                    onChange={(event) => {
                        setNewSubData((prev => ({
                            ...prev, name: event.target.value
                        })))
                    }}
                    error={!nameValidation(newSubData.name)}

                    helperText={
                        !nameValidation(newSubData.name) ? "名称不能为空" : null
                    } />
                <div>次数</div>
                <TextField
                    size="small"
                    disabled={loading}
                    type="text"
                    placeholder="无限制 请留空"
                    value={newSubData.usageLimit ?? ""}
                    onChange={(event) => {
                        const value = event.target.value
                        if (!usageLimitValidation(value)) return
                        setNewSubData((prev => ({
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
                    value={newSubData.expireAt ? new Date(newSubData.expireAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                    onChange={(event) => {
                        const value = event.target.value
                        setNewSubData(prev => ({
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
                    value={newSubData.sort ?? ""}
                    onChange={(event) => {
                        setNewSubData((prev => ({
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
                    onSave && <Button disabled={!isChanges || !nameValidation(newSubData.name) || newSubData.usageLimit != null && !usageLimitValidation(String(newSubData.usageLimit))} type="submit" loading={loading} color="primary" variant="contained" onClick={() => handleSave()}>保存</Button>
                }
            </div>
        </Box>
    </AppWindow>
}
export function SubPanel({ pluginId }: { pluginId: string }) {
    const modal = useModal()
    const subApi = SubApi(pluginId)

    const configQuery = useQuery({
        queryKey: ["subConfig", pluginId],
        queryFn: () => subApi.getSubConfig()
    })

    const dataQuery = useQuery({
        queryKey: ["subs", pluginId],
        queryFn: () => subApi.getAllSub(), enabled: configQuery.isSuccess && configQuery.data.enabled
    })

    const configMutation = useMutation({
        mutationFn: (config: UpdateConfigRequest) => subApi.updateSubConfig(config),
        onSuccess: () => {
            configQuery.refetch()
        }
    })


    const addSubscription = useMutation({
        mutationFn: (subscription: AddItemRequest) => subApi.addSub(subscription),
        onSuccess: () => {
            dataQuery.refetch()
        }
    })

    const updateSubscription = useMutation({
        mutationFn: ({ subData }: { subData: UpdateItemRequest }) => subApi.updateSub(subData),
        onSuccess: () => {
            dataQuery.refetch()
        }
    })

    const deleteSubscription = useMutation({
        mutationFn: (uuid: string) => subApi.deleteSub(uuid),
        onSuccess: () => {
            dataQuery.refetch()
        }
    })

    const ActionButtons = () => {
        return configQuery.isLoading ? <div>正在加载</div> : configQuery.isError ? <div>加载失败</div> : <AppIconButton onClick={openSettingsModal} icon={SettingsIcon} tip="设置" />
    }
    const [searchValus, setSearchValus] = useState("")
    const filterData = useMemo(() => {
        if (dataQuery.isSuccess) {
            return dataQuery.data.filter((item) => {
                const keyword = `${item.uuid.trim()}${item.name?.trim()}${item.enabled ? "on" : "off"}`
                return keyword.toLowerCase().includes(searchValus.trim().toLowerCase())
            })
        }
        else {
            return []
        }
    }, [dataQuery, searchValus])

    const openSettingsModal = () => {
        if (configQuery.isSuccess)
            modal.open(({ remove }) => (<SettingsModal remove={remove} config={configQuery.data} save={(config) => configMutation.mutateAsync(config)} />))
    }

    const openDetailModal = (subData: ItemResponse) => {
        modal.open(({ remove }) => <DetailModal remove={remove} item={subData} onSave={(subData) => updateSubscription.mutateAsync({ subData })} onDelete={(uuid) => deleteSubscription.mutateAsync(uuid)} api={subApi} />)
    }
    const openAddModal = () => {
        modal.open(({ remove }) =>
            <FormModal
                title={"新增订阅"}
                item={{
                    uuid: "",
                    enabled: true,
                    name: "",
                    expireAt: null,
                    usageLimit: null,
                    sort: null
                }} remove={remove} onSave={(subData) => addSubscription.mutateAsync(subData)} />, { onMaskClick: () => { } })
    }

    return <AcitonCard className="w-full" acitonBarProps={{ title: "订阅", action: <ActionButtons /> }}>
        {configQuery.isLoading ?
            <IconText Icon={HourglassIcon} text="正在加载配置" color="primary" /> :
            configQuery.isError ?
                <IconText Icon={HourglassIcon} text="配置加载失败" color="primary" /> :
                !configQuery.data.enabled ?
                    <IconText Icon={PowerIcon} text="订阅功能已关闭" color="primary" /> :
                    dataQuery.isLoading ?
                        <IconText Icon={HourglassIcon} text="正在加载订阅" color="primary" /> :
                        dataQuery.isError ?
                            <IconText Icon={HourglassIcon} text="订阅加载失败" color="primary" /> : <div>
                                <div className="flex p-3 gap-3 items-center">
                                    <TextField size="small" className="flex-1" value={searchValus} onChange={(e) => setSearchValus(e.target.value)} label="过滤: id,名称,on,off" />
                                    <Button variant="contained" onClick={() => openAddModal()}>新增订阅</Button>
                                </div>
                                {
                                    filterData.length === 0 ? <EmptyState tip="没有数据" /> :
                                        <div>
                                            {
                                                filterData.map((item, index) => {
                                                    const sort =
                                                        item.sort?.trim()

                                                    const query = new URLSearchParams()

                                                    if (sort) {
                                                        query.set("sort", sort)
                                                    }

                                                    return <div key={item.uuid} className="hover:bg-gray-100">
                                                        {index > 0 && <Divider />}
                                                        <div className="flex flex-row p-3 items-center" >
                                                            <Typography component={"div"} className="flex-1">
                                                                <div className="flex-1 grid grid-cols-[auto_auto_auto_1fr] gap-x-3 items-center">
                                                                    <div className="text-nowrap">名称</div>
                                                                    <div>:</div>
                                                                    <Typography color={item.enabled ? "primary" : "error"}>{item.name}</Typography>
                                                                    <div></div>

                                                                    <div className="text-nowrap">UUID</div>
                                                                    <div>:</div>
                                                                    <p>{item.uuid}</p>
                                                                    <div></div>

                                                                    <div className="text-nowrap">订阅</div>
                                                                    <div>:</div>
                                                                    <Typography onClick={e => e.stopPropagation()} component="a" href={getUseSubApiUrl(pluginId, item.uuid)} target="_blank" rel="noreferrer" color="primary" sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                                        <p>{`api/${pluginId}/useSub/${item.uuid}${query.toString() ? `?${query}` : ""}`}</p>
                                                                    </Typography>
                                                                    <div>
                                                                        <Tooltip title="复制订阅">
                                                                            <IconButton color="primary" onClick={async () => {
                                                                                try {
                                                                                    await navigator.clipboard.writeText(getUseSubApiUrl(pluginId, item.uuid))
                                                                                    enqueueSnackbar("复制成功", { variant: "success" });
                                                                                } catch (err) {
                                                                                    let message = "复制失败"
                                                                                    if (err instanceof Error)
                                                                                        message = `${message} - ${err.message}`
                                                                                    enqueueSnackbar(message, { variant: "error" });
                                                                                }
                                                                            }}>
                                                                                <CopyIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </div>

                                                                </div>
                                                            </Typography>
                                                            <Button variant="contained" startIcon={<DocsIcon />} onClick={() => openDetailModal(item)}>
                                                                查看订阅
                                                            </Button>
                                                        </div>
                                                    </div>
                                                })
                                            }
                                        </div>
                                }
                            </div>
        }
    </AcitonCard>
}
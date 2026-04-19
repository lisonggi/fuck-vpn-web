import { Button, Divider, FormControlLabel, IconButton, Switch, TextField, Tooltip, Typography } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack"
import { useMemo, useState } from "react"
import { SubApi, type SubConfig, type SubData, type Subscription } from "../api/SubApi"

import { CopyIcon, DocsIcon, HourglassIcon, PowerIcon, SettingsIcon } from "../assets/icons/Icons"

import { useModal } from "../hooks/useModal"
import { AppCard } from "./AppCard"
import { EmptyState } from "./EmptyState"
import { IconText } from "./IconText"
import { LoadingIconButtion } from "./LoadingIconButtion"


function getUseSubApiUrl(pluginId: string, uuid: string) {
    return `${window.location.origin}/api/${pluginId}/useSub/${uuid}`
}

function SettingsModal({ remove, config, save }: { remove: () => void, config: SubConfig, save: (config: SubConfig) => Promise<SubConfig> }) {
    const [newConfig, setNewConfig] = useState<SubConfig>(config)
    const [saveLoading, setSaveLoading] = useState(false)
    const isChanges = useMemo(() => {
        return JSON.stringify(newConfig) !== JSON.stringify(config)
    }, [config, newConfig])
    const handelSave = () => {
        setSaveLoading(true)
        save(newConfig).then(() => {
            remove()
        }).finally(() => {
            setSaveLoading(false)
        })
    }
    return <AppCard title="订阅设置">
        <div className="p-3 min-w-80">
            <Typography component={"div"} sx={{ fontSize: "0.9rem" }}>
                开启时才能使用订阅功能
            </Typography>
            <FormControlLabel
                control={<Switch disabled={saveLoading} checked={newConfig.enabled} onChange={(event) => setNewConfig({ ...newConfig, enabled: event.target.checked })} />}
                label="开关"
            />
            <div className="flex gap-3 justify-end">
                <Button disabled={!isChanges} loading={saveLoading} color="success" variant="contained" onClick={handelSave}>保存</Button>
                <Button disabled={saveLoading} variant="contained" onClick={() => remove()}>取消</Button>
            </div>
        </div>
    </AppCard >
}

function DetailModal({ remove, subData, onSave }: { remove: () => void, subData: SubData, onSave: (subData: SubData) => Promise<SubData> }) {
    const modal = useModal()
    const [newSubData, setNewSubData] = useState(subData)
    const openEditModal = (subData: SubData, onSave: (subData: SubData) => Promise<SubData>) => {
        modal.open(({ remove }) => <FormModal remove={remove} title="编辑订阅" subData={subData} onSave={onSave} />, { onMaskClick: () => { } })
    }

    const handelSave = async (subData: SubData) => {
        const result = await onSave(subData)
        setNewSubData(result)
        return Promise.resolve(result)
    }

    return <AppCard title={newSubData.subscription.name ?? "订阅"}>
        <div className="flex flex-col gap-3 p-3">
            <div className="flex-1 grid grid-cols-[auto_auto_1fr] gap-x-3">
                <div>UUID</div>
                <div>:</div>
                {newSubData.uuid}

                <div className="text-nowrap">名称</div>
                <div>:</div>
                {newSubData.subscription.name}

                <div className="text-nowrap">状态</div>
                <div>:</div>
                {newSubData.subscription.enabled ? "已启用" : "已禁用"}

                <div className="text-nowrap">使用上限</div>
                <div>:</div>
                {newSubData.subscription.usageLimit ?? "无限制"}

                <div className="text-nowrap">使用期限</div>
                <div>:</div>
                {newSubData.subscription.expireAt ?? "无限制"}
            </div>
            <div className="flex justify-end gap-3">
                <Button color="success" variant="contained" onClick={() => openEditModal(newSubData, handelSave)}>编辑</Button>
                <Button variant="contained" onClick={() => remove()}>关闭</Button>
            </div>
        </div>
    </AppCard>
}
function FormModal({ remove, title, subData, onSave }: { remove: () => void, title: string, subData: SubData, onSave: (subData: SubData) => Promise<SubData> }) {
    const [newSubData, setNewSubData] = useState(subData)
    const [loading, setLoading] = useState(false)
    const handelSave = async () => {
        setLoading(true)
        await onSave(newSubData).then(() => {
            remove()
        }).finally(() => {
            setLoading(false)
        })
    }
    return <AppCard title={title} className="min-w-80">
        <div className="flex flex-col gap-3 p-3">
            <FormControlLabel
                control={<Switch disabled={loading} checked={newSubData.subscription.enabled} onChange={(event) => {
                    setNewSubData((prev => {
                        return {
                            ...prev,
                            subscription: { ...prev.subscription, enabled: event.target.checked }
                        }
                    }))
                }} />}
                label="启用此订阅"
            />
            <TextField disabled={loading} label="名称" value={newSubData.subscription.name} onChange={(event) => {
                setNewSubData((prev => {
                    return {
                        ...prev,
                        subscription: { ...prev.subscription, name: event.target.value }
                    }
                }))
            }} error={!newSubData.subscription.name?.trim()}
                helperText={
                    !newSubData.subscription.name?.trim() ? "名称不能为空" : ""
                } />
            <TextField disabled={loading} label="使用次数限制 空=无限制" type="number"
                value={newSubData.subscription.usageLimit ?? ""}

                onChange={(event) => {
                    const value = event.target.value

                    // 允许空
                    if (value === "") {
                        setNewSubData(prev => ({
                            ...prev,
                            subscription: { ...prev.subscription, usageLimit: null }
                        }))
                        return
                    }

                    // ❌ 拒绝小数
                    if (!/^\d+$/.test(value)) return

                    setNewSubData(prev => ({
                        ...prev,
                        subscription: {
                            ...prev.subscription,
                            usageLimit: Number(value)
                        }
                    }))
                }}

                slotProps={{
                    input: {
                        inputProps: {
                            step: 1,
                            min: 1,
                        },
                    },
                }} />

            <div className="flex justify-end gap-3">
                <Button loading={loading} color="success" variant="contained" onClick={() => handelSave()}>保存</Button>
                <Button disabled={loading} variant="contained" onClick={() => remove()}>关闭</Button>
            </div>
        </div>

    </AppCard>
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
        mutationFn: (config: SubConfig) => subApi.updateSubConfig(config),
        onSuccess: () => {
            configQuery.refetch()
        }
    })


    const addSubscription = useMutation({
        mutationFn: (subscription: Subscription) => subApi.addSub(subscription),
        onSuccess: () => {
            dataQuery.refetch()
        }
    })

    const updateSubscription = useMutation({
        mutationFn: ({ subData }: { subData: SubData }) => subApi.updateSub(subData),
        onSuccess: () => {
            dataQuery.refetch()
        }
    })

    const removeSubscription = useMutation({
        mutationFn: (uuid: string) => subApi.removeSub(uuid),
        onSuccess: () => {
            dataQuery.refetch()
        }
    })

    const ActionButtons = () => {
        return configQuery.isLoading ? <div>正在加载</div> : configQuery.isError ? <div>加载失败</div> : <LoadingIconButtion onClick={openSettingsModal} Icon={SettingsIcon} tip="设置" />
    }
    const [searchValus, setSearchValus] = useState("")
    const filterData = useMemo(() => {
        if (dataQuery.isSuccess) {
            return Object.entries(dataQuery.data).filter(([id, item]) => {
                const keyword = `${id.trim()}${item.name?.trim()}${item.enabled ? "on" : "off"}`
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

    const openDetailModal = (subData: SubData) => {
        modal.open(({ remove }) => <DetailModal remove={remove} subData={subData} onSave={(subData) => updateSubscription.mutateAsync({ subData })} />)
    }

    return <AppCard title="订阅" actionCompose={<ActionButtons />}>
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
                                    <Button variant="contained">新增订阅</Button>
                                </div>
                                {
                                    filterData.length === 0 ? <EmptyState tip="没有数据" /> :
                                        <div>
                                            {
                                                filterData.map(([uuid, subscription], index) => {
                                                    return <div key={uuid} className="hover:bg-gray-100">
                                                        {index > 0 && <Divider />}
                                                        <div className="flex flex-row p-3 items-center" >
                                                            <Typography component={"div"} className="flex-1">
                                                                <div className="flex-1 grid grid-cols-[auto_auto_auto_1fr] gap-x-3 items-center">
                                                                    <div className="text-nowrap">名称</div>
                                                                    <div>:</div>
                                                                    <Typography color={subscription.enabled ? "primary" : "error"}>{subscription.name}</Typography>
                                                                    <div></div>

                                                                    <div className="text-nowrap">UUID</div>
                                                                    <div>:</div>
                                                                    <p>{uuid}</p>
                                                                    <div></div>

                                                                    <div className="text-nowrap">订阅</div>
                                                                    <div>:</div>
                                                                    <Typography onClick={e => e.stopPropagation()} component="a" href={getUseSubApiUrl(pluginId, uuid)} target="_blank" rel="noreferrer" color="primary" sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                                        <p>{`api/${pluginId}/useSub/${uuid}`}</p>
                                                                    </Typography>
                                                                    <div>
                                                                        <Tooltip title="复制订阅">
                                                                            <IconButton color="primary" onClick={async () => {
                                                                                try {
                                                                                    await navigator.clipboard.writeText(getUseSubApiUrl(pluginId, uuid))
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
                                                            <Button variant="contained" startIcon={<DocsIcon />} onClick={() => openDetailModal({ uuid, subscription })}>
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

    </AppCard>
    /* return <Box className="min-w-80" sx={{ borderBlockColor: "divider", borderRadius: borderRadius, boxShadow: theme.shadows[1] }}>
         <AppTitleBar title="订阅" boxSx={{
             borderTopRightRadius: borderRadius,
             borderTopLeftRadius: borderRadius,
         }} actionCompose={<Box className="flex items-center gap-1">
             {subEnabled && <LoadingIconButtion onClick={handleOpenAdd} Icon={AddIcon} color={theme.palette.primary.contrastText} tip="新增订阅" />}
             <Switch
                 checked={subEnabled}
                 onChange={(event) => void handleToggleEnabled(event.target.checked)}
                 disabled={subConfigLoading || configMutation.isLoading}
                 sx={{
                     color: theme.palette.primary.contrastText,
                     '& .MuiSwitch-track': {
                         backgroundColor: subEnabled ? theme.palette.primary.contrastText : theme.palette.error.main,
                     },
                     '& .Mui-checked': {
                         color: theme.palette.common.white,
                     },
                     '& .Mui-checked + .MuiSwitch-track': {
                         backgroundColor: theme.palette.common.white,
                     }
                 }}
             />
         </Box>} />
         { <Box className="p-3 flex flex-col gap-3">
             {loading ? <IconText Icon={HourglassIcon} text="正在加载" color="primary" /> : !subEnabled ? <IconText Icon={DefaultIcon} text="订阅功能已关闭" color="primary" /> : subItems.length === 0 ? <EmptyState tip="没有订阅" /> : subItems.map(({ uuid, subscription }) => (
                 <Box key={uuid} className="p-3 rounded-lg border" sx={{ borderColor: "divider" }}>
                     <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 2, alignItems: 'center' }}>
                         <Box>
                             <Typography sx={{ fontWeight: 600 }}>名称: {subscription.name ?? "未命名订阅"}</Typography>
                             <Typography color="text.secondary" >uuid: {uuid}</Typography>
                             <Typography >过期时间: {subscription.expireAt ? new Date(subscription.expireAt).toLocaleString() : "永不过期"}</Typography>
                             <Typography>使用上限: {subscription.usageLimit !== null ? subscription.usageLimit : "无限制"}</Typography>
                             <Box className="mt-2">
                                 <Typography variant="body2" color="text.secondary">订阅链接</Typography>
                                 <Box className="flex flex-wrap items-center gap-2">
                                     <Typography component="a" href={getUseSubApiUrl(pluginId, uuid)} target="_blank" rel="noreferrer" color="primary" sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}>
                                         {getUseSubApiUrl(pluginId, uuid)}
                                     </Typography>
                                     <Button size="small" variant="outlined" onClick={async () => {
                                         await navigator.clipboard.writeText(getUseSubApiUrl(pluginId, uuid))
                                     }}>
                                         复制
                                     </Button>
                                 </Box>
                             </Box>
                         </Box>
                         <Box className="flex flex-col gap-2 justify-start">
                             <Button size="small" variant="outlined" onClick={() => getRecords.mutateAsync(uuid)} disabled={!subEnabled || getRecords.isLoading}>记录</Button>
                             <Button size="small" variant="outlined" onClick={() => handleOpenEdit(uuid, subscription)} disabled={!subEnabled}>编辑</Button>
                         </Box>
                     </Box>
                 </Box>
             ))}
         </Box>
         <SubManageDialog
             open={manageOpen}
             form={subForm}
             onFormChange={setSubForm}
             title={editUuid ? "编辑订阅" : "新增订阅"}
             saveCancelDeleteProps={{
                 onSave: handleSaveSubscription,
                 onCancel: () => setManageOpen(false),
                 onDelete: editUuid ? handleRemoveSubscription : undefined
             }}
         />
         <SubRecordsDialog
             open={recordsOpen}
             onClose={() => setRecordsOpen(false)}
             records={records}
         />
     </Box> }*/
}
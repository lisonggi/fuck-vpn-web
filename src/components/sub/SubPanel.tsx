import { Button, Divider, IconButton, TextField, Tooltip, Typography } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack"
import { useMemo, useState } from "react"

import { CopyIcon, DocsIcon, HourglassIcon, PowerIcon, SettingsIcon } from "../../assets/icons/Icons"

import { SubscriptionApi, type SubscriptionConfigModel, type SubscriptionItemModel } from "../../api/SubscriptionApi"
import { useModal } from "../../hooks/useModal"
import { AcitonCard } from "../common/AcitonCard"
import { AppIconButton } from "../common/AppIconButton"
import { EmptyState } from "../common/EmptyState"
import { IconText } from "../common/IconText"
import { DetailModal } from "./DetailModal"
import { FormModal } from "./FormModal"
import { SubSettingsModal } from "./SubSettingsModal"

export function SubPanel({ pluginId }: { pluginId: string }) {
    const modal = useModal()
    const subscriptionApi = SubscriptionApi(pluginId)

    const configQuery = useQuery({
        queryKey: ["subConfig", pluginId],
        queryFn: () => subscriptionApi.getConfig()
    })

    const allItemQuery = useQuery({
        queryKey: ["subscriptions", pluginId],
        queryFn: () => subscriptionApi.getAllItem(), enabled: configQuery.isSuccess && configQuery.data.enabled
    })
    const queryClient = useQueryClient();
    const updateConfigMutation = useMutation({
        mutationFn: (config: SubscriptionConfigModel) => subscriptionApi.updateConfig(config),
        onSuccess: (data) => {
            queryClient.setQueryData<SubscriptionConfigModel>(["subConfig", pluginId], data)
        }
    })


    const addItemMutation = useMutation({
        mutationFn: (item: Omit<SubscriptionItemModel, "uuid">) => subscriptionApi.addItem(item),
        onSuccess: (data) => {
            queryClient.setQueryData<Required<SubscriptionItemModel>[]>(
                ["subscriptions", pluginId],
                (old = []) => [...old, data]
            )
        }
    })

    const updateItemMutation = useMutation({
        mutationFn: (item: SubscriptionItemModel) => subscriptionApi.updateItem(item),
        onSuccess: (data) => {
            queryClient.setQueryData<Required<SubscriptionItemModel>[]>(
                ["subscriptions", pluginId],
                (old = []) =>
                    old.map(item =>
                        item.uuid === data.uuid ? data : item
                    )
            )
        }
    })

    const deleteItemMutation = useMutation({
        mutationFn: (uuid: string) => subscriptionApi.deleteItem(uuid),
        onSuccess: (data) => {
            queryClient.setQueryData<Required<SubscriptionItemModel>[]>(
                ["subscriptions", pluginId],
                (old = []) => old.filter(item => item.uuid !== data.uuid)
            )
        }
    })

    const ActionButtons = () => {
        return configQuery.isLoading ? <div>正在加载</div> : configQuery.isError ? <div>加载失败</div> : <AppIconButton onClick={openSettingsModal} icon={SettingsIcon} tip="设置" />
    }
    const [searchValus, setSearchValus] = useState("")
    const filterData = useMemo(() => {
        if (allItemQuery.isSuccess) {
            return allItemQuery.data.filter((item) => {
                const keyword = `${item.uuid?.trim()}${item.name?.trim()}${item.enabled ? "on" : "off"}`
                return keyword.toLowerCase().includes(searchValus.trim().toLowerCase())
            })
        }
        else {
            return []
        }
    }, [allItemQuery, searchValus])

    const openSettingsModal = () => {
        if (configQuery.isSuccess)
            modal.open(({ remove }) => (<SubSettingsModal remove={remove} config={configQuery.data} save={(config) => updateConfigMutation.mutateAsync(config)} />))
    }

    const openDetailModal = (item: Required<SubscriptionItemModel>) => {
        modal.open(({ remove }) => <DetailModal remove={remove} item={item} onSave={(item) => updateItemMutation.mutateAsync(item)} onDelete={(uuid) => deleteItemMutation.mutateAsync(uuid)} api={subscriptionApi} />)
    }
    const openAddModal = () => {
        modal.open(({ remove }) =>
            <FormModal
                title={"新增订阅"}
                item={{
                    enabled: true,
                    name: "",
                    expireAt: null,
                    usageLimit: null,
                    sort: null
                }} remove={remove} onSave={(item) => addItemMutation.mutateAsync(item)} />, { onMaskClick: () => { } })
    }

    return <AcitonCard className="w-full" acitonBarProps={{ title: "订阅", action: <ActionButtons /> }}>
        {configQuery.isLoading ?
            <IconText Icon={HourglassIcon} text="正在加载配置" color="primary" /> :
            configQuery.isError ?
                <IconText Icon={HourglassIcon} text="配置加载失败" color="primary" /> :
                !configQuery.data.enabled ?
                    <IconText Icon={PowerIcon} text="订阅功能已关闭" color="primary" /> :
                    allItemQuery.isLoading ?
                        <IconText Icon={HourglassIcon} text="正在加载订阅" color="primary" /> :
                        allItemQuery.isError ?
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
                                                        item.sort?.trim() ? `?sort=${item.sort?.trim()}` : ""
                                                    const link = `${window.location.origin}/api/${pluginId}/useSub/${item.uuid}${sort}`
                                                    return <div key={item.uuid} className="hover:bg-gray-100">
                                                        {index > 0 && <Divider />}
                                                        <div className="flex flex-row p-3 items-center" >
                                                            <Typography component={"div"} className="flex-1">
                                                                <div className="flex-1 grid grid-cols-[auto_auto_auto_1fr] gap-x-3 items-center">
                                                                    <div>名称</div>
                                                                    <div>:</div>
                                                                    <Typography color={item.enabled ? "primary" : "error"}>{item.name}</Typography>
                                                                    <div></div>
                                                                    <div>UUID</div>
                                                                    <div>:</div>
                                                                    <Typography className="wrap-anywhere">{item.uuid}</Typography>
                                                                    <div></div>
                                                                    <div >订阅</div>
                                                                    <div>:</div>
                                                                    <Typography onClick={e => e.stopPropagation()} component="a" href={link} target="_blank" rel="noreferrer" color="primary" sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                                        <p>{link}</p>
                                                                    </Typography>
                                                                    <div>
                                                                        <Tooltip title="复制订阅">
                                                                            <IconButton color="primary" onClick={async () => {
                                                                                try {
                                                                                    await navigator.clipboard.writeText(link)
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
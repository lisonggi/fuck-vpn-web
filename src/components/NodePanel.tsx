import { Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { NodeApi, type NodeTaskConfig } from "../api/NodeApi";
import { HourglassIcon, RefreshIcon, SettingsIcon } from "../assets/icons/Icons";
import { useModal } from "../hooks/useModal";
import { AcitonCard } from "./AcitonCard";
import { AppIconButton } from "./AppIconButton";
import { AppWindow } from "./AppWindow";
import { EmptyState } from "./EmptyState";
import { IconText } from "./IconText";
import { LoadingIconButtion } from "./LoadingIconButtion";

function SettingsModal({ config, remove, onSave }: { config: NodeTaskConfig, remove: () => void, onSave: (config: NodeTaskConfig) => Promise<void> }) {
    const [newConfig, setNewConfig] = useState<NodeTaskConfig>(config)
    const [saveLoading, setSaveLoading] = useState(false)
    const handelSave = () => {
        setSaveLoading(true)
        onSave(newConfig).then(() => {
            remove()
        }).finally(() => {
            setSaveLoading(false)
        })
    }
    const isChanges = useMemo(() => {
        return JSON.stringify(newConfig) !== JSON.stringify(config)
    }, [config, newConfig])

    return <AppWindow title="节点配置" closeWindow={{ onClose: () => remove(), disabled: saveLoading }}>
        <div className="p-3 min-w-80">
            <Typography sx={{ fontSize: "0.9rem" }}>开启时系统按照周期执行重新获取</Typography>
            <div className="flex flex-col gap-3">
                <FormControlLabel
                    control={<Switch disabled={saveLoading} checked={newConfig.autoRefresh} onChange={(event) => setNewConfig({ ...newConfig, autoRefresh: event.target.checked })} />}
                    label="自动更新"
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="更新周期(毫秒)"
                    type="number"
                    disabled={saveLoading || !newConfig.autoRefresh}
                    value={newConfig.delayMilliseconds}
                    slotProps={{
                        input: {
                            inputProps: {
                                step: 1000,
                                min: 0,
                            },
                        },
                    }}
                    onChange={(event) => setNewConfig({ ...newConfig, delayMilliseconds: Number(event.target.value) })}
                />
                <div className="flex gap-3 justify-end">
                    <Button disabled={!isChanges} loading={saveLoading} color="success" variant="contained" onClick={handelSave}>保存</Button>
                </div>
            </div>
        </div>
    </AppWindow>
}
export function NodePanel({ pluginId }: { pluginId: string }) {
    const modal = useModal()
    const nodeApi = NodeApi(pluginId)
    const prevGeneratingRef = useRef<boolean | undefined>(undefined);

    const stateQuery = useQuery({
        queryKey: ["nodeState", pluginId],
        queryFn: () => nodeApi.getNodeState(),
        refetchInterval: (data) => ((data?.generating ? 2000 : false)),
        onSuccess: (data) => {
            if (prevGeneratingRef.current && !data.generating) {
                dataQuery.refetch()
            }
            prevGeneratingRef.current = data.generating;
        }
    })

    const dataQuery = useQuery({
        queryKey: ["nodes", pluginId],
        queryFn: () => nodeApi.getNodes()
    })

    const updateNodeConfig = useMutation({
        mutationFn: (config: NodeTaskConfig) => nodeApi.updateNodeConfig(config),
        onSuccess: () => {
            stateQuery.refetch()
        }
    })

    const refreshNodes = useMutation({
        mutationFn: () => nodeApi.refreshNodes(),
        onSuccess: () => {
            stateQuery.refetch()
        }
    });

    const openSettingsModal = () => {
        if (stateQuery.isSuccess) {
            modal.open(({ remove }) => (<SettingsModal config={stateQuery.data.nodeTaskConfig} remove={remove} onSave={(config) => updateNodeConfig.mutateAsync(config)} />), {
                onMaskClick: () => { }
            })
        }
    }

    return <>
        <AcitonCard className="w-full" acitonBarProps={{
            title: "节点", action: stateQuery.isLoading ? <div>正在加载</div> : stateQuery.isError ? <div>加载失败</div> : <>
                <AppIconButton onClick={openSettingsModal} icon={SettingsIcon} tip="设置" />
                <LoadingIconButtion onClick={() => refreshNodes.mutateAsync()} loading={stateQuery.data.generating} icon={RefreshIcon} tip="重新获取" />
            </>
        }}>
            {dataQuery.isLoading ? <IconText Icon={HourglassIcon} text="正在加载" color="primary" /> : dataQuery.isError ? <IconText Icon={HourglassIcon} text="加载失败" color="primary" /> : dataQuery.data.length === 0 ? <EmptyState tip="没有数据" /> : <div>{dataQuery.data.map((value, index) => {
                return <div key={value}>
                    {index > 0 && <Divider />}
                    <Typography className="px-3 py-1 whitespace-pre-wrap">
                        {value}
                    </Typography>
                </div>
            })}
            </div>}
        </AcitonCard>
    </>
}
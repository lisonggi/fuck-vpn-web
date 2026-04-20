import { Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { KeyApi, type KeyConfig } from "../api/KeyApi";
import { HourglassIcon, RefreshIcon, SettingsIcon } from "../assets/icons/Icons";
import { useModal } from "../hooks/useModal";
import { AcitonCard } from "./AcitonCard";
import { AppIconButton } from "./AppIconButton";
import { AppWindow } from "./AppWindow";
import { EmptyState } from "./EmptyState";
import { IconText } from "./IconText";
import { LoadingIconButtion } from "./LoadingIconButtion";


function SettingsModal({ config, remove, onSave }: { config: KeyConfig, remove: () => void, onSave: (config: KeyConfig) => Promise<void> }) {
    const [newConfig, setNewConfig] = useState<KeyConfig>(config)
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
    return <AppWindow title="密钥配置" closeWindow={{ onClose: () => remove(), disabled: saveLoading }}>
        <div className="p-3 min-w-80">
            <Typography sx={{ fontSize: "0.9rem" }}>开启时密钥不足时系统将自动补充</Typography>
            <div className="flex flex-col gap-3">
                <FormControlLabel
                    control={<Switch disabled={saveLoading} checked={newConfig.autoFill} onChange={(event) => setNewConfig({ ...newConfig, autoFill: event.target.checked })} />}
                    label="自动补充"
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="密钥数量"
                    type="number"
                    disabled={saveLoading || !newConfig.autoFill}
                    value={newConfig.keySize}
                    slotProps={{
                        input: {
                            inputProps: {
                                step: 1,
                                min: 1,
                            },
                        },
                    }}
                    onChange={(event) => setNewConfig({ ...newConfig, keySize: Number(event.target.value) })}
                />
                <div className="flex gap-3 justify-end">
                    <Button disabled={!isChanges} loading={saveLoading} color="success" variant="contained" onClick={handelSave}>保存</Button>
                </div>
            </div>
        </div>
    </AppWindow >
}

export function KeyPanel({ pluginId }: { pluginId: string }) {
    const modal = useModal()
    const keyApi = KeyApi(pluginId)
    const prevGeneratingRef = useRef<boolean | undefined>(undefined);

    const stateQuery = useQuery({
        queryKey: ["keyState", pluginId],
        queryFn: () => keyApi.getKeyState(),
        refetchInterval: (data) => ((data?.checking ? 2000 : false)),
        onSuccess: (data) => {
            if (prevGeneratingRef.current && !data.checking) {
                dataQuery.refetch()
            }
            prevGeneratingRef.current = data.checking;
        }
    })

    const dataQuery = useQuery({
        queryKey: ["keys", pluginId],
        queryFn: () => keyApi.getKeys()
    })


    const updateKeyConfig = useMutation({
        mutationFn: (config: KeyConfig) => keyApi.updateKeyConfig(config),
        onSuccess: () => {
            stateQuery.refetch()
        }
    })

    const refreshKeys = useMutation({
        mutationFn: () => keyApi.refreshKeys(),
        onSuccess: () => {
            stateQuery.refetch()
        }
    });


    const openSettingsModal = () => {
        if (stateQuery.isSuccess) {
            modal.open(({ remove }) => (<SettingsModal config={stateQuery.data?.keyConfig} remove={remove} onSave={(config) => updateKeyConfig.mutateAsync(config)} />), {
                onMaskClick: () => { }
            })
        }
    }

    return <AcitonCard className="w-full" acitonBarProps={{
        title: "密钥", action: stateQuery.isLoading ? <div>正在加载</div> : stateQuery.isError ? <div>加载失败</div> : <>
            <AppIconButton onClick={openSettingsModal} icon={SettingsIcon} tip="设置" />
            <LoadingIconButtion onClick={() => refreshKeys.mutateAsync()} loading={stateQuery.data.checking} icon={RefreshIcon} tip="重新获取" />
        </>
    }}>
        {dataQuery.isLoading ?
            <IconText Icon={HourglassIcon} text="正在加载" color="primary" /> :
            dataQuery.isError ? <IconText Icon={HourglassIcon} text="加载失败" color="primary" /> :
                dataQuery.data.length === 0 ? <EmptyState tip="没有数据" /> :
                    <div>{dataQuery.data.map((value, index) => {
                        return <div key={value}>
                            {index > 0 && <Divider />}
                            <Typography className="px-3 py-1 whitespace-pre-wrap">
                                {value}
                            </Typography>
                        </div>
                    })}
                    </div>}
    </AcitonCard>

}
import { useRef, useState } from "react";
import { KeyApi, type KeyConfig } from "../api/KeyApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormControlLabel, Switch, TextField } from "@mui/material";
import { SaveAndCancel, type SaveCancelActionProps } from "./SaveAndCancel";
import { DataPanel } from "./DataPanel";
import { ConfigDialog } from "./ConfigDialog";


function KeySettingsDialog({ open, config, onConfigChange, saveCancelActionProps }: {
    open: boolean,
    config: KeyConfig,
    onConfigChange: (config: KeyConfig) => void,
    saveCancelActionProps: SaveCancelActionProps
}) {
    
    return <ConfigDialog onClose={saveCancelActionProps.onCancel} open={open} title="密钥设置" action={<SaveAndCancel {...saveCancelActionProps} />} className="min-w-80">
        <FormControlLabel
            control={<Switch checked={config.autoFill} onChange={(event) => onConfigChange({ ...config, autoFill: event.target.checked })} />}
            label="自动补充"
        />
        <TextField
            fullWidth
            margin="dense"
            label="自动补充密钥数量"
            type="number"
            value={config.keySize}
            onChange={(event) => onConfigChange({ ...config, keySize: Number(event.target.value) || 0 })}
            helperText="开启时系统自动保持指定数量的密钥可用。"
        />
    </ConfigDialog>

}

export function KeyPanel({ pluginId }: { pluginId: string }) {
    const keyApi = KeyApi(pluginId)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [keyConfig, setKeyConfig] = useState<KeyConfig>({ autoFill: false, keySize: 0 })
    const prevGeneratingRef = useRef<boolean | undefined>(undefined);
    const { data: keys, refetch: keysRefetch } = useQuery({
        queryKey: ["keys", pluginId],
        queryFn: () => keyApi.getKeys()
    })
    const { data: keyState, refetch: keyStateRefetch } = useQuery({
        queryKey: ["keyState", pluginId],
        queryFn: () => keyApi.getKeyState(),
        refetchInterval: (data) => ((data?.checking ? 2000 : false)),
        onSuccess: (data) => {
            if (prevGeneratingRef.current && !data.checking) {
                keysRefetch();
            }
            prevGeneratingRef.current = data.checking;
        }
    })

    const updateKeyConfig = useMutation({
        mutationFn: (config: KeyConfig) => keyApi.updateKeyConfig(config),
        onSuccess: () => {
            keyStateRefetch()
            setSettingsOpen(keyState?.keyConfig.autoFill ?? false)
        }
    })

    const refreshKeys = useMutation({
        mutationFn: () => keyApi.refreshKeys(),
        onSuccess: () => {
            keyStateRefetch()
        }
    });

    const openSettings = () => {
        setKeyConfig(keyState?.keyConfig ?? { autoFill: false, keySize: 0 })
        setSettingsOpen(true)
    }

    return <>
        <DataPanel title="密钥" data={keys} actionButtonGroupProps={{ onSettingsClick: openSettings, onRefreshClick: refreshKeys.mutateAsync, loading: keyState?.checking }} />
        <KeySettingsDialog
            open={settingsOpen}
            config={keyConfig}
            onConfigChange={setKeyConfig}
            saveCancelActionProps={{ onSave: () => updateKeyConfig.mutateAsync(keyConfig), onCancel: () => setSettingsOpen(false) }}
        />
    </>
}
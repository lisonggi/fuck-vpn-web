import { useRef, useState } from "react";
import { NodeApi, type NodeTaskConfig } from "../api/NodeApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataPanel } from "./DataPanel";
import { SaveAndCancel, type SaveCancelActionProps } from "./SaveAndCancel";
import { ConfigDialog } from "./ConfigDialog";
import { FormControlLabel, Switch, TextField } from "@mui/material";
function NodeSettingsDialog({ open, config, onConfigChange, saveCancelActionProps }: {
    open: boolean,
    config: NodeTaskConfig,
    onConfigChange: (config: NodeTaskConfig) => void,
    saveCancelActionProps: SaveCancelActionProps
}) {
    return <ConfigDialog onClose={saveCancelActionProps.onCancel} open={open} title="节点设置" action={<SaveAndCancel {...saveCancelActionProps} />} className="min-w-80">
        <FormControlLabel
            control={<Switch checked={config.autoRefresh} onChange={(event) => onConfigChange({ ...config, autoRefresh: event.target.checked })} />}
            label="自动刷新"
        />
        <TextField
            fullWidth
            margin="dense"
            label="刷新间隔（毫秒）"
            type="number"
            value={config.delayMilliseconds}
            slotProps={{
                input: {
                    inputProps: {
                        step: 1000,
                        min: 0,
                    },
                },
            }}
            onChange={(event) => onConfigChange({ ...config, delayMilliseconds: Number(event.target.value) || 0 })}
            helperText="开启时系统自动以指定的时间间隔重新获取节点"
        />
    </ConfigDialog>
}
export function NodePanel({ pluginId }: { pluginId: string }) {
    const nodeApi = NodeApi(pluginId)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [nodeConfig, setNodeConfig] = useState<NodeTaskConfig>({ autoRefresh: false, delayMilliseconds: 0 })
    const prevGeneratingRef = useRef<boolean | undefined>(undefined);
    const { data: nodes, refetch: nodesRefetch } = useQuery({
        queryKey: ["nodes", pluginId],
        queryFn: () => nodeApi.getNodes()
    })
    const { data: nodeState, refetch: nodeStateRefetch } = useQuery({
        queryKey: ["nodeState", pluginId],
        queryFn: () => nodeApi.getNodeState(),
        refetchInterval: (data) => ((data?.generating ? 2000 : false)),
        onSuccess: (data) => {
            if (prevGeneratingRef.current && !data.generating) {
                nodesRefetch();
            }
            prevGeneratingRef.current = data.generating;
        }
    })

    const updateNodeConfig = useMutation({
        mutationFn: (config: NodeTaskConfig) => nodeApi.updateNodeConfig(config),
        onSuccess: () => {
            nodeStateRefetch()
            setSettingsOpen(false)
        }
    })

    const refreshNodes = useMutation({
        mutationFn: () => nodeApi.refreshNodes(),
        onSuccess: () => {
            nodeStateRefetch()
        }
    });

    const openSettings = () => {
        setNodeConfig(nodeState?.nodeTaskConfig ?? { autoRefresh: false, delayMilliseconds: 0 })
        setSettingsOpen(true)
    }

    return <>
        <DataPanel title="节点" data={nodes} actionButtonGroupProps={{ onSettingsClick: openSettings, onRefreshClick: refreshNodes.mutateAsync, loading: nodeState?.generating }} />
        <NodeSettingsDialog
            open={settingsOpen}
            config={nodeConfig}
            onConfigChange={setNodeConfig}
            saveCancelActionProps={{ onSave: () => updateNodeConfig.mutateAsync(nodeConfig), onCancel: () => setSettingsOpen(false) }}
        />
    </>
}
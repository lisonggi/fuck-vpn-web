import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, Switch, TextField, Tooltip, Typography, useTheme } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useMemo, useRef, useState, type ReactNode } from "react"
import { useOutletContext, useParams } from "react-router"

import { KeyApi, type KeyConfig } from "../api/KeyApi"
import { NodeApi, type NodeTaskConfig } from "../api/NodeApi"
import type { PluginInfo } from "../api/PluginApi"
import { SubApi, type SubConfig, type SubRecord, type Subscription } from "../api/SubApi"
import AddIcon from "../assets/icons/AddIcon"
import DefaultIcon from "../assets/icons/DefaultIcon"
import DeleteIcon from "../assets/icons/DeleteIcon"
import HourglassIcon from "../assets/icons/HourglassIcon"
import RefreshIcon from "../assets/icons/RefreshIcon"
import SettingsIcon from "../assets/icons/SettingsIcon"
import { AppCard } from "../components/AppCard"
import { AppTitleBar } from "../components/AppTitleBar"
import { EmptyState } from "../components/EmptyState"
import { IconText } from "../components/IconText"
import { LoadingIconButtion } from "../components/LoadingIconButtion"


const defaultNodeConfig = { autoRefresh: false, delayMilliseconds: 0 } as const
const defaultKeyConfig = { autoFill: false, keySize: 0 } as const

function DataList({ items }: { items: string[] }) {
    return <div>{items?.map((value, index) => {
        return <div key={value}>
            {index > 0 && <Divider />}
            <Typography className="px-3 py-1 whitespace-pre-wrap">
                {value}
            </Typography>
        </div>
    })}
    </div>
}


interface PanelActionProps {
    onSettingsClick?: () => void | Promise<void>
    onRefreshClick?: () => void | Promise<void>
    loading?: boolean
}

function PanelActionButtons({ onSettingsClick = async () => { }, onRefreshClick = async () => { }, loading }: PanelActionProps) {
    const theme = useTheme()
    return <>
        <LoadingIconButtion onClick={onSettingsClick} Icon={SettingsIcon} color={theme.palette.primary.contrastText} tip="设置" />
        <LoadingIconButtion onClick={onRefreshClick} loading={loading} Icon={RefreshIcon} color={theme.palette.primary.contrastText} tip="重新获取" />
    </>
}
function DataPanel({ title, data, actionButtonGroupProps }: { title: string, data?: string[], actionButtonGroupProps?: PanelActionProps }) {
    return <AppCard className="min-w-80" title={title} actionCompose={<PanelActionButtons onSettingsClick={actionButtonGroupProps?.onSettingsClick} onRefreshClick={actionButtonGroupProps?.onRefreshClick} loading={actionButtonGroupProps?.loading} />}>
        {!data ? <IconText Icon={HourglassIcon} text="正在加载" color="primary" /> : data?.length === 0 ? <EmptyState tip="没有数据" /> :
            <DataList items={data} />}
    </AppCard>
}

interface ConfigDialogProps {
    open: boolean
    title: string
    children: ReactNode
    action?: ReactNode
}

function ConfigDialog({ open, title, children, action, className }: ConfigDialogProps & { className?: string }) {
    return <Dialog open={open}>
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}>{title}</DialogTitle>
        <DialogContent className={`p-3 ${className || ''}`}>{children}</DialogContent>
        <DialogActions>
            {action}
        </DialogActions>
    </Dialog>
}
interface SaveCancelActionProps {
    onSave: () => Promise<void>
    onCancel: () => void
}
interface SaveCancelDeleteActionProps extends SaveCancelActionProps {
    onDelete?: () => Promise<void>
}
function SaveAndCancel({ onSave, onCancel }: SaveCancelActionProps) {
    const [isLoading, setIsLoading] = useState(false)
    function handleSave() {
        setIsLoading(true)
        onSave().finally(() => setIsLoading(false))
    }
    return (
        <>
            <Button onClick={onCancel} disabled={isLoading}>取消</Button>
            <Button loading={isLoading} variant="contained" onClick={handleSave} disabled={isLoading}>
                保存
            </Button>
        </>
    )
}
function SaveCancelDelete({ onSave, onCancel, onDelete }: SaveCancelDeleteActionProps) {
    const [isLoading, setIsLoading] = useState(false)
    function handleSave() {
        setIsLoading(true)
        onSave().finally(() => setIsLoading(false))
    }
    return (
        <>
            <button></button>
            {onDelete && (
                <Button color="error" variant="contained" onClick={onDelete} disabled={isLoading}>
                    删除
                </Button>
            )}
            <Button color="success" loading={isLoading} variant="contained" onClick={handleSave} disabled={isLoading}>
                保存
            </Button>
            <Button onClick={onCancel} variant="contained" disabled={isLoading}>取消</Button>
        </>
    )
}
function NodeSettingsDialog({ open, config, onConfigChange, saveCancelActionProps }: {
    open: boolean,
    onClose: () => void,
    config: NodeTaskConfig,
    onConfigChange: (config: NodeTaskConfig) => void,
    saveCancelActionProps: SaveCancelActionProps
}) {
    return <ConfigDialog open={open} title="节点设置" action={<SaveAndCancel {...saveCancelActionProps} />}>
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

function KeySettingsDialog({ open, config, onConfigChange, saveCancelActionProps }: {
    open: boolean,
    onClose: () => void,
    config: KeyConfig,
    onConfigChange: (config: KeyConfig) => void,
    saveCancelActionProps: SaveCancelActionProps
}) {
    return <ConfigDialog open={open} title="密钥设置" action={<SaveAndCancel {...saveCancelActionProps} />}>
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

function NodePanel({ pluginId }: { pluginId: string }) {
    const nodeApi = NodeApi(pluginId)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [nodeConfig, setNodeConfig] = useState<NodeTaskConfig>(defaultNodeConfig)
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
        setNodeConfig(nodeState?.nodeTaskConfig ?? defaultNodeConfig)
        setSettingsOpen(true)
    }

    return <>
        <DataPanel title="节点" data={nodes} actionButtonGroupProps={{ onSettingsClick: openSettings, onRefreshClick: refreshNodes.mutateAsync, loading: nodeState?.generating }} />
        <NodeSettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            config={nodeConfig}
            onConfigChange={setNodeConfig}
            saveCancelActionProps={{ onSave: () => updateNodeConfig.mutateAsync(nodeConfig), onCancel: () => setSettingsOpen(false) }}
        />
    </>
}
function KeyPanel({ pluginId }: { pluginId: string }) {
    const keyApi = KeyApi(pluginId)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [keyConfig, setKeyConfig] = useState<KeyConfig>(defaultKeyConfig)
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
        setKeyConfig(keyState?.keyConfig ?? defaultKeyConfig)
        setSettingsOpen(true)
    }

    return <>
        <DataPanel title="密钥" data={keys} actionButtonGroupProps={{ onSettingsClick: openSettings, onRefreshClick: refreshKeys.mutateAsync, loading: keyState?.checking }} />
        <KeySettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            config={keyConfig}
            onConfigChange={setKeyConfig}
            saveCancelActionProps={{ onSave: () => updateKeyConfig.mutateAsync(keyConfig), onCancel: () => setSettingsOpen(false) }}
        />
    </>
}
type SubForm = {
    name: string
    enabled: boolean
    expireAt: string
    usageLimit: string
}

const defaultSubForm: SubForm = {
    name: "",
    enabled: false,
    expireAt: "",
    usageLimit: ""
}

function convertSubForm(form: SubForm) {
    return {
        name: form.name || undefined,
        enabled: form.enabled,
        expireAt: form.expireAt ? new Date(form.expireAt).toISOString() : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null
    }
}

function toLocalDateTime(value?: string | null) {
    if (!value) {
        return ""
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return ""
    }
    return date.toISOString().slice(0, 16)
}

function getUseSubApiUrl(pluginId: string, uuid: string) {
    return `${window.location.protocol}//${window.location.hostname}:8080/api/${pluginId}/useSub/${uuid}`
}

function SubManageDialog({ open, form, onFormChange, title, saveCancelDeleteProps }: {
    open: boolean
    onClose: () => void
    form: SubForm
    onFormChange: (form: SubForm) => void
    title: string
    saveCancelDeleteProps: SaveCancelDeleteActionProps
}) {
    return <ConfigDialog
        open={open}
        title={title}
        action={<SaveCancelDelete {...saveCancelDeleteProps} />}
    >
        <TextField
            fullWidth
            margin="dense"
            label="订阅名称"
            value={form.name}
            onChange={(event) => onFormChange({ ...form, name: event.target.value })}
        />
        <FormControlLabel
            control={<Switch checked={form.enabled} onChange={(event) => onFormChange({ ...form, enabled: event.target.checked })} />}
            label="启用此订阅"
        />
        <TextField
            fullWidth
            id="sub-expireAt"
            type="datetime-local"
            value={form.expireAt}
            onChange={(event) => onFormChange({ ...form, expireAt: event.target.value })}
            helperText="可选，留空表示无限期。"
        />
        <TextField
            fullWidth
            margin="dense"
            label="使用上限"
            type="number"
            value={form.usageLimit}
            onChange={(event) => onFormChange({ ...form, usageLimit: event.target.value })}
            helperText="可选，留空表示不限制。"
        />
    </ConfigDialog>
}


function SubRecordsDialog({
    open,
    onClose,
    records,
}: {
    open: boolean
    onClose: () => void
    records: SubRecord[]
}) {
    const [keyword, setKeyword] = useState("")
    const [tab, setTab] = useState<"list" | "rank">("list")

    const total = records.length

    const filtered = useMemo(() => {
        if (!keyword.trim()) {
            return records
        }
        const lowerKeyword = keyword.trim().toLowerCase()
        return records.filter(r => r.ip.toLowerCase().includes(lowerKeyword))
    }, [records, keyword])

    const rank = useMemo(() => {
        const map = new Map<string, number>()
        records.forEach(r => {
            map.set(r.ip, (map.get(r.ip) ?? 0) + 1)
        })
        return [...map.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([ip, count]) => ({ ip, count }))
    }, [records])

    const isEmpty = total === 0

    const clearKeyword = () => setKeyword("")

    return (
        <ConfigDialog
            key={open ? "SubRecordsDialog-open" : "SubRecordsDialog-closed"}
            open={open}
            title="订阅访问记录"
            action={<Button onClick={onClose}>关闭</Button>}
            className="min-w-90"
        >
            <Box className="flex flex-col gap-3">
                {isEmpty ? (
                    <EmptyState tip="暂无访问记录" className="py-8" />
                ) : (
                    <>
                        <Box className="flex flex-col gap-2">
                            <Typography color="text.secondary">总访问次数：{total}</Typography>
                            <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-1">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="搜索 IP 或直接点击排行过滤"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        slotProps={{
                                            input: {
                                                endAdornment:
                                                    <IconButton disabled={!keyword} size="small" onClick={clearKeyword}>
                                                        <DeleteIcon color={keyword ? "primary" : "inherit"} />
                                                    </IconButton>
                                                ,
                                            },
                                        }}
                                    />
                                </Box>
                                <Box className="flex gap-2">
                                    <Button
                                        variant={tab === "list" ? "contained" : "outlined"}
                                        onClick={() => setTab("list")}
                                    >
                                        记录
                                    </Button>
                                    <Button

                                        variant={tab === "rank" ? "contained" : "outlined"}
                                        onClick={() => setTab("rank")}
                                    >
                                        排行
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        {tab === "list" ? (
                            filtered.length === 0 ? (
                                <EmptyState tip={keyword ? "没有匹配该 IP 的访问记录" : "没有访问记录"} />
                            ) : (
                                <Box className="flex flex-col gap-2 max-h-90 overflow-y-auto">
                                    {[...filtered]
                                        .sort((a, b) => b.time - a.time)
                                        .map((r, index) => (
                                            <Box
                                                key={`${r.ip}-${r.time}-${index}`}
                                                className="flex flex-wrap justify-between items-center gap-2 border rounded px-3 py-3 hover:bg-gray-50 transition"
                                            >
                                                <Box className="min-w-0 flex-1">
                                                    <Typography noWrap variant="body1" sx={{ fontWeight: 600 }}>{r.ip}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(r.time).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Tooltip title="复制 IP">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={async () => await navigator.clipboard.writeText(r.ip)}
                                                    >
                                                        复制
                                                    </Button>
                                                </Tooltip>
                                            </Box>
                                        ))}
                                </Box>
                            )
                        ) : (
                            <Box className="flex flex-col gap-2 max-h-90 overflow-y-auto">
                                {rank.map((item, index) => (
                                    <Box
                                        key={item.ip}
                                        className="flex flex-wrap justify-between items-center gap-2 border rounded px-3 py-3 hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => {
                                            setKeyword(item.ip)
                                            setTab("list")
                                        }}
                                    >
                                        <Box className="flex items-center gap-3 min-w-0 flex-1">
                                            <Typography
                                                className={
                                                    index === 0
                                                        ? "text-red-500 font-bold"
                                                        : index < 3
                                                            ? "text-orange-500"
                                                            : ""
                                                }
                                            >
                                                #{index + 1}
                                            </Typography>
                                            <Typography noWrap variant="body1" sx={{ fontWeight: 600 }}>{item.ip}</Typography>
                                        </Box>
                                        <Typography color="text.secondary">{item.count} 次</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </ConfigDialog>
    )
}

function SubPanel({ pluginId }: { pluginId: string }) {

    const theme = useTheme()
    const borderRadius = (Number(theme.shape.borderRadius) * 2) + "px"
    const subApi = SubApi(pluginId)
    const [manageOpen, setManageOpen] = useState(false)
    const [recordsOpen, setRecordsOpen] = useState(false)
    const [editUuid, setEditUuid] = useState<string | null>(null)
    const [subForm, setSubForm] = useState<SubForm>(defaultSubForm)
    const [records, setRecords] = useState<SubRecord[]>([])

    const { data: subConfig, refetch: refetchSubConfig, isLoading: subConfigLoading } = useQuery({
        queryKey: ["subConfig", pluginId],
        queryFn: () => subApi.getSubConfig()
    })

    const { data: subs, refetch: refetchAllSub } = useQuery({
        queryKey: ["subs", pluginId],
        queryFn: () => subApi.getAllSub(), enabled: subConfig?.enabled === true
    })

    const updateSubConfigMutation = useMutation({
        mutationFn: (config: SubConfig) => subApi.updateSubConfig(config),
        onSuccess: () => {
            refetchSubConfig()
        }
    })

    const addSubMutation = useMutation({
        mutationFn: (request: ReturnType<typeof convertSubForm>) => subApi.addSub(request),
        onSuccess: () => {
            refetchAllSub()
            setManageOpen(false)
        }
    })

    const updateSubMutation = useMutation({
        mutationFn: ({ uuid, request }: { uuid: string, request: ReturnType<typeof convertSubForm> }) => subApi.updateSub(uuid, request),
        onSuccess: () => {
            refetchAllSub()
            setManageOpen(false)
        }
    })

    const removeSubMutation = useMutation({
        mutationFn: (uuid: string) => subApi.removeSub(uuid),
        onSuccess: () => {
            refetchAllSub()
        }
    })

    const getRecordsMutation = useMutation({
        mutationFn: (uuid: string) => subApi.getRecords(uuid),
        onSuccess: (result) => {
            setRecords(result ?? [])
            setRecordsOpen(true)
        }
    })

    const handleOpenAdd = () => {
        setEditUuid(null)
        setSubForm(defaultSubForm)
        setManageOpen(true)
    }

    const handleToggleEnabled = async (enabled: boolean) => {
        await updateSubConfigMutation.mutateAsync({ enabled })
    }

    const handleOpenEdit = (uuid: string, subscription: Subscription) => {
        setEditUuid(uuid)
        setSubForm({
            name: subscription.name ?? "",
            enabled: subscription.enabled,
            expireAt: toLocalDateTime(subscription.expireAt),
            usageLimit: subscription.usageLimit?.toString() ?? ""
        })
        setManageOpen(true)
    }

    const handleSaveSubscription = async () => {
        const request = convertSubForm(subForm)
        if (editUuid) {
            await updateSubMutation.mutateAsync({ uuid: editUuid, request })
        } else {
            await addSubMutation.mutateAsync(request)
        }
    }

    const handleRemoveSubscription = async () => {
        if (!editUuid) {
            return
        }
        await removeSubMutation.mutateAsync(editUuid)
        setManageOpen(false)
    }

    const subItems = subs ? Object.entries(subs).map(([uuid, subscription]) => ({ uuid, subscription })) : []
    const subEnabled = subConfig?.enabled ?? false
    const loading = subConfigLoading

    return <Box className="min-w-80" sx={{ borderBlockColor: "divider", borderRadius: borderRadius, boxShadow: theme.shadows[1] }}>
        <AppTitleBar title="订阅" boxSx={{
            borderTopRightRadius: borderRadius,
            borderTopLeftRadius: borderRadius,
        }} actionCompose={<Box className="flex items-center gap-1">
            {subEnabled && <LoadingIconButtion onClick={handleOpenAdd} Icon={AddIcon} color={theme.palette.primary.contrastText} tip="新增订阅" />}
            <Switch
                checked={subEnabled}
                onChange={(event) => void handleToggleEnabled(event.target.checked)}
                disabled={subConfigLoading || updateSubConfigMutation.isLoading}
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
        <Box className="p-3 flex flex-col gap-3">
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
                            <Button size="small" variant="outlined" onClick={() => getRecordsMutation.mutateAsync(uuid)} disabled={!subEnabled || getRecordsMutation.isLoading}>记录</Button>
                            <Button size="small" variant="outlined" onClick={() => handleOpenEdit(uuid, subscription)} disabled={!subEnabled}>编辑</Button>
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
        <SubManageDialog
            open={manageOpen}
            onClose={() => setManageOpen(false)}
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
    </Box>
}

export function PluginPage() {
    const pluginId = useParams().pluginId!
    const pluginInfo: PluginInfo = useOutletContext()

    return <div className="p-3 flex flex-col gap-3">
        <div className={pluginInfo.keyService ? "grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 items-start" : ""}>
            <NodePanel pluginId={pluginId} />
            {
                pluginInfo.keyService && <KeyPanel pluginId={pluginId} />
            }
        </div>
        <SubPanel pluginId={pluginId} />
    </div>
}
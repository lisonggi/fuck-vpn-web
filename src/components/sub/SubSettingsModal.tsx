import { Button, FormControlLabel, Switch, TextField, Typography } from "@mui/material"
import { useMemo, useState } from "react"
import { AcitonWindow } from "../common/AcitonWindow"
import type { SubscriptionConfigModel } from "../../api/SubscriptionApi"

export function SubSettingsModal({ remove, config, save }: { remove: () => void, config: SubscriptionConfigModel, save: (config: SubscriptionConfigModel) => Promise<SubscriptionConfigModel> }) {
    const [newConfig, setNewConfig] = useState<SubscriptionConfigModel>(config)
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
    return <AcitonWindow title="订阅设置" closeWindow={{ onClose: () => remove(), disabled: saveLoading }}>
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
                label="成功提示"
                type="text"
                disabled={saveLoading}
                value={newConfig.successTip ?? ""}
                onChange={(event) => {
                    setNewConfig((prev => ({
                        ...prev,
                        successTip: event.target.value.trim() || null
                    })))
                }}
                placeholder="无需提示请留空" />
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
    </AcitonWindow >
}
import { Button } from "@mui/material"
import { useState } from "react"

export interface SaveCancelDeleteActionProps extends SaveCancelActionProps {
    onDelete?: () => Promise<void>
}
export interface SaveCancelActionProps {
    onSave: () => Promise<void>
    onCancel: () => void
}
export function SaveAndCancel({ onSave, onCancel }: SaveCancelActionProps) {
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
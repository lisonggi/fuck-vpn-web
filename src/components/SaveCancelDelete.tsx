import { useState } from "react"
import type { SaveCancelDeleteActionProps } from "./SaveAndCancel"
import { Button } from "@mui/material"

export function SaveCancelDelete({ onSave, onCancel, onDelete }: SaveCancelDeleteActionProps) {
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
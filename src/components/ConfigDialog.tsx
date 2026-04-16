import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import type { ReactNode } from "react"

export interface ConfigDialogProps {
    open: boolean
    title: string
    children: ReactNode
    action?: ReactNode
    onClose: () => void
}

export function ConfigDialog({ open, title, children, action, className, onClose }: ConfigDialogProps & { className?: string }) {
    return (
        <Dialog
            open={open}
            className={className}
            onClose={onClose}
        >
            <DialogTitle
                sx={{
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    flexShrink: 0,
                }}
            >
                {title}
            </DialogTitle>

            <DialogContent className="p-3">
                {children}
            </DialogContent>

            <DialogActions >
                {action}
            </DialogActions>
        </Dialog >
    )
}
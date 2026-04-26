import { type SxProps, Box, Typography, useTheme } from "@mui/material"
import type { ReactNode } from "react"

export interface AcitonBarProps {
    title: ReactNode | string
    menu?: ReactNode
    className?: string
    sx?: SxProps
    action?: ReactNode
}

export function ActionBar({ title, menu, className, sx, action }: AcitonBarProps) {
    const theme = useTheme()
    return <Box className={`p-2 flex gap-3 items-center ${className}`} sx={{ backgroundColor: theme.palette.primary.main, boxShadow: theme.shadows[3], ...sx }}>
        {menu && <div>{menu}</div>}
        <div className="flex-1">
            {typeof title === "string" ? <Typography sx={{ color: theme.palette.primary.contrastText, fontSize: "1.2rem" }}>{title}</Typography> : title}
        </div>
        {action && <div>{action}</div>}
    </Box>
}
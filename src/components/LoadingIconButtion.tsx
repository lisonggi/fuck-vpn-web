import { CircularProgress, IconButton, Tooltip, useTheme } from "@mui/material";
import { type ElementType } from "react";
import { DefaultIcon } from "../assets/icons/Icons";

export function LoadingIconButtion({ Icon = DefaultIcon, color, size = "24px", loading = false, onClick = async () => { }, tip = "tip" }: { Icon?: ElementType, color?: string, size?: string, loading?: boolean, onClick?: () => void | Promise<void>, tip?: string }) {
    const theme = useTheme()
    return <Tooltip title={tip}>
        <span>
            <IconButton disabled={loading} sx={{ color: color ?? theme.palette.primary.contrastText }} onClick={onClick}>
                {!loading ? <Icon sx={{ size: size }} /> : <CircularProgress sx={{ color: color ?? theme.palette.primary.contrastText }} size={size} aria-label="Loading…" />}
            </IconButton>
        </span>
    </Tooltip>
}
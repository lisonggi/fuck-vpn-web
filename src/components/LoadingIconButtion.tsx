import { CircularProgress, IconButton, Tooltip, useTheme } from "@mui/material";
import { type ElementType } from "react";
import DefaultIcon from "../assets/icons/DefaultIcon";

export function LoadingIconButtion({ Icon = DefaultIcon, color = undefined, size = "24px", loading = false, onClick = async () => { }, tip = "tip" }: { Icon?: ElementType, color?: string, size?: string, loading?: boolean, onClick?: () => void | Promise<void>, tip?: string }) {
    const theme = useTheme()
    const c = color ?? theme.palette.primary.main;

    return <Tooltip title={tip}>
        <IconButton disabled={loading} sx={{ color: c }} onClick={onClick}>
            {!loading ? <Icon sx={{ size: size }} /> : <CircularProgress sx={{ color: c }} size={size} aria-label="Loading…" />}
        </IconButton>
    </Tooltip>
}
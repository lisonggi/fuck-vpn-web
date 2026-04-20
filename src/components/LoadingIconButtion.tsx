import { CircularProgress } from "@mui/material";
import { useState } from "react";
import { AppIconButton, type AppIconButtonProps } from "./AppIconButton";


export function LoadingIconButtion({ onClick, loading: controlledLoading, iconSize = "24px", sx, ...props }: AppIconButtonProps & { onClick?: () => Promise<void>, loading?: boolean, iconSize?: string }) {
    const [innerLoading, setInnerLoading] = useState(false)

    const loading =
        controlledLoading !== undefined
            ? controlledLoading
            : innerLoading

    const handleClick = () => {
        if (onClick) {
            setInnerLoading(true)
            onClick().finally(() => { setInnerLoading(false) })
        }
    }
    return <AppIconButton {...props} disabled={loading} onClick={() => handleClick()} sx={{ fontSize: iconSize, ...sx }} icon={!loading ? props.icon : <CircularProgress size={iconSize} sx={{ color: "inherit" }} aria-label="Loading…" />} />
}
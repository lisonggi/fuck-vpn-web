import { Box, Typography } from "@mui/material";
import { useTheme, type SxProps } from "@mui/material/styles";
import * as React from "react";

export interface AppTitleBarProps {
    title: string,
    menuCompose?: React.ReactElement
    actionCompose?: React.ReactElement
    textSx?: SxProps
    boxSx?: SxProps
    className?: string
}

function AppTitleBar({ title, menuCompose, actionCompose, textSx, boxSx, className }:
    AppTitleBarProps) {
    const theme = useTheme()
    return <Box className="flex p-2 items-center z-1" sx={{ backgroundColor: "primary.main", boxShadow:theme.shadows[3], ...boxSx }}>
        {menuCompose}
        <Typography className={className} sx={{ fontSize: 20, color: "primary.contrastText", ...textSx }}>
            {title}
        </Typography>
        <div className={"ml-auto"}> {actionCompose}</div>
    </Box>
}

export { AppTitleBar };


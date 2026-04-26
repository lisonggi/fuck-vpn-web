import { Box, useTheme, type SxProps } from "@mui/material";
import type { ReactNode } from "react";

export function AppCard({ children = <div>this is card</div>, sx, className }: { children: ReactNode, sx?: SxProps, className?: string }) {
    const theme = useTheme()
    const borderRadius = (Number(theme.shape.borderRadius) * 2) + "px"
    return <Box className={className} sx={{ overflow: "auto", borderBlockColor: "divider", borderRadius: borderRadius, width: "fit-content", boxShadow: theme.shadows[1], ...sx }}>
        <div className="size-full">{children}</div>
    </Box>
}
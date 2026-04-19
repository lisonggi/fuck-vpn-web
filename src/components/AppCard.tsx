import { Box, useTheme } from "@mui/material"
import { AppTitleBar } from "./AppTitleBar"

export function AppCard({ title = "title", actionCompose, children, className, titleClassName }: { title?: string, actionCompose?: React.ReactElement, children?: React.ReactNode, className?: string, titleClassName?: string }) {
    const theme = useTheme()
    const borderRadius = (Number(theme.shape.borderRadius) * 2) + "px"
    return <Box className={className} sx={{ borderBlockColor: "divider", borderRadius: borderRadius, boxShadow: theme.shadows[1] }}>
        <AppTitleBar title={title} className={titleClassName} boxSx={{
            borderTopRightRadius: borderRadius,
            borderTopLeftRadius: borderRadius,
        }} actionCompose={actionCompose} />
        <Box sx={{
            backgroundColor: "background.paper",
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
        }}>
            {children}
        </Box>
    </Box>
}
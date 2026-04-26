import type { ReactNode } from "react"
import { ActionBar, type AcitonBarProps } from "./ActionBar"
import { AppCard } from "./AppCard"
import { Box } from "@mui/material"

export function AcitonCard({ acitonBarProps, children, className }: {
    acitonBarProps: AcitonBarProps
    children: ReactNode
    className?: string
}) {
    return <AppCard className={className}>
        <div className="size-full min-w-fit flex flex-col">
            <ActionBar {...acitonBarProps} />
            <Box className="flex-1 overflow-auto" sx={{ backgroundColor: "background.paper", }}>
                {children}
            </Box>
        </div>
    </AppCard>
}
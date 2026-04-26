import { IconButton, Tooltip, useTheme, type IconButtonProps } from "@mui/material";
import { isValidElement, type ElementType, type ReactNode } from "react";
import { DefaultIcon } from "../../assets/icons/Icons";

export type AppIconButtonProps = {
    icon?: ElementType | ReactNode
    tip?: string
} & IconButtonProps

export function AppIconButton({ icon: Icon = DefaultIcon, tip, sx, ...props }: AppIconButtonProps) {
    const theme = useTheme()
    const renderIcon = () => {
        if (isValidElement(Icon)) return Icon
        const IconComp = Icon as ElementType
        return <IconComp fontSize="inherit" />
    }
    return <Tooltip title={tip}>
        <span>
            <IconButton
                {...props}
                sx={{ color: theme.palette.primary.contrastText, ...sx }} >
                {renderIcon()}
            </IconButton>
        </span>
    </Tooltip>
}
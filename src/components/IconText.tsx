import { Typography, type SvgIconProps } from "@mui/material";
import type { ElementType } from "react";

export function IconText({ Icon, text, color="primary" , className }: { Icon: ElementType, text: string, color?: SvgIconProps['color'], className?: string }) {
    return <div className={`flex flex-col justify-center items-center gap-3 p-3 ${className || ''}`}>
        <Icon color={color} sx={{ fontSize: "3rem" }} />
        <Typography color={color} sx={{ fontSize: "1rem" }}>{text}</Typography>
    </div>
}
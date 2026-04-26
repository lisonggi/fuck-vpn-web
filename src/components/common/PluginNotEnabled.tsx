import { Button } from "@mui/material";
import { useState } from "react";
import { FlashOffIcon } from "../../assets/icons/Icons";

export function PluginNotEnabled({ onEnabledClick }: { onEnabledClick: () => Promise<unknown> }) {
    const [loading, setLoading] = useState(false)
    async function handleClick() {
        setLoading(true)
        try {
            await onEnabledClick()
        }
        finally {
            setLoading(false)
        }
    }

    return (<div className={"h-full flex-col flex justify-center items-center gap-5"}>
        <FlashOffIcon sx={{ color: "primary.main", fontSize: "7rem" }} />
        <Button loading={loading} onClick={handleClick} disabled={loading} variant="contained">
            启用此插件
        </Button>
    </div>)
}
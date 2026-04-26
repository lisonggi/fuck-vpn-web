import { useOutletContext, useParams } from "react-router"

import type { PluginConfigResponse } from "../api/PluginApi"
import { KeyPanel } from "../components/KeyPanel"
import { NodePanel } from "../components/NodePanel"
import { SubPanel } from "../components/sub/SubPanel"



export function PluginPage() {
    const pluginId = useParams().pluginId!
    const pluginConfig: PluginConfigResponse = useOutletContext()

    return <div className="p-3 flex flex-col gap-3">
        <div className={pluginConfig.pluginInfo.serviceType === "KEY" ? "grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 items-start" : ""}>
            <NodePanel pluginId={pluginId} />
            {
                pluginConfig.pluginInfo.serviceType === "KEY" && <KeyPanel pluginId={pluginId} />
            }
        </div>
        <SubPanel pluginId={pluginId} />
    </div>
}
import { useOutletContext, useParams } from "react-router"

import type { PluginInfo } from "../api/PluginApi"
import { KeyPanel } from "../components/KeyPanel"
import { NodePanel } from "../components/NodePanel"
import { SubPanel } from "../components/SubPanel"



export function PluginPage() {
    const pluginId = useParams().pluginId!
    const pluginInfo: PluginInfo = useOutletContext()

    return <div className="p-3 flex flex-col gap-3">
        <div className={pluginInfo.keyService ? "grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 items-start" : ""}>
            <NodePanel pluginId={pluginId} />
            {
                pluginInfo.keyService && <KeyPanel pluginId={pluginId} />
            }
        </div>
        <SubPanel pluginId={pluginId} />
    </div>
}
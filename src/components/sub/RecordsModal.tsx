import { useQuery } from "@tanstack/react-query"
import { AcitonWindow } from "../common/AcitonWindow"
import { IconText } from "../common/IconText"
import { HourglassIcon } from "../../assets/icons/Icons"
import type { SubscriptionApi } from "../../api/SubscriptionApi"
import { Divider, Typography } from "@mui/material"
import { EmptyState } from "../common/EmptyState"

export function RecordsModal({ remove, uuid, api }: { remove: () => void, uuid: string, api: ReturnType<typeof SubscriptionApi> }) {
    const recordsData = useQuery({
        queryKey: [uuid],
        queryFn: () => api.getRecords(uuid)
    })
    return <AcitonWindow title="记录" closeWindow={{ onClose: () => remove() }}>
        {<div className="p-3">
            {recordsData.isLoading ?
                <IconText Icon={HourglassIcon} text="正在加载" /> :
                recordsData.isError ? <IconText Icon={HourglassIcon} text="加载失败" /> :
                    recordsData.data.records.length == 0 ? <EmptyState tip="没有记录" /> :
                        <div className="flex-1 overflow-auto">
                            {recordsData.data.records.map((item, index) =>
                                <div key={item.ip + item.time}>
                                    {index > 0 && <Divider />}
                                    <div><Typography color="info" sx={{ fontSize: "1.2rem" }}>{item.ip}</Typography></div>
                                    <div><Typography sx={{ fontSize: "0.9rem" }}>{new Date(item.time - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}</Typography></div>
                                    <div><Typography sx={{ fontSize: "0.9rem" }}>{item.userAgent}</Typography></div>
                                </div>
                            )}
                        </div>
            }
        </div>}
    </AcitonWindow>
}
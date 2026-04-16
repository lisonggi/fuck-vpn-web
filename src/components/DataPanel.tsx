import { LoadingIconButtion } from "./LoadingIconButtion"
import SettingsIcon from "../assets/icons/SettingsIcon"
import { Divider, Typography, useTheme } from "@mui/material"
import RefreshIcon from "../assets/icons/RefreshIcon"
import { AppCard } from "./AppCard"
import { IconText } from "./IconText"
import HourglassIcon from "../assets/icons/HourglassIcon"
import { EmptyState } from "./EmptyState"

interface PanelActionProps {
    onSettingsClick?: () => void | Promise<void>
    onRefreshClick?: () => void | Promise<void>
    loading?: boolean
}

function DataList({ items }: { items: string[] }) {
    return <div>{items?.map((value, index) => {
        return <div key={value}>
            {index > 0 && <Divider />}
            <Typography className="px-3 py-1 whitespace-pre-wrap">
                {value}
            </Typography>
        </div>
    })}
    </div>
}
function PanelActionButtons({ onSettingsClick = async () => { }, onRefreshClick = async () => { }, loading }: PanelActionProps) {
    const theme = useTheme()
    return <>
        <LoadingIconButtion onClick={onSettingsClick} Icon={SettingsIcon} color={theme.palette.primary.contrastText} tip="设置" />
        <LoadingIconButtion onClick={onRefreshClick} loading={loading} Icon={RefreshIcon} color={theme.palette.primary.contrastText} tip="重新获取" />
    </>
}
export function DataPanel({ title, data, actionButtonGroupProps }: { title: string, data?: string[], actionButtonGroupProps?: PanelActionProps }) {
    return <AppCard className="min-w-80" title={title} actionCompose={<PanelActionButtons onSettingsClick={actionButtonGroupProps?.onSettingsClick} onRefreshClick={actionButtonGroupProps?.onRefreshClick} loading={actionButtonGroupProps?.loading} />}>
        {!data ? <IconText Icon={HourglassIcon} text="正在加载" color="primary" /> : data?.length === 0 ? <EmptyState tip="没有数据" /> :
            <DataList items={data} />}
    </AppCard>
}
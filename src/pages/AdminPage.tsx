import { IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLoaderData, useMatches, useNavigate } from "react-router";
import { AuthApi } from "../api/AuthApi";
import { PluginApi, type PluginConfigResponse, type PluginUpdateConfigRequest } from "../api/PluginApi";
import { InfoIcon, MenuIcon, PowerIcon } from "../assets/icons/Icons";
import { AcitonCard } from "../components/common/AcitonCard";
import { type AcitonBarProps } from "../components/common/ActionBar";
import { AcitonWindow } from "../components/common/AcitonWindow";
import { LoadingIconButtion } from "../components/common/LoadingIconButtion";
import { MenuDrawer, type MenuDrawerProps, type MenuGroup, type MenuItem } from "../components/common/MenuDrawer";
import { PluginNotEnabled } from "../components/common/PluginNotEnabled";
import { useModal } from "../hooks/useModal";
import { adminChildren } from "../router";
import { LoadingPage } from "./LoadingPage";
import { enqueueSnackbar } from "notistack";

const PLUGIN_QUERY_KEY = "getAllPlugin"
function InfoModal({ remove, pluginInfo }: { remove: () => void, pluginInfo: PluginConfigResponse }) {
    return <AcitonWindow title="插件信息" closeWindow={{ onClose: () => remove() }}>
        <Typography component="div" className="p-3">
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 p-3 border-gray-200 border-dashed border-2 rounded-md  text-nowrap">
                <div className="text-gray-500">名称</div>
                <div>:</div>
                <div>{pluginInfo.pluginInfo.name}</div>

                <div className="text-gray-500">ID</div>
                <div>:</div>
                <div>{pluginInfo.pluginInfo.id}</div>

                <div className="text-gray-500">启用状态</div>
                <div>:</div>
                <div>{pluginInfo.enabled ? "已启用" : "已禁用"}</div>

                <div className="text-gray-500">插件类型</div>
                <div>:</div>
                <div>{pluginInfo.pluginInfo.serviceType === "KEY" ? "KEY" : "NODE"}</div>

                <div className="text-gray-500">版本</div>
                <div>:</div>
                <div>{pluginInfo.pluginInfo.version}</div>

                <div className="text-gray-500">作者</div>
                <div>:</div>
                <div>{pluginInfo.pluginInfo.author || "未知"}</div>

                <div className="text-gray-500">描述</div>
                <div>:</div>
                <div>{pluginInfo.pluginInfo.description || "无描述"}</div>
            </div>
        </Typography>

    </AcitonWindow>
}
export function AdminPage() {
    const modal = useModal()
    const { username } = useLoaderData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const queryClient = useQueryClient();
    const configQuery = useQuery({
        queryKey: [PLUGIN_QUERY_KEY],
        queryFn: PluginApi().getAllPluginConfig
    });
    const theme = useTheme()
    const updateConfigMutation = useMutation({
        mutationFn: ({ id, config }: { id: string; config: PluginUpdateConfigRequest }) =>
            PluginApi().updatePluginConfig(id, config),
        onSuccess: (result, request) => {
            queryClient.setQueryData<PluginConfigResponse[]>([PLUGIN_QUERY_KEY], (old) =>
                old?.map((item) =>
                    item.pluginInfo.id === request.id
                        ? { ...item, enabled: result.enabled }
                        : item
                )
            );
        }
    })
    const matches = useMatches();
    const navigate = useNavigate()

    const menuGroup = useMemo<MenuGroup[]>(() => {
        const baseMenuItems: MenuItem[] = [];
        const pluginMenuitems: MenuItem[] = [];
        adminChildren.forEach(children => {
            const Icon = children.handle.icon
            if (children.id === "plugin") {
                configQuery.data?.forEach(plugin => {
                    pluginMenuitems.push({
                        path: plugin.pluginInfo.id,
                        name: plugin.pluginInfo.name,
                        icon: plugin.enabled
                            ? <Icon color="primary" />
                            : <Icon color="disabled" />
                    });
                });
            } else {
                baseMenuItems.push({
                    path: children.path ?? "",
                    name: children.handle.name,
                    icon: <Icon color="primary" />,
                });
            }
        });
        const allMenuGroup: MenuGroup[] = [{ menuItems: baseMenuItems }, { menuItems: pluginMenuitems }]
        return allMenuGroup
    }, [configQuery.data]);
    const selectedItem: MenuItem | undefined = useMemo(() => {
        const allMenuItems = menuGroup.flatMap((group) => group.menuItems)
        const currentMatch = matches[matches.length - 1].pathname
        const path = currentMatch.replace(matches[0].pathname + "/", "")
        return allMenuItems.find(item => item.path === path)
    }, [menuGroup, matches])

    useEffect(() => {
        if (!configQuery.isLoading && !selectedItem) {
            navigate("/404", { replace: true })
        }
    }, [configQuery.isLoading, navigate, selectedItem])

    if (configQuery.isLoading || configQuery.isError) {
        return <div className="h-dvh w-full">
            <LoadingPage isError={configQuery.isError} isLoading={configQuery.isLoading} onRefetch={configQuery.refetch} />
        </div>
    }

    if (!selectedItem) {
        return null
    }

    const menuDrawerProps: MenuDrawerProps = {
        menuGroup: menuGroup,
        selectedItem: selectedItem,
        open: isMenuOpen,
        onClose: function (): void {
            setIsMenuOpen(false)
        },
        onItemclick: function (item: MenuItem): void {
            setIsMenuOpen(false)
            navigate(item.path)
        },
        username: username,
        onLogoutClick: async () => {
            await AuthApi().logout()
            enqueueSnackbar(`再见 ${username}`, { variant: "info" })
            navigate("/login")
        }
    }

    const pluginInfo: PluginConfigResponse | undefined = configQuery.data?.find(item => item.pluginInfo.id === selectedItem.path)

    const openInfoModal = () => {
        if (pluginInfo) {
            modal.open(({ remove }) => (<InfoModal remove={remove} pluginInfo={pluginInfo} />))
        }
    }
    const acitonBarProps: AcitonBarProps = {
        title: selectedItem.name, menu: <IconButton onClick={() => setIsMenuOpen(true)} sx={{
            backgroundColor: "primary.main"
        }}>
            <MenuIcon sx={{ color: "primary.contrastText" }} />
        </IconButton>
        , action: pluginInfo ? (
            <div className="flex items-center gap-1">
                <Tooltip title="插件信息">
                    <IconButton sx={{ color: theme.palette.primary.contrastText }} onClick={() => openInfoModal()}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
                {pluginInfo.enabled && (
                    <LoadingIconButtion icon={PowerIcon} onClick={() => updateConfigMutation.mutateAsync({
                        id: selectedItem.path,
                        config: { enabled: false }
                    })} tip="停用此插件" />
                )}
            </div>
        ) : undefined
    }
    return (<div className="h-dvh w-full">
        <AcitonCard className="size-full" acitonBarProps={acitonBarProps}>
            {pluginInfo === undefined || pluginInfo.enabled ? <Outlet context={pluginInfo} /> : <PluginNotEnabled onEnabledClick={() => updateConfigMutation.mutateAsync({
                id: selectedItem.path,
                config: { enabled: true }
            })}></PluginNotEnabled>}
        </AcitonCard>
        <MenuDrawer {...menuDrawerProps} />
    </div>)
}
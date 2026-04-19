import { Button, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLoaderData, useMatches, useNavigate } from "react-router";
import { AuthApi } from "../api/AuthApi";
import { PluginApi, type PluginInfo, type UpdateStateConfig } from "../api/PluginApi";
import { AppCard } from "../components/AppCard";
import { AppLayout } from "../components/AppLayout";
import type { AppTitleBarProps } from "../components/AppTitleBar";
import { LoadingIconButtion } from "../components/LoadingIconButtion";
import type { MenuDrawerProps, MenuGroup, MenuItem } from "../components/MenuDrawer";
import { PluginNotEnabled } from "../components/PluginNotEnabled";
import { useModal } from "../hooks/useModal";
import { adminChildren } from "../router";
import { LoadingPage } from "./LoadingPage";
import { InfoIcon, MenuIcon, PowerIcon } from "../assets/icons/Icons";

const PLUGIN_QUERY_KEY = "getAllPlugin"
function InfoModal({ remove, pluginInfo }: { remove: () => void, pluginInfo: PluginInfo }) {
    return <AppCard title="插件信息">
        <div className="flex flex-col items-center p-3 px-10 gap-3">
            <Typography component="div">
                <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 p-3 border-gray-200 border-dashed border-2 rounded-md  text-nowrap">
                    <div className="text-gray-500">名称</div>
                    <div>:</div>
                    <div>{pluginInfo.info.name}</div>

                    <div className="text-gray-500">ID</div>
                    <div>:</div>
                    <div>{pluginInfo.info.id}</div>

                    <div className="text-gray-500">启用状态</div>
                    <div>:</div>
                    <div>{pluginInfo.enabled ? "已启用" : "已禁用"}</div>

                    <div className="text-gray-500">插件类型</div>
                    <div>:</div>
                    <div>{pluginInfo?.keyService ? "节点+密钥" : "节点"}</div>

                    <div className="text-gray-500">版本</div>
                    <div>:</div>
                    <div>{pluginInfo?.info.version}</div>

                    <div className="text-gray-500">作者</div>
                    <div>:</div>
                    <div>{pluginInfo?.info.author || "未知"}</div>

                    <div className="text-gray-500">描述</div>
                    <div>:</div>
                    <div>{pluginInfo?.info.description || "无描述"}</div>
                </div>
            </Typography>
            <Button className="flex-1 w-full" variant="contained" onClick={() => remove()}>
                好的
            </Button>
        </div>
    </AppCard>
}
export function AdminPage() {
    const modal = useModal()
    const { token } = useLoaderData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [PLUGIN_QUERY_KEY],
        queryFn: PluginApi().getAllPlugin
    });
    const theme = useTheme()
    const [closePluginButtonLoading, setClosePluginButtonLoading] = useState(false)
    const mutation = useMutation({
        mutationFn: ({ id, config }: { id: string; config: UpdateStateConfig }) =>
            PluginApi().updateStateConfig(id, config),
        onSuccess: (result, request) => {
            queryClient.setQueryData<PluginInfo[]>([PLUGIN_QUERY_KEY], (old) =>
                old?.map((item) =>
                    item.info.id === request.id
                        ? { ...item, enabled: result.body!.enabled }
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
                data?.forEach(plugin => {
                    pluginMenuitems.push({
                        path: plugin.info.id,
                        name: plugin.info.name,
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
    }, [data]);
    const selectedItem: MenuItem | undefined = useMemo(() => {
        const allMenuItems = menuGroup.flatMap((group) => group.menuItems)
        const currentMatch = matches[matches.length - 1].pathname
        const path = currentMatch.replace(matches[0].pathname + "/", "")
        return allMenuItems.find(item => item.path === path)
    }, [menuGroup, matches])

    useEffect(() => {
        if (!isLoading && !selectedItem) {
            navigate("/404", { replace: true })
        }
    }, [isLoading, navigate, selectedItem])

    if (isLoading || isError) {
        return <div className="h-dvh w-full">
            <LoadingPage isError={isError} isLoading={isLoading} onRefetch={refetch} />
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
        username: token.username,
        onLogoutClick: async () => {
            await AuthApi().logout()
            navigate("/login")
        }
    }

    const updateStateConfig = async (id: string, enabled: boolean) => {
        await mutation.mutateAsync({ id, config: { enabled } })
    }

    const pluginInfo: PluginInfo | undefined = data?.find(item => item.info.id === selectedItem.path)

    const handelLoadingIconButtionClick = async () => {
        setClosePluginButtonLoading(true)
        await updateStateConfig(selectedItem.path, false).finally(() => {
            setClosePluginButtonLoading(false)
        })
    }
    const openInfoModal = () => {
        if (pluginInfo) {
            modal.open(({ remove }) => (<InfoModal remove={remove} pluginInfo={pluginInfo} />))
        }
    }
    const appTitleBarProps: AppTitleBarProps = {
        title: selectedItem.name,
        menuCompose: (
            <IconButton onClick={() => setIsMenuOpen(true)} sx={{
                backgroundColor: "primary.main"
            }}>
                <MenuIcon sx={{ color: "primary.contrastText" }} />
            </IconButton>),
        actionCompose: pluginInfo ? (
            <div className="flex items-center gap-1">
                <Tooltip title="插件信息">
                    <IconButton sx={{ color: theme.palette.primary.contrastText }} onClick={() => openInfoModal()}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
                {pluginInfo.enabled && (
                    <LoadingIconButtion Icon={PowerIcon} loading={closePluginButtonLoading} onClick={handelLoadingIconButtionClick} tip="停用此插件" />
                )}
            </div>
        ) : undefined
    }

    return (<div className="h-dvh w-full">
        <AppLayout menuDrawerProps={menuDrawerProps} appTitleBarProps={appTitleBarProps}>
            {pluginInfo === undefined || pluginInfo.enabled ? <Outlet context={pluginInfo} /> : <PluginNotEnabled onEnabledClick={() => updateStateConfig(selectedItem.path, true)}></PluginNotEnabled>}
        </AppLayout>
    </div>)
}
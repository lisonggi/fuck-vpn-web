import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLoaderData, useMatches, useNavigate } from "react-router";
import { AuthApi } from "../api/AuthApi";
import { PluginApi, type PluginInfo, type UpdateStateConfig } from "../api/PluginApi";
import InfoIcon from "../assets/icons/InfoIcon";
import MenuIcon from "../assets/icons/MenuIcon";
import PowerIcon from "../assets/icons/PowerIcon";
import { AppLayout } from "../components/AppLayout";
import type { AppTitleBarProps } from "../components/AppTitleBar";
import { LoadingIconButtion } from "../components/LoadingIconButtion";
import type { MenuDrawerProps, MenuGroup, MenuItem } from "../components/MenuDrawer";
import { PluginNotEnabled } from "../components/PluginNotEnabled";
import { adminChildren } from "../router";
import { LoadingPage } from "./LoadingPage";

const PLUGIN_QUERY_KEY = "getAllPlugin"

export function AdminPage() {
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
    const [infoDialogOpen, setInfoDialogOpen] = useState(false)

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
                    path: children.path ?? "/",
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
        let path = currentMatch.replace(matches[0].pathname + "/", "")
        if (path === "") {
            path = "/"
        }
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
                    <IconButton sx={{ color: theme.palette.primary.contrastText }} onClick={() => setInfoDialogOpen(true)}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
                {pluginInfo.enabled && (
                    <LoadingIconButtion Icon={PowerIcon} color={theme.palette.primary.contrastText} loading={closePluginButtonLoading} onClick={handelLoadingIconButtionClick} tip="停用此插件" />
                )}
            </div>
        ) : undefined
    }

    return (<div className="h-dvh w-full">
        <AppLayout menuDrawerProps={menuDrawerProps} appTitleBarProps={appTitleBarProps}>
            {pluginInfo === undefined || pluginInfo.enabled ? <Outlet context={pluginInfo} /> : <PluginNotEnabled onEnabledClick={() => updateStateConfig(selectedItem.path, true)}></PluginNotEnabled>}
            <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)}>
                <DialogTitle sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}>
                    插件信息
                </DialogTitle>
                <DialogContent className="p-3 min-w-80">
                    <Typography variant="subtitle1" gutterBottom>
                        插件 名称:{pluginInfo?.info.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        插件 ID:{pluginInfo?.info.id}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        启用状态:{pluginInfo?.enabled ? "已启用" : "已禁用"}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        是否为密钥服务:{pluginInfo?.keyService ? "是" : "否"}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                        版本:{pluginInfo?.info.version}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        作者:{pluginInfo?.info.author || "未知"}
                    </Typography>

                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        描述:{pluginInfo?.info.description || "无描述"}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInfoDialogOpen(false)}>关闭</Button>
                </DialogActions>
            </Dialog>
        </AppLayout>
    </div>)
}
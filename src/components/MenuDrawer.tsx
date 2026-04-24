import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { Fragment, type JSX } from "react/jsx-runtime";
import { LogoutIcon } from "../assets/icons/Icons";
import { LoadingIconButtion } from "./LoadingIconButtion";

export interface MenuGroup {
    menuItems: MenuItem[]
}

export interface MenuItem {
    path: string
    name: string
    icon: JSX.Element
}
export interface MenuDrawerProps {
    menuGroup: MenuGroup[]
    selectedItem: MenuItem
    open: boolean
    onClose: () => void
    onItemclick: (item: MenuItem) => void
    username: string,
    onLogoutClick: () => Promise<void>
}

export function MenuDrawer({ menuGroup, selectedItem, open, onClose, onItemclick: onItemOnclick, username, onLogoutClick }: MenuDrawerProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const handleLogoutClick = async () => {
        setIsLoggingOut(true);
        await onLogoutClick().finally(() => { setIsLoggingOut(false) });
    };
    const theme = useTheme()
    return (
        <Drawer open={open} onClose={onClose}>
            <Box className={"flex flex-col flex-1"} sx={{ width: 250 }} role="presentation" onClick={onClose}>
                <Box onClick={(e) => e.stopPropagation()}
                    className="w-full flex p-2 items-center justify-center"
                    sx={{ backgroundColor: "primary.main", }}>
                    <Typography sx={{ fontSize: 18, color: "primary.contrastText" }}>
                        FuckVPN WebClient
                    </Typography>
                </Box>
                <div className={"overflow-auto flex-1"} onClick={(e) => e.stopPropagation()}>
                    {
                        menuGroup.filter(group => group.menuItems?.length > 0).map((value, index) => (
                            <Fragment key={index}>
                                <List className="p-0">
                                    {index > 0 && <Divider component="li" />}
                                    {value.menuItems.map((item: MenuItem, index: number) => (
                                        <ListItem key={index} disablePadding>
                                            <ListItemButton selected={selectedItem.path === item.path} onClick={() => onItemOnclick(item)}>
                                                <ListItemIcon>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText primary={item.name} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Fragment>
                        ))
                    }
                </div>
            </Box>
            <Divider />
            <Box className="p-2">
                <Typography component="div" color="primary" className="flex flex-row items-center" sx={{ fontSize: "1.3rem" }}>
                    <div className="flex-1">
                        {username}
                    </div>
                    <LoadingIconButtion sx={{ color: theme.palette.primary.main }} tip="注销登陆" loading={isLoggingOut} icon={LogoutIcon} onClick={()=>handleLogoutClick()} />
                </Typography>
            </Box>
        </Drawer>
    )
}
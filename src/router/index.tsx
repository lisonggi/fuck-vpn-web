import { Typography } from "@mui/material";
import { createBrowserRouter, redirect, type RouteObject, } from "react-router";
import { AuthApi, type UserConfigResponse } from "../api/AuthApi";
import { FlashOnIcon, HomeIcon, SecurityIcon } from "../assets/icons/Icons";
import { AdminPage } from "../pages/AdminPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PluginPage } from "../pages/PluginPage";
import { SecurityPage } from "../pages/SecurityPage";
import { TestPage } from "../pages/TestPage";

export const adminChildren: RouteObject[] = [
    {
        index: true,
        element: <div className="p-3">欢迎使用 FuckVPN WebClient<br />请在左侧菜单中选择功能<br />为了你的设备安全<Typography color="error">尽快修改初始密码</Typography></div>,
        handle: {
            name: "主页",
            icon: HomeIcon
        }
    },
    {
        path: "settings",
        Component: SecurityPage,
        handle: {
            name: "安全",
            icon: SecurityIcon
        }
    }, {
        path: ":pluginId",
        id: "plugin",
        Component: PluginPage,
        handle: {
            name: "插件",
            icon: FlashOnIcon
        }
    }
]
export const router = createBrowserRouter([
    {
        path: "/",
        element: <></>,
        loader: () => redirect("/admin")
    },
    {
        path: "/login",
        Component: LoginPage,
        loader: async () => {
            try {
                await AuthApi().me({ silent: true });
                return redirect("/admin");
            } catch {
                return null;
            }
        },
        hydrateFallbackElement: <div>加载中</div>,
        errorElement: <div>错误</div>,
    },
    {
        path: "/admin",
        id: "admin",
        Component: AdminPage,
        children: adminChildren,
        loader: async () => {
            try {
                const response: UserConfigResponse = await AuthApi().me()
                return { username: response.username }
            } catch {
                return redirect("/login")
            }
        },
        hydrateFallbackElement: <div>加载中</div>,
        errorElement: <div>错误</div>,
    },
    {
        path: "/test",
        Component: TestPage
    },
    {
        path: "*",
        Component: NotFoundPage
    }
]);
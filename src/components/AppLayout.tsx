import { AppTitleBar, type AppTitleBarProps } from "./AppTitleBar";
import { MenuDrawer, type MenuDrawerProps } from "./MenuDrawer";

export function AppLayout({ menuDrawerProps, appTitleBarProps, children }: { menuDrawerProps: MenuDrawerProps, appTitleBarProps: AppTitleBarProps, children: React.ReactNode }) {

    return <div className="size-full flex flex-col">
        <AppTitleBar {...appTitleBarProps} />
        <MenuDrawer {...menuDrawerProps} />
        <div className="overflow-auto size-full">
            {children}
        </div>
    </div>
}
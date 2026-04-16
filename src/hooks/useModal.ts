import { createContext, useContext, type ReactNode } from "react"


export interface ModalOpenOptions {
    show?: boolean
    onClose?: () => void
}

export interface ModalControls {
    open: () => void
    close: () => void
}

export interface ModalContextType {
    open: (
        render: (close: () => void) => ReactNode,
        options?: ModalOpenOptions
    ) => ModalControls
    close: (id: number) => void
}

export const ModalContext = createContext<ModalContextType | null>(null)

export function useModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error("ModalProvider 未初始化")
    }

    return {
        create: context.open,
    }
}
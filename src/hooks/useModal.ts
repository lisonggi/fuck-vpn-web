import { createContext, useContext } from "react"
import type { JSX } from "react/jsx-runtime"
import type { ModalItem } from "../providers/ModalProvider"


export interface ModalOpenOptions {
    onMaskClick?: (action: ModalActions) => void
}

export type ContentType = (action: ModalActions) => JSX.Element

export interface ModalActions {
    hide: () => void
    remove: () => void
    id: string
}
export interface ModalControl extends ModalActions {
    show: () => void
}

export interface ModalContextType {
    create: (content: ContentType, options?: ModalOpenOptions) => ModalControl
    show: (id: string) => void
    showAll: () => void
    hide: (id: string) => void
    hideAll: () => void
    remove: (id: string) => void
    removeAll: () => void
    modals: Map<string, ModalItem>
}

export const ModalContext = createContext<ModalContextType | null>(null)

export function useModal() {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error("ModalProvider Not initialized")
    }
    const open = (content: ContentType, options?: ModalOpenOptions): ModalControl => {
        const modal = context.create(content, options)
        context.show(modal.id)
        return modal
    }
    return {
        open: open,
        create: context.create,
        show: context.show,
        showAll: context.showAll,
        hide: context.hide,
        hideAll: context.hideAll,
        remove: context.remove,
        removeAll: context.showAll,
        modals: context.modals
    }
}
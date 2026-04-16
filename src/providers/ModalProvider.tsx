import { useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ModalContext, type ModalOpenOptions, type ModalControls } from "../hooks/useModal"

export interface ModalItem {
    id: number
    content: ReactNode
    show: boolean
    onClose?: () => boolean | void
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modals, setModals] = useState<ModalItem[]>([])

    const close = (id: number) => {
        setModals(prev =>
            prev.map(m => {
                if (m.id !== id) return m
                return { ...m, show: false }
            })
        )

        setTimeout(() => {
            setModals(prev => prev.filter(m => m.id !== id))
        }, 200)
    }

    const open = (
        render: (close: () => void) => ReactNode,
        options?: ModalOpenOptions
    ): ModalControls => {
        const id = Date.now()

        const closeThis = () => close(id)
        const openThis = () => {
            setModals(prev =>
                prev.map(m => (m.id === id ? { ...m, show: true } : m))
            )
        }

        const initialShow = options?.show ?? true

        setModals(prev => [
            ...prev,
            {
                id,
                content: render(closeThis),
                show: initialShow ? false : false,
                onClose: options?.onClose,
            },
        ])

        if (initialShow) {
            requestAnimationFrame(() => {
                setModals(prev =>
                    prev.map(m => (m.id === id ? { ...m, show: true } : m))
                )
            })
        }

        return {
            open: openThis,
            close: closeThis,
        }
    }

    return (
        <ModalContext.Provider value={{ open: open, close }}>
            {children}

            {createPortal(
                modals.map((m) => (
                    <div className="fixed inset-0 z-50" key={m.id}>
                        <div
                            onClick={() => {
                                if (!m.onClose) {
                                    close(m.id)
                                    return
                                }
                                const ok = m.onClose()
                                if (ok !== false) {
                                    close(m.id)
                                }
                            }}

                            className={`
                                absolute inset-0 bg-black/40 backdrop-blur-sm
                                transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]  z-51
                                ${m.show ? "opacity-100" : "opacity-0"}
                            `}
                        />

                        <div className="relative size-full overflow-y-auto  ">
                            <div className="min-h-full flex items-center justify-center p-4">
                                <div
                                    className={`
                                        overflow-auto
                                        z-52
                                        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                                   ${m.show
                                            ? "opacity-100 rotate-0 scale-100"
                                            : "opacity-0 rotate-2 scale-95"
                                        }
                                    `}
                                >
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    </div>
                )),
                document.body
            )}
        </ModalContext.Provider>
    )
}
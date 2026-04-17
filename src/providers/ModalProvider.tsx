import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import type { JSX } from "react/jsx-runtime"
import { ModalContext, type ModalActions, type ModalControl, type ModalOpenOptions } from "../hooks/useModal"

export interface ModalItem extends ModalOpenOptions {
    id: string
    content: JSX.Element
    show: boolean
    onMaskClick: () => void
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modals, setModals] = useState<Map<string, ModalItem>>(new Map())
    const mountedRef = useRef(false)
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])
    const assertSafeCall = (name: string) => {
        if (!mountedRef.current) {
            throw new Error(
                `Modal: ${name}() cannot be called during render. ` +
                `Use useEffect or event handlers instead.`
            )
        }
    }
    const visible = (id: string, visible: boolean) => {
        requestAnimationFrame(() => {
            setModals(prev => {
                const next = new Map(prev)
                const item = next.get(id)
                if (!item) throw Error("The element has been cleared")
                next.set(id, {
                    ...item, show: visible
                })
                return next
            })
        })
    }
    const visibleAll = (visible: boolean) => {
        requestAnimationFrame(() => {
            setModals(prev => {
                const next = new Map(prev)
                next.forEach(value => {
                    value.show = visible
                })
                return next
            })
        })
    }

    const create = (content: (action: ModalActions) => JSX.Element, options?: ModalOpenOptions): ModalControl => {
        assertSafeCall("create")
        const id = crypto.randomUUID()
        setModals(prev => {
            const next = new Map(prev)
            next.set(id, {
                id,
                content: content({
                    hide: () => hide(id),
                    remove: () => remove(id),
                    id: id
                }),
                show: false,
                onMaskClick: () => {
                    const onMaskClick = options?.onMaskClick
                    if (onMaskClick) {
                        onMaskClick({
                            hide: () => hide(id),
                            remove: () => remove(id),
                            id: id
                        })
                    } else {
                        remove(id)
                    }
                },
            })
            return next
        })
        return {
            show: () => show(id),
            hide: () => hide(id),
            remove: () => remove(id),
            id: id
        }
    }

    const show = (id: string) => {
        assertSafeCall("show")
        visible(id, true)
    }

    const showAll = () => {
        assertSafeCall("showAll")
        visibleAll(true)
    }

    const hide = (id: string) => {
        assertSafeCall("hide")
        visible(id, false)
    }

    const hideAll = () => {
        assertSafeCall("hideAll")
        visibleAll(false)
    }

    const remove = (id: string) => {
        assertSafeCall("remove")
        hide(id)
        setTimeout(() => {
            setModals(prev => {
                const copy = new Map(prev)
                copy.delete(id)
                return copy
            })
        }, 200)
    }
    const removeAll = () => {
        assertSafeCall("removeAll")
        hideAll()
        setTimeout(() => {
            setModals(new Map())
        }, 200)
    }

    return (
        <ModalContext value={{ create, show, showAll, hide, hideAll, remove, removeAll, modals }}>
            {children}

            {createPortal(
                Array.from(modals.values()).map((m) => (
                    <div className={`w-dvw h-dvh fixed inset-0 ${m.show
                        ? "visible"
                        : "invisible"}`} key={m.id} id={m.id}>
                        <div className={`size-full bg-black/40 backdrop-blur-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${m.show ? "opacity-100" : "opacity-0"}`} />
                        <div className="fixed inset-0" onClick={() => m.onMaskClick()} >
                            <div className="size-full flex overflow-auto">
                                <div className={`m-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${m.show
                                    ? "opacity-100 rotate-0 scale-100"
                                    : "opacity-0 rotate-2 scale-95"
                                    }`} onClick={(e) => {
                                        e.stopPropagation()
                                    }}>
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    </div>
                )),
                document.body
            )}
        </ModalContext>
    )
}
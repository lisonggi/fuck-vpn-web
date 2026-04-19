import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ModalContext, type ContentType, type ModalControl, type ModalOpenOptions } from "../hooks/useModal"

export interface ModalItem extends ModalOpenOptions {
    id: string
    content: ContentType
    show: boolean
    hideThis: () => void
    removeThis: () => void
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modals, setModals] = useState<Map<string, ModalItem>>(new Map())
    const downOnMask = useRef(false)
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

    const create = (content: ContentType, options?: ModalOpenOptions): ModalControl => {
        assertSafeCall("create")
        const id = crypto.randomUUID()
        setModals(prev => {
            const next = new Map(prev)
            next.set(id, {
                id,
                content: content,
                show: false,
                onMaskClick: options?.onMaskClick,
                hideThis: () => { hide(id) },
                removeThis: () => { remove(id) }
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
                Array.from(modals.values()).map((m) => {
                    return <div className={`w-dvw h-dvh fixed z-50 inset-0 ${m.show
                        ? "visible"
                        : "invisible"}`} key={m.id} id={m.id}>
                        <div className={`size-full bg-black/40 backdrop-blur-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${m.show ? "opacity-100" : "opacity-0"}`} />
                        <div className="fixed inset-0 flex overflow-auto"
                            onPointerDown={(e) => {
                                downOnMask.current = e.target === e.currentTarget
                            }}
                            onPointerUp={(e) => {
                                if (downOnMask.current && e.target === e.currentTarget) {
                                    const onMaskClick = m.onMaskClick
                                    if (onMaskClick) {
                                        onMaskClick({
                                            hide: () => m.hideThis(),
                                            remove: () => m.removeThis(),
                                            id: m.id
                                        })
                                    } else {
                                        remove(m.id)
                                    }
                                }
                                downOnMask.current = false
                            }}>
                            <div className={`modal-content m-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${m.show
                                ? "opacity-100 rotate-0 scale-100"
                                : "opacity-0 rotate-2 scale-95"}`} >
                                {m.content({
                                    hide: () => m.hideThis(),
                                    remove: () => m.removeThis(),
                                    id: m.id
                                })}
                            </div>
                        </div>
                    </div>
                }),
                document.body
            )
            }
        </ModalContext >
    )
}
import type React from "react";
import { CloseIcon } from "../../assets/icons/Icons";
import { AcitonCard } from "./AcitonCard";
import { AppIconButton } from "./AppIconButton";

export function AcitonWindow({ title, className, closeWindow: { onClose, disabled = false }, children }: { title: string, className?: string, closeWindow: { onClose: () => void, disabled?: boolean }, children: React.ReactNode }) {
    return <AcitonCard className={className} acitonBarProps={{ title: title, action: <AppIconButton icon={CloseIcon} tip="关闭" disabled={disabled} onClick={onClose} /> }}>
        {children}
    </AcitonCard>
}
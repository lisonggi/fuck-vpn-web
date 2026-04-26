import { Button } from "@mui/material";
import { AcitonWindow } from "../components/common/AcitonWindow";
import { useModal } from "../hooks/useModal";
function ModalContent({ remove }: { remove: () => void }) {
    return (
        <AcitonWindow title="测试" closeWindow={{ onClose: () => remove() }} className="h-dvh">
            {
                Array.from({ length: 1000 }).map((_, i) => (
                    <div key={i}>item {i}</div>
                ))
            }
        </AcitonWindow >
    )
}


export function TestPage() {

    const modal = useModal()

    function handelOpenModalClick() {
        modal.open(({ remove }) => (
            <ModalContent remove={remove} />
        ))
    }
    return <div className="h-dvh w-dvw p-10">
        <Button onClick={() => handelOpenModalClick()}>打开窗口</Button>
    </div>
}
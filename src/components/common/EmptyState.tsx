import { BoxIcon } from "../../assets/icons/Icons";
import { IconText } from "./IconText";

export function EmptyState({ tip, className }: { tip: string, className?: string }) {
    return <IconText text={tip} Icon={BoxIcon} color="primary" className={className} />
}
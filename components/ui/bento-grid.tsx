import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoCard = ({
    className,
    title,
    description,
    header,
    icon,
    onClick,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "row-span-1 group/bento transition-[box-shadow,transform] duration-150 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] p-0 bg-white border border-black justify-between flex flex-col space-y-0 cursor-pointer overflow-hidden",
                className
            )}
        >
            {header}
            <div className="p-4 flex flex-col gap-2">
                {icon}
                <div className="font-mono font-bold text-black text-sm">
                    {title}
                </div>
                <div className="font-mono font-normal text-neutral-600 text-xs">
                    {description}
                </div>
            </div>
        </div>
    );
};

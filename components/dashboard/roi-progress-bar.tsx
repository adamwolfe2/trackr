"use client";

import { useEffect, useState } from "react";

export function ROIProgressBar({ adoptionRate }: { adoptionRate: number }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setWidth(adoptionRate), 120);
        return () => clearTimeout(t);
    }, [adoptionRate]);

    return (
        <div className="h-2 bg-neutral-100 border border-neutral-200">
            <div
                className="h-full bg-black"
                style={{
                    width: `${width}%`,
                    transition: "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
            />
        </div>
    );
}

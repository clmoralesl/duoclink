"use client";
import Link from "next/link";

type BackButtonProps = {
    href?: string;
    label?: string;
    /** "inline": sin wrapper; "block": centrado con margen superior */
    layout?: "inline" | "block";
    /** "secondary" = blanco con borde (default), "primary" = azul sólido */
    variant?: "secondary" | "primary";
    className?: string;
};

export default function BackButton({
    href = "/home",
    label = "Volver",
    layout = "block",
    variant = "secondary",
    className = "",
}: BackButtonProps) {
    const base = "px-6 py-2 rounded-lg font-medium transition-colors";
    const styles =
        variant === "primary"
            ? "bg-duoc-blue text-white hover:bg-duoc-yellow hover:text-duoc-blue"
            : "bg-white border border-gray-300 !text-black hover:bg-gray-50";

    const btn = (
        <Link href={href} className={`${base} ${styles} ${className}`}>
            {label}
        </Link>
    );

    // layout=inline: sin wrapper (para colocarlo junto a otros botones)
    if (layout === "inline") return btn;

    // layout=block (default): centrado y con margen superior
    return <div className="mt-6 flex justify-center">{btn}</div>;
}
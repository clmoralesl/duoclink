"use client";

import { useState } from "react";
import ModalFarmaciasDeTurno from "@/components/ModalFarmaciasDeTurno";

interface BotonCorazonFlotanteProps {
    className?: string;
    color?: string;
}

const BotonCorazonFlotante = ({
    className = "",
    color = "#ff004f",
}: BotonCorazonFlotanteProps) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                aria-label="Ver farmacias de turno"
                className={`animate-heartbeat hover:scale-110 transition-transform ${className}`}
                style={{
                    width: "55px",
                    height: "55px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill={color}
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-lg"
                >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 
          5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
          4.5 2.09C13.09 3.81 14.76 3 16.5 
          3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
          6.86-8.55 11.54L12 21.35z" />
                </svg>
            </button>

            {open && <ModalFarmaciasDeTurno onClose={() => setOpen(false)} />}
        </>
    );
};

export default BotonCorazonFlotante;
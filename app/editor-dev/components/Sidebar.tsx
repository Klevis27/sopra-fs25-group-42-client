import React, { ReactNode } from "react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    position?: "left" | "right"; // Allow choosing position
    children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, position = "right", children }) => {
    const isLeft = position === "left";

    return (
        <>
            <aside
                style={{
                    position: "fixed",
                    [isLeft ? "left" : "right"]: isOpen ? "0" : "-300px", // Slide in from left or right
                    top: "0",
                    width: "300px",
                    height: "100vh",
                    background: "#f8f9fa",
                    boxShadow: isLeft ? "2px 0 10px rgba(0, 0, 0, 0.2)" : "-2px 0 10px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease-in-out",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        alignSelf: isLeft ? "flex-start" : "flex-end", // Align close button properly
                    }}
                >
                    ✖
                </button>

                {/* Dynamic Content */}
                {children}
            </aside>
        </>
    );
};

export default Sidebar;

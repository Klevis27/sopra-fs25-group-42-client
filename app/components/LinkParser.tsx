"use client";

import React from 'react';
import { ReactNode } from "react";

interface LinkParserProps {
    children: ReactNode;
    onInternalLinkClick?: (pageTitle: string) => void;
}

export const LinkParser = ({ children, onInternalLinkClick }: LinkParserProps) => {
    const processText = (text: string) => {
        const parts = text.split(/(\[\[.*?\]\])/g);
        return parts.map((part, index) => {
            const match = part.match(/\[\[(.*?)\]\]/);
            if (match) {
                const pageTitle = match[1];
                return (
                    <a
                        key={index}
                        className="internal-link text-blue-600 hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            onInternalLinkClick?.(pageTitle);
                        }}
                    >
                        {pageTitle}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const processChildren = (child: ReactNode): ReactNode => {
        if (typeof child === "string") {
            return processText(child);
        }
        if (Array.isArray(child)) {
            return child.map(processChildren);
        }
        return child; // Don't alter non-strings like <strong>, <code>, etc.
    };

    return <>{React.Children.map(children, processChildren)}</>;
};
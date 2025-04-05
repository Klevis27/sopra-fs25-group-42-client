"use client";

import { useState, useEffect } from "react";
import ReactMarkdown, {Components} from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import {LinkParser} from "@/editor-dev/components/LinkParser";
export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState("# Hello World\nStart writing here...");
    const TEXT_CONTAINERS = [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'li', 'td', 'th', 'blockquote', 'code'
    ];
    useEffect(() => {
        hljs.highlightAll();
    }, [markdown]);

    const handleInternalLink = (pageTitle: string) => {
        // Implement your navigation logic here
        console.log("Internal link clicked:", pageTitle);
        alert(`Navigating to: ${pageTitle}`);
    };
    const customComponents: Components = TEXT_CONTAINERS.reduce((acc, tag) => {
        acc[tag] = ({ children }) => (
            <LinkParser onInternalLinkClick={handleInternalLink}>
                {children}
            </LinkParser>
        );
        return acc;
    }, {} as Components);
    return (
        <div className="w-1/2">
            {/* Editor Pane */}
            <div className
                 style={{
                     float: "left",
                     border: "1px solid #ddd",
                     borderRadius: "8px",
                     boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
                     height: "80vh",
                     width: "50%",

                 }}

            >
                <div className="h-full bg-white rounded-lg shadow-sm">

                 <textarea
                     style={{width:"100%", height: "80vh", background: "white",color:"black",resize: "none"}}
                     value={markdown}
                     onChange={(e) => setMarkdown(e.target.value)}
                     placeholder="Write markdown here..."
                 />
                </div>
            </div>

            {/* Preview Pane */}
            <div className="w-1/2">
                <div className
                     style={{
                         float: "right",
                         padding: "24px",
                         background: "white",
                         border: "1px solid #ddd",
                         borderRadius: "8px",
                         boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.1)",
                         height: "80vh",
                         width: "50%",
                }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={customComponents}
                    >

                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
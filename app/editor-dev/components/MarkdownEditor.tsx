"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState("# Hello World\nStart writing here...");

    useEffect(() => {
        hljs.highlightAll();
    }, [markdown]);

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
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
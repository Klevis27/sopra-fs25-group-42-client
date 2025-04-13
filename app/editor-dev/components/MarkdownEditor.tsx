"use client";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc"; // P2P provider (no server needed)
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import { LinkParser } from "@/editor-dev/components/LinkParser";

// Create shared Yjs document
const ydoc = new Y.Doc();
const ytext = ydoc.getText("markdown");

// Set up WebRTC provider
const provider = new WebrtcProvider("markdown-room", ydoc);

const useYjs = () => {
    const [content, setContent] = useState(ytext.toString());

    useEffect(() => {
        const updateContent = () => setContent(ytext.toString());
        ytext.observe(updateContent);

        return () => ytext.unobserve(updateContent);
    }, []);

    const bindEditor = useCallback((element: HTMLTextAreaElement | null) => {
        if (!element) return;

        // Sync textarea with Yjs
        const observer = new MutationObserver(() => {
            if (element.value !== ytext.toString()) {
                ytext.delete(0, ytext.length);
                ytext.insert(0, element.value);
            }
        });

        observer.observe(element, { childList: true, characterData: true });

        // Initial sync
        element.value = ytext.toString();

        return () => observer.disconnect();
    }, []);

    return { content, bindEditor };
};

export default function CollaborativeMarkdownEditor() {
    const { content, bindEditor } = useYjs();
    const [localValue, setLocalValue] = useState(content);

    useEffect(() => {
        hljs.highlightAll();
    }, [content]);

    const handleInternalLink = (pageTitle: string) => {
        console.log("Internal link clicked:", pageTitle);
        alert(`Navigating to: ${pageTitle}`);
    };

    const TEXT_CONTAINERS = [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'li', 'td', 'th', 'blockquote', 'code'
    ] as const;

    const customComponents = TEXT_CONTAINERS.reduce((acc, tag) => ({
        ...acc,
        [tag]: ({ children, ...props }) => (
            <LinkParser onInternalLinkClick={handleInternalLink}>
                {children}
            </LinkParser>
        )
    }), {});

    return (
        <div className="w-full flex h-screen">
            {/* Editor Pane */}
            <div className="w-1/2 p-4 border-r border-gray-200">
                <div className="h-full bg-white rounded-lg shadow-sm">
          <textarea
              ref={bindEditor}
              value={localValue}
              onChange={(e) => {
                  setLocalValue(e.target.value);
                  ytext.delete(0, ytext.length);
                  ytext.insert(0, e.target.value);
              }}
              className="w-full h-full p-4 resize-none focus:outline-none"
              placeholder="Collaborate in real-time..."
          />
                </div>
            </div>

            {/* Preview Pane */}
            <div className="w-1/2 p-4">
                <div className="h-full bg-white rounded-lg shadow-sm overflow-auto">
                    <div className="p-4 prose max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={customComponents}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
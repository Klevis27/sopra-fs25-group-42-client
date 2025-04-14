"use client";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import { LinkParser } from "@/editor-dev/components/LinkParser";

// Create shared Yjs document
const ydoc = new Y.Doc();
const ytext = ydoc.getText("markdown");

// WebSocket provider configuration
const provider = new WebsocketProvider(
    "ws://localhost:1234", // dummi addres
    "markdown-room",
    ydoc
);

const useCollaborativeEditor = () => {
    const [content, setContent] = useState(ytext.toString());
    const [users, setUsers] = useState<Array<{ name: string; color: string }>>([]);
    const [isConnected, setIsConnected] = useState(false);

    // Content synchronization
    useEffect(() => {
        const handleContentUpdate = () => setContent(ytext.toString());
        ytext.observe(handleContentUpdate);

        return () => ytext.unobserve(handleContentUpdate);
    }, []);

    // Connection status and awareness
    useEffect(() => {
        provider.on("status", (event: { status: string }) => {
            setIsConnected(event.status === "connected");
        });

        const handleAwarenessUpdate = () => {
            const states = Array.from(provider.awareness.getStates().values());
            setUsers(states.filter(s => s.user).map(s => s.user));
        };

        provider.awareness.on("change", handleAwarenessUpdate);
        provider.awareness.setLocalState({
            user: {
                name: `User ${Math.floor(Math.random() * 1000)}`,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`
            }
        });

        return () => {
            provider.awareness.off("change", handleAwarenessUpdate);
            provider.off("status");
        };
    }, []);

    // Textarea binding
    const bindEditor = useCallback((element: HTMLTextAreaElement | null) => {
        if (!element) return;

        const updateYjs = (value: string) => {
            ytext.delete(0, ytext.length);
            ytext.insert(0, value);
        };

        const handleInput = (e: Event) => {
            updateYjs((e.target as HTMLTextAreaElement).value);
        };

        element.value = ytext.toString();
        element.addEventListener("input", handleInput);

        return () => element.removeEventListener("input", handleInput);
    }, []);

    return { content, bindEditor, users, isConnected };
};

export default function CollaborativeMarkdownEditor() {
    const { content, bindEditor, users, isConnected } = useCollaborativeEditor();

    useEffect(() => {
        hljs.highlightAll();
    }, [content]);

    const handleInternalLink = (pageTitle: string) => {
        console.log("Internal link clicked:", pageTitle);
        // Implement navigation logic here
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
            {/* Connection Status */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                <div className="flex -space-x-2">
                    {users.map((user, i) => (
                        <div
                            key={i}
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: user.color }}
                            title={user.name}
                        />
                    ))}
                </div>
            </div>

            {/* Editor Pane */}
            <div className="w-1/2 p-4 border-r border-gray-200">
                <div className="h-full bg-white rounded-lg shadow-sm">
          <textarea
              ref={bindEditor}
              className="w-full h-full p-4 resize-none focus:outline-none font-mono"
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
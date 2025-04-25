"use client";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "github-markdown-css/github-markdown.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { TextAreaBinding } from "y-textarea";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import { LinkParser } from "@/editor-dev/components/LinkParser";
import { useRouter, useParams } from "next/navigation";

// Create shared Yjs document
const ydoc = new Y.Doc();
const ytext = ydoc.getText("markdown");
const ymap = ydoc.getMap("meta");

const useCollaborativeEditor = () => {
    const params = useParams();
    const noteId = params?.note_id as string;
    const [content, setContent] = useState(ytext.toString());
    const [users, setUsers] = useState<Array<{ name: string; color: string }>>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    // Initialize WebSocket provider
    useEffect(() => {
        if (!noteId) return;

        const wsProvider = new WebsocketProvider(`ws://localhost:1234`, noteId, ydoc);
        setProvider(wsProvider);

        // Set noteId in shared map if needed
        ymap.set("noteId", noteId);

        return () => {
            wsProvider.destroy();
        };
    }, [noteId]);

    // Content synchronization
    useEffect(() => {
        const handleUpdate = () => setContent(ytext.toString());
        ytext.observe(handleUpdate);
        return () => ytext.unobserve(handleUpdate);
    }, []);

    // Connection and awareness state
    useEffect(() => {
        if (!provider) return;

        const handleStatus = (event: { status: string }) => {
            setIsConnected(event.status === "connected");
        };

        const handleAwareness = () => {
            const states = Array.from(provider.awareness.getStates().values());
            setUsers(states.filter(s => s.user).map(s => s.user));
        };

        provider.on("status", handleStatus);
        provider.awareness.on("change", handleAwareness);

        // Set random user info
        provider.awareness.setLocalState({
            user: {
                name: `User ${Math.floor(Math.random() * 1000)}`,
                color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
            }
        });

        return () => {
            provider.off("status", handleStatus);
            provider.awareness.off("change", handleAwareness);
        };
    }, [provider]);

    // Bind textarea using y-textarea
    const bindEditor = useCallback((element: HTMLTextAreaElement | null) => {
        if (!element) return;
        const binding = new TextAreaBinding(ytext, element);
        return () => binding.destroy();
    }, []);

    return { content, bindEditor, users, isConnected };
};

export default function CollaborativeMarkdownEditor() {
    const { content, bindEditor, users, isConnected } = useCollaborativeEditor();

    // Apply syntax highlighting
    useEffect(() => {
        hljs.highlightAll();
    }, [content]);

    const handleInternalLink = (pageTitle: string) => {
        console.log("Internal link clicked:", pageTitle);
    };

    const components = {
        // Headers
        h1: ({ children, ...props }: any) => (
            <h1 className="text-3xl font-bold my-4 border-b pb-2" {...props}>
                {children}
            </h1>
        ),
        h2: ({ children, ...props }: any) => (
            <h2 className="text-2xl font-bold my-3 border-b pb-1" {...props}>
                {children}
            </h2>
        ),
        h3: ({ children, ...props }: any) => (
            <h3 className="text-xl font-semibold my-2" {...props}>
                {children}
            </h3>
        ),

        // Text formatting
        em: ({ children, ...props }: any) => (
            <em className="italic" {...props}>
                {children}
            </em>
        ),
        strong: ({ children, ...props }: any) => (
            <strong className="font-bold" {...props}>
                {children}
            </strong>
        ),

        // Lists
        ol: ({ children, ...props }: any) => (
            <ol className="list-decimal pl-8 my-2" {...props}>
                {children}
            </ol>
        ),
        ul: ({ children, ...props }: any) => (
            <ul className="list-disc pl-8 my-2" {...props}>
                {children}
            </ul>
        ),
        li: ({ children, ...props }: any) => (
            <li className="my-1 pl-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </li>
        ),

        // Links
        a: ({ children, href, ...props }: any) => (
            <a
                href={href}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            >
                {children}
            </a>
        ),

        // Wiki links ([[S]])
        text: ({ children, ...props }: any) => {
            const text = children?.toString() || '';
            if (text.includes('[[') && text.includes(']]')) {
                return (
                    <span>
                        {text.split(/(\[\[.*?\]\])/).map((part, i) => {
                            if (part.match(/\[\[.*?\]\]/)) {
                                const page = part.replace(/\[\[|\]\]/g, '');
                                return (
                                    <a
                                        key={i}
                                        className="text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => handleInternalLink(page)}
                                    >
                                        {page}
                                    </a>
                                );
                            }
                            return part;
                        })}
                    </span>
                );
            }
            return <span {...props}>{children}</span>;
        },

        // Code blocks
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="bg-gray-100 rounded p-2 my-2">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </div>
            ) : (
                <code className="bg-gray-100 px-1 rounded" {...props}>
                    {children}
                </code>
            );
        }
    };

    return (
        <div className="w-full flex h-screen">
            {/* Connection Status */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
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

            {/* Editor */}
            <div className="w-1/2 p-4 border-r border-gray-200">
                <div className="h-full bg-white rounded-lg shadow-sm">
                    <textarea
                        ref={bindEditor}
                        className="w-full h-full p-4 resize-none focus:outline-none font-mono"
                        placeholder="Collaborate in real-time..."
                        defaultValue={content}
                    />
                </div>
            </div>

            {/* Preview */}
            <div className="w-1/2 p-4">
                <div className="h-full bg-white rounded-lg shadow-sm overflow-auto markdown-body">
                    <div className="p-4">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={components}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
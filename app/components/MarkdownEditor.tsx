"use client";
import {useState, useEffect, PropsWithChildren, JSX, useRef} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import * as Y from "yjs";
import {WebsocketProvider} from "y-websocket";
import {TextAreaBinding} from "y-textarea";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import {LinkParser} from "@/components/LinkParser";
import {useParams} from "next/navigation";
import "github-markdown-css";
import {useApi} from "@/hooks/useApi";

const useCollaborativeEditor = () => {
    const params = useParams();
    const noteId = params?.note_id as string;
    const [content, setContent] = useState("");
    const [users, setUsers] = useState<Array<{ name: string; color: string }>>([]);
    const [isConnected, setIsConnected] = useState(false);
    const ytextRef = useRef<Y.Text | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<TextAreaBinding | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const api = useApi();

    useEffect(() => {
        if (!noteId) return;

        // Create a new Y.Doc when noteId changes
        const ydoc = new Y.Doc();
        const ytext = ydoc.getText("markdown");
        const ymap = ydoc.getMap("meta");
        ymap.set("noteId", noteId);
        ytextRef.current = ytext;

        const rawBaseURL = api.getBaseURL();
        const baseURL = rawBaseURL.startsWith("http://localhost:8080")
            ? "ws://localhost:1234"
            : "wss://yjs-server-1061772680937.europe-west6.run.app";

        const provider = new WebsocketProvider(baseURL, noteId, ydoc);
        providerRef.current = provider;

        const handleStatus = (event: { status: string }) => {
            setIsConnected(event.status === "connected");
        };
        const handleAwareness = () => {
            const states = Array.from(provider.awareness.getStates().values());
            setUsers(states.filter(s => s.user).map(s => s.user));
        };

        const handleUpdate = () => {
            setContent(ytext.toString());
        };

        provider.on("status", handleStatus);
        provider.awareness.on("change", handleAwareness);
        ytext.observe(handleUpdate);

        setContent(ytext.toString());

        provider.awareness.setLocalStateField("user", {
            name: `User ${Math.floor(Math.random() * 1000)}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
        });

        return () => {
            ytext.unobserve(handleUpdate);
            provider.awareness.off("change", handleAwareness);
            provider.off("status", handleStatus);
            provider.destroy();
            ydoc.destroy();
        };
    }, [noteId, api]);

    // Content synchronization
    useEffect(() => {
        if (textareaRef.current && ytextRef.current) {
            bindingRef.current = new TextAreaBinding(ytextRef.current, textareaRef.current);
            return () => {
                bindingRef.current?.destroy();
                bindingRef.current = null;
            };
        }
    }, [content]);

    return {
        content,
        isConnected,
        users,
        textareaRef,
    };
};

export default function CollaborativeMarkdownEditor() {
    const { content, isConnected, users, textareaRef } = useCollaborativeEditor();

    // Apply syntax highlighting
    useEffect(() => {
        hljs.highlightAll();
    }, [content]);

    const handleInternalLink = (pageTitle: string) => {
        console.log("Internal link clicked:", pageTitle);
    };

    const components: Components = {
        // Plain text
        p: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['p']>) => (
            <p className="my-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </p>
        ),

        // Headers
        h1: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['h1']>) => (
            <h1 className="text-3xl font-bold my-4 border-b pb-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </h1>
        ),
        h2: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['h2']>) => (
            <h2 className="text-2xl font-bold my-3 border-b pb-1" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </h2>
        ),
        h3: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['h3']>) => (
            <h3 className="text-xl font-semibold my-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </h3>
        ),

        // Text formatting
        em: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['em']>) => (
            <em className="italic" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </em>
        ),
        strong: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['strong']>) => (
            <strong className="font-bold" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </strong>
        ),

        // Lists
        ol: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['ol']>) => (
            <ol className="list-decimal pl-8 my-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </ol>
        ),
        ul: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['ul']>) => (
            <ul className="list-disc pl-8 my-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </ul>
        ),
        li: ({children, ...props}: PropsWithChildren<JSX.IntrinsicElements['li']>) => (
            <li className="my-1 pl-2" {...props}>
                <LinkParser onInternalLinkClick={handleInternalLink}>
                    {children}
                </LinkParser>
            </li>
        ),

        // Links
        a: ({children, href, ...props}: PropsWithChildren<JSX.IntrinsicElements['a']> & { href?: string }) => (
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

        // Code blocks
        code: (({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
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
        })
    };

    return (
        <div className="w-full flex h-full">
            {/* Connection Status */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}/>
                <div className="flex -space-x-2">
                    {users.map((user, i) => (
                        <div
                            key={i}
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{backgroundColor: user.color}}
                            title={user.name}
                        />
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="w-1/2 p-4 border-r border-gray-200">
                <div className="h-full bg-white rounded-lg shadow-sm">
                    <textarea
                        ref={textareaRef}
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
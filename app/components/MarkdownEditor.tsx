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
import {useParams, useRouter} from "next/navigation";
import "github-markdown-css";
import {useApi} from "@/hooks/useApi";
import {Note} from "@/types/note";

interface AwarenessUser {
    name: string;
    color: string;
}

export default function CollaborativeMarkdownEditor() {
    const router = useRouter();
    const params = useParams();
    const vaultId = params.vault_id as string;
    const noteId = params.note_id as string;
    const [content, setContent] = useState<string>("");
    const [users, setUsers] = useState<AwarenessUser[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    // Add state for notes list
    const [notes, setNotes] = useState<Note[]>([]);
    const api = useApi();

    // Refs must be initialized to null
    const ydocRef = useRef<Y.Doc | null>(null);
    const ytextRef = useRef<Y.Text | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const api = useApi();

    // 1) Create Y.Doc + WebsocketProvider + awareness + update listener
    useEffect(() => {
        if (!noteId) return;

        // 1.a. Doc + Text
        const ydoc = new Y.Doc();
        const ytext = ydoc.getText("markdown");
        ydocRef.current = ydoc;
        ytextRef.current = ytext;

        // Expose for console testing
        // @ts-expect-error debug
        window.ydoc = ydoc;
        console.log("→ assigned window.ydoc");
        console.log("→ ytext is:", ytext);


        // 1.b. WS URL (dev vs prod)
        const raw = api.getBaseURL();
        const wsURL = raw.startsWith("http://localhost:8080")
            ? "ws://localhost:8080"
            : "wss://yjs-server-1061772680937.europe-west6.run.app";

        // 1.c. Provider
        const provider = new WebsocketProvider(wsURL, noteId, ydoc);
        providerRef.current = provider;

        // 1.d. Connection status
        provider.on("status", ({ status }) => {
            console.log("WS status:", status);
            setIsConnected(status === "connected");
        });

        // 1.e. Awareness → users[]
        const updateAwareness = () => {
            // We trust that each state.user is AwarenessUser
            const arr = Array.from(provider.awareness.getStates().values())
                .map((s) => s.user as AwarenessUser | undefined)
                .filter((u): u is AwarenessUser => !!u);
            setUsers(arr);
        };
        provider.awareness.on("change", updateAwareness);

        // 1.f. Set our local awareness
        provider.awareness.setLocalStateField("user", {
            name: `User${Math.floor(Math.random() * 1000)}`,
            color: `#${Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0")}`,
        });

        // 1.g. Content updates
        const onUpdate = () => setContent(ytext.toString());
        ytext.observe(onUpdate);
        setContent(ytext.toString());

        // Cleanup
        return () => {
            ytext.unobserve(onUpdate);
            provider.awareness.off("change", updateAwareness);
            provider.destroy();
            ydoc.destroy();
        };
    }, [noteId, api]);

    // 2) Bind textarea once
    useEffect(() => {
        const ytext = ytextRef.current;
        const ta = textareaRef.current;
        if (ytext && ta) {
            const binding = new TextAreaBinding(ytext, ta);
            return () => binding.destroy();
        }
    }, [noteId]); // only re-run when you switch noteId

    // Apply syntax highlighting
    useEffect(() => {
        hljs.highlightAll();
    }, [content]);
    // Add useEffect to fetch notes
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await api.get<Note[]>(`/vaults/${vaultId}/notes`);
                setNotes(response);
            } catch (error) {
                console.error("Failed to fetch notes:", error);
            }
        };
        if (vaultId) fetchNotes();
    }, [vaultId, api]);

    // Modify handleInternalLink function
    const handleInternalLink = (pageTitle: string) => {
        // Find note by title
        const targetNote = notes.find(n => n.title === pageTitle);

        if (targetNote) {
            const query = window.location.search; // Preserve existing query params
            router.push(`/vaults/${vaultId}/notes/${targetNote.id}${query}`);
        } else {
            console.warn(`Note "${pageTitle}" not found in current vault`);
            // Optional: Add UI feedback here
        }
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
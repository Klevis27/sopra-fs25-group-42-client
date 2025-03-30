"use client";
import { useState, useEffect } from 'react';
//import ReactMarkdown from 'react-markdown';
//import remarkGfm from 'remark-gfm';
//import rehypeRaw from 'rehype-raw';
//import 'highlight.js/styles/github.css';
//import hljs from 'highlight.js';

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState('# Hello World\nStart writing here...');
    const [splitRatio, setSplitRatio] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize syntax highlighting
    useEffect(() => {
        hljs.highlightAll();
    }, [markdown]);

    // Handle mouse move for split pane dragging
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const container = document.getElementById('editor-container');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setSplitRatio(Math.min(Math.max(newRatio, 25), 75)); // Keep between 25-75%
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add event listeners for dragging
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            id="editor-container"
            className="h-screen w-full flex relative bg-gray-100"
        >
            {/* Editor Pane */}
            <div
                className="h-full border-r-2 border-gray-300"
                style={{ flexBasis: `${splitRatio}%` }}
            >
        <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-full p-4 font-mono text-gray-800 bg-white resize-none focus:outline-none"
            placeholder="Write your markdown here..."
        />
            </div>

            {/* Resize Handle */}
            <div
                className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize ${isDragging ? 'bg-blue-500' : ''}`}
                onMouseDown={() => setIsDragging(true)}
            />

            {/* Preview Pane */}
            <div
                className="h-full overflow-auto bg-white"
                style={{ flexBasis: `${100 - splitRatio}%` }}
            >
                <div className="p-4 prose max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

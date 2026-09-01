import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
    if (!content) return null;

    return (
        <div className={`markdown-body text-foreground leading-relaxed break-words ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, [remarkEmoji, { accessible: true, emoticon: true }]]}
                components={{
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 py-2 my-3 text-foreground/90 italic bg-primary/5 rounded-r-xl">
                            {children}
                        </blockquote>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-extrabold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                    code: ({ children, className: codeClassName, ...props }) => {
                        const isInline = !codeClassName;
                        if (isInline) {
                            return (
                                <code
                                    className="font-mono text-xs bg-secondary/80 text-primary font-bold px-1.5 py-0.5 rounded border border-border/60"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className="block font-mono text-xs" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="p-4 rounded-2xl bg-secondary/60 border border-border/80 overflow-x-auto text-xs font-mono my-3 shadow-inner">
                            {children}
                        </pre>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold hover:underline transition-colors cursor-pointer"
                        >
                            {children}
                        </a>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-xl sm:text-2xl font-black text-foreground mt-4 mb-2">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg sm:text-xl font-extrabold text-foreground mt-3 mb-1.5">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-bold text-foreground mt-2 mb-1">
                            {children}
                        </h3>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc ml-5 space-y-1 my-2 text-foreground/90">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal ml-5 space-y-1 my-2 text-foreground/90">{children}</ol>
                    ),
                    p: ({ children }) => (
                        <p className="text-sm sm:text-base leading-relaxed my-2">{children}</p>
                    ),
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || 'Image attachment'}
                            className="max-h-[360px] max-w-full rounded-2xl object-contain my-3 border border-border/80 shadow-md bg-black/40"
                            loading="lazy"
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

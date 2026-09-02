import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface MarkdownContentProps {
    content: string;
    className?: string;
    variant?: 'default' | 'comment';
    compact?: boolean;
    disableLinks?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
    content,
    className = '',
    variant = 'default',
    compact = false,
    disableLinks = false,
}) => {
    if (!content) return null;

    const isComment = variant === 'comment' || compact;

    return (
        <div className={`markdown-body text-foreground leading-relaxed break-words ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, [remarkEmoji, { accessible: true, emoticon: true }]]}
                components={{
                    blockquote: ({ children }) => (
                        <blockquote
                            className={`border-l-4 border-primary pl-3.5 py-1.5 my-2 text-foreground/90 italic bg-primary/5 rounded-r-xl ${
                                isComment ? 'text-xs' : 'text-sm'
                            }`}
                        >
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
                        <pre
                            className={`rounded-2xl bg-secondary/60 border border-border/80 overflow-x-auto font-mono my-2 shadow-inner ${
                                isComment ? 'p-3 text-[11px]' : 'p-4 text-xs'
                            }`}
                        >
                            {children}
                        </pre>
                    ),
                    a: ({ href, children }) =>
                        disableLinks ? (
                            <span className="text-primary font-bold">{children}</span>
                        ) : (
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
                        <h1
                            className={`font-black text-foreground mt-3 mb-1.5 ${
                                isComment ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl mt-4 mb-2'
                            }`}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2
                            className={`font-extrabold text-foreground mt-2.5 mb-1 ${
                                isComment ? 'text-sm sm:text-base' : 'text-lg sm:text-xl mt-3 mb-1.5'
                            }`}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3
                            className={`font-bold text-foreground mt-2 mb-1 ${
                                isComment ? 'text-xs sm:text-sm' : 'text-base'
                            }`}
                        >
                            {children}
                        </h3>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc ml-5 space-y-1 my-1.5 text-foreground/90">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal ml-5 space-y-1 my-1.5 text-foreground/90">{children}</ol>
                    ),
                    p: ({ children }) => (
                        <p className={`leading-relaxed my-1.5 ${isComment ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                            {children}
                        </p>
                    ),
                    img: ({ src, alt }) => {
                        const isVideo =
                            typeof src === 'string' &&
                            (/\.(mp4|webm|mov|mkv|avi)$/i.test(src) ||
                                src.includes('/media/stream/') ||
                                (typeof alt === 'string' && /\.(mp4|webm|mov|mkv|avi)$/i.test(alt)));

                        if (isVideo && src) {
                            return (
                                <div
                                    className={`rounded-2xl overflow-hidden my-2.5 border border-border/80 bg-black shadow-md ${
                                        isComment ? 'max-w-md w-full' : 'max-w-xl w-full'
                                    }`}
                                >
                                    <CustomVideoPlayer
                                        src={src}
                                        autoPlay={false}
                                        className="w-full aspect-video"
                                    />
                                </div>
                            );
                        }

                        return (
                            <div className="relative inline-block my-2 max-w-full rounded-2xl overflow-hidden border border-border/80 bg-secondary/20 shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all duration-300">
                                <img
                                    src={src}
                                    alt={alt || 'Attachment'}
                                    className={`w-auto h-auto object-contain rounded-2xl transition-transform duration-300 hover:scale-[1.02] ${
                                        isComment
                                            ? 'max-h-[260px] sm:max-h-[300px]'
                                            : 'max-h-[380px] sm:max-h-[460px]'
                                    }`}
                                    loading="lazy"
                                />
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

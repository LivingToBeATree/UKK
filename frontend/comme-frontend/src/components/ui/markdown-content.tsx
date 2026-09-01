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
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
    content,
    className = '',
    variant = 'default',
    compact = false,
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
                                    className={`rounded-2xl overflow-hidden my-3 border border-border/80 bg-black shadow-md ${
                                        isComment ? 'max-w-[340px] sm:max-w-[400px]' : 'max-w-xl'
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
                            <img
                                src={src}
                                alt={alt || 'Image attachment'}
                                className={`rounded-xl object-contain my-2 border border-border/80 shadow-xs bg-black/40 transition-all ${
                                    isComment
                                        ? 'max-h-[160px] sm:max-h-[190px] max-w-[240px] sm:max-w-[280px]'
                                        : 'max-h-[300px] sm:max-h-[360px] max-w-full'
                                }`}
                                loading="lazy"
                            />
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

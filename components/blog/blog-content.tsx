"use client";

import ReactMarkdown from "react-markdown";

interface BlogContentProps {
    content: string;
}

export function BlogContent({ content }: BlogContentProps) {
    return (
        <article className="blog-content">
            <ReactMarkdown
                components={{
                    // Open external links in new tab safely
                    a: ({ href, children, ...props }) => {
                        const isExternal = href?.startsWith("http");
                        return (
                            <a
                                href={href}
                                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}

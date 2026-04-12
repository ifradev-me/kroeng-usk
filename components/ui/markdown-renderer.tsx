'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    const isExternal =
      href?.startsWith('http://') ||
      href?.startsWith('https://') ||
      href?.startsWith('//');

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    // Link internal — buka di tab yang sama
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
};

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy-900 prose-p:text-gray-600 prose-a:text-electric-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-electric-700 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

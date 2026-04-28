'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = children;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [children]);

  const language = className?.replace('language-', '') || 'plaintext';

  return (
    <div className="relative my-5 rounded-lg overflow-hidden border border-gray-700 not-prose">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          {copied ? (
            <>
              <Check size={13} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 overflow-x-auto p-4 m-0 text-sm leading-relaxed">
        <code className={className ?? 'font-mono'}>{children}</code>
      </pre>
    </div>
  );
}

const buildComponents = (): Components => ({
  // --- Headings ---
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-bold text-navy-900 mt-8 mb-4 pb-2 border-b border-gray-200" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold text-navy-900 mt-7 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold text-navy-800 mt-6 mb-2" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-semibold text-navy-800 mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-base font-semibold text-navy-700 mt-4 mb-1" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-sm font-semibold text-navy-700 mt-3 mb-1 uppercase tracking-wide" {...props}>
      {children}
    </h6>
  ),

  // --- Paragraph ---
  p: ({ children, ...props }) => (
    <p className="text-gray-700 leading-7 mb-4" {...props}>
      {children}
    </p>
  ),

  // --- Lists ---
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-outside pl-6 mb-4 space-y-1 text-gray-700" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside pl-6 mb-4 space-y-1 text-gray-700" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),

  // --- Table ---
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-5 not-prose">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-100" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-gray-200" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-gray-200 even:bg-gray-50" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border border-gray-300 px-4 py-2 text-left font-semibold text-navy-800 bg-gray-100"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props}>
      {children}
    </td>
  ),

  // --- Code ---
  code: ({ children, className, ...props }) => {
    // inline code (no className means no language tag from remark)
    if (!className) {
      return (
        <code
          className="bg-gray-100 text-electric-700 px-1.5 py-0.5 rounded text-[0.875em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    // block code — rendered via pre below
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => {
    // Extract text content and className from child <code>
    const child = children as React.ReactElement<{ className?: string; children?: string }>;
    const codeText = typeof child?.props?.children === 'string' ? child.props.children : '';
    const codeClass = child?.props?.className;

    if (!codeText && !codeClass) {
      // fallback
      return (
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-5 text-sm" {...props}>
          {children}
        </pre>
      );
    }

    return <CodeBlock className={codeClass}>{codeText}</CodeBlock>;
  },

  // --- Blockquote ---
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-electric-400 bg-electric-50 pl-4 pr-3 py-2 my-4 text-gray-600 italic rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // --- Horizontal Rule ---
  hr: () => <hr className="my-6 border-gray-200" />,

  // --- Images ---
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      className="rounded-xl max-w-full my-4 mx-auto shadow-sm"
      {...props}
    />
  ),

  // --- Links ---
  a: ({ href, children, ...props }) => {
    const isExternal =
      href?.startsWith('http://') ||
      href?.startsWith('https://') ||
      href?.startsWith('//');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="text-electric-600 hover:text-electric-800 underline underline-offset-2 transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },

  // --- Strong / Em ---
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-navy-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-gray-600" {...props}>
      {children}
    </em>
  ),
});

const markdownComponents = buildComponents();

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`text-base leading-relaxed ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

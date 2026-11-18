'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { standardizeNoteMarkdown } from '@/lib/notemaker-cleaner';
import { BookOpen } from 'lucide-react';

interface NoteContentRendererProps {
    content: string;
    className?: string;
    variant?: 'summary' | 'notes';
}

export function NoteContentRenderer({ content, className = '', variant = 'notes' }: NoteContentRendererProps) {
    const cleanedMarkdown = useMemo(() => {
        return standardizeNoteMarkdown(content);
    }, [content]);

    if (!cleanedMarkdown) return null;

    return (
        <div className={`notemaker-content prose max-w-none text-slate-800 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => (
                        <div className='my-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-white p-5 shadow-xs'>
                            <div className='mb-1.5 flex items-center gap-2'>
                                <span className='inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2 py-0.5 font-bold text-[10px] text-white uppercase tracking-wider shadow-2xs'>
                                    <BookOpen size={12} />
                                    {variant === 'summary' ? 'Academic Executive Summary' : 'Chapter Study Note'}
                                </span>
                            </div>
                            <h1 className='font-black text-lg text-slate-900 leading-snug tracking-tight md:text-2xl'>{children}</h1>
                        </div>
                    ),
                    h2: ({ children }) => (
                        <div className='mt-8 mb-3.5 border-indigo-100/90 border-b pb-2'>
                            <h2 className='flex items-center gap-2 font-black text-base text-indigo-700 tracking-tight md:text-lg'>
                                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-100 font-bold text-[11px] text-indigo-700 shadow-2xs'>
                                    #
                                </span>
                                <span>{children}</span>
                            </h2>
                        </div>
                    ),
                    h3: ({ children }) => (
                        <h3 className='mt-6 mb-2 flex items-center gap-2 font-bold text-slate-900 text-sm tracking-tight md:text-base'>
                            <span className='h-1.5 w-1.5 rounded-full bg-indigo-500' />
                            <span>{children}</span>
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className='mt-4 mb-1.5 font-bold text-slate-800 text-xs tracking-tight md:text-sm'>{children}</h4>
                    ),
                    p: ({ children }) => (
                        <p className='mb-3.5 font-normal text-[15px] text-slate-700 leading-relaxed last:mb-0'>{children}</p>
                    ),
                    strong: ({ children }) => <strong className='font-bold text-slate-900'>{children}</strong>,
                    em: ({ children }) => <em className='font-medium text-slate-800 italic'>{children}</em>,
                    ul: ({ children }) => <ul className='my-3 space-y-2 pl-1'>{children}</ul>,
                    ol: ({ children }) => (
                        <ol className='my-3 list-decimal space-y-2 pl-5 font-semibold text-slate-800 text-sm'>{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className='flex items-start text-slate-700 text-sm leading-relaxed'>
                            <span className='mt-2 mr-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500' />
                            <span className='flex-1'>{children}</span>
                        </li>
                    ),
                    hr: () => <hr className='my-6 border-slate-200/80' />,
                    blockquote: ({ children }) => (
                        <blockquote className='my-4 rounded-xl border-indigo-400 border-l-4 bg-indigo-50/40 p-4 font-medium text-slate-700 text-sm italic'>
                            {children}
                        </blockquote>
                    ),
                    code: ({ children }) => (
                        <code className='rounded border border-slate-200/60 bg-slate-100 px-1.5 py-0.5 font-mono text-indigo-700 text-xs'>
                            {children}
                        </code>
                    )
                }}>
                {cleanedMarkdown}
            </ReactMarkdown>
        </div>
    );
}

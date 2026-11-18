'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

const WEBHOOK_URL = 'https://n8n.srv937206.hstgr.cloud/webhook/aivrm-chatbot';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    options?: string[];
}

export function SchoolAssistantBot({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            // Clear history from state and localStorage when closed
            localStorage.removeItem('chat_history');
            setMessages([]);
            setInput('');
            return;
        }

        // Initialize session on open
        let sid = localStorage.getItem('chatbot_sessionId');
        if (!sid) {
            sid = `sess_${Math.random().toString(36).substr(2, 9)}${Date.now()}`;
            localStorage.setItem('chatbot_sessionId', sid);
        }
        setSessionId(sid);

        // Version check
        if (localStorage.getItem('chat_version') !== '2.0') {
            localStorage.setItem('chat_version', '2.0');
        }

        // Always show initial messages when reopened
        setMessages([
            { id: '1', text: 'Hey there! 👋', role: 'assistant' },
            {
                id: '2',
                text: 'This is your assistant here! How can we help you today?',
                role: 'assistant',
                options: ['Admission', 'Fees', 'Examination', 'Need More Help?']
            }
        ]);
    }, [open]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_history', JSON.stringify(messages));
            localStorage.setItem('chat_last_time', Date.now().toString());

            if (bodyRef.current) {
                bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            role: 'user'
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, sessionId })
            });
            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || '⚠️ Sorry, no reply from server.',
                role: 'assistant'
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: '⚠️ Error connecting to server',
                role: 'assistant'
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const linkify = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-bold underline transition-colors hover:opacity-80'>
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='overflow-hidden border-none bg-transparent p-0 shadow-2xl sm:max-w-[450px] [&>button]:hidden'>
                <div
                    id='chatbot-widget'
                    className='flex h-[600px] w-full flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-2xl'>
                    {/* Header - Purple Branding */}
                    <div
                        id='chatbot-header'
                        className='flex shrink-0 items-center justify-between bg-gradient-to-r from-primary to-[#6d28d9] p-5 text-white shadow-lg'>
                        <div className='title flex items-center gap-3 font-bold text-base tracking-tight'>
                            <div className='rounded-full bg-white p-1'>
                                <img
                                    src='/chatbot/standing-robot.png'
                                    alt='bot'
                                    className='bot-logo h-[32px] w-[32px] rounded-full object-cover'
                                />
                            </div>
                            <span>School Assistant Bot</span>
                        </div>
                        <button
                            id='chatbot-close'
                            onClick={() => onOpenChange(false)}
                            className='p-1 text-2xl text-white/80 leading-none transition-all hover:rotate-90 hover:text-white'>
                            ×
                        </button>
                    </div>

                    {/* Body */}
                    <div id='chatbot-body' ref={bodyRef} className='flex flex-1 flex-col overflow-y-auto bg-slate-50/50 p-4 transition-all'>
                        {messages.map((msg) => (
                            <div key={msg.id} className='mb-4 flex flex-col'>
                                <div
                                    className={cn(
                                        'message fade-in max-w-[85%] animate-in rounded-[18px] p-3 px-4 text-[14px] leading-relaxed shadow-sm duration-300',
                                        msg.role === 'assistant'
                                            ? 'bot-message self-start rounded-tl-none border border-primary/10 bg-white text-black shadow-sm'
                                            : 'user-message self-end rounded-tr-none border border-secondary/10 bg-secondary/10 text-black'
                                    )}>
                                    {msg.role === 'assistant' ? linkify(msg.text) : msg.text}

                                    {msg.options && (
                                        <div className='options mt-4 flex flex-col gap-2'>
                                            {msg.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => sendMessage(opt)}
                                                    className='option-btn w-full rounded-xl border border-black/10 bg-white p-3 font-bold text-[13px] text-black shadow-sm transition-all hover:translate-x-1 hover:bg-black/5 active:translate-y-px'>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className='typing fade-in mb-2 animate-in self-start rounded-[10px] bg-muted p-[6px_12px] text-[13px] text-muted-foreground italic'>
                                Typing...
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div id='chatbot-footer' className='flex shrink-0 gap-2 border-border border-t bg-white p-2'>
                        <input
                            type='text'
                            id='chatbot-input'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                            placeholder='Type your message...'
                            className='flex-1 rounded-[10px] border border-input bg-white p-2 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30'
                        />
                        <button
                            id='chatbot-send'
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                'rounded-[10px] p-2 px-3 transition-all',
                                !input.trim() || isLoading
                                    ? 'cursor-default bg-primary/20 text-white'
                                    : 'bg-primary text-white shadow-md hover:opacity-90'
                            )}>
                            ➤
                        </button>
                    </div>

                    {/* Branding */}
                    <div
                        id='chatbot-branding'
                        className='border-border border-t bg-muted/30 p-1.5 text-center text-[11px] text-muted-foreground'>
                        Provided by{' '}
                        <a
                            href='https://vapstech.com/'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='font-bold text-secondary hover:underline'>
                            VapsTechnosoft Pvt Ltd
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

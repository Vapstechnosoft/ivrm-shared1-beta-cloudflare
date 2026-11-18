'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const WEBHOOK_URL = 'https://n8n.srv937206.hstgr.cloud/webhook/vapstech-website-chatbot';

interface Message {
    type: 'bot' | 'user';
    content: string;
    isHTML?: boolean;
}

const linkify = (text: string) => {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline font-bold hover:text-blue-400">$1</a>');
};

export function VapsChatWindow({ onClose }: { onClose?: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');

    const bodyRef = useRef<HTMLDivElement>(null);

    // Initialize session and history
    useEffect(() => {
        let sid = localStorage.getItem('chatbot_sessionId');
        if (!sid) {
            sid = `sess_${Math.random().toString(36).substr(2, 9)}${Date.now()}`;
            localStorage.setItem('chatbot_sessionId', sid);
        }
        setSessionId(sid);

        setMessages([
            { type: 'bot', content: 'Hey there! 👋' },
            { type: 'bot', content: 'Welcome to Vaps Technosoft Pvt Ltd! How can we help you today?' }
        ]);
    }, []);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async (msg: string) => {
        if (!msg.trim()) return;

        const userMessage: Message = { type: 'user', content: msg };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, sessionId })
            });
            const data = await response.json();

            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    type: 'bot',
                    content: data.reply || '⚠️ Sorry, no reply from server.',
                    isHTML: true
                }
            ]);
        } catch (error) {
            setIsTyping(false);
            setMessages((prev) => [...prev, { type: 'bot', content: '⚠️ Error connecting to server' }]);
        }
    };

    return (
        <div className='relative flex h-full w-full flex-col overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/80 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] backdrop-blur-3xl'>
            {/* Header */}
            <div className='flex items-center justify-between bg-gradient-to-r from-orange-500 to-purple-600 p-4 text-white shadow-md'>
                <div className='flex items-center gap-3'>
                    <img
                        src='https://vapstech.com/wp-content/uploads/2026/01/VAPS-logo.jpg'
                        alt='bot'
                        className='h-10 w-10 rounded-full border-2 border-white object-cover'
                    />
                    <div>
                        <h3 className='font-bold text-sm'>AI Edge</h3>
                        <p className='font-black text-[10px] uppercase tracking-widest opacity-80'>Intelligent Assistant</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className='rounded-full p-1 transition-transform hover:rotate-90 hover:bg-white/10'>
                        <X className='h-5 w-5' />
                    </button>
                )}
            </div>

            {/* Body */}
            <div ref={bodyRef} className='flex flex-1 flex-col gap-4 overflow-y-auto bg-gradient-to-b from-transparent to-white/30 p-4'>
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.type === 'bot' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            'max-w-[85%] break-words rounded-2xl p-3.5 text-[13px] shadow-sm',
                            msg.type === 'bot'
                                ? 'self-start bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                                : 'self-end border border-black/5 bg-white text-gray-800'
                        )}>
                        <div dangerouslySetInnerHTML={{ __html: msg.isHTML ? linkify(msg.content) : msg.content }} />
                        {msg.type === 'bot' && i === 1 && (
                            <div className='mt-3.5 flex flex-col gap-2'>
                                {['About Vaps Tech', 'About AI Vrm', 'Contact sales'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => sendMessage(opt)}
                                        className='w-full rounded-xl bg-black/10 py-2.5 font-bold text-white text-xs transition-all hover:bg-black/25 active:scale-95'>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
                {isTyping && (
                    <div className='animate-pulse self-start rounded-2xl bg-black/5 p-3 font-medium text-[12px] text-gray-500'>
                        Bot is typing...
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className='border-black/5 border-t bg-white/40 p-4'>
                <div className='flex gap-2.5 rounded-2xl border border-black/5 bg-white p-1 shadow-inner'>
                    <input
                        type='text'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                        placeholder='Type your message...'
                        className='flex-1 border-none bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none'
                    />
                    <button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className={cn(
                            'rounded-xl p-2.5 shadow-md transition-all active:scale-90',
                            inputValue.trim()
                                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:opacity-90'
                                : 'cursor-not-allowed bg-gray-100 text-gray-300'
                        )}>
                        ➤
                    </button>
                </div>
                <div className='mt-3.5 text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest'>
                    Provided by{' '}
                    <a href='https://vapstech.com' target='_blank' className='text-orange-600 hover:underline' rel='noreferrer'>
                        Vaps Tech
                    </a>
                </div>
            </div>
        </div>
    );
}

export function VapsChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize session and history
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className='fixed right-5 bottom-5 z-[10000]' ref={containerRef}>
            {/* Toggle Button */}
            <button
                onClick={() => {
                    const nextState = !isOpen;
                    setIsOpen(nextState);
                    if (nextState) setUnreadCount(0);
                }}
                className={cn(
                    'z-[10001] flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-tr from-orange-500 to-purple-600 text-2xl text-white shadow-[0_4px_15px_rgba(255,100,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95',
                    !isOpen && 'animate-bounce'
                )}>
                {isOpen ? <X className='h-7 w-7 rotate-0 transition-all duration-300' /> : '💬'}
                {!isOpen && unreadCount > 0 && (
                    <span className='-top-[5px] -right-[5px] absolute flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-orange-600 font-bold text-[12px] text-white'>
                        {unreadCount}
                    </span>
                )}
                {!isOpen && (
                    <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        className='-top-1 -right-1 absolute'>
                        <Sparkles className='h-3 w-3 fill-yellow-300 text-yellow-300' />
                    </motion.div>
                )}
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className='absolute right-0 bottom-[80px] z-[9999] h-[520px] w-[350px] origin-bottom-right md:w-[380px]'>
                        <VapsChatWindow onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}

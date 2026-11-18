'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserAccessibleModules } from '@/hooks/common';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, GraduationCap, Maximize2, Minimize2, Minus, Send, Sparkles, Wallet, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    link?: string;
}

export const StudentChatbot = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChatEnabled, setIsChatEnabled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { data: accessibleModule } = useUserAccessibleModules();

    // Context and Messages State
    const getContextInfo = () => {
        if (pathname.toLowerCase().includes('fees')) return { name: 'Student Fees', color: 'from-emerald-500 to-teal-600', icon: Wallet };
        if (pathname.toLowerCase().includes('exam'))
            return { name: 'Student Academics', color: 'from-violet-500 to-purple-600', icon: GraduationCap };
        return { name: 'Student Support', color: 'from-blue-600 to-indigo-700', icon: Bot };
    };
    const currentContext = getContextInfo();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Welcome to your Student Portal Assistant! How can I help you with your studies or payments today?`,
            role: 'assistant',
            timestamp: new Date()
        }
    ]);

    type MenuState = 'ROOT' | 'ACADEMICS' | 'PAYMENTS' | 'COE' | 'FEEDBACK';
    const [menuState, setMenuState] = useState<MenuState>('ROOT');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Scrolling Effect
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen, isMinimized, isLoading]);

    // Menu Reset Effect
    useEffect(() => {
        if (!isOpen) {
            setMenuState('ROOT');
            setIsChatEnabled(false);
        }
    }, [isOpen]);

    const isAuthPage = pathname?.toLowerCase().includes('login') || pathname?.toLowerCase().includes('sign-in');

    // Only show in Student Portal - Guard AFTER hooks
    if (!mounted || !pathname?.toLowerCase().includes('studentportal') || isAuthPage) return null;

    // Helper to resolve links from common.ts data (environment-aware)
    const resolveLink = (targetName: string, fallbackLink?: string) => {
        if (!accessibleModule?.data) return fallbackLink;

        // Flatten pages for searching
        const allPages = accessibleModule.data.flatMap((module) =>
            module.menu.flatMap((menu) => menu.sub_menu.flatMap((subMenu) => subMenu.pages))
        );

        const page = allPages.find(
            (p) =>
                p.name.toLowerCase().trim() === targetName.toLowerCase().trim() ||
                p.title?.toLowerCase().trim() === targetName.toLowerCase().trim()
        );

        if (page) return page.url;

        // Second pass: partial match if no exact match found
        const partialMatch = allPages.find(
            (p) => p.name.toLowerCase().includes(targetName.toLowerCase()) || p.title?.toLowerCase().includes(targetName.toLowerCase())
        );

        return partialMatch ? partialMatch.url : fallbackLink;
    };

    const MENU_STRUCTURE: Record<string, any> = {
        ROOT: [
            { label: 'My Academics & Results', id: 'ACADEMICS' },
            { label: 'Fees & Payments', id: 'PAYMENTS' },
            { label: 'coe', id: 'COE' },
            { label: 'complaints and feedbacks', id: 'FEEDBACK' },
            { label: 'Ask a specific query', id: 'ENABLE_CHAT' }
        ],
        ACADEMICS: [
            {
                label: 'Check Progress Card',
                response: 'View your latest results in Reports > Progress Card Report.',
                pageName: 'Exam Report',
                link: '/StudentPortal/student-dashboard/Exam/ExamReport'
            },
            {
                label: 'Apply Leave',
                response: 'To apply leave, Go to Admission > Leave Apply Online',
                pageName: 'Online Leave Application',
                link: '/StudentPortal/student-dashboard/Admission/OnlineLeaveApp'
            },

            {
                label: 'My Attendance',
                response: 'Check your yearly attendance in Reports > Student Yearly Attendance Report.',
                pageName: 'Attendance Details',
                link: '/StudentPortal/masters/attendance-details'
            }
        ],
        PAYMENTS: [
            {
                label: 'Pay Fees Online',
                response: 'Pay your outstanding fees securely in Masters > Fee Online Payment.',
                pageName: 'Fee Online Payment',
                link: '/StudentPortal/masters/feeonlinpayment'
            },
            {
                label: 'Fees dashboard',
                response: 'Visualise your fees history > Fee Cumulative.',
                pageName: 'Cumulative Fee Analysis',
                link: '/StudentPortal/masters/feecumulative'
            },
            {
                label: 'Download Fee Receipt',
                response: 'Download your payment receipts in Student Dashboard > Fees > Reports > Portal Fee Receipt.',
                pageName: 'Portal Fee Receipt',
                link: '/StudentPortal/student-dashboard/Fees/Reports/PortalFeeReceipt'
            }
        ],
        COE: [{ label: 'School events', response: 'See your events >.', pageName: 'Calendar of Events', link: '/StudentPortal/coe/coe' }],
        FEEDBACK: [
            {
                label: 'Complaints',
                response: 'You can raise your complaints here.',
                pageName: 'Student Complaints',
                link: '/StudentPortal/student-dashboard/Feedback/Transaction/StudentCompliantsView'
            },
            {
                label: 'Feedbacks',
                response: 'Check student feedbacks.',
                pageName: 'Student Feedback Details',
                link: '/StudentPortal/feedback/studentfeedback'
            }
        ]
    };

    const handleOptionClick = (option: any) => {
        if (option.id === 'ENABLE_CHAT') {
            setIsChatEnabled(true);
            setMessages((prev) => [
                ...prev,
                { id: `${Date.now()}-user`, text: option.label, role: 'user', timestamp: new Date() },
                {
                    id: `${Date.now()}-bot`,
                    text: 'Student Portal Chat enabled. How can I assist you with your academic record?',
                    role: 'assistant',
                    timestamp: new Date()
                }
            ]);
            return;
        }

        if (MENU_STRUCTURE[option.id]) {
            setMenuState(option.id as MenuState);
            setMessages((prev) => [
                ...prev,
                { id: `${Date.now()}-user`, text: option.label, role: 'user', timestamp: new Date() },
                {
                    id: `${Date.now()}-bot`,
                    text: `Checking your ${option.label.toLowerCase()} details. What would you like to see?`,
                    role: 'assistant',
                    timestamp: new Date()
                }
            ]);
            return;
        }

        if (option.response) {
            const resolvedLink = option.pageName ? resolveLink(option.pageName, option.link) : option.link;
            setMessages((prev) => [
                ...prev,
                { id: `${Date.now()}-user`, text: option.label, role: 'user', timestamp: new Date() },
                { id: `${Date.now()}-bot`, text: option.response, role: 'assistant', timestamp: new Date(), link: resolvedLink }
            ]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: Message = { id: `${Date.now()}-user`, text: input, role: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.map((m) => ({ role: m.role, content: m.text })).concat({ role: 'user', content: input }),
                    context: 'StudentPortal'
                })
            });
            const data = await response.json();
            if (data.text) {
                setMessages((prev) => [
                    ...prev,
                    { id: `${Date.now()}-bot`, text: data.text, role: 'assistant', timestamp: new Date(), link: data.link }
                ]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed right-1 bottom-1 z-[2147483647] flex flex-col items-end'>
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            width: isMaximized ? 'min(90vw, 900px)' : '350px',
                            height: isMaximized ? 'min(85vh, 800px)' : '480px'
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={cn(
                            'mb-4 flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:bg-zinc-900',
                            isMaximized && 'fixed inset-4 z-[2147483647] m-auto'
                        )}>
                        {/* Header */}
                        <div className={cn('flex items-center justify-between bg-gradient-to-r p-4 text-white', currentContext.color)}>
                            <div className='flex items-center gap-3'>
                                <div className='relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md'>
                                    <GraduationCap className='h-6 w-6 text-white' />
                                </div>
                                <div>
                                    <h3 className='flex items-center gap-1.5 font-bold text-sm leading-none'>
                                        School Assistant
                                        <Sparkles className='h-3 w-3 text-yellow-300' />
                                    </h3>
                                    <p className='mt-1 flex items-center gap-1 text-[11px] opacity-80'>
                                        <span className='h-1.5 w-1.5 rounded-full bg-green-400' />
                                        Your personal portal helper
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center gap-1'>
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className='rounded-md p-1.5 transition-colors hover:bg-white/10'>
                                    <Minus className='h-4 w-4' />
                                </button>
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className='rounded-md p-1.5 transition-colors hover:bg-white/10'>
                                    {isMaximized ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className='rounded-md p-1.5 transition-colors hover:bg-white/10'>
                                    <X className='h-4 w-4' />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className='relative flex-1 overflow-hidden bg-slate-50 dark:bg-zinc-800/30'>
                            <ScrollArea className='h-full' ref={scrollRef}>
                                <div className='flex flex-col gap-4 p-5'>
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex w-full flex-col gap-1.5',
                                                msg.role === 'user' ? 'ml-auto items-end' : 'items-start'
                                            )}>
                                            <div
                                                className={cn(
                                                    'flex max-w-[85%] flex-col gap-2 whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm',
                                                    msg.role === 'user'
                                                        ? 'rounded-tr-none bg-primary text-primary-foreground'
                                                        : 'rounded-tl-none border border-border/50 bg-white text-foreground dark:bg-zinc-800'
                                                )}>
                                                <span>{msg.text}</span>
                                                {msg.role === 'assistant' && msg.link && (
                                                    <Button
                                                        variant='default'
                                                        size='sm'
                                                        onClick={() => {
                                                            if (msg.link) router.push(msg.link);
                                                        }}
                                                        className='mt-1 h-7 w-full bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold text-white text-xs shadow-sm hover:from-blue-600 hover:to-indigo-700'>
                                                        Go to Page →
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {!isLoading && (
                                        <div className='mt-2 flex flex-wrap gap-2 px-1'>
                                            {MENU_STRUCTURE[menuState]?.map((opt: any, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleOptionClick(opt)}
                                                    className='flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-2 text-foreground/80 text-xs shadow-sm transition-all hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-zinc-700'>
                                                    <span className='h-1.5 w-1.5 rounded-full bg-blue-500/70' />
                                                    {opt.label}
                                                </button>
                                            ))}
                                            {menuState !== 'ROOT' && (
                                                <button
                                                    onClick={() => setMenuState('ROOT')}
                                                    className='mt-2 w-full text-center text-[10px] text-muted-foreground transition-colors hover:text-primary'>
                                                    ← Back to Main Menu
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className='flex items-start gap-2'>
                                            <div className='flex items-center gap-2 rounded-2xl rounded-tl-none border border-border/50 bg-white px-4 py-3 shadow-sm dark:bg-zinc-800'>
                                                <div className='flex gap-1'>
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]' />
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]' />
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-blue-800' />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Input Area */}
                        <div className='border-border border-t bg-white p-4 dark:bg-zinc-900'>
                            <div className='flex items-center gap-2'>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isChatEnabled ? 'Describe your academic need...' : 'Select an option or enable chat'}
                                    className='h-11 rounded-xl border-none bg-slate-100 dark:bg-zinc-800'
                                    disabled={isLoading || !isChatEnabled}
                                />
                                <Button
                                    size='icon'
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim() || !isChatEnabled}
                                    className='h-11 w-11 rounded-xl bg-blue-600 shadow-lg hover:bg-indigo-700'>
                                    <Send className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='flex flex-col items-center gap-1'>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'group relative flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full border-2 border-white/90 shadow-2xl transition-all duration-500',
                        isOpen ? 'bg-red-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-700'
                    )}>
                    {isOpen ? (
                        <X className='h-4 w-4 text-white' />
                    ) : (
                        <div className='relative flex h-full w-full flex-col items-center justify-center'>
                            <GraduationCap className='z-10 h-5 w-5 text-white drop-shadow-lg' />

                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                className='absolute top-[2px] right-[2px] z-20 flex h-2 w-2 items-center justify-center rounded-full bg-white'>
                                <Sparkles className='h-1 w-1 text-blue-600' />
                            </motion.div>
                        </div>
                    )}
                </motion.button>
                {!isOpen && (
                    <span className='whitespace-nowrap rounded-full border border-black/5 bg-white/50 px-1.5 py-[1px] font-bold text-[8px] text-foreground/80 tracking-wider shadow-sm backdrop-blur-sm dark:bg-black/20 dark:text-white/80'>
                        AI VRM HELP
                    </span>
                )}
            </div>
        </div>
    );
};

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserAccessibleModules } from '@/hooks/common';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Maximize2, MessageSquare, Minimize2, Minus, Send, Sparkles, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    link?: string;
}

export const Chatbot = () => {
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
    const { data: session } = useSession();

    // Context and Messages State
    const context = () => {
        if (pathname.toLowerCase().includes('admission')) return { name: 'Admission', color: 'from-sky-500 to-indigo-600' };
        if (pathname.toLowerCase().includes('fees')) return { name: 'Fees', color: 'from-emerald-500 to-teal-600' };
        if (pathname.toLowerCase().includes('exam')) return { name: 'Exams', color: 'from-violet-500 to-purple-600' };
        if (pathname.toLowerCase().includes('staffportal')) return { name: 'Staff Support', color: 'from-orange-500 to-rose-600' };
        return { name: 'Help Desk', color: 'from-indigo-600 to-blue-700' };
    };
    const currentContext = context();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello! I am your AI VRM Help Desk. Select an option below or type your query once enabled.`,
            role: 'assistant',
            timestamp: new Date()
        }
    ]);

    type MenuState =
        | 'ROOT'
        | 'ACADEMIC'
        | 'ANALYSIS'
        | 'STUDENT'
        | 'FEES'
        | 'OFFICE'
        | 'ENABLE_CHAT'
        | 'ATTENDANCE'
        | 'EXAMS'
        | 'UPLOAD'
        | 'LEAVE'
        | 'INTERACTION'
        | 'ADMISSION_QUERIES';
    const [menuState, setMenuState] = useState<MenuState>('ROOT');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Welcome Message Effect
    useEffect(() => {
        if (messages.length === 1) {
            setMessages([
                {
                    id: '1',
                    text: `Hello! I am your AI VRM Help Desk. How can I assist you today?`,
                    role: 'assistant',
                    timestamp: new Date()
                }
            ]);
        }
    }, [pathname, currentContext.name, messages.length]);

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
        setMenuState('ROOT');
        setIsChatEnabled(false);
    }, [pathname, isOpen]);

    useEffect(() => {
        if (menuState !== 'ENABLE_CHAT' && menuState !== 'ADMISSION_QUERIES') {
            setIsChatEnabled(false);
        }
    }, [menuState]);

    // Early guard AFTER all hooks are declared
    const params = useParams();
    const sub_domain = params?.sub_domain;
    const isAuthPage =
        pathname?.toLowerCase().includes('login') || pathname?.toLowerCase().includes('sign-in') || pathname === `/${sub_domain}`;
    const isStudentPortal = pathname?.toLowerCase().includes('studentportal');
    const isStaffPortal = pathname?.toLowerCase().includes('staffportal');

    if (!mounted || isStudentPortal || isAuthPage) return null;

    // Helper to resolve links from common.ts data (environment-aware)
    const resolveLink = (targetName: string, fallbackLink?: string) => {
        if (!accessibleModule?.data) return fallbackLink;
        for (const module of accessibleModule.data) {
            for (const menu of module.menu) {
                for (const subMenu of menu.sub_menu) {
                    const page = subMenu.pages.find(
                        (p) => p.name.toLowerCase() === targetName.toLowerCase() || p.title?.toLowerCase() === targetName.toLowerCase()
                    );
                    if (page) return page.url;
                }
            }
        }
        return fallbackLink;
    };

    const MENU_STRUCTURE: Record<string, any> = {
        ROOT: [
            { label: 'Academic Operations', id: 'ACADEMIC' },
            { label: 'Performance Analysis', id: 'ANALYSIS' },
            { label: 'Fees & Payments', id: 'FEES' },
            { label: 'Student Records', id: 'STUDENT' },
            { label: 'Staff ESS (Self Service)', id: 'OFFICE' },
            { label: 'Admission queries', id: 'ADMISSION_QUERIES' },
            { label: 'Detailed Query', id: 'ENABLE_CHAT' }
        ],
        ADMISSION_QUERIES: [
            {
                label: 'when is the last date to apply',
                query: 'when is the last date to apply',
                isAdmissionQuery: true
            },
            {
                label: 'I want to know institution facilitites',
                query: 'I want to know institution facilitites',
                isAdmissionQuery: true
            },
            {
                label: 'admission fees',
                query: 'admission fees',
                isAdmissionQuery: true
            },
            {
                label: 'when i ll get to know my aplication status',
                query: 'when i ll get to know my aplication status',
                isAdmissionQuery: true
            }
        ],
        ACADEMIC: [
            {
                label: 'Marks Entry',
                response: 'Enter marks in Exam > Exam Module > Marks Entry.',
                pageName: 'Marks Entry',
                link: '/Exam/exam-module/marks-entry/exam-marks-entry'
            },
            {
                label: 'Hall Ticket Gen',
                response: 'Generate hall tickets in Exam > Exam Mapping > Hall Ticket Generation.',
                pageName: 'Hall Ticket Generation',
                link: '/Exam/exam-module/exam-mapping/exam-hall-ticket-generation'
            },
            {
                label: 'Marks Calculation',
                response: 'Calculate final scores in Exam > Marks Calculation.',
                pageName: 'Exam Marks Calculation',
                link: '/Exam/exam-module/calculation/marks-calculation'
            },
            {
                label: 'Cumulative Report',
                response: 'View overall academic summary in Exam > Reports > Cumulative Report.',
                pageName: 'Cumulative Report',
                link: '/Exam/exam-module/reports/cumulative-report'
            }
        ],
        ANALYSIS: [
            {
                label: 'AI Class Analysis',
                response: 'Analyze performance trends in Exam > AI Performance Analysis.',
                pageName: 'AI Performance Analysis',
                link: '/Exam/exam-module/ai-performance-analysis'
            },
            {
                label: 'Progress Card Report',
                response: 'View student progress cards in Exam > Reports > Progress Card Report.',
                pageName: 'Progress Card Report',
                link: '/Exam/exam-module/reports/vvehpc_exam-report-card'
            },
            {
                label: 'Toppers List',
                response: 'View exam toppers in Exam > Reports > Toppers List Report.',
                pageName: 'Toppers List Report',
                link: '/Exam/exam-module/reports/toppers-list-report'
            },
            {
                label: 'Grade Slab Report',
                response: 'View grade distribution in Exam > Reports > Grade Slab Report.',
                pageName: 'Grade Slab Report',
                link: '/Exam/exam-module/reports/grade-slab-report'
            }
        ],
        FEES: [
            {
                label: 'Fee Collection',
                response: 'Record fee transactions in Fees > Transactions > Fee Transaction.',
                pageName: 'Fee Transaction',
                link: '/fees/transactions/feetransaction'
            },
            {
                label: 'Fee Concession',
                response: 'Manage student concessions in Fees > Transactions > Fee Concession.',
                pageName: 'Fee Concession',
                link: '/fees/transactions/feeconcession'
            },
            {
                label: 'Daily Collection',
                response: 'View daily collection summary in Fees > Reports > Daily Fee Collection.',
                pageName: 'Daily Fee Collection',
                link: '/fees/feereports/dailyfeecollectionreport'
            },
            {
                label: 'Defaulters List',
                response: 'View fee defaulters in Fees > Reports > Fee Defaulter Report.',
                pageName: 'Fee Defaulter Report',
                link: '/fees/feereports/feedefaulterreport'
            }
        ],
        STUDENT: [
            {
                label: 'Mark Attendance',
                response: 'Record daily attendance in Admission > Attendance Entry > Student Attendance.',
                pageName: 'Student Attendance',
                link: '/admission/preadmission/attendance-entry/student-attendance'
            },
            {
                label: 'Student Search',
                response: 'Find student details in Admission > Reports > Student Search.',
                pageName: 'Student Search',
                link: '/admission/preadmission/reports/student-search'
            },
            {
                label: 'Admission Register',
                response: 'View student register in Admission > Admission > Reports > Admission Register Report.',
                pageName: 'Admission Register Report',
                link: '/admission/preadmission/reports/admission-register-report'
            },
            {
                label: 'Total Strength',
                response: 'View school strength report in Admission > Reports > Total Strength Report.',
                pageName: 'Total Strength Report',
                link: '/admission/preadmission/reports/total-strength'
            },
            {
                label: 'TC Application',
                response: 'Apply for TC in Admission > Preadmission > Student TC > Apply TC.',
                pageName: 'Apply TC',
                link: '/admission/preadmission/student-transfer-certificate/apply'
            }
        ],
        OFFICE: [
            {
                label: 'Apply Leave',
                response: 'Apply for leave in HRMS > Leave Management > Apply Leave.',
                pageName: 'Apply Leave',
                link: '/hrms/leave-management/apply-leave'
            },
            {
                label: 'Salary Slips',
                response: 'Download salary slips in HRMS > Reports > Salary Slip.',
                pageName: 'Salary Slip',
                link: '/hrms/reports/salary-slip'
            },
            {
                label: 'Cumulative Salary',
                response: 'View salary summary in HRMS > Reports > Cumulative Salary Report.',
                pageName: 'Cumulative Salary Report',
                link: '/hrms/reports/cumulative-salary-report'
            },
            {
                label: 'Employee Profile',
                response: 'View your profile in HRMS > Employee > Employee Register.',
                pageName: 'Employee Register',
                link: '/hrms/employee'
            }
        ]
    };

    const STAFF_MENU_STRUCTURE: Record<string, any> = {
        ROOT: [
            { label: 'Attendance & Entry', id: 'ATTENDANCE' },
            { label: 'Exams & Evaluation', id: 'EXAMS' },
            { label: 'Upload & Notice Board', id: 'UPLOAD' },
            { label: 'Leave & Biometrics ESS', id: 'LEAVE' },
            { label: 'Interactions', id: 'INTERACTION' },
            { label: 'Admission queries', id: 'ADMISSION_QUERIES' },
            { label: 'Detailed Query', id: 'ENABLE_CHAT' }
        ],
        ADMISSION_QUERIES: [
            {
                label: 'when is the last date to apply',
                query: 'when is the last date to apply',
                isAdmissionQuery: true
            },
            {
                label: 'I want to know institution facilitites',
                query: 'I want to know institution facilitites',
                isAdmissionQuery: true
            },
            {
                label: 'admission fees',
                query: 'admission fees',
                isAdmissionQuery: true
            },
            {
                label: 'when i ll get to know my aplication status',
                query: 'when i ll get to know my aplication status',
                isAdmissionQuery: true
            }
        ],
        ATTENDANCE: [
            {
                label: 'Attendance Entry',
                response: 'Record daily attendance in Attendance > Transaction > Attendance Entry.',
                pageName: 'Attendance Entry',
                link: '/admission/preadmission/attendance-entry/student-attendance'
            },
            {
                label: 'Attendance Report',
                response: 'View attendance history in Attendance > Report > Student Attendance Report.',
                pageName: 'Student Attendance Report',
                link: '/admission/preadmission/reports/student-attendance-report'
            }
        ],
        EXAMS: [
            {
                label: 'AI MCQ Quiz',
                response: 'Manage online MCQ quizzes in Exam > Exam > AI MCQ Quiz.',
                pageName: 'AI MCQ Quiz',
                link: '/StaffPortal/ai-mcq-quiz'
            },
            {
                label: 'OMR Sheet Evaluator',
                response: 'Evaluate scanned OMR sheets using AI in Exam > Exam > OMR Sheet Evaluator.',
                pageName: 'OMR Sheet Evaluator',
                link: '/StaffPortal/omr-sheet-evaluator'
            },
            {
                label: 'Marks Entry',
                response: 'Direct marks entry in Exam > Marks Entry > Marks Entry.',
                pageName: 'Marks Entry',
                link: '/Exam/exam-module/marks-entry/exam-marks-entry'
            },
            {
                label: 'Cumulative Report',
                response: 'View cumulative exam report in Exam > Report > Cumulative Report.',
                pageName: 'Cumulative Report',
                link: '/Exam/exam-module/reports/cumulative-report'
            }
        ],
        UPLOAD: [
            {
                label: 'Homework Upload',
                response: 'Upload student homework in Upload > Transaction > Homework.',
                pageName: 'Homework',
                link: '/StaffPortal/Upload/ivrm-homework'
            },
            {
                label: 'Homework Marks Entry',
                response: 'Enter homework grades in Upload > Transaction > Homework Marks Entry.',
                pageName: 'Homework Marks Entry',
                link: '/StaffPortal/Upload/HomeWork_Marks_Enter'
            },
            {
                label: 'Notice Board',
                response: 'Post notices on notice board in Upload > Transaction > Notice Board.',
                pageName: 'Notice Board',
                link: '/StaffPortal/Upload/notice-board'
            },
            {
                label: 'Classwork Upload',
                response: 'Upload classwork files in Upload > Transaction > Classwork.',
                pageName: 'Classwork',
                link: '/StaffPortal/Upload/ivrm-classwork'
            }
        ],
        LEAVE: [
            {
                label: 'Leave Application',
                response: 'Apply for leaves in Leave > Leave Management > Leave Application.',
                pageName: 'Leave Application',
                link: '/StaffPortal/leave-management/online-leave-application'
            },
            {
                label: 'Leave Approval',
                response: 'Approve or Reject leave requests in Leave > Leave Management > Leave Approval.',
                pageName: 'Leave Approval',
                link: '/StaffPortal/leave-management/leave-approval'
            },
            {
                label: 'Biometric Punch Report',
                response: 'View employee punch report in Biometric Report > Report > Employee Punch Report.',
                pageName: 'Employee Punch Report',
                link: '/StaffPortal/BiometricReport/employeePunchAttendence'
            }
        ],
        INTERACTION: [
            {
                label: 'IVRM Interaction',
                response: 'View interactions in Interaction > Transaction > IVRM Interaction.',
                pageName: 'IVRM Interaction',
                link: '/StaffPortal/Interactions/IVRM_Interactions'
            },
            {
                label: 'SCS Interaction',
                response: 'View SCS interactions in Interaction > Transaction > SCS Interaction.',
                pageName: 'SCS Interaction',
                link: '/StaffPortal/Interactions/SCS_IVRM_Interactions'
            }
        ]
    };

    const ACTIVE_MENU_STRUCTURE = isStaffPortal ? STAFF_MENU_STRUCTURE : MENU_STRUCTURE;

    const handleOptionClick = (option: any) => {
        if (option.id === 'ENABLE_CHAT') {
            setIsChatEnabled(true);
            const msg: Message = {
                id: `${Date.now()}-user`,
                text: 'My query not listed',
                role: 'user',
                timestamp: new Date()
            };
            const botMsg: Message = {
                id: `${Date.now()}-bot`,
                text: 'Chatbox enabled. Please type your query precisely.',
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, msg, botMsg]);
            return;
        }

        if (option.isAdmissionQuery) {
            const userMsg: Message = {
                id: `${Date.now()}-user`,
                text: option.label,
                role: 'user',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, userMsg]);
            handleAdmissionQuery(option.query);
            return;
        }

        // Category transition
        if (
            [
                'ACADEMIC',
                'ANALYSIS',
                'STUDENT',
                'FEES',
                'OFFICE',
                'ATTENDANCE',
                'EXAMS',
                'UPLOAD',
                'LEAVE',
                'INTERACTION',
                'ADMISSION_QUERIES'
            ].includes(option.id)
        ) {
            setMenuState(option.id as MenuState);
            if (option.id === 'ADMISSION_QUERIES') {
                setIsChatEnabled(true);
            }
            const userMsg: Message = {
                id: `${Date.now()}-user`,
                text: option.label,
                role: 'user',
                timestamp: new Date()
            };
            const botMsg: Message = {
                id: `${Date.now()}-bot`,
                text: 'What can I help you with?',
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, userMsg, botMsg]);
            return;
        }

        // Local response (Avoids API call for menu options)
        if (option.response) {
            const resolvedLink = option.pageName ? resolveLink(option.pageName, option.link) : option.link;
            const userMsg: Message = {
                id: `${Date.now()}-user`,
                text: option.label,
                role: 'user',
                timestamp: new Date()
            };
            const botMsg: Message = {
                id: `${Date.now()}-bot`,
                text: option.response,
                role: 'assistant',
                timestamp: new Date(),
                link: resolvedLink
            };
            setMessages((prev) => [...prev, userMsg, botMsg]);
        }
    };

    const handleAdmissionQuery = async (queryText: string) => {
        setIsLoading(true);
        try {
            const mi_id_str = session?.mi_id?.toString() || '';
            const response = await fetch('/api/chatbot/admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: queryText,
                    mi_id: mi_id_str
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch from admission API: ${response.statusText}`);
            }

            const data = await response.json();
            const replyText = data.answer || "I couldn't retrieve an answer for that query.";

            const botMsg: Message = {
                id: `${Date.now()}-bot-${Math.random().toString(36).substr(2, 9)}`,
                text: replyText,
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Admission Query Error:', error);
            const errorMessage: Message = {
                id: `${Date.now()}-error-${Math.random().toString(36).substr(2, 9)}`,
                text: "I'm having trouble connecting to the admission service right now. Please try again later.",
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (text?: string, link?: string) => {
        const messageText = text || input;
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            id: `${Date.now()}-user-${Math.random().toString(36).substr(2, 9)}`,
            text: messageText,
            role: 'user',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (menuState === 'ADMISSION_QUERIES') {
                const mi_id_str = session?.mi_id?.toString() || '';
                const response = await fetch('/api/chatbot/admission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: messageText,
                        mi_id: mi_id_str
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch from admission API: ${response.statusText}`);
                }

                const data = await response.json();
                const replyText = data.answer || "I couldn't retrieve an answer for that query.";

                const botMessage: Message = {
                    id: `${Date.now()}-bot-${Math.random().toString(36).substr(2, 9)}`,
                    text: replyText,
                    role: 'assistant',
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                const response = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messages.map((m) => ({ role: m.role, content: m.text })).concat({ role: 'user', content: messageText }),
                        context: currentContext.name // Pass context to API
                    })
                });

                const data = await response.json();

                if (data.text) {
                    // If we have a link (from menu click), we pass it to the message object

                    const botMessage: Message = {
                        id: `${Date.now()}-bot-${Math.random().toString(36).substr(2, 9)}`,
                        text: data.text,
                        role: 'assistant',
                        timestamp: new Date(),
                        link: link // Attach link if present
                    };
                    setMessages((prev) => [...prev, botMessage]);

                    // Reset to root after meaningful interaction? Or stay? Let's stay in context for now.
                    // setMenuState('ROOT');
                } else if (data.error) {
                    throw new Error(data.error);
                }
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage: Message = {
                id: `${Date.now()}-error-${Math.random().toString(36).substr(2, 9)}`,
                text: "I'm having trouble connecting right now. Please try again later.",
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
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
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={cn(
                            'mb-4 flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl dark:bg-zinc-900',
                            isMaximized && 'fixed inset-4 z-[2147483647] m-auto'
                        )}>
                        {/* Header */}
                        <div className={cn('flex items-center justify-between bg-gradient-to-r p-4 text-white', currentContext.color)}>
                            <div className='flex items-center gap-3'>
                                <div className='relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md'>
                                    <Bot className='h-6 w-6 text-white' />
                                    <div className='absolute right-0 bottom-0 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-green-500' />
                                </div>
                                <div>
                                    <h3 className='flex items-center gap-1.5 font-bold text-sm leading-none'>
                                        AI VRM {currentContext.name}
                                        <Sparkles className='h-3 w-3 text-yellow-300' />
                                    </h3>
                                    <p className='mt-1 flex items-center gap-1 text-[11px] opacity-80'>
                                        <span className='h-1.5 w-1.5 rounded-full bg-green-400' />
                                        Always here to help you
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center gap-1'>
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className='rounded-md p-1.5 transition-colors hover:bg-white/10'
                                    title='Minimize'>
                                    <Minus className='h-4 w-4' />
                                </button>
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className='rounded-md p-1.5 transition-colors hover:bg-white/10'
                                    title={isMaximized ? 'Restore' : 'Maximize'}>
                                    {isMaximized ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className='rounded-md p-1.5 transition-colors hover:bg-white/10'
                                    title='Close'>
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
                                                        className='mt-1 h-7 w-full bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white text-xs shadow-sm hover:from-indigo-600 hover:to-purple-700'>
                                                        Go to Page →
                                                    </Button>
                                                )}
                                            </div>
                                            <span className='px-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wider opacity-60'>
                                                {msg.role === 'assistant' ? 'AI Assistant' : 'You'} •{' '}
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Quick Help Chips (Hierarchical Menu) */}
                                    {!isLoading && (
                                        <div className='fade-in slide-in-from-bottom-4 mt-2 flex animate-in flex-col gap-2 px-1 duration-500'>
                                            <div className='flex flex-wrap gap-2'>
                                                {ACTIVE_MENU_STRUCTURE[menuState]?.map((opt: any, i: number) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleOptionClick(opt)}
                                                        className='flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-2 text-left text-foreground/80 text-xs shadow-sm transition-all hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700'>
                                                        <span className='h-1.5 w-1.5 rounded-full bg-primary/70' />
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Back Button for Sub-menus */}
                                            {menuState !== 'ROOT' && (
                                                <button
                                                    onClick={() => setMenuState('ROOT')}
                                                    className='mt-2 flex items-center gap-1 self-start px-2 text-[10px] text-muted-foreground transition-colors hover:text-primary'>
                                                    ← Back to Main Menu
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className='flex items-start gap-2'>
                                            <div className='flex items-center gap-2 rounded-2xl rounded-tl-none border border-border/50 bg-white px-4 py-3 shadow-sm dark:bg-zinc-800'>
                                                <div className='flex gap-1'>
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]' />
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]' />
                                                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-primary' />
                                                </div>
                                                <span className='ml-2 text-muted-foreground text-xs'>Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Input Area */}
                        <div className='border-border border-t bg-white p-4 dark:bg-zinc-900'>
                            <div className='flex items-center gap-2'>
                                <div className='relative flex-1'>
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder={isChatEnabled ? 'Type your query precisely...' : "Click 'My query not listed' to type"}
                                        className='h-11 rounded-xl border-none bg-slate-100 pr-10 shadow-inner focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 dark:bg-zinc-800'
                                        disabled={isLoading || !isChatEnabled}
                                    />
                                    <MessageSquare className='-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-muted-foreground/40' />
                                </div>
                                <Button
                                    size='icon'
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim() || !isChatEnabled}
                                    className='h-11 w-11 shrink-0 rounded-xl bg-primary shadow-lg transition-all hover:bg-primary/90 active:scale-90 disabled:opacity-50'>
                                    <Send className='h-4 w-4' />
                                </Button>
                            </div>
                            <p className='mt-3 text-center text-[9px] text-muted-foreground opacity-60'>
                                AI responses are generated based on ERP knowledge and subject policy.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized Bar */}
            <AnimatePresence>
                {isOpen && isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => setIsMinimized(false)}
                        className={cn(
                            'mb-4 flex w-[300px] cursor-pointer items-center gap-3 rounded-t-xl border border-white/20 bg-gradient-to-r px-4 py-3 text-white shadow-2xl backdrop-blur-md',
                            currentContext.color
                        )}>
                        <Bot className='h-5 w-5' />
                        <span className='truncate font-bold text-xs tracking-tight'>Support: AI VRM {currentContext.name}</span>
                        <Maximize2 className='ml-auto h-4 w-4 opacity-70' />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div className='flex flex-col items-center gap-1'>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleChat}
                    className={cn(
                        'group relative flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ring-2 ring-white/90 transition-all duration-500 dark:ring-zinc-800/90',
                        isOpen && !isMinimized ? 'bg-red-500 ring-red-100' : cn('bg-gradient-to-tr', currentContext.color)
                    )}>
                    <div className='absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20' />
                    {isOpen && !isMinimized ? (
                        <X className='z-10 h-4 w-4 text-white' />
                    ) : (
                        <div className='relative flex h-full w-full flex-col items-center justify-center'>
                            <Bot className='z-10 h-5 w-5 text-white drop-shadow-lg' />

                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                className='absolute top-[2px] right-[2px] z-20 flex h-2 w-2 items-center justify-center rounded-full bg-white'>
                                <Sparkles className='h-1 w-1 text-primary' />
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

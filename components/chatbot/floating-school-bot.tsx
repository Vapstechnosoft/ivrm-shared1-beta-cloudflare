'use client';

import { motion } from 'framer-motion';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SchoolAssistantBot } from './school-assistant-bot';

export function FloatingSchoolBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const params = useParams();
    const sub_domain = params?.sub_domain;

    const isAuthPage =
        pathname?.toLowerCase().includes('login') || pathname?.toLowerCase().includes('sign-in') || pathname === `/${sub_domain}`;

    if (!mounted || isAuthPage) return null;

    return (
        <>
            <div className='group fixed right-20 bottom-1 z-[2147483647] flex flex-col items-center gap-1'>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className='flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-xl ring-2 ring-indigo-600 transition-all hover:bg-slate-50'>
                    <img src='/chatbot/standing-robot-black.png' alt='School Assistant' className='h-full w-full object-contain' />
                </motion.button>
                <div className='flex h-[12px] items-center justify-center rounded-full border border-black/5 bg-white/50 px-1.5 shadow-sm backdrop-blur-sm'>
                    <span className='translate-y-[0px] whitespace-nowrap font-bold text-[7.5px] text-black/80 uppercase leading-none tracking-wider'>
                        School Assistant
                    </span>
                </div>
            </div>

            <SchoolAssistantBot open={isOpen} onOpenChange={setIsOpen} />
        </>
    );
}

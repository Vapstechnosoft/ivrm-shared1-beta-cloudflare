'use client';

import { Phone, Shield } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='sticky bottom-0 z-50 w-full border-slate-200 border-t bg-white/80 py-4 backdrop-blur-md'>
            <div className='container mx-auto px-6'>
                <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                    {/* Copyright & Branding Section */}
                    <div className='flex flex-wrap items-center justify-center gap-2 font-medium text-slate-500 text-sm'>
                        <Shield className='h-4 w-4 text-[#EA580C]' />
                        <p>© VAPS 2019 . All rights reserved.</p>
                        <div className='h-4 w-px bg-slate-200' />
                        <p className='font-bold text-slate-600 tracking-tight'>VAPS DIGITAL CAMPUS -</p>
                        <div className='h-4 w-px bg-slate-200' />
                        <div className='flex items-center gap-2'>
                            <Phone className='h-4 w-4 text-[#10B981]' />
                            <span className='font-bold text-slate-600'>Toll Free No. 01206901888</span>
                        </div>
                    </div>

                    {/* Subtle Accent */}
                    <div className='absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#EA580C]/20 to-transparent' />
                </div>
            </div>
        </footer>
    );
}

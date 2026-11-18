'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Bell, BookOpen, Briefcase, ChevronRight, CircleCheck, GraduationCap, Search, Sparkles, TrendingUp, Users } from 'lucide-react';

const stats = [
    {
        title: 'Total Students',
        value: '3,240',
        change: '+12.5%',
        icon: Users,
        gradient: 'from-[#EA580C] to-[#C2410C]',
        delay: 0.1
    },
    {
        title: 'Avg. Attendance',
        value: '95.8%',
        change: '+1.2%',
        icon: CircleCheck,
        gradient: 'from-[#EA580C] to-[#C2410C]',
        delay: 0.2
    },
    {
        title: 'Staff On Duty',
        value: '142',
        change: 'Stable',
        icon: Briefcase,
        gradient: 'from-[#EA580C] to-[#C2410C]',
        delay: 0.3
    },
    {
        title: 'Active Courses',
        value: '28',
        change: 'New!',
        icon: BookOpen,
        gradient: 'from-[#EA580C] to-[#D97706]',
        delay: 0.4
    }
];

export default function PremiumDashboard() {
    return (
        <div className='container-fluid min-h-screen bg-slate-50/50 px-6 py-8'>
            {/* Search & Welcome Row */}
            <div className='mb-10 flex flex-col items-center justify-between gap-6 md:flex-row'>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='flex-1'>
                    <h1 className='font-black text-3xl text-slate-900 tracking-tighter md:text-5xl'>
                        Welcome, <span className='text-[#EA580C]'>Explorer</span>
                    </h1>
                    <p className='mt-2 font-bold text-[10px] text-slate-500 uppercase tracking-[0.2em]'>Friday, February 13, 2026</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='relative w-full md:w-[400px]'>
                    <div className='pointer-events-none absolute inset-y-0 left-5 flex items-center'>
                        <Search className='h-5 w-5 text-slate-400' />
                    </div>
                    <input
                        type='text'
                        placeholder='Search modules, features, or records...'
                        className='w-full rounded-3xl border-2 border-slate-100 bg-white py-4 pr-6 pl-14 font-medium text-slate-600 shadow-sm transition-all focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/10'
                    />
                </motion.div>
            </div>

            {/* Hero Section */}
            <div className='row mb-10'>
                <div className='col-12'>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='card-premium relative overflow-hidden border-none bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E40AF] p-10 text-white md:p-16'>
                        {/* Background Decoration */}
                        <div className='-translate-y-1/2 absolute top-0 right-0 h-full w-[50%] translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]' />
                        <div className='-translate-x-1/3 absolute bottom-0 left-0 h-full w-[30%] translate-y-1/3 rounded-full bg-indigo-500/20 blur-[100px]' />

                        <div className='relative z-10 flex flex-col items-center gap-12 lg:flex-row'>
                            <div className='flex-1 space-y-8 text-center lg:text-left'>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md'>
                                    <Sparkles className='h-4 w-4 fill-orange-300 text-orange-300' />
                                    <span className='font-black text-[10px] uppercase tracking-[0.25em]'>Amber Core Enabled</span>
                                </motion.div>

                                <h2 className='font-black text-5xl leading-[0.9] tracking-tighter md:text-7xl'>
                                    Crystal <br />
                                    <span className='text-orange-400'>Intelligence</span>
                                </h2>

                                <p className='mx-auto max-w-2xl font-medium text-lg text-white/80 leading-relaxed lg:mx-0'>
                                    A professional digital workspace built for institutional excellence. Powered by the VAPS Amber engine.
                                </p>

                                <div className='flex flex-wrap justify-center gap-5 pt-6 lg:justify-start'>
                                    <Button className='btn-premium-orange rounded-[1.5rem] px-10 py-8 text-lg shadow-2xl transition-all'>
                                        Launch Explorer
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        className='rounded-[1.5rem] border border-white/20 bg-white/10 px-10 py-8 font-bold text-white backdrop-blur-sm hover:bg-white/20'>
                                        System Stats
                                    </Button>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 30, rotate: 2 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 80, delay: 0.5 }}
                                className='relative hidden lg:block'>
                                <div className='float-premium rounded-[3.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-3xl'>
                                    <img
                                        src='/assets/registration.png'
                                        alt='UI Preview'
                                        className='h-[350px] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]'
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className='row g-4 mb-12'>
                {stats.map((stat, idx) => (
                    <div key={idx} className='col-12 col-sm-6 col-xl-3'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: stat.delay }}
                            className='h-full'>
                            <Card className='card-premium group h-full border-none p-2'>
                                <CardContent className='p-8'>
                                    <div className='mb-8 flex items-start justify-between'>
                                        <div
                                            className={`rounded-3xl bg-gradient-to-br p-5 ${stat.gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}>
                                            <stat.icon className='h-6 w-6' />
                                        </div>
                                        <div className='rounded-full bg-orange-50 px-3 py-1.5 font-black text-[10px] text-orange-600 uppercase tracking-wider'>
                                            {stat.change}
                                        </div>
                                    </div>
                                    <p className='mb-2 font-black text-slate-400 text-xs uppercase tracking-[0.2em]'>{stat.title}</p>
                                    <h3 className='font-black text-4xl text-slate-900 tracking-tighter'>{stat.value}</h3>
                                    <div className='mt-6 h-1.5 w-12 origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#EA580C] to-[#C2410C] transition-transform duration-500 group-hover:scale-x-100' />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Discover Section */}
            <div className='row g-6'>
                <div className='col-lg-8'>
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <Card className='card-premium border-none p-2'>
                            <CardContent className='p-10'>
                                <div className='mb-12 flex items-center justify-between'>
                                    <div>
                                        <h2 className='font-black text-3xl text-slate-900 tracking-tight'>System Performance</h2>
                                        <p className='mt-1 font-medium text-slate-500'>Real-time institutional metrics</p>
                                    </div>
                                    <div className='rounded-2xl bg-orange-50 p-4'>
                                        <TrendingUp className='h-6 w-6 text-orange-600' />
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className='group flex cursor-pointer items-center gap-8 rounded-[2rem] border border-transparent p-6 transition-all duration-300 hover:border-orange-100 hover:bg-slate-50'>
                                            <div className='flex h-16 w-16 transform items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-400 shadow-sm transition-all group-hover:rotate-6 group-hover:bg-[#EA580C] group-hover:text-white'>
                                                <GraduationCap className='h-8 w-8' />
                                            </div>
                                            <div className='flex-1'>
                                                <h4 className='font-bold text-slate-900 text-xl tracking-tight'>
                                                    Active Module Deployment
                                                </h4>
                                                <p className='font-medium text-slate-500'>Session ID: #BS-9021-X</p>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <span className='font-black text-[#EA580C] text-sm uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100'>
                                                    Open
                                                </span>
                                                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 transition-colors group-hover:bg-[#EA580C] group-hover:text-white'>
                                                    <ChevronRight className='h-6 w-6' />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className='col-lg-4'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className='h-full'>
                        <Card className='card-premium h-full border-none bg-slate-900 p-2 text-white'>
                            <CardContent className='flex h-full flex-col bg-slate-900 p-10'>
                                <div className='mb-10 w-fit rounded-3xl bg-[#EA580C] p-5 shadow-orange-500/20 shadow-xl'>
                                    <Bell className='h-6 w-6 animate-bell' />
                                </div>
                                <h3 className='mb-4 font-black text-4xl leading-none tracking-tighter'>
                                    Global <br />
                                    Network
                                </h3>
                                <p className='mb-12 font-medium text-white/40'>Live server status and connectivity status.</p>

                                <div className='flex-1 space-y-4'>
                                    <div className='rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-3xl transition-colors hover:bg-white/10'>
                                        <p className='mb-2 font-black text-[10px] text-orange-400 uppercase tracking-widest'>Live Node</p>
                                        <p className='font-bold leading-tight'>Primary database shard optimized successfully.</p>
                                    </div>
                                    <div className='rounded-[2rem] border border-white/10 bg-white/5 p-6 opacity-60 backdrop-blur-3xl transition-colors hover:bg-white/10'>
                                        <p className='mb-2 font-black text-[10px] text-amber-400 uppercase tracking-widest'>Sync Status</p>
                                        <p className='font-bold leading-tight'>All regional hubs reporting 100% uptime.</p>
                                    </div>
                                </div>

                                <button className='btn-premium-orange mt-12 w-full rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#C2410C] py-6 font-black uppercase tracking-widest shadow-lg shadow-orange-500/25 transition-transform hover:scale-105'>
                                    Network Console
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

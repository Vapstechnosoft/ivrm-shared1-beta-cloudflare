'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserAccessibleModules } from '@/hooks/common';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Boxes, Grid, LayoutGrid, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { setNavigationContext } from './navigation-context';

export function OperationTools() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedModuleId, setSelectedModuleId] = React.useState<number | null>(null);
    const { data: accessibleModules, isLoading } = useUserAccessibleModules();
    const router = useRouter();
    const pathname = usePathname();

    // Close menu when route changes
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const filteredModules = React.useMemo(() => {
        if (!accessibleModules?.data) return [];
        if (!searchQuery.trim()) return accessibleModules.data;
        const q = searchQuery.toLowerCase().trim();
        return accessibleModules.data.filter((module: any) => {
            if (module.name?.toLowerCase().includes(q)) return true;
            return module.menu?.some((menu: any) => {
                if (menu.name?.toLowerCase().includes(q)) return true;
                return menu.sub_menu?.some((sub: any) => {
                    if (sub.name?.toLowerCase().includes(q)) return true;
                    if (sub.pages?.some((p: any) => (p.title || p.name || '')?.toLowerCase().includes(q))) return true;
                    return sub.sub_menu?.some((childSub: any) => {
                        if (childSub.name?.toLowerCase().includes(q)) return true;
                        return childSub.pages?.some((p: any) => (p.title || p.name || '')?.toLowerCase().includes(q));
                    });
                });
            });
        });
    }, [accessibleModules, searchQuery]);

    // Set initial selected module when data loads or search changes
    React.useEffect(() => {
        if (filteredModules.length > 0) {
            const currentStillExists = filteredModules.some((m: any) => m.id === selectedModuleId);
            if (!currentStillExists) {
                setSelectedModuleId(filteredModules[0].id);
            }
        }
    }, [filteredModules, selectedModuleId]);

    const selectedModule = React.useMemo(
        () => accessibleModules?.data?.find((m: any) => m.id === selectedModuleId),
        [accessibleModules, selectedModuleId]
    );

    const handlePageClick = (page: any, menu: any, subMenu: any) => {
        const navData = {
            module: selectedModule?.name || '',
            menu: menu.name,
            subMenu: subMenu.name,
            pages: subMenu.pages,
            title: page.title || '',
            description: page.description || ''
        };

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
        }
        setNavigationContext(navData);

        // Close immediately and navigate with a tiny delay to ensure state propagates
        setIsOpen(false);
        document.body.style.overflow = '';

        // Make AI Edge links portal-aware
        let targetUrl = page.url;
        if (
            targetUrl.includes('ai-notemaker') ||
            targetUrl.includes('ai-performance-analysis') ||
            targetUrl.includes('ai-question-paper-generator') ||
            targetUrl.includes('ai-mcq-quiz')
        ) {
            if (pathname.includes('/StaffPortal/')) {
                if (targetUrl.includes('ai-notemaker')) targetUrl = '/StaffPortal/ai-notemaker';
                else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StaffPortal/ai-performance-analysis';
                else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StaffPortal/ai-question-paper-generator';
                else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StaffPortal/ai-mcq-quiz';
            } else if (pathname.includes('/StudentPortal/')) {
                if (targetUrl.includes('ai-notemaker')) targetUrl = '/StudentPortal/ai-notemaker';
                else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StudentPortal/ai-performance-analysis';
                else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StudentPortal/ai-question-paper-generator';
                else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StudentPortal/ai-mcq-quiz';
            }
        }

        setTimeout(() => {
            router.push(targetUrl);
        }, 10);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant='ghost'
                        className='group flex items-center gap-2 rounded-full px-4 py-2 text-slate-600 transition-all hover:bg-orange-50 hover:text-orange-600 active:scale-95'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600'>
                            <Grid className='h-4 w-4' />
                        </div>
                        <span className='font-bold text-sm tracking-tight'>Operation Tools</span>
                    </Button>
                </DialogTrigger>

                <DialogContent className='!translate-x-[-50%] !translate-y-[-50%] h-screen w-screen max-w-none overflow-hidden rounded-none border-none bg-transparent p-0 shadow-none ring-0 focus:ring-0 md:h-[90vh] md:max-w-[1400px] md:rounded-[3rem] [&>button]:hidden'>
                    <DialogHeader className='sr-only'>
                        <DialogTitle>Module Explorer</DialogTitle>
                    </DialogHeader>

                    <div
                        className='relative flex h-full w-full cursor-default gap-0 overflow-hidden bg-white shadow-[0_80px_160px_-30px_rgba(0,0,0,0.3)]'
                        onClick={(e) => e.stopPropagation()}>
                        {/* Custom content remains the same */}
                        {/* ... (rest of the content handled by replace range) */}
                        {/* Left Pane: Module Sidebar */}
                        <div className='flex w-full flex-col border-slate-100 border-r bg-slate-50/50 md:w-[320px] lg:w-[380px]'>
                            {/* Sidebar Header */}
                            <div className='border-slate-100 border-b p-8 pb-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='rounded-2xl bg-orange-600 p-2 text-white shadow-lg shadow-orange-200'>
                                            <LayoutGrid className='h-5 w-5' />
                                        </div>
                                        <h2 className='font-black text-slate-900 text-xl tracking-tight'>Modules</h2>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => setIsOpen(false)}
                                        className='rounded-full hover:bg-orange-50 hover:text-orange-600 md:hidden'>
                                        <X className='h-5 w-5' />
                                    </Button>
                                </div>

                                <div className='relative mt-6'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search core tools...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='h-11 rounded-full border-transparent bg-white pr-6 pl-11 font-medium text-sm shadow-sm transition-all focus:ring-orange-500/20'
                                    />
                                </div>
                            </div>

                            {/* Module List */}
                            <div className='scrollbar-hide flex-1 overflow-y-auto px-4 py-4'>
                                <div className='space-y-1'>
                                    {isLoading ? (
                                        <div className='flex flex-col items-center justify-center py-10 space-y-4'>
                                            <div className='h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent' />
                                            <p className='text-sm font-medium text-slate-500 animate-pulse'>Loading modules...</p>
                                        </div>
                                    ) : filteredModules.length > 0 ? (
                                        filteredModules.map((module: any) => {
                                            const Icon = getIconByName(module.icon) || Boxes;
                                            const isActive = selectedModuleId === module.id;
                                            return (
                                                // biome-ignore lint/a11y/useButtonType: <explanation>
                                                   <button
                                                    key={module.id}
                                                    onMouseEnter={() => setSelectedModuleId(module.id)}
                                                    onClick={() => setSelectedModuleId(module.id)}
                                                    className={cn(
                                                        'group relative flex w-full items-center gap-4 rounded-3xl p-4 transition-all duration-300',
                                                        isActive
                                                            ? 'bg-white shadow-[0_10px_30px_-10px_rgba(255,100,0,0.15)] md:translate-x-2'
                                                            : 'hover:bg-slate-100/80'
                                                    )}>
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId='sidebar-active'
                                                            className='-translate-y-1/2 absolute top-1/2 left-0 h-8 w-1 rounded-r-full bg-orange-500'
                                                        />
                                                    )}
                                                    <div
                                                        className={cn(
                                                            'flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-300',
                                                            isActive
                                                                ? 'bg-orange-600 text-white shadow-md shadow-orange-100'
                                                                : 'bg-white text-slate-400 group-hover:text-orange-600'
                                                        )}>
                                                        <Icon className='h-5 w-5' />
                                                    </div>
                                                    <div className='flex-1 text-left'>
                                                        <p
                                                            className={cn(
                                                                'font-black text-sm tracking-tight transition-colors',
                                                                isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-orange-600'
                                                            )}>
                                                            {module.name}
                                                        </p>
                                                        <p className='font-bold text-[10px] text-slate-400 uppercase tracking-wider'>
                                                            {module.menu.reduce((acc: number, curr: any) => acc + (curr.sub_menu?.length || 0), 0)} Sections
                                                        </p>
                                                    </div>
                                                    <ArrowRight
                                                        className={cn(
                                                            'h-4 w-4 transition-all',
                                                            isActive
                                                                ? 'translate-x-0 text-orange-600 opacity-100'
                                                                : 'translate-x-4 opacity-0'
                                                        )}
                                                    />
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className='flex flex-col items-center justify-center py-10 text-center opacity-50'>
                                            <Boxes className='h-10 w-10 text-slate-300 mb-3' />
                                            <p className='text-sm font-medium text-slate-500'>No modules found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Pane: Module Details (Hierarchy) */}
                        <div className='hidden flex-1 flex-col bg-white md:flex'>
                            {/* Details Header */}
                            <div className='flex h-[110px] items-center justify-between border-slate-50/50 border-b bg-white/50 px-10 py-8 backdrop-blur-md'>
                                <div className='slide-in-from-left-4 animate-in duration-500'>
                                    <h3 className='font-black text-[11px] text-orange-500 uppercase tracking-[0.25em]'>Explorer</h3>
                                    <p className='mt-1 font-black text-2xl text-slate-900 tracking-tight'>
                                        {selectedModule?.name || 'Select a module'}
                                    </p>
                                </div>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setIsOpen(false)}
                                    className='h-12 w-12 rounded-full bg-slate-50 text-slate-400 transition-all hover:rotate-90 hover:bg-orange-50 hover:text-orange-600'>
                                    <X className='h-6 w-6' />
                                </Button>
                            </div>

                            {/* Hierarchy Grid */}
                            <div className='scrollbar-hide flex-1 overflow-y-auto px-10 py-10'>
                                <AnimatePresence>
                                    <motion.div
                                        key={selectedModuleId}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className='grid gap-12 sm:grid-cols-1 lg:grid-cols-2'>
                                        {selectedModule?.menu.map((menu: any, menuIdx: number) => (
                                            <div key={menuIdx} className='space-y-8'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='h-px flex-1 bg-slate-100' />
                                                    <h4 className='font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]'>
                                                        {menu.name}
                                                    </h4>
                                                    <div className='h-px flex-1 bg-slate-100' />
                                                </div>

                                                <div className='grid gap-6'>
                                                    {menu.sub_menu.map((subMenu: any, subIdx: number) => (
                                                        <div
                                                            key={subIdx}
                                                            className='group relative rounded-[2rem] border border-slate-100 bg-white p-6 transition-all hover:border-transparent hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]'>
                                                            <h5 className='mb-4 font-black text-orange-600 text-xs uppercase tracking-wider'>
                                                                {subMenu.name}
                                                            </h5>
                                                            <div className='grid gap-3'>
                                                                {(() => {
                                                                    const seenTitles = new Set<string>();
                                                                    const seenUrls = new Set<string>();
                                                                    const uniquePages = (subMenu.pages || []).filter((page: any) => {
                                                                        const rawTitle = page.title || page.name || '';
                                                                        const normTitle = rawTitle
                                                                            .toLowerCase()
                                                                            .replace(/[^a-z0-9]/g, '')
                                                                            .trim();
                                                                        const normUrl = (page.url || '')
                                                                            .toLowerCase()
                                                                            .replace(/^app\./i, '')
                                                                            .replace(/\/+/g, '/')
                                                                            .replace(/\/$/, '')
                                                                            .trim();

                                                                        if (normTitle && seenTitles.has(normTitle)) {
                                                                            return false;
                                                                        }
                                                                        if (
                                                                            normUrl &&
                                                                            normUrl !== '#' &&
                                                                            normUrl !== '' &&
                                                                            seenUrls.has(normUrl)
                                                                        ) {
                                                                            return false;
                                                                        }

                                                                        if (normTitle) seenTitles.add(normTitle);
                                                                        if (normUrl && normUrl !== '#' && normUrl !== '')
                                                                            seenUrls.add(normUrl);
                                                                        return true;
                                                                    });

                                                                    const q = searchQuery.toLowerCase().trim();
                                                                    const displayPages = q
                                                                        ? uniquePages.filter((page: any) =>
                                                                              (page.title || page.name || page.url || '').toLowerCase().includes(q)
                                                                          )
                                                                        : uniquePages;

                                                                    if (q && displayPages.length === 0) return null;

                                                                    return displayPages.map((page: any, pageIdx: number) => {
                                                                        const PageIcon = getIconByName(page.icon) || Boxes;
                                                                        return (
                                                                            // biome-ignore lint/a11y/useButtonType: <explanation>
                                                                                <button
                                                                                key={page.id ? `page-${page.id}` : pageIdx}
                                                                                onClick={() => handlePageClick(page, menu, subMenu)}
                                                                                className='group/btn relative flex items-center justify-between overflow-hidden rounded-2xl px-3 py-2 text-left transition-all hover:bg-slate-50 hover:text-orange-600'>
                                                                                <div className='flex items-center gap-3'>
                                                                                    <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/50 text-slate-400 transition-colors group-hover/btn:bg-orange-100 group-hover/btn:text-orange-600'>
                                                                                        <PageIcon className='h-3.5 w-3.5' />
                                                                                    </div>
                                                                                    <span className='font-medium text-slate-600 text-sm transition-colors group-hover/btn:text-orange-600'>
                                                                                        {page.title}
                                                                                    </span>
                                                                                </div>

                                                                                {/* Purple Glowing Dot Indicator on the Right */}
                                                                                <div className='pointer-events-none absolute right-4 flex items-center justify-center opacity-0 transition-all duration-300 group-hover/btn:opacity-100'>
                                                                                    <div className='h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_15px_4px_rgba(168,85,247,0.7)]' />
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    });
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {!selectedModule && !isLoading && (
                                    <div className='flex h-full flex-col items-center justify-center text-center opacity-40'>
                                        <div className='mb-6 rounded-full bg-slate-50 p-10'>
                                            <Boxes className='h-20 w-20 text-slate-200' />
                                        </div>
                                        <p className='font-black text-slate-400 text-xl tracking-tight'>
                                            Select a module to view structure
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
}

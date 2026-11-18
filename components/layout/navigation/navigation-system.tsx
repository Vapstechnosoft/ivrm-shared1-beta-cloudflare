'use client';

import { Button } from '@/components/ui/button';
import { useUserAccessibleModules } from '@/hooks/common';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import type { IUserAccessibleModules } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, ChevronDown, ChevronRight, ReceiptText, Settings, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNavigationContext, setNavigationContext } from './navigation-context';

// Premium Border Beam Component for "Running Border" effect
const BorderBeam = ({ size = 150, duration = 3, colorFrom = '#ff8c00', colorTo = '#ff4500' }) => {
    return (
        <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]'>
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                className='absolute inset-[-100%] z-0'
                style={{
                    background: `conic-gradient(from 0deg, transparent 70%, ${colorFrom}, ${colorTo}, transparent)`
                }}
            />
            {/* Inner mask to create border effect */}
            <div className='absolute inset-[2px] z-10 rounded-[calc(inherit-2px)] bg-white' />
        </div>
    );
};

// Aura Glow Component for the active state
const AuraGlow = () => (
    <motion.div
        layoutId='aura-glow'
        className='absolute inset-0 z-0 rounded-full bg-orange-500/15 blur-[12px]'
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
    />
);

const DEFAULT_AI_EDGE_MODULE = {
    id: 50005,
    name: 'AI Edge',
    icon: 'Sparkles',
    menu: [
        {
            id: 1,
            name: 'AI Edge',
            icon: 'BookOpen',
            sub_menu: [
                {
                    id: 1,
                    name: 'AI Tools',
                    icon: 'Database',
                    pages: [
                        {
                            id: 1,
                            name: 'Question Paper Generator',
                            icon: 'FileText',
                            url: '/iframe/ai-question-paper-generator',
                            title: 'AI Question Paper Generator',
                            description: 'Generate question papers from textbooks using AI'
                        },
                        {
                            id: 2,
                            name: 'AI Notemaker',
                            icon: 'FileText',
                            url: '/iframe/ai-notemaker',
                            title: 'AI Notemaker',
                            description: 'Summarize and create structured notes from textbooks using AI'
                        },
                        {
                            id: 3,
                            name: 'AI Performance Analysis',
                            icon: 'BarChart',
                            url: '/Exam/exam-module/ai-performance-analysis',
                            title: 'AI Performance Analysis',
                            description: 'Analyze performance metrics and AI-driven insights'
                        },
                        {
                            id: 4,
                            name: 'AI Doubt Resolver',
                            icon: 'MessageSquare',
                            url: '/iframe/ai-doubt-resolver',
                            title: 'AI Doubt Resolver',
                            description: 'Resolve academic doubts using AI'
                        }
                    ]
                }
            ]
        }
    ]
};

// Helper function to get icon with fallback for known module names
const getIconWithFallback = (iconName: string | null | undefined, moduleName: string): any => {
    if (iconName) {
        const icon = getIconByName(iconName);
        if (icon) return icon;
    }

    // Fallback icons for known modules
    const fallbackIcons: Record<string, any> = {
        'HRMS Config': Settings,
        'HRMS Config Report': Settings,
        Reports: BarChart3,
        Report: BarChart3,
        Transactions: ReceiptText,
        Transaction: ReceiptText
    };

    return fallbackIcons[moduleName] || null;
};

interface SubMenu {
    id: number;
    name: string;
    icon: string;
    pages: {
        id: number;
        name: string;
        icon: string;
        url: string;
        title?: string;
        description?: string;
    }[];
}

interface Menu {
    id: number;
    name: string;
    icon: string;
    sub_menu: SubMenu[];
}

export interface ActiveNavigation {
    module: string;
    menu: string;
    subMenu: string;
    pages: SubMenu['pages'];
    title?: string;
    description?: string;
}

export function NavigationSystem() {
    const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [hoveredModule, setHoveredModule] = useState<string | null>(null);
    const [hoveredSubMenu, setHoveredSubMenu] = useState<{ menuName: string; subMenuName: string; pages: any[] } | null>(null);
    const [moduleFilter, setModuleFilterState] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const { data: accessibleModule } = useUserAccessibleModules();
    useEffect(() => {
        console.log('accessibleModule', accessibleModule);
    }, [accessibleModule]);

    const handleModuleClick = (moduleName: string) => {
        if (activeDrawer === moduleName) {
            setActiveDrawer(null);
            setActiveModule(null);
        } else {
            setActiveDrawer(moduleName);
            setActiveModule(moduleName);
            // Reset sub-menu state when switching modules to avoid seeing previous module's content
            setHoveredSubMenu(null);
        }
    };

    const handleSubMenuClick = (module: IUserAccessibleModules, menu: Menu, subMenu: SubMenu) => {
        const firstPageUrl = subMenu.pages[0]?.url;
        if (firstPageUrl) {
            const firstPage = subMenu.pages[0];
            const navData = {
                module: module.name,
                menu: menu.name,
                subMenu: subMenu.name,
                pages: subMenu.pages,
                title: firstPage?.title || '',
                description: firstPage?.description || ''
            };
            setNavigationContext(navData);

            if (typeof window !== 'undefined') {
                sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
            }

            setActiveDrawer(null);
            setActiveModule(module.name);

            // Make AI Edge links portal-aware
            let targetUrl = firstPageUrl;
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

            router.push(targetUrl);
        }
    };

    // Close drawer on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.navigation-drawer') && !target.closest('.nav-button')) {
                setActiveDrawer(null);
                setActiveModule(null);
            }
        };

        if (activeDrawer) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [activeDrawer]);

    // Handle external navigation requests (opening modules and filtering)
    useEffect(() => {
        const handleExternalRequest = (event: any) => {
            const moduleName = event.detail;
            if (moduleName) {
                const targetModule = accessibleModule?.data?.find(
                    (m) => m.name.toLowerCase() === moduleName.toLowerCase()
                );
                const nameToOpen = targetModule ? targetModule.name : moduleName;
                setActiveDrawer(nameToOpen);
                setActiveModule(nameToOpen);
                setHoveredSubMenu(null);
            }
        };

        const handleFilterRequest = (event: any) => {
            setModuleFilterState(event.detail);
            if (typeof window !== 'undefined' && event.detail) {
                sessionStorage.setItem('moduleFilter', event.detail);
            } else if (typeof window !== 'undefined') {
                sessionStorage.removeItem('moduleFilter');
            }
        };

        window.addEventListener('module-request', handleExternalRequest);
        window.addEventListener('module-filter', handleFilterRequest);
        return () => {
            window.removeEventListener('module-request', handleExternalRequest);
            window.removeEventListener('module-filter', handleFilterRequest);
        };
    }, [accessibleModule?.data]);

    // Auto-select first sub-menu when drawer opens so pages appear immediately
    useEffect(() => {
        if (activeDrawer) {
            const currentMod =
                accessibleModule?.data?.find(
                    (m) => m.name.toLowerCase() === activeDrawer.toLowerCase()
                ) || (activeDrawer.toLowerCase() === 'ai edge' ? (DEFAULT_AI_EDGE_MODULE as any) : null);

            if (currentMod && currentMod.menu?.[0]?.sub_menu?.[0]) {
                const firstMenu = currentMod.menu[0];
                const firstSubMenu = firstMenu.sub_menu[0];
                setHoveredSubMenu({
                    menuName: firstMenu.name,
                    subMenuName: firstSubMenu.name,
                    pages: firstSubMenu.pages
                });
            }
        }
    }, [activeDrawer, accessibleModule?.data]);

    useEffect(() => {
        // Restore navigation context and filters from sessionStorage on mount
        if (typeof window !== 'undefined') {
            const savedNav = sessionStorage.getItem('activeNavigation');
            const savedFilter = sessionStorage.getItem('moduleFilter');

            if (savedFilter) setModuleFilterState(savedFilter);

            if (savedNav) {
                try {
                    const navData = JSON.parse(savedNav);
                    setNavigationContext(navData);
                    setActiveModule(navData.module);
                } catch (e) {
                    console.error('Failed to restore navigation context', e);
                }
            }
        }
    }, []);

    // Auto-sync navigation context with current URL
    useEffect(() => {
        if (!accessibleModule?.data || !pathname || pathname === '/') return;

        const currentNav = getNavigationContext().activeNavigation;

        // If current navigation already contains this page, just ensure module is active
        if (currentNav?.pages?.some((p) => p.url === pathname)) {
            if (activeModule !== currentNav.module) {
                setActiveModule(currentNav.module);
            }
            return;
        }

        // Search for the page in all modules to sync context
        for (const module of accessibleModule.data) {
            for (const menu of module.menu) {
                for (const subMenu of menu.sub_menu) {
                    const matchedPage = subMenu.pages.find((p) => p.url === pathname);
                    if (matchedPage) {
                        const navData: ActiveNavigation = {
                            module: module.name,
                            menu: menu.name,
                            subMenu: subMenu.name,
                            pages: subMenu.pages,
                            title: matchedPage.title || '',
                            description: matchedPage.description || ''
                        };
                        setNavigationContext(navData);
                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
                        }
                        setActiveModule(module.name);
                        return;
                    }
                }
            }
        }
    }, [accessibleModule, pathname, activeModule]);

    if (activeModule !== null && activeDrawer === null && (pathname === '/' || pathname === null)) {
        setActiveDrawer(null);
        setActiveModule(null);
        return null;
    }

    const handlePageClick = (page: any, module: any, menu: any, subMenu: any) => {
        const navData = {
            module: module.name,
            menu: menu.name,
            subMenu: subMenu.name,
            pages: subMenu.pages,
            title: page.title || '',
            description: page.description || ''
        };
        setNavigationContext(navData);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
        }
        setActiveDrawer(null);

        // Make AI Edge links portal-aware
        let targetUrl = page.url;
        if (
            targetUrl.includes('ai-notemaker') ||
            targetUrl.includes('ai-performance-analysis') ||
            targetUrl.includes('ai-question-paper-generator') ||
            targetUrl.includes('ai-mcq-quiz')
        ) {
            if (pathname.includes('/StaffPortal/')) {
                // If in Staff Portal, force Staff Portal routes
                if (targetUrl.includes('ai-notemaker')) targetUrl = '/StaffPortal/ai-notemaker';
                else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StaffPortal/ai-performance-analysis';
                else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StaffPortal/ai-question-paper-generator';
                else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StaffPortal/ai-mcq-quiz';
            } else if (pathname.includes('/StudentPortal/')) {
                // If in Student Portal, force Student Portal routes
                if (targetUrl.includes('ai-notemaker')) targetUrl = '/StudentPortal/ai-notemaker';
                else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StudentPortal/ai-performance-analysis';
                else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StudentPortal/ai-question-paper-generator';
                else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StudentPortal/ai-mcq-quiz';
            }
        }

        router.push(targetUrl);
    };

    return (
        <div className='flex flex-1 items-center justify-center overflow-hidden py-2'>
            {/* Centered Floating Island Container */}
            <motion.div
                className='relative flex items-center overflow-hidden rounded-full border border-white/40 bg-white/40 px-2 py-1.5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05),0_5px_15px_-5px_rgba(0,0,0,0.02)] backdrop-blur-xl'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                {/* Horizontal Navigation Bar - Now hidden by default to keep header clean */}
                <nav
                    className='scrollbar-hide flex items-center overflow-x-auto scroll-smooth'
                    onMouseLeave={() => setHoveredModule(null)}>
                    <div className='relative flex min-w-max items-center space-x-1 px-2'>
                        {/* Clear Filter Button if active */}
                        {moduleFilter && (
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                    setModuleFilterState(null);
                                    if (typeof window !== 'undefined') sessionStorage.removeItem('moduleFilter');
                                }}
                                className='flex items-center gap-1.5 rounded-full border border-orange-200/50 bg-orange-50 px-3 py-1.5 font-bold text-[10px] text-orange-600 uppercase tracking-wider transition-all hover:bg-orange-100'>
                                <X className='h-3 w-3' />
                                All Modules
                            </Button>
                        )}

                        {accessibleModule?.data
                            ?.filter((module) => !moduleFilter || module.name === moduleFilter)
                            ?.map((module) => {
                                const IconComponent = getIconByName(module.icon);
                                const isActive = activeModule === module.name;
                                const isDigitalSignage = module.name === 'Digital Signage';

                                return (
                                    <div key={module.id} className='relative py-0.5'>
                                        <Button
                                            variant='ghost'
                                            className={cn(
                                                'nav-button group relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-500',
                                                'hover:bg-transparent active:scale-95',
                                                isActive
                                                    ? 'text-orange-600'
                                                    : isDigitalSignage
                                                      ? 'text-orange-500'
                                                      : 'text-gray-500 hover:text-orange-600'
                                            )}
                                            onMouseEnter={() => setHoveredModule(module.name)}
                                            onClick={() => handleModuleClick(module.name)}>
                                            {isActive && <AuraGlow />}

                                            <motion.div
                                                whileHover={{ scale: 1.2, x: 2 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                                className={cn(
                                                    'flex items-center justify-center rounded-full p-1.5 transition-all duration-500',
                                                    isActive
                                                        ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgba(255,100,0,0.3)]'
                                                        : isDigitalSignage
                                                          ? 'bg-orange-100 text-orange-500'
                                                          : 'bg-gray-100/50 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'
                                                )}>
                                                {IconComponent && <IconComponent className='h-3.5 w-3.5' />}
                                            </motion.div>

                                            <span
                                                className={cn(
                                                    'relative z-10 whitespace-nowrap font-bold text-[12px] uppercase tracking-[0.05em] transition-colors duration-500',
                                                    isActive
                                                        ? 'text-orange-600'
                                                        : isDigitalSignage
                                                          ? 'text-orange-500'
                                                          : 'text-gray-600 group-hover:text-orange-600'
                                                )}>
                                                {module.name}
                                            </span>

                                            <ChevronDown
                                                className={cn(
                                                    'relative z-10 ml-1 h-3 w-3 opacity-40 transition-transform duration-500 ease-out',
                                                    isActive && 'rotate-180 text-orange-600 opacity-100'
                                                )}
                                            />
                                        </Button>
                                    </div>
                                );
                            })}
                    </div>
                </nav>
            </motion.div>

            {/* Dropdown Drawer */}
            <AnimatePresence>
                {activeDrawer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]'
                            onClick={() => setActiveDrawer(null)}
                        />

                        {/* Drawer Content - Luxury Curved Responsive Design */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 280,
                                damping: 24,
                                mass: 1.2
                            }}
                            className='navigation-drawer absolute top-[calc(100%+12px)] right-0 left-0 z-50 mx-auto w-[96vw] max-w-[1400px]'>
                            <div className='relative w-full overflow-hidden rounded-[3.5rem] border border-white/50 bg-gradient-to-br from-white via-white/95 to-white/90 p-2.5 shadow-[0_80px_160px_-30px_rgba(140,107,211,0.35),0_50px_100px_-25px_rgba(255,122,24,0.3)] backdrop-blur-3xl'>
                                {/* Crystalline Shine Overlay */}
                                <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-orange-500/5' />

                                <div className='relative flex w-full flex-col overflow-hidden rounded-[2.8rem] bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] md:flex-row'>
                                    {/* Responsive Header for Mobile */}
                                    <div className='flex items-center justify-between border-gray-50 border-b p-6 md:hidden'>
                                        <h3 className='font-black text-gray-800 text-lg tracking-tight'>{activeDrawer}</h3>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => setActiveDrawer(null)}
                                            className='rounded-full bg-gray-50'>
                                            <X className='h-5 w-5 text-gray-400' />
                                        </Button>
                                    </div>

                                    <div className='flex h-[80vh] w-full flex-col overflow-hidden md:h-[75vh]'>
                                        {/* Content area with split scrolling */}
                                        <div className='flex flex-1 flex-col gap-0 overflow-hidden px-0 py-0 xl:flex-row'>
                                            {/* Left Panel: Menu Categories with vertical scroll */}
                                            {(() => {
                                                 const activeModuleObj =
                                                     accessibleModule?.data?.find(
                                                         (m) => m.name.toLowerCase() === activeDrawer?.toLowerCase()
                                                     ) || (activeDrawer?.toLowerCase() === 'ai edge' ? (DEFAULT_AI_EDGE_MODULE as any) : null);

                                                 return (
                                                     <motion.div
                                                         className='scrollbar-hide flex-1 overflow-y-auto p-6 md:p-10'
                                                         initial='visible'
                                                         animate='visible'>
                                                         <div className='flex flex-wrap items-start gap-8'>
                                                             {activeModuleObj?.menu?.map((menu: any) => (
                                                                 <motion.div
                                                                     key={menu.id}
                                                                     className='group relative flex min-w-[240px] flex-col'>
                                                                {/* Interactive Glowing Card */}
                                                                <div
                                                                    className={cn(
                                                                        'relative rounded-2xl border border-gray-100/50 bg-white p-6 shadow-sm transition-all duration-300',
                                                                        'group-hover:-translate-y-1 group-hover:border-transparent group-hover:shadow-[0_20px_40px_-15px_rgba(255,100,0,0.18)]',
                                                                        'overflow-hidden'
                                                                    )}>
                                                                    {/* Running Border Glow */}
                                                                    <div className='absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
                                                                        <BorderBeam duration={3} colorFrom='#8b5cf6' colorTo='#d946ef' />
                                                                    </div>

                                                                    {/* Card Content */}
                                                                    <div className='relative z-20'>
                                                                        <h4 className='mb-4 flex items-center justify-between border-purple-50 border-b pb-2 font-black text-[11px] text-purple-600 uppercase tracking-[0.2em]'>
                                                                            {menu.name}
                                                                            <div className='h-1 w-1 rounded-full bg-purple-500/50 transition-transform group-hover:scale-150' />
                                                                        </h4>

                                                                        {/* Submenu items list style */}
                                                                        <div className='flex flex-col space-y-3.5'>
                                                                            {menu.sub_menu.map((subMenu) => (
                                                                                <button
                                                                                    key={subMenu.id}
                                                                                    className={cn(
                                                                                        'group/item flex items-center justify-between gap-2 pr-2 text-left text-[#555] text-[14px] transition-all hover:font-bold hover:text-orange-600',
                                                                                        hoveredSubMenu?.subMenuName === subMenu.name &&
                                                                                            'font-bold text-orange-600',
                                                                                        subMenu.name === 'Digital Signage' &&
                                                                                            'font-bold text-orange-500'
                                                                                    )}
                                                                                    onMouseEnter={() =>
                                                                                        setHoveredSubMenu({
                                                                                            menuName: menu.name,
                                                                                            subMenuName: subMenu.name,
                                                                                            pages: subMenu.pages
                                                                                        })
                                                                                    }
                                                                                    onClick={() => {
                                                                                        // For mobile/touch: If this sub-menu isn't active, show it first
                                                                                        if (hoveredSubMenu?.subMenuName !== subMenu.name) {
                                                                                            setHoveredSubMenu({
                                                                                                menuName: menu.name,
                                                                                                subMenuName: subMenu.name,
                                                                                                pages: subMenu.pages
                                                                                            });
                                                                                        } else {
                                                                                            // If already active, then navigate
                                                                                            handleSubMenuClick(
                                                                                                activeModuleObj!,
                                                                                                menu,
                                                                                                subMenu
                                                                                            );
                                                                                        }
                                                                                    }}>
                                                                                    <span>{subMenu.name}</span>
                                                                                    <ChevronRight
                                                                                        className={cn(
                                                                                            'h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100',
                                                                                            hoveredSubMenu?.subMenuName === subMenu.name &&
                                                                                                'opacity-100'
                                                                                        )}
                                                                                    />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                 </div>
                                                     </motion.div>
                                                 );
                                             })()}

                                            {/* Right Panel: Dynamic Page Detail Panel - Sticky Header with Scrollable List */}
                                            <div
                                                className={cn(
                                                    'flex h-full w-full flex-shrink-0 flex-col overflow-hidden border-gray-100/80 border-t bg-white shadow-[inset_0_1px_0_0_rgba(0,0,0,0.01),inset_1px_0_0_0_rgba(0,0,0,0.01)] xl:w-[380px] xl:border-t-0 xl:border-l',
                                                    !hoveredSubMenu && 'hidden xl:flex'
                                                )}>
                                                <div className='sticky top-0 z-30 border-gray-100 border-b bg-gray-50/10 p-8 backdrop-blur-md'>
                                                    <h5 className='mb-2 font-black text-[10px] text-orange-500 uppercase tracking-[0.25em]'>
                                                        {hoveredSubMenu ? 'Quick Access' : 'Explorer'}
                                                    </h5>
                                                    <p className='truncate font-bold text-md text-purple-600 leading-none tracking-tight'>
                                                        {hoveredSubMenu ? hoveredSubMenu.subMenuName : `All ${activeDrawer} Modules`}
                                                    </p>
                                                </div>
                                                <div className='scrollbar-hide flex-1 overflow-y-auto p-5'>
                                                    <AnimatePresence mode='wait'>
                                                        {hoveredSubMenu ? (
                                                            <motion.div
                                                                key={hoveredSubMenu.subMenuName}
                                                                initial={{ opacity: 0, scale: 0.98, x: 10 }}
                                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                exit={{ opacity: 0, scale: 0.98, x: -10 }}
                                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                                className='space-y-1.5'>
                                                                {hoveredSubMenu.pages.map((page, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            const activeModuleObj =
                                                                                accessibleModule?.data?.find(
                                                                                    (m) => m.name.toLowerCase() === activeDrawer?.toLowerCase()
                                                                                ) || (activeDrawer?.toLowerCase() === 'ai edge' ? (DEFAULT_AI_EDGE_MODULE as any) : null);
                                                                            handlePageClick(
                                                                                page,
                                                                                activeModuleObj!,
                                                                                { name: hoveredSubMenu.menuName },
                                                                                {
                                                                                    name: hoveredSubMenu.subMenuName,
                                                                                    pages: hoveredSubMenu.pages
                                                                                }
                                                                            );
                                                                        }}
                                                                        className='group/page flex w-full items-center gap-3 rounded-2xl border border-transparent px-5 py-3 text-left text-[#4a4a4a] text-[14px] transition-all hover:border-orange-100/50 hover:bg-orange-50/50 hover:text-orange-600'>
                                                                        <div className='h-1.5 w-1.5 rounded-full bg-orange-500/20 transition-colors group-hover/page:bg-orange-500' />
                                                                        <span className='transition-transform group-hover/page:translate-x-0.5'>
                                                                            {page.title}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        ) : (
                                                            <div className='flex h-full flex-col items-center justify-center px-10 text-center'>
                                                                <div className='mb-6 rounded-[3rem] bg-orange-50/30 p-10'>
                                                                    <img
                                                                        src='/assets/student_academic.png'
                                                                        alt='Navigation'
                                                                        className='h-32 w-auto opacity-25 mix-blend-multiply grayscale'
                                                                    />
                                                                </div>
                                                                <p className='font-medium text-[13px] text-muted-foreground/80 leading-relaxed'>
                                                                    Select a sub-module to explore <br /> available categories
                                                                </p>
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Custom scrollbar styling */}
            <style jsx global>{`
                /* Custom scrollbar styling for the entire component */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 3px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                /* For Firefox */
                .overflow-y-auto {
                    scrollbar-width: thin;
                    scrollbar-color: #c1c1c1 transparent;
                }

                /* Hide scrollbar utility - must be at the bottom for priority */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none !important;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none !important;  /* IE and Edge */
                    scrollbar-width: none !important;  /* Firefox */
                }

                /* Horizontal scroll for main nav */
                nav.overflow-x-auto::-webkit-scrollbar {
                    height: 4px;
                }

                nav.overflow-x-auto::-webkit-scrollbar-track {
                    background: transparent;
                }

                nav.overflow-x-auto::-webkit-scrollbar-thumb {
                    background: #d4d4d4;
                    border-radius: 2px;
                }

                nav.overflow-x-auto::-webkit-scrollbar-thumb:hover {
                    background: #a3a3a3;
                }
            `}</style>
        </div>
    );
}



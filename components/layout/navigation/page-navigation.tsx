'use client';

import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNavigationContext } from './navigation-context';

// Page navigation row logic removed for "neat and clean" design

export function PageNavigation() {
    const [activeNavigation, setActiveNavigation] = useState(getNavigationContext().activeNavigation);
    const pathname = usePathname();
    const [pageName, setPageName] = useState('');
    const [pageTitle, setPageTitle] = useState('');
    const [pageDescription, setPageDescription] = useState('');

    // Listen for navigation context changes and update page details
    useEffect(() => {
        const interval = setInterval(() => {
            const context = getNavigationContext();
            if (context.activeNavigation !== activeNavigation) {
                setActiveNavigation(context.activeNavigation);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [activeNavigation]);

    // Update page details when activeNavigation or pathname changes
    useEffect(() => {
        if (activeNavigation?.pages) {
            const currentPage = activeNavigation.pages.find((page: any) => page.url === pathname);
            if (currentPage) {
                setPageName(currentPage.name);
                setPageTitle(currentPage.title || '');
                setPageDescription(currentPage.description || '');
            } else {
                setPageName('');
                setPageTitle('');
                setPageDescription('');
            }
        } else {
            setPageName('');
            setPageTitle('');
            setPageDescription('');
        }
    }, [activeNavigation, pathname]);

    // Update navigation context when navigating between pages
    useEffect(() => {
        if (activeNavigation?.pages) {
            const currentPage = activeNavigation.pages.find((page: any) => page.url === pathname);
            if (currentPage && (activeNavigation.title !== currentPage.title || activeNavigation.description !== currentPage.description)) {
                const updatedNavData = {
                    ...activeNavigation,
                    title: currentPage.title || '',
                    description: currentPage.description || ''
                };

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('activeNavigation', JSON.stringify(updatedNavData));
                }
            }
        }
    }, [pathname, activeNavigation]);

    const customBannerRoutes = [
        '/visitors-management/transactions/gate-pass',
        '/visitors-management/transactions/visitor-appointment',
        '/visitors-management/reports/gate-pass-report',
        '/Naac/lp-online-exam/lp-master-complexities',
        '/Exam/online-exam/transactions/publish-to-student',
        '/Exam/online-exam/transactions/answer-paper-correction',
        '/Exam/online-exam/master-question',
        '/Exam/online-exam/reports/online-exam-report',
        '/Naac/lp-online-exam/lp-master-oe-exam'
    ];

    if (customBannerRoutes.some((route) => pathname?.toLowerCase().includes(route.toLowerCase()))) {
        return null;
    }

    const isMatchingCurrentPath = activeNavigation?.pages?.some((page: any) => page.url === pathname);

    if (!activeNavigation || !isMatchingCurrentPath || !pageTitle) {
        return null;
    }

    if (pathname === '/' || pathname === null) {
        setActiveNavigation(null);
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className='no-print sticky top-14 z-20 w-full bg-background'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}>
                <PolygonBanner
                    title={pageTitle}
                    description={pageDescription || ''}
                    breadcrumb={
                        <div className='flex items-center gap-2 text-sm text-white/80'>
                            <span className='font-medium'>{activeNavigation.module}</span>
                            <ChevronRight className='h-4 w-4' />
                            <span>{activeNavigation.menu}</span>
                            <ChevronRight className='h-4 w-4' />
                            <span className='font-medium'>{activeNavigation.subMenu}</span>
                            <ChevronRight className='h-4 w-4' />
                            <span className='font-bold text-white'>{pageName}</span>
                        </div>
                    }
                />
            </motion.div>
        </AnimatePresence>
    );
}

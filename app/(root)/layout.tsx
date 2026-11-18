import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navigation/navbar';
import { NavigationStability } from '@/components/layout/navigation/navigation-stability';
import { PageNavigation } from '@/components/layout/navigation/page-navigation';
import type React from 'react';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex min-h-screen flex-col'>
            <Navbar />
            <PageNavigation />
            <NavigationStability />
            <main className='flex-1'>{children}</main>
            <Footer />
        </div>
    );
}

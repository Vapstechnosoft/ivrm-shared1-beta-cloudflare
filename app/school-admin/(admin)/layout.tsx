import Navbar from '@/components/layout/navigation/navbar';
import type React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <main className='p-4 md:p-8'>
                <div className='mx-auto w-full max-w-[1400px]'>{children}</div>
            </main>
        </div>
    );
}

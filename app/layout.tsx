import { Chatbot } from '@/components/chatbot/chatbot';
import { StudentChatbot } from '@/components/chatbot/student-chatbot';
import Providers from '@/components/layout/providers';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import NextTopLoader from 'nextjs-toploader';
import type * as React from 'react';
import { Toaster } from 'sonner';

const geistSans = localFont({
    src: '../public/fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
});

const geistMono = localFont({
    src: '../public/fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
});

export const metadata: Metadata = {
    manifest: '/manifest.json',
    title: 'VAPS',
    description: 'Thsi is a web application School Management with advanced features.',
    icons: '/icons/VAPS.png'
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
    const session = await auth();
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        if (window.performance && window.performance.getEntriesByType('navigation').length > 0) {
                            if (window.performance.getEntriesByType('navigation')[0].type === 'reload') {
                                var url = new URL(window.location.href);
                                var params = ['page', 'page_size', 'search_query', 'sort_column', 'search_columns', 'sort_direction'];
                                var changed = false;
                                for (var i = 0; i < params.length; i++) {
                                    if (url.searchParams.has(params[i])) {
                                        url.searchParams.delete(params[i]);
                                        changed = true;
                                    }
                                }
                                if (changed) {
                                    window.location.replace(url.href);
                                }
                            }
                        }
                    `
                    }}
                />
            </head>
            <body
                suppressHydrationWarning
                className={cn('min-h-screen min-w-[360px] bg-layout font-sans antialiased', geistSans.variable, geistMono.variable)}>
                <NextTopLoader color='#4F39F6' showSpinner={false} height={3} speed={300} />

                <Providers session={session}>
                    {children}
                    {session && (
                        <>
                            <Chatbot />
                            <StudentChatbot />
                            {/* <FloatingSchoolBot /> */}
                        </>
                    )}
                    <Toaster
                        position='bottom-right'
                        closeButton={true}
                        duration={3000}
                        richColors
                        className={`${geistSans.className}`}
                        style={{
                            zIndex: 99999
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}

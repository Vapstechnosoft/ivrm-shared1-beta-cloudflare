'use client';

import { feeReceiptLogo } from '@/hooks/fees/useReports';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';


interface LogoProps {
    className?: string;
    size?: 'icon' | 'text' | 'full';
    herf?: string | null;
    src?: string | null;
}

const DEFAULT_FALLBACK_LOGO = 'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/52b647fd-940b-48f0-b28c-8547e52a7109.png';

export default function Logo({ className = '', herf = '', size = 'text', src: customSrc }: LogoProps) {
    const { data: session } = useSession();
    const { data: logoData } = feeReceiptLogo();

    const payload = (logoData as any)?.data !== undefined ? (logoData as any)?.data : logoData;
    const rawList = Array.isArray(payload)
        ? payload
        : payload?.institutionlist || payload?.logoList || payload?.data || (payload ? [payload] : []);

    const matchedItem =
        Array.isArray(rawList) && rawList.length > 0
            ? rawList.find((item: any) => Number(item.mI_Id || item.mi_id || item.MI_Id) === Number(session?.mi_id)) || rawList[0]
            : null;

    const apiLogo =
        matchedItem?.mI_logo ||
        matchedItem?.mI_Logo ||
        matchedItem?.mi_logo ||
        matchedItem?.mi_Logo ||
        matchedItem?.MI_Logo ||
        matchedItem?.logo ||
        matchedItem?.logopath ||
        matchedItem?.logoPath ||
        matchedItem?.mI_LogoPath ||
        matchedItem?.institution_logo;

    const sessionLogo = session?.mi_logo;

    let rawLogo = customSrc || sessionLogo || apiLogo || '';

    // Handle relative path returned by backend API
    if (rawLogo && !rawLogo.startsWith('http://') && !rawLogo.startsWith('https://') && !rawLogo.startsWith('data:')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        try {
            const origin = baseUrl ? new URL(baseUrl).origin : '';
            rawLogo = `${origin}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`;
        } catch {
            // Keep rawLogo as is
        }
    }

    const resolvedLogo = rawLogo || DEFAULT_FALLBACK_LOGO;

    const logoContent = (
        <div className={cn('flex items-center', className)}>
            <Image
                src={resolvedLogo}
                alt={session?.mi_name || 'Institution Logo'}
                width={200}
                height={50}
                className='h-10 w-auto object-contain brightness-110 contrast-110 drop-shadow-sm transition-all duration-300 hover:scale-[1.02]'
                priority
                unoptimized
            />
        </div>
    );

    return herf ? <Link href={herf}>{logoContent}</Link> : logoContent;
}

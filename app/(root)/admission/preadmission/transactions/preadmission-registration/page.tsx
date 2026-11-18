'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { useCheckPreadmissionLive } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { ArrowUpRight, LockKeyhole, LockKeyholeOpen } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddPreadmissionRegistrationForm from './_components/registration-form';

interface PreadmissionRegistrationProps {
    sub_domain?: string;
}

function resolveSubDomain(
    explicitSubDomain?: string,
    callbackUrl?: string | null,
    querySubDomain?: string | null
): string {
    const IGNORED_SEGMENTS = new Set([
        'sign-in',
        'signin',
        'login',
        'auth',
        'admission',
        'preadmission',
        'preconfiguration',
        'school-admin',
        'terms',
        'dashboard',
        'localhost',
        'www'
    ]);

    const cleanCandidate = (val?: string | null): string => {
        if (!val) return '';
        const trimmed = val.trim();
        if (!trimmed || IGNORED_SEGMENTS.has(trimmed.toLowerCase())) {
            return '';
        }
        return trimmed.toUpperCase();
    };

    // 1. Explicit prop or route param (e.g. /shs, /bps)
    const explicitClean = cleanCandidate(explicitSubDomain);
    if (explicitClean) return explicitClean;

    // 2. Query param ?sub_domain=... or ?subdomain=...
    const queryClean = cleanCandidate(querySubDomain);
    if (queryClean) return queryClean;

    // 3. Callback URL param (e.g. "/sign-in/shs", "/shs", "%2Fsign-in%2Fshs")
    if (callbackUrl && callbackUrl.trim()) {
        try {
            const decoded = decodeURIComponent(callbackUrl);
            const pathOnly = decoded.split('?')[0];
            const segments = pathOnly.split('/').filter(Boolean);
            const candidate = [...segments].reverse().find((seg) => !IGNORED_SEGMENTS.has(seg.toLowerCase()));
            if (candidate) {
                return cleanCandidate(candidate);
            }
        } catch {
            // ignore decoding errors
        }
    }

    // 4. Client-side browser inspection (pathname, sessionStorage, hostname)
    if (typeof window !== 'undefined') {
        try {
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const pathCandidate = [...pathSegments].reverse().find((seg) => !IGNORED_SEGMENTS.has(seg.toLowerCase()));
            if (pathCandidate) {
                return cleanCandidate(pathCandidate);
            }
        } catch {}

        try {
            const stored = sessionStorage.getItem('sub_domain');
            const storedClean = cleanCandidate(stored);
            if (storedClean) return storedClean;
        } catch {}

        try {
            // Generic extraction from tenant domain/hostname:
            // e.g. "shs.vapssmartecampus.com" -> "SHS"
            // or "client-beta1-next.azurewebsites.net" -> "CLIENT"
            const hostname = window.location.hostname.toLowerCase();
            if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
                const parts = hostname.split('.');
                if (parts.length > 2) {
                    const firstPart = parts[0].split('-')[0];
                    if (firstPart && !IGNORED_SEGMENTS.has(firstPart)) {
                        return cleanCandidate(firstPart);
                    }
                }
            }
        } catch {}
    }

    return '';
}

export default function PreadmissionRegistration({ sub_domain: propSubDomain }: PreadmissionRegistrationProps = {}) {
    const params = useParams();
    const searchParams = useSearchParams();

    const paramSubDomain = propSubDomain || (params?.sub_domain as string | undefined);
    const callbackUrl = searchParams?.get('callbackUrl');
    const querySubDomain = searchParams?.get('sub_domain') || searchParams?.get('subdomain');

    const resolvedSubDomain = resolveSubDomain(paramSubDomain, callbackUrl, querySubDomain);

    useEffect(() => {
        if (resolvedSubDomain && typeof window !== 'undefined') {
            sessionStorage.setItem('sub_domain', resolvedSubDomain);
        }
    }, [resolvedSubDomain]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: preadmissionLive, refetch: refetchAll } = useCheckPreadmissionLive(resolvedSubDomain || '');

    const handleEdit = () => {
        setIsDialogOpen(true);
    };

    function closeDialog() {
        setIsDialogOpen(false);
        refetchAll();
    }

    const isPreadmissionLive: boolean = Boolean(preadmissionLive?.success && preadmissionLive?.data === true);

    return (
        <div className="flex flex-col items-center w-full gap-4">
            {isPreadmissionLive && (
                <div className="flex items-baseline gap-2 font-bold animate-in fade-in zoom-in duration-500 mb-2">
                    <span className="text-[#d35400] text-xl">Preadmission is</span>
                    <span className="text-[#27ae60] text-3xl tracking-wider">LIVE!</span>
                </div>
            )}
            <Button
                type='button'
                variant='outline'
                className={cn('h-12 w-full border-2 border-gray-200', isPreadmissionLive && 'bg-success')}
                onClick={() => handleEdit()}
                toolTip={
                    isPreadmissionLive === false ? 'Preadmission Registration is not available yet.' : 'Preadmission Registration is live.'
                }
                disabled={isPreadmissionLive === false}>
                {isPreadmissionLive === false ? (
                    <LockKeyhole className='mr-2 h-4 w-4 text-gray-600 ' />
                ) : (
                    <LockKeyholeOpen className='mr-2 h-4 w-4 text-white ' />
                )}
                <span className={isPreadmissionLive === false ? 'flex-1 font-medium text-gray-600' : 'flex-1 text-white tracking-widest'}>
                    Preadmission Registration
                </span>
                {isPreadmissionLive === true && <ArrowUpRight className={'h-4 w-4 text-white'} />}
            </Button>
            <AdaptiveDialog title='Preadmission Registration' isOpen={isDialogOpen} onClose={closeDialog} size='lg'>
                <AddPreadmissionRegistrationForm sub_domain={resolvedSubDomain || ''} closeDialog={closeDialog} />
            </AdaptiveDialog>
        </div>
    );
}

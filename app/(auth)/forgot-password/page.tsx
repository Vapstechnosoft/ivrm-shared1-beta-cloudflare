'use client';

import { useRouter } from 'next/navigation';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function ForgotPasswordPage() {
    const router = useRouter();

    return (
        <div className='flex min-h-screen w-full items-center justify-center bg-slate-100'>
            <ForgotPasswordModal isOpen={true} onClose={() => router.push('/sign-in')} />
        </div>
    );
}

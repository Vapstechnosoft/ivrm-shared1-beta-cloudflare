import { Suspense } from 'react';
import FeeOnlinePaymentClient from './_components/fee-online-payment-client';

export default function FeeOnlinePaymentPage() {
    return (
        <div className='container mx-auto max-w-7xl p-4'>
            <Suspense fallback={<div className='p-8 text-center text-muted-foreground'>Loading...</div>}>
                <FeeOnlinePaymentClient />
            </Suspense>
        </div>
    );
}

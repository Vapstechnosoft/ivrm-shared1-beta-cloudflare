import FeeOnlinePaymentClient from './_components/fee-online-payment-client';
import { getFeeOnlinePaymentLoadData } from './actions';

export default async function FeeOnlinePaymentPage() {
    const response = await getFeeOnlinePaymentLoadData({});
    // In real app, might need to pass params or fetch session data here

    return (
        <div className='container mx-auto max-w-7xl p-4'>
            <FeeOnlinePaymentClient initialData={response.data} />
        </div>
    );
}

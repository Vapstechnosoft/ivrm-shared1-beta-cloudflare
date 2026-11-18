import FeeDetailsClient from './_components/fee-details-client';
import { getFeeDetailsLoadData } from './actions';

export default async function FeeDetailsPage() {
    const initialData = await getFeeDetailsLoadData();

    return (
        <div className='container mx-auto max-w-7xl p-4'>
            <FeeDetailsClient initialData={initialData} />
        </div>
    );
}

import FeedbackCollegeParentTransactionClient from './_components/feedback-college-parent-transaction-client';
import { getFeedbackTransactionLoadData } from './actions';

export default async function FeedbackCollegeParentTransactionPage() {
    const initialData = await getFeedbackTransactionLoadData();

    return (
        <div className='container mx-auto max-w-7xl p-4'>
            <FeedbackCollegeParentTransactionClient initialData={initialData} />
        </div>
    );
}

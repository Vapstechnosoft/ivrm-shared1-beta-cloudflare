import { Card, CardContent } from '@/components/ui/card';
// Force TS Server re-analysis
import { getInitialInteractions } from '@/server/staff-portal/interactions';
import { InteractionContainer } from './_components/interaction-container';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Interactions | Student Portal',
    description: 'Manage and view interactions between students and staff.'
};

export default async function IVRMInteractionsPage() {
    const response = await getInitialInteractions();

    if (!response.success || !response.data) {
        return (
            <div className='p-4 md:p-6'>
                <Card className='border-red-200 bg-red-50'>
                    <CardContent className='pt-6 text-center text-red-600'>
                        <p className='font-semibold'>Failed to load interactions.</p>
                        <p className='text-sm'>{response.message || 'Please check your connection and try again.'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 p-4 md:p-6'>
            <InteractionContainer initialData={response.data} />
        </div>
    );
}

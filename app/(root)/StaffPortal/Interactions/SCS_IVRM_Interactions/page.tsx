import { Card, CardContent } from '@/components/ui/card';
import { getInitialInteractions } from '@/server/staff-portal/interactions';
import { InteractionContainer } from './_components/interaction-container';

export const dynamic = 'force-dynamic';

export default async function SCSInteractionsPage() {
    const response = await getInitialInteractions();

    if (!response.success || !response.data) {
        return (
            <div className='p-6'>
                <Card className='border-red-200 bg-red-50'>
                    <CardContent className='pt-6 text-center text-red-600'>
                        <p className='font-semibold'>Failed to load interactions.</p>
                        <p className='text-sm'>{response.message || 'Please try again later.'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-6 p-4 md:p-6 lg:p-8'>
            <div className='flex flex-col gap-1'>
                <h1 className='font-bold text-3xl text-primary tracking-tight'>SCS Interactions</h1>
                <p className='text-muted-foreground'>Manage your messages and communications.</p>
            </div>

            <InteractionContainer initialData={response.data} />
        </div>
    );
}

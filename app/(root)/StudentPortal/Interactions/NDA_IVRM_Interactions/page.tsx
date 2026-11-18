import { Card, CardContent } from '@/components/ui/card';
import { getInitialInteractions } from '@/server/staff-portal/interactions';
import { InteractionContainer } from './_components/interaction-container';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'NDA Interactions | Student Portal',
    description: 'Manage and view interactions for NDA student portal.'
};

export default async function NDAIVRMInteractionsPage() {
    const response = await getInitialInteractions();

    if (!response.success || !response.data) {
        return (
            <div className='p-6'>
                <Card className='border-red-200 bg-red-50'>
                    <CardContent className='pt-6 text-center text-red-600'>
                        <p className='font-semibold'>Failed to load NDA interactions.</p>
                        <p className='text-sm'>{response.message || 'Please check your connection and try again.'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 p-4 md:p-6'>
            <div className='flex flex-col gap-0.5 border-primary/10 border-b-2 pb-2'>
                <h1 className='font-black text-[#1e1b4b] text-xl uppercase tracking-tight'>NDA Interaction</h1>
                <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-widest opacity-60'>
                    Notre Dame Academy Student Interaction Portal
                </p>
            </div>

            <InteractionContainer initialData={response.data} />
        </div>
    );
}

'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaveConfiguration, useSaveLeaveConfiguration } from '@/hooks/hrms/leave-management/useMasters';
import type { LeaveConfigurationFormData } from '@/types/hrms/leave-management/leaveConfiguration/leaveConfiguration';
import { Loader2, Settings } from 'lucide-react';
import LeaveConfigurationForm from './_components/leave-configuration-form';

export default function LeaveConfigurationPage() {
    const { data: configData, isLoading } = useLeaveConfiguration();
    const { mutate: saveConfiguration, isPending } = useSaveLeaveConfiguration();

    const handleSubmit = (data: LeaveConfigurationFormData) => {
        saveConfiguration(data);
    };

    const handleCancel = () => {
        // Clean reset handled in form
    };

    if (isLoading) {
        return (
            <div className='flex min-h-[60vh] items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='container p-4 md:p-6 space-y-6'>
            <Card className='shadow-md border border-border/80'>
                <CardHeader className='border-b bg-muted/40 py-4 px-6 flex flex-row items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                        <Settings className='h-5 w-5 text-primary' />
                        <CardTitle className='text-lg font-semibold tracking-wide uppercase'>
                            Leave Configuration
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className='p-6'>
                    <LeaveConfigurationForm
                        initialData={configData?.data || null}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isPending={isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

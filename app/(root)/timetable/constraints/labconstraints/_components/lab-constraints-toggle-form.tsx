'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    ttlaB_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleLabConstraintsFormProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    data: any;
    message: string;
}

export default function LabConstraintsToggleForm({ isOpen, onClose, onConfirm, data, message }: ToggleLabConstraintsFormProps) {
    const isActive = data?.ttlaB_ActiveFlag;

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        defaultValues: {
            ttlaB_Id: Number(data?.ttlaB_Id)
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            await onConfirm();
            closeDialog();
        } catch (error: any) {
            console.log('FULL ERROR:', error);

            const errorMessage = error?.response?.data?.message || error?.message || 'Something went wrong';

            toast.error(errorMessage);
        }
    };

    return (
        <AdaptiveDialog title={`${message} Record`} isOpen={isOpen} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {message.toLowerCase()} this record?
                        <br />
                        <strong>Class:</strong> {data?.asmcL_ClassName} | <strong>Section:</strong> {data?.asmC_SectionName}
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={message === 'Delete' || isActive ? 'destructive' : 'default'}>
                        {message}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}

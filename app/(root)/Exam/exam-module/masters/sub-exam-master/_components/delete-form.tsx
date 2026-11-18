'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterSubExam } from '@/hooks/exam/exammodule/usemasters';
import { masterSubExamSchema } from '@/schemas/exam/exam-module/masters';
import { toggleMasterSubExam } from '@/server/exam/exam-module/masters/sub-exam';
import type { IMasterSubExam } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubExamSchema.delete>;

interface DeleteSubExamFormProps {
    rowData: IMasterSubExam;
    onClose: () => void;
}

export default function DeleteSubExamForm({ rowData, onClose }: DeleteSubExamFormProps) {
    const { refetchAll } = useMasterSubExam();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubExamSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await toggleMasterSubExam(Number(rowData.emsE_Id));

            if (response.success) {
                toast.success(response.message || 'Sub Exam deleted successfully');
                refetchAll();
                reset();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to delete sub exam');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong while deleting.');
        }
    };

    return (
        <AdaptiveDialog title='Delete Sub Exam' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('emsE_Id')} defaultValue={rowData.emsE_Id} />
                    <p className='text-sm text-foreground'>
                        Are you sure you want to delete <strong>{rowData.emsE_SubExamName}</strong> ({rowData.emsE_SubExamCode})?
                    </p>
                    {errors.root && <FormError>{errors.root?.message}</FormError>}
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant='destructive'>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}

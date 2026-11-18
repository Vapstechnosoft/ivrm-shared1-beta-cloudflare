'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useCollegeFeePrevilegeList } from '@/hooks/fees/college/useMasters';
import { collegeFeePrevilegeSchema } from '@/schemas/fees/college/masters/masterclgfeeprevilege';
import { deleteCollegeFeePrivilege } from '@/server/fees/college/masters/masterclgfeeprevilege';
import type { ICollegeFeePrivilegeList } from '@/types/fees/college/masters/masterclgfeeprevilege';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof collegeFeePrevilegeSchema.delete>;

interface ToggleCollegeFeePrivilegeFormProps {
    rowData: ICollegeFeePrivilegeList;
    onClose: () => void;
}

export default function ToggleCollegeFeePrivilegeForm({ rowData, onClose }: ToggleCollegeFeePrivilegeFormProps) {
    const { refetchAll } = useCollegeFeePrevilegeList();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeePrevilegeSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await deleteCollegeFeePrivilege(Number(rowData.fgL_Id));

            if (response?.returnval === true || response?.success) {
                toast.success(response?.message || 'Record Deleted Successfully');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || 'Record Not Deleted');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'Failed to delete record');
        }
    };

    return (
        <AdaptiveDialog title='Delete College Fee Privilege' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fgL_Id')} defaultValue={rowData.fgL_Id} />
                    <p className='text-foreground text-sm'>
                        Are you sure you want to <strong>permanently delete</strong> the fee privilege for user{' '}
                        <span className='font-semibold text-primary'>{rowData.normalizedUserName}</span>?
                    </p>
                    <FormError>{errors.fgL_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant='destructive'>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}

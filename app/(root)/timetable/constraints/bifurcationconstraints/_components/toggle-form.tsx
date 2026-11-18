'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useBifurcationConstraints } from '@/hooks/timetable/useMasters';
import { bifurcationConstraintsSchema } from '@/schemas/timetable/constraints/bifurcationconstraints';
import { toggleBifurcationConstraintsStatus } from '@/server/timetable/constraints/bifurcationconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { IBifurcationConstraintList } from './columns';

const toggleSchema = z.object({
    ttB_Id: z.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleBifurcationConstraintsFormProps {
    rowData: IBifurcationConstraintList;
    onClose: () => void;
}

export default function ToggleBifurcationConstraints({ rowData, onClose }: ToggleBifurcationConstraintsFormProps) {
    const { refetchAll } = useBifurcationConstraints();
    const isActive = rowData.ttB_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(bifurcationConstraintsSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await toggleBifurcationConstraintsStatus(Number(rowData.ttB_Id));
            if (response.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Bifurcation Constraints ' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttB_Id')} defaultValue={rowData.ttB_Id} />
                    <p>Are you sure you want to {isActive ? 'deactivate' : 'activate'} The selected data</p>
                    <FormError>{errors.ttB_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}

// 'use client';

// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle
// } from '@/components/ui/alert-dialog';
// import { deleteBifurcationConstraintsDetail } from '@/server/timetable/constraints/bifurcationconstraints'; // Uses deletedetails endpoint
// import { toast } from 'sonner';

// interface ToggleFormProps {
//     rowData: any;
//     onClose: () => void;
//     onSuccess?: () => void;
// }

// export default function ToggleBifurcationConstraints({ rowData, onClose, onSuccess }: ToggleFormProps) {
//     const isActive = rowData.ttB_ActiveFlag;
//     const action = isActive ? 'Deactivate' : 'Activate';

//     const handleConfirm = async () => {
//         try {
//             const res = await deleteBifurcationConstraintsDetail(rowData.ttB_Id);
//             // Legacy response parsing
//             // Check promise.returnMsg === "true"
//             if (res.returnMsg === 'true' || res.returnMsg === true) {
//                 toast.success(`Record ${action}d Successfully`);
//                 onSuccess?.(); // Trigger refresh
//                 // window.location.reload(); // Handled by onSuccess usually
//             } else {
//                 toast.error(`Failed to ${action} record`);
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('An error occurred');
//         } finally {
//             onClose();
//         }
//     };

//     return (
//         <AlertDialog open={true} onOpenChange={onClose}>
//             <AlertDialogContent>
//                 <AlertDialogHeader>
//                     <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                     <AlertDialogDescription>Do you want to {action} this record?</AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                     <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
//                     <AlertDialogAction
//                         onClick={handleConfirm}
//                         className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}>
//                         Yes, {action} it!
//                     </AlertDialogAction>
//                 </AlertDialogFooter>
//             </AlertDialogContent>
//         </AlertDialog>
//     );
// }

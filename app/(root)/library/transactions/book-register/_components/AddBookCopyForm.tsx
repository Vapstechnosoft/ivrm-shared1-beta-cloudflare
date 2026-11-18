'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBookRegister } from '@/hooks/library/useBookRegister';
import { saveBookRegister } from '@/server/library/masters/bookRegister';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const addCopySchema = z.object({
    noOfCopies: z.coerce.number().min(1, 'Minimum 1 copy required').max(100, 'Maximum 100 copies allowed'),
    accessions: z.array(
        z.object({
            lmbanO_No: z.string().min(1, 'Accession number is required')
        })
    )
});

type AddCopyFields = z.infer<typeof addCopySchema>;

export default function AddBookCopyForm({
    isOpen,
    onClose,
    bookData,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    bookData: BookRegisterPayload | null;
    onSuccess: () => void;
}) {
    const { refetchAll } = useBookRegister();
    const [numCopies, setNumCopies] = useState<number>(1);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch
    } = useForm<AddCopyFields>({
        resolver: zodResolver(addCopySchema),
        defaultValues: {
            noOfCopies: 1,
            accessions: [{ lmbanO_No: '' }]
        }
    });

    const accessions = watch('accessions');

    const handleGenerateRows = () => {
        const count = watch('noOfCopies');
        const newAccessions = Array.from({ length: count }, () => ({ lmbanO_No: '' }));
        setValue('accessions', newAccessions);
    };

    const onSubmit = async (data: AddCopyFields) => {
        if (!bookData) return;

        try {
            // Prepare payload: same as edit but with only the new accessions
            // Note: In some VAPS backends, sending an existing lmB_Id with a list of accessions
            // will ADD those accessions to the book.
            const payload: BookRegisterPayload = {
                ...bookData,
                accessionList: data.accessions.map((a) => ({
                    lmbanO_No: a.lmbanO_No,
                    lmbanO_AvialableStatus: 'Available'
                }))
            };

            const response = await saveBookRegister(payload);
            if (response.success) {
                toast.success('Book copies added successfully');
                reset();
                onSuccess();
                refetchAll();
                onClose();
            } else {
                toast.error(response.message || 'Failed to add copies');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-primary text-sm uppercase'>
                        ADD NEW BOOK COPY FOR THE BOOK: {bookData?.lmB_BookTitle}
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    <div className='flex items-center gap-4 rounded-lg bg-gray-50 p-4'>
                        <div className='flex flex-1 flex-col gap-1.5'>
                            <Label className='font-semibold text-xs'>
                                No. Of Copies: <span className='text-red-500'>*</span>
                            </Label>
                            <InputText {...register('noOfCopies')} type='number' className='bg-white' error={errors.noOfCopies?.message} />
                        </div>
                        <Button type='button' onClick={handleGenerateRows} className='mt-5 bg-orange-500 hover:bg-orange-600'>
                            OK
                        </Button>
                    </div>

                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader className='bg-blue-600 hover:bg-blue-600'>
                                <TableRow className='border-none hover:bg-transparent'>
                                    <TableHead className='w-20 font-bold text-white'>SL No</TableHead>
                                    <TableHead className='font-bold text-white'>Accession No</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accessions.map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className='font-medium'>{index + 1}</TableCell>
                                        <TableCell>
                                            <InputText
                                                {...register(`accessions.${index}.lmbanO_No` as const)}
                                                placeholder='Enter Accession No'
                                                error={errors.accessions?.[index]?.lmbanO_No?.message}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <DialogFooter className='flex justify-center gap-4 border-t pt-4'>
                    <Button
                        type='button'
                        onClick={handleSubmit(onSubmit)}
                        className='min-w-[100px] bg-blue-700 font-bold uppercase hover:bg-blue-800'>
                        Save
                    </Button>
                    <Button
                        variant='outline'
                        onClick={onClose}
                        className='min-w-[100px] border-gray-400 font-bold text-gray-700 uppercase hover:bg-gray-100'>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// app/dashboard/transaction/lostbook/_components/update-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { useLostBookList } from '@/hooks/library/useTransactions';
import { lostBookSchema } from '@/schemas/library/transactions';
import { getAuthorNameDropdown, getBookListDropdown, saveLostBookRecord } from '@/server/library/transactions/lost-book';
import type { AuthorOption } from '@/types/library/transactions/transactions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ILostBookList } from '@/types/library/transactions/transactions';
import { format } from 'date-fns';
import { Loader2, Save, X } from 'lucide-react';

type FormFields = z.infer<typeof lostBookSchema.addOrUpdate>;

interface UpdateLostBookFormProps {
    selectedRow: ILostBookList;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

export default function UpdateLostBookForm({ selectedRow, onSuccess, onCancel, className = '' }: UpdateLostBookFormProps) {
    const { refetchAll } = useLostBookList();

    const [loading, setLoading] = useState(false);
    const [bookOptions, setBookOptions] = useState<any[]>([]);
    const [authorOptions, setAuthorOptions] = useState<AuthorOption[]>([]);

    const [bookCategory, setBookCategory] = useState<'book' | 'nonbook'>('book');
    const [bookType, setBookType] = useState<'issue' | 'ref'>('issue');

    let initialDate = format(new Date(), 'yyyy-MM-dd');
    if (selectedRow?.lmbanO_LostDamagedDate) {
        try {
            initialDate = format(new Date(selectedRow.lmbanO_LostDamagedDate), 'yyyy-MM-dd');
        } catch (e) {}
    }

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(lostBookSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            LMBANO_Id: selectedRow?.lmbanO_Id?.toString() || '',
            LMBANO_AvialableStatus: (selectedRow?.lmbanO_AvialableStatus?.toLowerCase() as any) || 'lost',
            LMBANO_LostDamagedDate: initialDate,
            LMBANO_LostDamagedReason: selectedRow?.lmbanO_LostDamagedReason || '',
            LMBANO_ModeOfPayment: (selectedRow?.lmbanO_ModeOfPayment as any) || undefined,
            LMBANO_AmountCollected: selectedRow?.lmbanO_AmountCollected?.toString() || ''
        }
    });

    useEffect(() => {
        loadBookOptions();
    }, [bookCategory, bookType]);

    // Pre-select author on load
    useEffect(() => {
        if (selectedRow?.lmbanO_Id) {
            handleBookSelect(selectedRow.lmbanO_Id);
        }
    }, [selectedRow]);

    const loadBookOptions = async () => {
        try {
            const response = await getBookListDropdown(bookCategory, bookType);
            if (response.success && Array.isArray(response.data)) {
                const foundMatch = response.data.find((b: any) => b.lmbanO_Id === selectedRow?.lmbanO_Id);
                let finalOptions: any[] = response.data as any[];
                if (!foundMatch && selectedRow?.lmbanO_Id) {
                    finalOptions = [
                        {
                            lmbanO_Id: selectedRow.lmbanO_Id,
                            lmbanO_AccessionNo: selectedRow.lmbanO_AccessionNo,
                            lmB_BookTitle: selectedRow.lmB_BookTitle
                        },
                        ...(response.data as any[])
                    ];
                }
                setBookOptions(finalOptions);
            }
        } catch (error) {
            console.error('Failed to load book options:', error);
            toast.error('Failed to load book options');
        }
    };

    const handleBookSelect = async (bookId: number) => {
        setValue('LMBANO_Id', String(bookId));
        try {
            const response = await getAuthorNameDropdown(bookId);
            if (response.success && Array.isArray(response.data)) {
                setAuthorOptions(response.data);
            }
        } catch (error) {
            toast.error('Failed to load author information');
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            setLoading(true);
            const response = await saveLostBookRecord(data);
            // Handle multiple success indicators common in this project
            if (response.success || (response as any).returnval === true || (response as any).returnval === 'true') {
                toast.success('Lost book record updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || (response as any).maxmsg || 'Failed to update record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 rounded-xl border bg-card p-6 shadow-sm ${className}`}>
            <div className='border-b pb-4 text-center'>
                <h2 className='font-bold text-2xl text-primary uppercase tracking-tight'>Update Lost Book</h2>
            </div>

            {/* Middle 2 Columns */}
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-6'>
                    {/* Book Title */}
                    <div className='space-y-2'>
                        <Label htmlFor='LMBANO_Id' className='font-semibold text-sm'>
                            Book Title: <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            disabled
                            value={selectedRow?.lmbanO_Id?.toString()}
                            onValueChange={(value) => handleBookSelect(Number.parseInt(value))}>
                            <SelectTrigger className='w-full bg-muted/50'>
                                <SelectValue placeholder='Select Book...' />
                            </SelectTrigger>
                            <SelectContent>
                                {bookOptions.map((book) => (
                                    <SelectItem key={book.lmbanO_Id} value={book.lmbanO_Id?.toString()}>
                                        {book.lmbanO_AccessionNo} :: {book.lmB_BookTitle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.LMBANO_Id && <p className='text-red-500 text-xs'>{errors.LMBANO_Id.message}</p>}
                    </div>

                    {/* Delete Date (Lost Date) */}
                    <div className='space-y-2'>
                        <Label htmlFor='LMBANO_LostDamagedDate' className='font-semibold text-sm'>
                            Delete Date: <span className='text-red-500'>*</span>
                        </Label>
                        <Input id='LMBANO_LostDamagedDate' type='date' {...register('LMBANO_LostDamagedDate')} className='w-full' />
                        {errors.LMBANO_LostDamagedDate && <p className='text-red-500 text-xs'>{errors.LMBANO_LostDamagedDate.message}</p>}
                    </div>

                    {/* Price */}
                    <div className='space-y-2'>
                        <Label htmlFor='LMBANO_AmountCollected' className='font-semibold text-sm'>
                            Price: <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                            id='LMBANO_AmountCollected'
                            placeholder='Enter Lost/Damage Price'
                            {...register('LMBANO_AmountCollected')}
                            className='w-full'
                        />
                        {errors.LMBANO_AmountCollected && <p className='text-red-500 text-xs'>{errors.LMBANO_AmountCollected.message}</p>}
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-6'>
                    {/* Author Name */}
                    <div className='space-y-2'>
                        <Label htmlFor='AuthorId' className='font-semibold text-sm'>
                            Author Name:
                        </Label>
                        <Select disabled={authorOptions.length === 0}>
                            <SelectTrigger className='w-full bg-muted/50'>
                                <SelectValue placeholder={authorOptions.length === 0 ? 'Select book first' : 'Select author...'} />
                            </SelectTrigger>
                            <SelectContent>
                                {authorOptions.map((author) => {
                                    if (!author) return null;
                                    const authorId = (author as any).id || (author as any).lmbanO_Id;
                                    const authorName = (author as any).name || (author as any).authorName;
                                    return (
                                        <SelectItem key={authorId} value={authorId?.toString()}>
                                            {authorName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Delete Reason (Remarks) */}
                    <div className='space-y-2'>
                        <Label htmlFor='LMBANO_LostDamagedReason' className='font-semibold text-sm'>
                            Delete Reason:
                        </Label>
                        <Textarea
                            id='LMBANO_LostDamagedReason'
                            placeholder='Enter the Remarks'
                            {...register('LMBANO_LostDamagedReason')}
                            className='min-h-[80px] w-full'
                        />
                        {errors.LMBANO_LostDamagedReason && (
                            <p className='text-red-500 text-xs'>{errors.LMBANO_LostDamagedReason.message}</p>
                        )}
                    </div>

                    {/* Book Status */}
                    <div className='space-y-2'>
                        <Label htmlFor='LMBANO_AvialableStatus' className='font-semibold text-sm'>
                            Book Status: <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => setValue('LMBANO_AvialableStatus', value as 'lost' | 'damaged')}
                            defaultValue={selectedRow?.lmbanO_AvialableStatus?.toLowerCase() || 'lost'}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select Status' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='lost'>Lost</SelectItem>
                                <SelectItem value='damaged'>Damaged</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.LMBANO_AvialableStatus && <p className='text-red-500 text-xs'>{errors.LMBANO_AvialableStatus.message}</p>}
                    </div>
                </div>
            </div>

            {/* Bottom Centered - Mode of Payment */}
            <div className='flex flex-col items-center gap-4 rounded-lg border bg-muted/20 p-4'>
                <Label className='font-bold text-primary text-sm uppercase'>
                    Mode Of Payment: <span className='text-red-500'>*</span>
                </Label>
                <RadioGroup
                    defaultValue={(selectedRow?.lmbanO_ModeOfPayment as any) || undefined}
                    onValueChange={(value) => setValue('LMBANO_ModeOfPayment', value as 'Cash' | 'Bank')}
                    className='flex space-x-12'>
                    <div className='flex items-center space-x-3'>
                        <RadioGroupItem value='Cash' id='edit-cash' />
                        <Label htmlFor='edit-cash' className='cursor-pointer font-medium'>
                            Cash
                        </Label>
                    </div>
                    <div className='flex items-center space-x-3'>
                        <RadioGroupItem value='Bank' id='edit-bank' />
                        <Label htmlFor='edit-bank' className='cursor-pointer font-medium'>
                            Bank
                        </Label>
                    </div>
                </RadioGroup>
                {errors.LMBANO_ModeOfPayment && <p className='text-red-500 text-xs'>{errors.LMBANO_ModeOfPayment.message}</p>}
            </div>

            {/* Buttons */}
            <div className='flex items-center justify-center gap-4 border-t pt-6'>
                <Button
                    type='submit'
                    disabled={isSubmitting || loading}
                    className='h-11 min-w-[140px] bg-primary transition-all hover:bg-primary/90'>
                    {isSubmitting || loading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            SAVING...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' />
                            UPDATE
                        </>
                    )}
                </Button>

                <Button type='button' variant='destructive' onClick={onCancel} className='h-11 min-w-[140px]'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}

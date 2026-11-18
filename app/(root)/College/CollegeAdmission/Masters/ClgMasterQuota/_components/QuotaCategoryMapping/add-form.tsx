'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useSaveMasterQuotaCategoryMapping } from '@/hooks/college/useCollegeMasters';
import { IMasterQuota, IMasterQuotaCategory } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

const formSchema = z.object({
    acQ_Id: z.string().min(1, 'Select a Quota'),
    selectedCategories: z.array(z.number()).min(1, 'Select at least one Quota Category')
});

type FormValues = z.infer<typeof formSchema>;

interface AddQuotaCategoryMappingFormProps {
    quotas: IMasterQuota[];
    categories: IMasterQuotaCategory[];
    onSuccess: () => void;
}

export default function AddQuotaCategoryMappingForm({ quotas, categories, onSuccess }: AddQuotaCategoryMappingFormProps) {
    const saveMutation = useSaveMasterQuotaCategoryMapping();
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acQ_Id: '',
            selectedCategories: []
        }
    });

    const selectedCategories = form.watch('selectedCategories');

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter(c => c.acqC_CategoryName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    const isAllSelected = filteredCategories.length > 0 && filteredCategories.every(c => selectedCategories.includes(c.acqC_Id));

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelection = [...new Set([...selectedCategories, ...filteredCategories.map(c => c.acqC_Id)])];
            form.setValue('selectedCategories', newSelection, { shouldValidate: true });
        } else {
            const filteredIds = filteredCategories.map(c => c.acqC_Id);
            const newSelection = selectedCategories.filter(id => !filteredIds.includes(id));
            form.setValue('selectedCategories', newSelection, { shouldValidate: true });
        }
    };

    const handleSelectOne = (checked: boolean, id: number) => {
        if (checked) {
            form.setValue('selectedCategories', [...selectedCategories, id], { shouldValidate: true });
        } else {
            form.setValue('selectedCategories', selectedCategories.filter(existingId => existingId !== id), { shouldValidate: true });
        }
    };

    const onSubmit = async (values: FormValues) => {
        // Construct the array payload exactly as requested
        const checkedCategories = categories.filter(c => values.selectedCategories.includes(c.acqC_Id)).map(c => ({
            acqC_Id: c.acqC_Id
        }));

        const payload = {
            acQ_Id: parseInt(values.acQ_Id),
            quotaClist: checkedCategories
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Saving record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data.message || 'Record Saved Successfully';
                }
                throw new Error(data?.message || 'Failed To Save Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='acQ_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quota Name <span className='text-red-500'>*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Quota" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {quotas.map(quota => (
                                            <SelectItem key={quota.acQ_Id} value={quota.acQ_Id.toString()}>
                                                {quota.acQ_QuotaName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name='selectedCategories'
                        render={() => (
                            <FormItem>
                                <FormLabel>Quota Category <span className='text-red-500'>*</span></FormLabel>
                                <div className='border rounded-md p-4 space-y-4'>
                                    <Input 
                                        placeholder='Search Categories...' 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='mb-2'
                                    />
                                    <div className='flex items-center space-x-2 pb-2 border-b'>
                                        <Checkbox 
                                            id="selectAll" 
                                            checked={isAllSelected}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <label htmlFor="selectAll" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Select All
                                        </label>
                                    </div>
                                    <div className='max-h-48 overflow-y-auto space-y-2'>
                                        {filteredCategories.map(cat => (
                                            <div key={cat.acqC_Id} className='flex items-center space-x-2'>
                                                <Checkbox 
                                                    id={`cat-${cat.acqC_Id}`} 
                                                    checked={selectedCategories.includes(cat.acqC_Id)}
                                                    onCheckedChange={(checked) => handleSelectOne(checked as boolean, cat.acqC_Id)}
                                                />
                                                <label htmlFor={`cat-${cat.acqC_Id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    {cat.acqC_CategoryName}
                                                </label>
                                            </div>
                                        ))}
                                        {filteredCategories.length === 0 && (
                                            <div className='text-sm text-muted-foreground'>No categories found.</div>
                                        )}
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <div className='flex justify-center gap-4 mt-6'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => {
                        form.reset();
                        onSuccess();
                    }} disabled={saveMutation.isPending}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}

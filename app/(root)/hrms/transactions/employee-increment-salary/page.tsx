'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetEmployees } from '@/hooks/hrms/useMasters';
import {
    useAddOrUpdateEmployeeSalaryIncrement,
    useDeleteEmployeeIncrementMaster,
    useEmployeeIncrementGrid
} from '@/hooks/hrms/useTransactions';
import { getHeadDropdown } from '@/server/hrms/hrmsConfig/transaction/salary-updation';
import { Plus, Save, X } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getEmployeeIncrementColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeIncrementSalaryPage(props: { searchParams: SearchParams }) {
    const [heads, setHeads] = useState<any[]>([]);
    const [isHeadsLoading, setIsHeadsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchParams, setSearchParams] = useState<any>({});
    // const searchParams = use(props.searchParams);
    
        useEffect(() => {
            const fetchParams = async () => {
                const params = await props.searchParams;
                setSearchParams(params);
            };
            fetchParams();
        }, [props.searchParams]);
    
    // Fetch Employees using existing hook
    const { data: employeesData, isLoading: isEmployeesLoading } = useGetEmployees();

    // Fetch Heads
    useEffect(() => {
        const fetchHeads = async () => {
            setIsHeadsLoading(true);
            try {
                const result = await getHeadDropdown();
                setHeads(result.headdropdown || []);
            } catch (error) {
                console.error('Failed to fetch heads:', error);
                toast.error('Failed to load salary heads');
            } finally {
                setIsHeadsLoading(false);
            }
        };
        fetchHeads();
    }, []);

    // Mutation
    const { mutate: saveIncrement, isPending: isSaving } = useAddOrUpdateEmployeeSalaryIncrement();

    // Grid Data
    
    const { data: gridData, isLoading: isGridLoading } = useEmployeeIncrementGrid(searchParams);
    const { mutate: deleteIncrement, isPending: isDeleting } = useDeleteEmployeeIncrementMaster();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this record?')) {
            deleteIncrement(id);
        }
    };

    const columns = useMemo(() => getEmployeeIncrementColumns(handleDelete), []);

    const tableProps = useDataTableProps(gridData);

    // Form Setup
    const { control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            selectedEmployees: [] as string[],
            incrementDate: new Date(),
            headId: undefined as string | undefined,
            type: 'Percentage',
            value: ''
        }
    });

    const onSubmit = async (data: any) => {
        console.log('🚀 ~ onSubmit ~ data:', data);
        const payload = {
            hrmeD_Id: Number(data.headId),
            hreiceD_Amount: data.type === 'Amount' ? Number(data.value) : 0,
            hreiceD_Percentage: data.type === 'Percentage' ? data.value.toString() : '0',
            employee: data.selectedEmployees.map((empId: string) => ({
                hrmE_Id: Number(empId)
            }))
        };

        saveIncrement(payload, {
            onSuccess: () => {
                reset();
                setIsFormOpen(false);
            }
        });
    };

    const handleCancel = () => {
        reset();
        setIsFormOpen(false);
    };

    return (
        <div className='min-h-screen bg-background p-4'>
            <div className='container mx-auto space-y-6'>
                <div className='flex flex-end gap-2'>
                    <Button
                        type='button'
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Earning/Deduction
                    </Button>
                </div>
                {/* Grid Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    title={
                        <div className='flex items-center gap-4'>
                            <span>Employee Increment List</span>
                            <Badge variant='secondary' className='border-primary/20 bg-primary/10 font-bold text-primary'>
                                Total Records: {tableProps.totalItems}
                            </Badge>
                        </div>
                    }
                    variant='outline'
                    size='lg'
                    className='rounded-xl shadow-xl '>
                    <div className='space-y-4 p-6'>
                        <GenericDataTable
                            {...tableProps}
                            columns={columns}
                            isLoading={isGridLoading || isDeleting}
                            showViewOptions={false}
                            isPaginationRequired={true}
                            isSearchRequired={true}
                        />
                    </div>
                </CollapsibleSection>

                {isFormOpen && (
                    <CollapsibleSection
                        defaultOpen={true}
                        title='Salary Increment Details'
                        variant='outline'
                        size='lg'
                        className='overflow-hidden rounded-xl shadow-xl'>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 p-6'>
                            {/* Form content remains same */}
                            <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                                {/* Employee Selection */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-base'>
                                        Employee <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='selectedEmployees'
                                        control={control}
                                        rules={{ required: 'Please select at least one employee' }}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <MultiSelect
                                                    options={
                                                        employeesData?.data?.map((emp: any) => ({
                                                            label: emp.value,
                                                            value: emp.key.toString()
                                                        })) || []
                                                    }
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder='Search here...'
                                                    maxHeight={240}
                                                    className={`w-full border-2 transition-all focus:border-primary ${fieldState.error ? 'border-destructive' : ''}`}
                                                />
                                                {fieldState.error && (
                                                    <p className='mt-1 font-medium text-destructive text-xs'>{fieldState.error.message}</p>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                {/* Increment Date */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-base'>
                                        Increment Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='incrementDate'
                                        control={control}
                                        rules={{ required: 'Increment date is required' }}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <DatePicker
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                    className={`flex h-12 w-full items-center border-2 ${fieldState.error ? 'border-destructive' : ''}`}
                                                />
                                                {fieldState.error && (
                                                    <p className='mt-1 font-medium text-destructive text-xs'>{fieldState.error.message}</p>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                {/* Type (Percentage/Amount) */}
                                <div className='space-y-3'>
                                    <div className='pt-2'>
                                        <Label className='font-semibold text-base'>
                                            {watch('type')}: <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='value'
                                            control={control}
                                            rules={{
                                                required: `${watch('type')} is required`,
                                                validate: (val) => !isNaN(Number(val)) || 'Please enter a valid number'
                                            }}
                                            render={({ field, fieldState }) => (
                                                <>
                                                    <InputText
                                                        {...field}
                                                        placeholder={`Enter ${watch('type')}`}
                                                        className={`h-12 w-full text-lg transition-all focus:border-primary ${fieldState.error ? 'border-destructive' : ''}`}
                                                    />
                                                    {fieldState.error && (
                                                        <p className='mt-1 font-medium text-destructive text-xs'>
                                                            {fieldState.error.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>
                                    <div className='rounded-lg bg-muted/30 p-3'>
                                        <Controller
                                            name='type'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className='flex flex-row justify-around gap-6'>
                                                    <div className='group flex cursor-pointer items-center gap-3'>
                                                        <RadioGroupItem
                                                            value='Percentage'
                                                            id='type-percentage'
                                                            className='h-5 w-5 text-primary focus:ring-primary'
                                                        />
                                                        <Label
                                                            htmlFor='type-percentage'
                                                            className='cursor-pointer font-medium text-base transition-colors group-hover:text-primary'>
                                                            Percentage
                                                        </Label>
                                                    </div>
                                                    <div className='group flex cursor-pointer items-center gap-3'>
                                                        <RadioGroupItem
                                                            value='Amount'
                                                            id='type-amount'
                                                            className='h-5 w-5 text-primary focus:ring-primary'
                                                        />
                                                        <Label
                                                            htmlFor='type-amount'
                                                            className='cursor-pointer font-medium text-base transition-colors group-hover:text-primary'>
                                                            Amount
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>
                                </div>
                                {/* Head Selection */}
                                <div className='space-y-3'>
                                    <Label className='font-semibold text-base'>
                                        Head <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='headId'
                                        control={control}
                                        rules={{ required: 'Please select a salary head' }}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger
                                                        className={`h-12 w-full border-2 text-base focus:ring-primary ${fieldState.error ? 'border-destructive' : ''}`}>
                                                        <SelectValue placeholder='Select Head' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {isHeadsLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            heads.map((head) => (
                                                                <SelectItem key={head.HRMED_Id} value={head.HRMED_Id.toString()}>
                                                                    {head.HRMED_Name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && (
                                                    <p className='mt-1 font-medium text-destructive text-xs'>{fieldState.error.message}</p>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className='flex items-center justify-end gap-3 pt-10'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className='w-32 rounded-xl border-orange-500 text-orange-600 transition-all hover:bg-orange-50'>
                                    <X className='mr-2 h-4 w-4' />
                                    CANCEL
                                </Button>
                                <Button
                                    type='submit'
                                    disabled={isSaving || isEmployeesLoading || isHeadsLoading}
                                    className='w-32 rounded-xl transition-all'>
                                    {isSaving ? (
                                        <span className='flex items-center gap-2'>
                                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                                            SAVING...
                                        </span>
                                    ) : (
                                        <span className='flex items-center gap-2 uppercase'>
                                            <Save className='h-4 w-4' />
                                            Save
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}

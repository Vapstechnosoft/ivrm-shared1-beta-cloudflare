'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useInvRSalesClassData,
    useInvRSalesDetails,
    useInvRSalesItemLoadData,
    useInvRSalesLoadData,
    useInvRSalesSectionList,
    useInvRSalesStaffLoadData,
    useInvRSalesStudentList
} from '@/hooks/inventory/reports/use-inv-r-sales';
import { cn } from '@/lib/utils';
import { type InvRSalesSchema, invRSalesSchema } from '@/schemas/inventory/reports/inv-r-sales';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileText, RefreshCcw } from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onSubmit: (payload: InvRSalesSchema) => void;
    isLoading?: boolean;
}

export default function ReportForm({ onSubmit, isLoading }: ReportFormProps) {
    const form = useForm<InvRSalesSchema>({
        resolver: zodResolver(invRSalesSchema),
        defaultValues: {
            typeflag: 'All',
            bw_dates: false,
            startdate: undefined,
            enddate: undefined,
            optionflag: undefined,
            individualflag: undefined,
            showTax: false,
            showDiscount: false,
            salesArray: [],
            itemArray: [],
            studentArray: [],
            classId: undefined,
            sectionId: undefined,
            singleStudentId: undefined,
            singleStaffId: undefined,
            singleCustomerId: undefined
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = form;

    // Watched values
    const typeflag = watch('typeflag');
    const optionflag = watch('optionflag');
    const individualflag = watch('individualflag');
    const bw_dates = watch('bw_dates');
    const classId = watch('classId');
    const sectionId = watch('sectionId');

    const { data: loadData } = useInvRSalesLoadData();
    const { data: detailsData, refetch: refetchDetails } = useInvRSalesDetails(optionflag);
    const { data: classData, refetch: refetchClasses } = useInvRSalesClassData(individualflag);
    const { data: sectionData, refetch: refetchSections } = useInvRSalesSectionList(classId, individualflag);
    const { data: studentListData, refetch: refetchStudentList } = useInvRSalesStudentList(classId, sectionId, individualflag, optionflag);
    // Item load-data from the same GRN API (flg=Item_1), enabled only when optionflag === 'Item'
    const { data: itemLoadData, refetch: refetchItemLoadData } = useInvRSalesItemLoadData(optionflag === 'Item' ? 'Item_1' : '');
    // Staff load-data from the same item-consumption API, enabled only when optionflag === 'Staff'
    const { data: staffLoadData, refetch: refetchStaffLoadData } = useInvRSalesStaffLoadData(optionflag === 'Staff');

    useEffect(() => {
        if (optionflag) {
            refetchDetails();
            setValue('individualflag', undefined);
            setValue('classId', undefined);
            setValue('sectionId', undefined);
            setValue('studentArray', []);
            setValue('itemArray', []);
            setValue('salesArray', []);
            setValue('singleStudentId', undefined);
            setValue('singleStaffId', undefined);
            setValue('singleCustomerId', undefined);
            if (optionflag === 'Item') {
                refetchItemLoadData();
            }
            if (optionflag === 'Staff') {
                refetchStaffLoadData();
            }
        }
    }, [optionflag, refetchDetails, refetchItemLoadData, refetchStaffLoadData, setValue]);

    useEffect(() => {
        if (individualflag) {
            refetchClasses();
            setValue('classId', undefined);
            setValue('sectionId', undefined);
            setValue('studentArray', []);
        }
    }, [individualflag, refetchClasses, setValue]);

    useEffect(() => {
        if (classId) {
            if (individualflag === 'CS') {
                refetchSections();
                setValue('sectionId', undefined);
                setValue('studentArray', []);
            } else if (individualflag === 'C') {
                refetchStudentList();
                setValue('studentArray', []);
            }
        }
    }, [classId, individualflag, refetchSections, refetchStudentList, setValue]);

    useEffect(() => {
        if (classId && sectionId && individualflag === 'CS') {
            refetchStudentList();
            setValue('studentArray', []);
        }
    }, [classId, sectionId, individualflag, refetchStudentList, setValue]);

    const getGenericDetailsArray = (data: any) => {
        if (!data) return [];
        const resData = data.data;
        if (Array.isArray(resData)) return resData;
        if (resData?.$values && Array.isArray(resData.$values)) return resData.$values;
        if (resData?.get_customer) {
            if (Array.isArray(resData.get_customer)) return resData.get_customer;
            if (resData.get_customer.$values) return resData.get_customer.$values;
        }
        if (resData?.get_salesdetails) {
            if (Array.isArray(resData.get_salesdetails)) return resData.get_salesdetails;
            if (resData.get_salesdetails.$values) return resData.get_salesdetails.$values;
        }
        if (resData?.get_salesDetails) {
            if (Array.isArray(resData.get_salesDetails)) return resData.get_salesDetails;
            if (resData.get_salesDetails.$values) return resData.get_salesDetails.$values;
        }
        if (Array.isArray(data.get_customer)) return data.get_customer;
        if (data.get_customer?.$values) return data.get_customer.$values;
        return [];
    };

    const grnSalesOptions = useMemo(() => {
        const details = getGenericDetailsArray(detailsData);
        return details
            .map((item: any) => {
                const id = item.id ?? item.invmsL_Id ?? item.invmsl_Id ?? item.INVMSL_Id;
                const no = item.name ?? item.invmsL_SalesNo ?? item.invmsl_SalesNo ?? item.INVMSL_SalesNo;
                return {
                    label: no?.toString() || '',
                    value: id?.toString() || ''
                };
            })
            .filter((o: any) => o.value);
    }, [detailsData]);

    // Helper to extract item array from GRN-style load data response (same as GRN report)
    const getItemDetailsArray = (data: any) => {
        if (!data) return [];
        const resData = data.data;
        if (Array.isArray(resData)) return resData;
        if (resData?.$values && Array.isArray(resData.$values)) return resData.$values;
        if (resData?.get_grn_item_supplier) {
            if (Array.isArray(resData.get_grn_item_supplier)) return resData.get_grn_item_supplier;
            if (resData.get_grn_item_supplier.$values) return resData.get_grn_item_supplier.$values;
        }
        if (Array.isArray(data.get_grn_item_supplier)) return data.get_grn_item_supplier;
        if (data.get_grn_item_supplier?.$values) return data.get_grn_item_supplier.$values;
        return [];
    };

    const itemDetailsArray = useMemo(() => getItemDetailsArray(itemLoadData), [itemLoadData]);

    // Helper to extract staff array from item-consumption-style load data response
    const getStaffDetailsArray = (data: any) => {
        if (!data) return [];
        const resData = data.data;
        if (Array.isArray(resData)) return resData;
        if (resData?.$values && Array.isArray(resData.$values)) return resData.$values;
        if (resData?.get_ICreportdetails) {
            if (Array.isArray(resData.get_ICreportdetails)) return resData.get_ICreportdetails;
            if (resData.get_ICreportdetails.$values) return resData.get_ICreportdetails.$values;
        }
        if (Array.isArray(data.get_ICreportdetails)) return data.get_ICreportdetails;
        if (data.get_ICreportdetails?.$values) return data.get_ICreportdetails.$values;
        return [];
    };

    const staffDetailsArray = useMemo(() => getStaffDetailsArray(staffLoadData), [staffLoadData]);

    const itemOptions = useMemo(() => {
        // Prefer the GRN load-data source when optionflag is 'Item'
        if (optionflag === 'Item' && itemDetailsArray.length > 0) {
            return itemDetailsArray
                .map((item: any) => ({
                    label: item.name || item.invmI_ItemName || 'Unknown Item',
                    value: (item.id || item.invmI_Id)?.toString() || ''
                }))
                .filter((o: any) => o.value);
        }
        // Fallback to detailsData (existing behaviour)
        const details = getGenericDetailsArray(detailsData);
        return details
            .map((item: any) => {
                const id = item.invmI_Id ?? item.invmi_Id ?? item.INVMI_Id;
                const name = item.invmI_ItemName ?? item.invmi_ItemName ?? item.INVMI_ItemName;
                return {
                    label: name?.toString() || '',
                    value: id?.toString() || ''
                };
            })
            .filter((o: any) => o.value);
    }, [detailsData, itemDetailsArray, optionflag]);

    const staffOptions = useMemo(() => {
        // Prefer the item-consumption load-data source when optionflag is 'Staff'
        if (optionflag === 'Staff' && staffDetailsArray.length > 0) {
            return staffDetailsArray
                .map((item: any) => ({
                    label: item.name || item.employeename || 'Unknown Staff',
                    value: (item.id || item.hrmE_Id)?.toString() || ''
                }))
                .filter((o: any) => o.value);
        }
        // Fallback to detailsData (existing behaviour)
        const details = getGenericDetailsArray(detailsData);
        return details
            .map((item: any) => {
                const id = item.hrmE_Id ?? item.hrme_Id ?? item.HRME_Id;
                const name = item.employeename ?? item.employeeName ?? item.HRME_EmployeeName;
                return {
                    label: name?.toString() || '',
                    value: id?.toString() || ''
                };
            })
            .filter((o: any) => o.value);
    }, [detailsData, staffDetailsArray, optionflag]);

    const customerOptions = useMemo(() => {
        const details = getGenericDetailsArray(detailsData);

        return details
            .map((item: any) => {
                const id = item.id ?? item.invmC_Id ?? item.invmc_Id ?? item.INVMC_Id;
                const name =
                    item.name ?? item.invmC_CustomerName ?? item.invmc_CustomerName ?? item.INVMC_CustomerName ?? item.customerName;
                return {
                    label: name?.toString() || '',
                    value: id?.toString() || ''
                };
            })
            .filter((o: any) => o.value);
    }, [detailsData]);

    useEffect(() => {
        if (optionflag === 'Student' && !individualflag) {
            setValue('individualflag', 'C');
        }
    }, [optionflag, individualflag, setValue]);

    const classOptions = useMemo(() => {
        if (Array.isArray(classData?.data)) return classData.data;
        return classData?.data?.get_class || [];
    }, [classData]);
    const sectionOptions = useMemo(() => {
        if (Array.isArray(sectionData?.data)) return sectionData.data;
        return sectionData?.data?.get_Section || [];
    }, [sectionData]);
    const studentList = useMemo(() => {
        const data = studentListData?.data;
        if (Array.isArray(data)) return data;
        return data?.get_Studentlist ?? data?.studentList ?? [];
    }, [studentListData]);

    const studentListOptions = useMemo(
        () =>
            studentList
                .map((item: any) => {
                    const id = item.amsT_Id ?? item.amst_Id ?? item.AMST_Id ?? item.studentId;
                    const name = item.studentName ?? item.studentname ?? item.ameS_StudentName ?? '';
                    const admNo = item.amsT_AdmNo ?? item.amst_AdmNo ?? item.AMST_AdmNo ?? '';
                    return {
                        label: name + (admNo ? ` : ${admNo}` : ''),
                        value: id?.toString() || ''
                    };
                })
                .filter((opt: { value: string; label: string }) => opt.value),
        [studentList]
    );

    const handleFormSubmit = (data: InvRSalesSchema) => {
        onSubmit(data);
    };

    const onFormError = (errors: any) => {
        console.log('Validation Errors:', errors);
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
            const error = errors[firstErrorKey];
            const message = error.message || 'Please fill all required fields';
            toast.error(message);
        }
    };

    const handleCancel = () => {
        reset();
        onSubmit({} as InvRSalesSchema);
    };

    const GenericCombobox = ({ options, value, onChange, placeholder }: any) => {
        const [open, setOpen] = useState(false);
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between'>
                        {value ? options.find((option: any) => option.value === value)?.label : placeholder}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                    <Command>
                        <CommandInput placeholder={`Search ${placeholder}...`} />
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option: any) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}>
                                    <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit, onFormError)} className='space-y-4'>
            <CollapsibleSection title='Report Configuration' defaultOpen={true}>
                <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Report Type */}
                    <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                        <Label className='font-semibold text-primary'>Report Type</Label>
                        <Controller
                            name='typeflag'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={(val: any) => {
                                        field.onChange(val);
                                        setValue('optionflag', undefined);
                                    }}
                                    defaultValue={field.value}
                                    className='flex flex-col space-y-1'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='All' id='r1' />
                                        <Label htmlFor='r1'>All</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Overall' id='r2' />
                                        <Label htmlFor='r2'>Overall</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Detailed' id='r3' />
                                        <Label htmlFor='r3'>Detailed</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        <div className='mt-2 flex space-x-4'>
                            <Controller
                                name='showTax'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='tax' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='tax'>Tax</Label>
                                    </div>
                                )}
                            />
                            <Controller
                                name='showDiscount'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='disc' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='disc'>Discount</Label>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Sub Options */}
                    {(typeflag === 'Overall' || typeflag === 'Detailed') && (
                        <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                            <Label className='font-semibold text-primary'>Filter By</Label>
                            <Controller
                                name='optionflag'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-col space-y-1'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Item' id='sub1' />
                                            <Label htmlFor='sub1'>Item</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Student' id='sub2' />
                                            <Label htmlFor='sub2'>Student</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Staff' id='sub3' />
                                            <Label htmlFor='sub3'>Staff</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Customer' id='sub4' />
                                            <Label htmlFor='sub4'>Customer</Label>
                                        </div>
                                        {typeflag === 'Detailed' && (
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Saleno' id='sub5' />
                                                <Label htmlFor='sub5'>Sale No.</Label>
                                            </div>
                                        )}
                                    </RadioGroup>
                                )}
                            />
                            {errors.optionflag && <FormError>{errors.optionflag.message}</FormError>}
                        </div>
                    )}

                    {/* Student Selection Mode */}
                    {optionflag === 'Student' && (
                        <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                            <Label className='font-semibold text-primary'>Student Selection Mode</Label>
                            <Controller
                                name='individualflag'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        className='flex flex-col space-y-1'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='C' id='ind1' />
                                            <Label htmlFor='ind1'>Class</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='CS' id='ind2' />
                                            <Label htmlFor='ind2'>Class/Section</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    )}

                    {/* Date Filters */}
                    <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                        <div className='mb-4 flex items-center space-x-2'>
                            <Controller
                                name='bw_dates'
                                control={control}
                                render={({ field }) => <Checkbox id='bw_dates' checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label htmlFor='bw_dates' className='font-semibold'>
                                Between Dates
                            </Label>
                        </div>
                        {bw_dates && (
                            <div className='space-y-3'>
                                <div className='flex flex-col gap-1.5'>
                                    <Label>Start Date</Label>
                                    <Controller
                                        name='startdate'
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type='date'
                                                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm'
                                                value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        )}
                                    />
                                    {errors.startdate && <FormError>{errors.startdate.message}</FormError>}
                                </div>
                                <div className='flex flex-col gap-1.5'>
                                    <Label>End Date</Label>
                                    <Controller
                                        name='enddate'
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type='date'
                                                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm'
                                                value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                            />
                                        )}
                                    />
                                    {errors.enddate && <FormError>{errors.enddate.message}</FormError>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='p-4 pt-0'>
                    <div className='space-y-4 rounded-md border border-dashed bg-background p-4'>
                        {optionflag === 'Saleno' && (
                            <div className='max-w-xl space-y-2'>
                                <Label>
                                    Select Sale No <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='salesArray'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={grnSalesOptions}
                                            onValueChange={(val) =>
                                                field.onChange(
                                                    getGenericDetailsArray(detailsData).filter((i: any) =>
                                                        val.includes((i.id ?? i.invmsL_Id ?? i.invmsl_Id ?? i.INVMSL_Id)?.toString())
                                                    )
                                                )
                                            }
                                            defaultValue={field.value?.map((v: any) =>
                                                (v.id ?? v.invmsL_Id ?? v.invmsl_Id ?? v.INVMSL_Id)?.toString()
                                            )}
                                            placeholder='Select Sale No...'
                                        />
                                    )}
                                />
                                {errors.salesArray && <FormError>{errors.salesArray.message}</FormError>}
                            </div>
                        )}

                        {optionflag === 'Item' && (
                            <div className='max-w-xl space-y-2'>
                                <Label>
                                    Select Item <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='itemArray'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={itemOptions}
                                            onValueChange={(val) => {
                                                const selectedObjects =
                                                    itemDetailsArray.length > 0
                                                        ? itemDetailsArray
                                                              .filter((i: any) => val.includes((i.id || i.invmI_Id)?.toString()))
                                                              .map((i: any) => ({ ...i, checked: true }))
                                                        : getGenericDetailsArray(detailsData)
                                                              .filter((i: any) =>
                                                                  val.includes((i.invmI_Id ?? i.invmi_Id ?? i.INVMI_Id)?.toString())
                                                              )
                                                              .map((i: any) => ({ ...i, checked: true }));
                                                field.onChange(selectedObjects);
                                            }}
                                            defaultValue={field.value?.map((v: any) => (v.id || v.invmI_Id)?.toString())}
                                            placeholder='Select Item...'
                                        />
                                    )}
                                />
                                {errors.itemArray && <FormError>{errors.itemArray.message}</FormError>}
                            </div>
                        )}

                        {optionflag === 'Staff' && (
                            <div className='max-w-xl space-y-2'>
                                <Label>
                                    Select Staff <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='singleStaffId'
                                    control={control}
                                    render={({ field }) => (
                                        <GenericCombobox
                                            options={staffOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder='Staff'
                                        />
                                    )}
                                />
                                {errors.singleStaffId && <FormError>{errors.singleStaffId.message}</FormError>}
                            </div>
                        )}

                        {optionflag === 'Customer' && (
                            <div className='max-w-xl space-y-2'>
                                <Label>
                                    Select Customer <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='singleCustomerId'
                                    control={control}
                                    render={({ field }) => (
                                        <GenericCombobox
                                            options={customerOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder='Customer'
                                        />
                                    )}
                                />
                                {errors.singleCustomerId && <FormError>{errors.singleCustomerId.message}</FormError>}
                            </div>
                        )}

                        {optionflag === 'Student' && (
                            <div className='space-y-4'>
                                {(individualflag === 'C' || individualflag === 'CS') && (
                                    <div className='max-w-xl space-y-2'>
                                        <Label>
                                            Class <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='classId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classOptions.map((c: any) => (
                                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                                {c.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                    </div>
                                )}

                                {individualflag === 'CS' && classId && (
                                    <div className='max-w-xl space-y-2'>
                                        <Label>
                                            Section <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='sectionId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sectionOptions.map((s: any) => (
                                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                                {s.asmC_SectionName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                    </div>
                                )}

                                {((individualflag === 'C' && classId) || (individualflag === 'CS' && classId && sectionId)) && (
                                    <div className='max-w-xl space-y-2'>
                                        <Label>
                                            Select Students <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='studentArray'
                                            control={control}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={studentListOptions}
                                                    onValueChange={(val) =>
                                                        field.onChange(studentList.filter((s: any) => val.includes(s.amsT_Id.toString())))
                                                    }
                                                    defaultValue={field.value?.map((v: any) => v.amsT_Id.toString())}
                                                    placeholder='Select Students...'
                                                />
                                            )}
                                        />
                                        {errors.studentArray && <FormError>{errors.studentArray.message}</FormError>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t bg-muted/10 p-4'>
                    <Button
                        type='submit'
                        variant='secondary'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                        isLoading={isLoading}>
                        <FileText className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                        onClick={handleCancel}>
                        <RefreshCcw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                </div>
            </CollapsibleSection>
        </form>
    );
}

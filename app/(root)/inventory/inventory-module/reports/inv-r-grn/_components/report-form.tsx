'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useInvRGRNLoadData, useInvRGRNReport } from '@/hooks/inventory/reports/use-inv-r-grn';
import { type InvRGRNSchema, invRGRNSchema } from '@/schemas/inventory/reports/inv-r-grn';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileText, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface ReportFormProps {
    onReportGenerated: (data: any, payload: any, total: number) => void;
}

export default function ReportForm({ onReportGenerated }: ReportFormProps) {
    const form = useForm<InvRGRNSchema>({
        resolver: zodResolver(invRGRNSchema),
        defaultValues: {
            typeflag: 'All',
            bw_dates: false,
            startdate: undefined,
            enddate: undefined,
            optionflag: undefined,
            grnArray: [],
            itemArray: [],
            supplierArray: []
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
    const bw_dates = watch('bw_dates');

    // Data Fetching
    const { data: loadData, refetch: refetchLoadData } = useInvRGRNLoadData(optionflag || '');
    const generateReportMutation = useInvRGRNReport();

    // Effect to refetch when optionflag changes
    useEffect(() => {
        if (optionflag) {
            refetchLoadData();
            if (optionflag === 'Individual_1') setValue('grnArray', []);
            if (optionflag === 'Item_1') setValue('itemArray', []);
            if (optionflag === 'Supplier') setValue('supplierArray', []);
        }
    }, [optionflag, refetchLoadData, setValue]);

    // Derived options for MultiSelects
    // Data extraction helper
    const getDetailsArray = (data: any) => {
        if (!data) return [];
        const resData = data.data;

        // 1. Data is directly in 'data' as an array
        if (Array.isArray(resData)) return resData;

        // 2. Data is in 'data.$values'
        if (resData?.$values && Array.isArray(resData.$values)) return resData.$values;

        // 3. Data is in 'data.get_grn_item_supplier'
        if (resData?.get_grn_item_supplier) {
            if (Array.isArray(resData.get_grn_item_supplier)) return resData.get_grn_item_supplier;
            if (resData.get_grn_item_supplier.$values) return resData.get_grn_item_supplier.$values;
        }

        // 4. Root level properties
        if (Array.isArray(data.get_grn_item_supplier)) return data.get_grn_item_supplier;
        if (data.get_grn_item_supplier?.$values) return data.get_grn_item_supplier.$values;

        return [];
    };

    const detailsArray = useMemo(() => getDetailsArray(loadData), [loadData]);

    const grnOptions = useMemo(() => {
        return detailsArray.map((item: any) => ({
            label: item.name || item.invmgrN_GRNNo || 'Unknown GRN',
            value: (item.id || item.invmgrN_Id)?.toString()
        }));
    }, [detailsArray]);

    const itemOptions = useMemo(() => {
        return detailsArray.map((item: any) => ({
            label: item.name || item.invmI_ItemName || 'Unknown Item',
            value: (item.id || item.invmI_Id)?.toString()
        }));
    }, [detailsArray]);

    const supplierOptions = useMemo(() => {
        return detailsArray.map((item: any) => ({
            label: item.name || item.invmS_SupplierName || 'Unknown Supplier',
            value: (item.id || item.invmS_Id)?.toString()
        }));
    }, [detailsArray]);

    const onSubmit = (data: InvRGRNSchema) => {
        const payload = {
            ...data,
            optionflag: data.optionflag?.replace('_1', ''), // Strip suffix for backend compatibility
            bwdateflag: data.bw_dates,
            startdate: data.startdate ? format(data.startdate, 'yyyy-MM-dd') : '',
            enddate: data.enddate ? format(data.enddate, 'yyyy-MM-dd') : '',
            grnArray: data.grnArray?.map((g: any) => ({
                ...g,
                INVMGRN_Id: g.invmgrN_Id || g.id || g.INVMGRN_Id
            })),
            itemArray: data.itemArray?.map((i: any) => ({
                ...i,
                INVMI_Id: i.invmI_Id || i.id || i.INVMI_Id
            })),
            supplierArray: data.supplierArray?.map((s: any) => ({
                ...s,
                INVMS_Id: s.invmS_Id || s.id || s.INVMS_Id
            }))
        };

        generateReportMutation.mutate(
            // @ts-ignore - casting simpler types for mock payload
            { payload: payload },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        // Handle varied data structures
                        let reportData = [];
                        if (Array.isArray(res.data)) {
                            reportData = res.data;
                        } else if (res.data?.$values) {
                            reportData = res.data.$values;
                        } else if (res.data?.get_grnreport) {
                            reportData = Array.isArray(res.data.get_grnreport)
                                ? res.data.get_grnreport
                                : res.data.get_grnreport?.$values || [];
                        }

                        onReportGenerated(reportData, payload, res.total || 0);
                    }
                }
            }
        );
    };

    const handleCancel = () => {
        reset();
        onReportGenerated([], null, 0);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <CollapsibleSection title='Report Configuration' defaultOpen={true}>
                <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Report Type Selection */}
                    <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                        <Label className='font-semibold text-primary'>Report Type</Label>
                        <Controller
                            name='typeflag'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue('optionflag', undefined); // Reset sub-option
                                    }}
                                    defaultValue={field.value}
                                    className='flex flex-col space-y-1'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='All' id='r1' />
                                        <Label htmlFor='r1' className='cursor-pointer'>
                                            All
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Overall' id='r2' />
                                        <Label htmlFor='r2' className='cursor-pointer'>
                                            Overall
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Detailed' id='r3' />
                                        <Label htmlFor='r3' className='cursor-pointer'>
                                            Detailed
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {/* Sub Options (Visible only for Overall/Detailed) */}
                    {(typeflag === 'Overall' || typeflag === 'Detailed') && (
                        <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                            <Label className='font-semibold text-primary'>Filter By</Label>
                            <Controller
                                name='optionflag'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-col space-y-1'>
                                        {typeflag === 'Detailed' && (
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Individual_1' id='sub1' />
                                                <Label htmlFor='sub1' className='cursor-pointer'>
                                                    Individual (GRN)
                                                </Label>
                                            </div>
                                        )}
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Item_1' id='sub2' />
                                            <Label htmlFor='sub2' className='cursor-pointer'>
                                                Item-wise
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Supplier' id='sub3' />
                                            <Label htmlFor='sub3' className='cursor-pointer'>
                                                Supplier
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.optionflag && <FormError>{errors.optionflag.message}</FormError>}
                        </div>
                    )}

                    {/* Date Filters */}
                    {typeflag !== 'All' && (
                        <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                            <div className='mb-4 flex items-center space-x-2'>
                                <Controller
                                    name='bw_dates'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='bw_dates' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='bw_dates' className='cursor-pointer font-semibold'>
                                    Between Dates
                                </Label>
                            </div>

                            {bw_dates && (
                                <div className='space-y-3'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Start Date <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='startdate'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='date'
                                                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                                                    value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                                />
                                            )}
                                        />
                                        {errors.startdate && <FormError>{errors.startdate.message}</FormError>}
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            End Date <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='enddate'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='date'
                                                    className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
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
                    )}
                </div>

                {/* Specific Filters (Multi Selects) */}
                {(optionflag === 'Individual_1' || optionflag === 'Item_1' || optionflag === 'Supplier') && (
                    <div className='p-4 pt-0'>
                        <div className='rounded-md border border-dashed bg-background p-4'>
                            {optionflag === 'Individual_1' && (
                                <div className='max-w-xl space-y-2'>
                                    <Label>
                                        Select GRN No <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='grnArray'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={grnOptions}
                                                onValueChange={(val) => {
                                                    const selectedObjects = detailsArray
                                                        ?.filter((i: any) => val.includes((i.id || i.invmgrN_Id)?.toString()))
                                                        .map((i: any) => ({ ...i, checked: true }));
                                                    field.onChange(selectedObjects);
                                                }}
                                                defaultValue={field.value?.map((v: any) => (v.id || v.invmgrN_Id)?.toString())}
                                                placeholder='Select GRN...'
                                            />
                                        )}
                                    />
                                    {errors.grnArray && <FormError>{errors.grnArray.message}</FormError>}
                                </div>
                            )}

                            {optionflag === 'Item_1' && (
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
                                                    const selectedObjects = detailsArray
                                                        ?.filter((i: any) => val.includes((i.id || i.invmI_Id)?.toString()))
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

                            {optionflag === 'Supplier' && (
                                <div className='max-w-xl space-y-2'>
                                    <Label>
                                        Select Supplier <span className='text-destructive'>*</span>
                                    </Label>
                                    <Controller
                                        name='supplierArray'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={supplierOptions}
                                                onValueChange={(val) => {
                                                    const selectedObjects = detailsArray
                                                        ?.filter((i: any) => val.includes((i.id || i.invmS_Id)?.toString()))
                                                        .map((i: any) => ({ ...i, checked: true }));
                                                    field.onChange(selectedObjects);
                                                }}
                                                defaultValue={field.value?.map((v: any) => (v.id || v.invmS_Id)?.toString())}
                                                placeholder='Select Supplier...'
                                            />
                                        )}
                                    />
                                    {errors.supplierArray && <FormError>{errors.supplierArray.message}</FormError>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className='flex justify-center gap-4 border-t bg-muted/10 p-4'>
                    <Button
                        type='submit'
                        variant='secondary'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                        isLoading={generateReportMutation.isPending}>
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

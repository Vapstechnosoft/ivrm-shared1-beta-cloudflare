'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useInvVendorPayment } from '@/hooks/inventory/transactions/use-inv-vendor-payment';
import { cn } from '@/lib/utils';
import { type InvVendorPaymentSchema, invVendorPaymentSchema } from '@/schemas/inventory/transactions/inv-vendor-payment';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GRNPaymentDetailsModal } from './grn-payment-details-modal';

interface AddFormProps {
    onSuccess: () => void;
    initialData?: any;
}

export default function AddVendorPaymentForm({ onSuccess, initialData }: AddFormProps) {
    const {
        suppliers: supplierList,
        paymentModes: paymentModeList,
        getGRNDetailsMutation,
        getGRNListMutation,
        saveMutation,
        getModelDetailsMutation,
        getGRNDetailMutation
    } = useInvVendorPayment();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [detailsData, setDetailsData] = useState<any[]>([]);
    const [selectedGRNNo, setSelectedGRNNo] = useState('');
    const [resetKey, setResetKey] = useState(0);

    const form = useForm<InvVendorPaymentSchema>({
        resolver: zodResolver(invVendorPaymentSchema),
        defaultValues: {
            invmS_Id: 0,
            invspT_PaymentDate: new Date(),
            invspT_ModeOfPayment: '',
            invspT_Amount: 0,
            invspT_Remarks: '',
            invspT_BankName: '',
            invspT_ChequeDDNo: '',
            invspT_PaymentReference: '',
            paymentArray: []
        }
    });

    const {
        control,
        handleSubmit,
        register,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = form;
    const { fields, replace, update } = useFieldArray({
        control,
        name: 'paymentArray'
    });

    const watchedMode = watch('invspT_ModeOfPayment');
    const watchedSupplier = watch('invmS_Id');

    // Derived state for totals
    const paymentArray = watch('paymentArray') || [];
    const totalPurchase = paymentArray.reduce((acc, item) => acc + (item.invmgrN_PurchaseValue || 0), 0);
    const totalPaid = paymentArray.reduce((acc, item) => acc + (item.invsptgrN_Amount || 0), 0);
    const totalBalance = paymentArray.reduce((acc, item) => acc + (item.invmgrN_TotalBalance || 0), 0);

    // Update form total amount when individual amounts change
    useEffect(() => {
        // Calculate total amount valid for save (sum of current payments)
        // In angular: totalpaid sum of all finalamount
        const totalCurrentPaid = paymentArray.reduce((acc, item) => acc + (item.invsptgrN_Amount || 0), 0);
        setValue('invspT_Amount', totalCurrentPaid);
    }, [paymentArray, setValue]);

    useEffect(() => {
        if (initialData) {
            // Find the correct ID from initialData depending on backend casing
            const paymentId = initialData.invspT_Id || initialData.invspt_id || initialData.INVSPT_Id || 0;
            const supplierId = initialData.invmS_Id || initialData.invms_id || initialData.INVMs_Id || 0;

            console.log('Extracted Payment ID for Edit:', paymentId);

            // Edit Mode
            getModelDetailsMutation.mutate(paymentId, {
                onSuccess: (res) => {
                    const details = res.data || [];
                    const mappedDetails = details.map((d: any) => {
                        const amount = d.invsptgrN_Amount ?? d.invsptgrn_amount ?? 0;
                        const totalPaid = d.invmgrN_TotalPaid ?? d.invmgrn_totalpaid ?? 0;
                        const purchaseValue = d.invmgrN_PurchaseValue ?? d.invmgrn_purchasevalue ?? 0;
                        const totalBalance = d.invmgrN_TotalBalance ?? d.invmgrn_totalbalance ?? 0;

                        return {
                            invsptgrN_Id: d.invsptgrN_Id ?? d.invsptgrn_id,
                            invmgrN_Id: d.invmgrN_Id ?? d.invmgrn_id,
                            invmgrN_GRNNo: d.invmgrN_GRNNo || d.invmgrn_grnno,
                            invmgrN_PurchaseValue: purchaseValue,
                            invmgrN_TotalPaid: totalPaid, // Total Paid
                            invmgrN_TotalBalance: totalBalance,
                            invsptgrN_Amount: amount, // Amount paid in this transaction record
                            invsptgrN_Remarks: d.invsptgrN_Remarks || d.invsptgrn_remarks || '',
                            checkedvalue: true,
                            // Original values for calculation logic
                            INVSPTGRN_Amount_New: totalPaid > 0 && totalPaid >= amount ? totalPaid - amount : 0, // Previous paid before this trans
                            INVMGRN_TotalBalance_New: totalBalance + amount // Balance before this trans
                        };
                    });

                    const paymentDateStr = initialData.invspT_PaymentDate || initialData.invspt_paymentdate;
                    const chequeDDDateStr = initialData.invspT_ChequeDDDate || initialData.invspt_chequedddate;

                    // React Hook Form
                    reset({
                        invspT_Id: paymentId,
                        invmS_Id: supplierId,
                        invspT_PaymentDate: paymentDateStr ? new Date(paymentDateStr) : new Date(),
                        invspT_ModeOfPayment: initialData.invspT_ModeOfPayment || initialData.invspt_modeofpayment || '',
                        invspT_BankName: initialData.invspT_BankName || initialData.invspt_bankname || '',
                        invspT_ChequeDDNo: initialData.invspT_ChequeDDNo || initialData.invspt_chequeddno || '',
                        invspT_ChequeDDDate: chequeDDDateStr ? new Date(chequeDDDateStr) : undefined,
                        invspT_PaymentReference: initialData.invspT_PaymentReference || initialData.invspt_paymentreference || '',
                        invspT_Amount: initialData.invspT_Amount || initialData.invspt_amount || 0,
                        invspT_Remarks: initialData.invspT_Remarks || initialData.invspt_remarks || '',
                        paymentArray: mappedDetails
                    });
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, reset]);

    const handleSupplierChange = (supplierId: string) => {
        const id = Number.parseInt(supplierId);
        setValue('invmS_Id', id);

        if (!initialData) {
            getGRNListMutation.mutate(id, {
                onSuccess: (res) => {
                    const grns = res.data || [];
                    const mappedGrns = grns.map((g: any) => ({
                        invmgrN_Id: g.invmgrN_Id,
                        invmgrN_GRNNo: g.invmgrN_GRNNo,
                        invmgrN_PurchaseValue: g.invmgrN_PurchaseValue,
                        invmgrN_TotalPaid: g.invmgrN_TotalPaid || 0,
                        invmgrN_TotalBalance: g.invmgrN_TotalBalance,
                        invsptgrN_Amount: 0,
                        invsptgrN_Remarks: '',
                        checkedvalue: false,
                        INVSPTGRN_Amount_New: g.invmgrN_TotalPaid || 0,
                        INVMGRN_TotalBalance_New: g.invmgrN_TotalBalance,
                        paystatus: g.invmgrN_TotalBalance === 0 ? '0' : g.invmgrN_TotalPaid > 0 ? '1' : '2'
                    }));
                    replace(mappedGrns);
                }
            });
        }
    };

    const handleAmountBlur = (index: number, currentAmountStr: string) => {
        const amountToPay = Number.parseFloat(currentAmountStr) || 0;
        const field = fields[index];
        const prevPaid = field.INVSPTGRN_Amount_New || 0; // Previously paid
        // The original balance before this payment:
        const originalBalance = field.INVMGRN_TotalBalance_New || 0;
        // OR: purchaseValue - prevPaid = balance available to pay.
        const purchaseValue = field.invmgrN_PurchaseValue;

        // Wait, angular logic: `totalpaidamount = finalamount + totalpaid`.
        // `balanceAmount = PurchaseValue - totalpaidamount`.

        let newTotalPaid = prevPaid + amountToPay;
        let newBalance = purchaseValue - newTotalPaid;

        if (newTotalPaid > purchaseValue) {
            toast.error('Paid Amount must be Less than or Equal to Purchase Amount');
            // Reset to 0 or max allowed? Angular sets INVSPTGRN_Amount to 0.
            newTotalPaid = prevPaid;
            newBalance = purchaseValue - prevPaid;
            setValue(`paymentArray.${index}.invsptgrN_Amount`, 0);
        } else {
            setValue(`paymentArray.${index}.invsptgrN_Amount`, amountToPay);
        }

        setValue(`paymentArray.${index}.invmgrN_TotalPaid`, newTotalPaid);
        setValue(`paymentArray.${index}.invmgrN_TotalBalance`, newBalance);
        setValue(`paymentArray.${index}.checkedvalue`, amountToPay > 0);
    };

    const handleViewGRNDetails = (grnId: number, grnNo: string) => {
        if (!watchedSupplier) {
            toast.error('Please select a supplier first');
            return;
        }
        getGRNDetailMutation.mutate(
            { invmS_Id: watchedSupplier, invmgrN_Id: grnId },
            {
                onSuccess: (res) => {
                    setDetailsData(res.data || []);
                    setSelectedGRNNo(grnNo);
                    setIsDetailsModalOpen(true);
                },
                onError: () => {
                    toast.error('Failed to fetch payment details');
                }
            }
        );
    };

    const onSubmit = (data: InvVendorPaymentSchema) => {
        // Filter checked or amounts > 0
        const validPayments = data.paymentArray?.filter((p) => p.checkedvalue && p.invsptgrN_Amount > 0);
        if (!validPayments || validPayments.length === 0) {
            toast.error('Please select at least one GRN and enter an amount');
            return;
        }

        // Recalculate total amount to ensure it matches the sum of selected payments
        const calculatedTotal = validPayments.reduce((sum, item) => sum + (Number(item.invsptgrN_Amount) || 0), 0);

        const payload = {
            ...data,
            invspT_Amount: calculatedTotal,
            paymentArray: validPayments
        };

        console.log('AddVendorPaymentForm: Submitting payload:', payload);

        saveMutation.mutate(payload, {
            onSuccess: (res) => {
                if (res.success) onSuccess();
            }
        });
    };

    const onError = (errors: any) => {
        console.error('Form Validation Errors:', errors);
        toast.error('Please check the form for errors.');
        // Specifically check for invspT_Amount error which might be hidden
        if (errors.invspT_Amount) {
            toast.error(`Total Amount Error: ${errors.invspT_Amount.message}`);
        }
    };

    const handleReset = () => {
        reset();
        setResetKey((prev) => prev + 1);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='grid gap-2'>
                        <label className='font-medium text-sm'>
                            Supplier <span className='text-destructive'>*</span>
                        </label>
                        <Controller
                            control={control}
                            name='invmS_Id'
                            render={({ field }) => (
                                <Select
                                    key={`supplier-${resetKey}`}
                                    onValueChange={(val) => handleSupplierChange(val)}
                                    value={field.value ? field.value.toString() : undefined}
                                    disabled={!!initialData}>
                                    <SelectTrigger className={cn('w-full', !field.value && 'text-muted-foreground')}>
                                        <SelectValue placeholder='Select Supplier' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supplierList.map((s: any) => (
                                            <SelectItem key={s.invmS_Id} value={s.invmS_Id.toString()}>
                                                {s.invmS_SupplierName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.invmS_Id && <span className='text-destructive text-xs'>{errors.invmS_Id.message}</span>}
                    </div>

                    <div className='grid gap-2'>
                        <label className='font-medium text-sm'>
                            Mode of Payment <span className='text-destructive'>*</span>
                        </label>
                        <Controller
                            control={control}
                            name='invspT_ModeOfPayment'
                            render={({ field }) => (
                                <Select key={`mode-${resetKey}`} onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger className={cn('w-full', !field.value && 'text-muted-foreground')}>
                                        <SelectValue placeholder='Select Mode' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentModeList.map((m: any) => (
                                            <SelectItem key={m.ivrmmoD_ModeOfPayment} value={m.ivrmmoD_ModeOfPayment}>
                                                {m.ivrmmoD_ModeOfPayment}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.invspT_ModeOfPayment && (
                            <span className='text-destructive text-xs'>{errors.invspT_ModeOfPayment.message}</span>
                        )}
                    </div>

                    {watchedMode && ['BANK', 'RTGS/NEFT', 'SWIPE/CARD', 'RTGS'].includes(watchedMode.toUpperCase()) && (
                        <>
                            <div className='grid gap-2'>
                                <label className='font-medium text-sm'>Bank Name</label>
                                <Input {...register('invspT_BankName')} placeholder='Bank Name' />
                                {errors.invspT_BankName && (
                                    <span className='text-destructive text-xs'>{errors.invspT_BankName.message}</span>
                                )}
                            </div>
                            <div className='grid gap-2'>
                                <label className='font-medium text-sm'>Cheque/DD No.</label>
                                <Input {...register('invspT_ChequeDDNo')} placeholder='Cheque/DD No.' />
                            </div>
                            <div className='grid gap-2'>
                                <label className='font-medium text-sm'>Cheque Date</label>
                                <Controller
                                    control={control}
                                    name='invspT_ChequeDDDate'
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <Calendar
                                                    mode='single'
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date('1900-01-01')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className='space-y-4'>
                    <div className='grid gap-2'>
                        <label className='font-medium text-sm'>Payment Reference</label>
                        <Input {...register('invspT_PaymentReference')} placeholder='Reference' />
                    </div>
                    <div className='grid gap-2'>
                        <label className='font-medium text-sm'>
                            Payment Date <span className='text-destructive'>*</span>
                        </label>
                        <Controller
                            control={control}
                            name='invspT_PaymentDate'
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.invspT_PaymentDate && <span className='text-destructive text-xs'>{errors.invspT_PaymentDate.message}</span>}
                    </div>

                    <div className='grid gap-2'>
                        <label className='font-medium text-sm'>Remarks</label>
                        <Textarea {...register('invspT_Remarks')} placeholder='Enter Remarks' />
                    </div>
                </div>
            </div>

            {/* GRN Grid */}
            {!!watchedSupplier && fields.length > 0 && (
                <div className='overflow-hidden rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50'>
                                <TableHead className='w-[50px]'>Select</TableHead>
                                <TableHead>GRN No</TableHead>
                                <TableHead className='text-right'>Purchase Value</TableHead>
                                <TableHead className='text-right'>Total Paid</TableHead>
                                <TableHead className='text-right'>Balance</TableHead>
                                <TableHead className='w-[150px] text-right'>Payment Amount</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-center'>View</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <Controller
                                            control={control}
                                            name={`paymentArray.${index}.checkedvalue`}
                                            render={({ field: checkboxField }) => (
                                                <Checkbox
                                                    checked={checkboxField.value}
                                                    onCheckedChange={checkboxField.onChange}
                                                    disabled={field.paystatus === '0'} // 0 = Full Paid
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className='font-medium'>{field.invmgrN_GRNNo}</TableCell>
                                    <TableCell className='text-right'>{field.invmgrN_PurchaseValue?.toFixed(2)}</TableCell>
                                    <TableCell className='text-right'>
                                        <Controller
                                            control={control}
                                            name={`paymentArray.${index}.invmgrN_TotalPaid`}
                                            render={({ field: valField }) => <span>{valField.value?.toFixed(2)}</span>}
                                        />
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <Controller
                                            control={control}
                                            name={`paymentArray.${index}.invmgrN_TotalBalance`}
                                            render={({ field: valField }) => <span>{valField.value?.toFixed(2)}</span>}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Controller
                                            control={control}
                                            name={`paymentArray.${index}.invsptgrN_Amount`}
                                            render={({ field: valField }) => (
                                                <Input
                                                    type='number'
                                                    className='h-8 text-right'
                                                    {...valField}
                                                    onChange={(e) => valField.onChange(e.target.valueAsNumber || 0)}
                                                    onBlur={(e) => {
                                                        valField.onBlur();
                                                        handleAmountBlur(index, e.target.value);
                                                    }}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input {...register(`paymentArray.${index}.invsptgrN_Remarks`)} className='h-8' />
                                    </TableCell>
                                    <TableCell>
                                        {field.paystatus === '0' && <span className='font-bold text-green-600 text-xs'>Full Paid</span>}
                                        {field.paystatus === '1' && <span className='font-bold text-blue-600 text-xs'>Part Paid</span>}
                                        {field.paystatus === '2' && <span className='font-bold text-red-600 text-xs'>Not Paid</span>}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            className='h-8 w-8 p-0'
                                            onClick={() => handleViewGRNDetails(field.invmgrN_Id, field.invmgrN_GRNNo || '')}>
                                            <Eye className='h-4 w-4 text-blue-500' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className='bg-muted font-bold'>
                                <TableCell colSpan={2} className='text-center'>
                                    Total
                                </TableCell>
                                <TableCell className='text-right'>{totalPurchase.toFixed(2)}</TableCell>
                                <TableCell className='text-right'>{totalPaid.toFixed(2)}</TableCell>
                                <TableCell className='text-right'>{totalBalance.toFixed(2)}</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            )}

            <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={handleReset}>
                    <RotateCcw className='mr-2 h-4 w-4' /> Reset
                </Button>
                <Button type='submit' disabled={saveMutation.isPending}>
                    <Save className='mr-2 h-4 w-4' />{' '}
                    {saveMutation.isPending ? 'Saving...' : initialData ? 'Update Payment' : 'Save Payment'}
                </Button>
            </div>

            <GRNPaymentDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                data={detailsData}
                grnNo={selectedGRNNo}
            />
        </form>
    );
}

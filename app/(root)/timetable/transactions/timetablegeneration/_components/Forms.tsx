'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type TimeTableGenerationValues, timeTableGenerationSchema } from '@/schemas/timetable/transactions';
import { generateTT, getGenerationCounts, getGenerationMasters, resetTT } from '@/server/timetable/transactions/timetablegeneration';
import type { AcademicYear, Category } from '@/types/timetable/Transaction/timetablegeneration';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, FileSpreadsheet, RefreshCcw, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface FormsProps {
    onFetch: (data: TimeTableGenerationValues | null) => void;
}

export default function Forms({ onFetch }: FormsProps) {
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [isCountLoading, setIsCountLoading] = useState(false);

    const [counts, setCounts] = useState<any>({
        totalperiods: 0,
        totalalloted: 0,
        totalnotalloted: 0,
        totalpending: 0,
        fixingperiodcnt: 0,
        fixingperiodstaffcnt: 0,
        consecutivecnt: 0,
        bifurcationcnt: 0
    });

    const [workloadData, setWorkloadData] = useState<any[]>([]);
    const [classWorkloadData, setClassWorkloadData] = useState<any[]>([]);
    const [pendingPeriods, setPendingPeriods] = useState<any[]>([]);

    useEffect(() => {
        const fetchMasters = async () => {
            try {
                const masters = await getGenerationMasters();
                setYears(masters.years || []);
                setCategories(masters.categories || []);
            } catch (error) {
                console.error('Failed to fetch masters', error);
                toast.error('Failed to load masters data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMasters();
    }, []);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<TimeTableGenerationValues>({
        resolver: zodResolver(timeTableGenerationSchema),
        defaultValues: {
            asmaY_Id: '',
            ttmC_Id: '',
            asmcL_Id: '',
            asms_Id: '',
            hrmE_Id: '',
            notConfirmedPeriods: ''
        }
    });

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const ttmC_Id = useWatch({ control, name: 'ttmC_Id' });

    const fetchCounts = async () => {
        if (!asmaY_Id || !ttmC_Id || categories.length === 0) {
            setCounts({
                totalperiods: 0,
                totalalloted: 0,
                totalnotalloted: 0,
                totalpending: 0,
                fixingperiodcnt: 0,
                fixingperiodstaffcnt: 0,
                consecutivecnt: 0,
                bifurcationcnt: 0
            });
            setValue('asmcL_Id', '0');
            setValue('asms_Id', '0');
            setValue('hrmE_Id', '0');
            setValue('notConfirmedPeriods', '0');
            setWorkloadData([]);
            setClassWorkloadData([]);
            setPendingPeriods([]);
            return;
        }

        setIsCountLoading(true);

        try {
            const albumNameArray =
                String(ttmC_Id) === 'all' ? categories.map((c) => ({ ttmC_Id: Number(c.ttmC_Id) })) : [{ ttmC_Id: Number(ttmC_Id) }];

            const payload = {
                asmaY_Id: Number(asmaY_Id),
                ttmc_idslist: albumNameArray
            };

            const response = await getGenerationCounts(payload);
            console.log('Generation Counts Response:', response);
            const promise: any = response.data || {};

            if (promise?.countArray?.length > 0) {
                const countData = promise.countArray[0];

                const totalperiods = countData.totalPeriods || 0;
                const totalalloted = countData.totalAllotted || 0;
                const totalpending = countData.notConfirmedPeriods || 0;
                const totalnotalloted = Number(totalperiods) - Number(totalalloted);

                setCounts({
                    totalperiods,
                    totalalloted,
                    totalnotalloted: totalnotalloted >= 0 ? totalnotalloted : 0,
                    totalpending,
                    fixingperiodcnt: promise.fixingperiodcnt || 0,
                    fixingperiodstaffcnt: promise.fixingperiodstaffcnt || 0,
                    consecutivecnt: promise.consecutivecnt || 0,
                    bifurcationcnt: promise.bifurcationcnt || 0
                });

                setValue('asmcL_Id', totalperiods.toString());
                setValue('asms_Id', totalalloted.toString());
                setValue('hrmE_Id', totalnotalloted.toString());
                setValue('notConfirmedPeriods', totalpending.toString());

                setWorkloadData(promise.workloadpdf || []);
                setClassWorkloadData(promise.workloadpdf1 || []);
                setPendingPeriods(promise.time_Table_new || []);
            } else if (promise?.countdetails?.length > 0) {
                // Fallback if data is in countdetails as mentioned by user
                const countData = promise.countdetails[0];
                const totalperiods = countData.totalPeriods || countData.totalpriodscount || 0;
                const totalalloted = countData.totalAllotted || countData.totalallotedcount || 0;
                const totalpending = countData.notConfirmedPeriods || countData.totalnotallotedcount || 0;
                const totalnotalloted = Number(totalperiods) - Number(totalalloted);

                setCounts({
                    totalperiods,
                    totalalloted,
                    totalnotalloted: totalnotalloted >= 0 ? totalnotalloted : 0,
                    totalpending,
                    fixingperiodcnt: promise.fixingperiodcnt || 0,
                    fixingperiodstaffcnt: promise.fixingperiodstaffcnt || 0,
                    consecutivecnt: promise.consecutivecnt || 0,
                    bifurcationcnt: promise.bifurcationcnt || 0
                });

                setValue('asmcL_Id', totalperiods.toString());
                setValue('asms_Id', totalalloted.toString());
                setValue('hrmE_Id', totalnotalloted.toString());
                setValue('notConfirmedPeriods', totalpending.toString());

                setWorkloadData(promise.workloadpdf || []);
                setClassWorkloadData(promise.workloadpdf1 || []);
                setPendingPeriods(promise.time_Table_new || []);
            }
        } catch (error: any) {
            console.error(error?.message);
            toast.error(error?.message || 'Failed to fetch counts');
        } finally {
            setIsCountLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, [asmaY_Id, ttmC_Id, categories]);

    const handleGenerate = async (data: TimeTableGenerationValues) => {
        if (!data.asmaY_Id || !data.ttmC_Id) {
            toast.error('Please Select Academic Year and Category');
            return;
        }

        setGenerating(true);
        try {
            const ttmc_idslist =
                data.ttmC_Id === 'all' ? categories.map((c) => ({ ttmC_Id: Number(c.ttmC_Id) })) : [{ ttmC_Id: Number(data.ttmC_Id) }];

            const payload = {
                asmaY_Id: Number(data.asmaY_Id),
                ttmc_idslist: ttmc_idslist
            };

            const response = await generateTT(payload);
            const isSuccess =
                response.success === true ||
                response.data === true ||
                response.data?.returnval === true ||
                (response as any) === true ||
                (response as any)?.returnval === true;
            if (isSuccess) {
                toast.success('Time Table Generated successfully');
                onFetch(data);
            } else {
                toast.error(response?.message || 'Data Not Saved!');
            }
        } catch (error) {
            console.error('Error generating TT:', error);
            toast.error('An error occurred while generating the timetable');
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = async () => {
        if (!asmaY_Id) {
            reset();
            return;
        }

        if (
            confirm(
                'Are you sure you want to Reset TimeTable? (Click OK to reset the timetable in the database, or Cancel to only clear the form fields)'
            )
        ) {
            setResetting(true);
            try {
                const payload = { asmaY_Id: Number(asmaY_Id) };
                const response = await resetTT(payload);
                const isResetSuccess =
                    response.success === true ||
                    response.data === true ||
                    response.data?.returnval === true ||
                    (response as any) === true ||
                    (response as any)?.returnval === true;
                if (isResetSuccess) {
                    toast.success('Time Table successfully Reset!');
                    reset();
                } else {
                    toast.error('Reset failed. Please contact administration');
                }
            } catch (error) {
                console.error('Error resetting TT:', error);
                toast.error('An error occurred during resetting the timetable');
            } finally {
                setResetting(false);
            }
        } else {
            reset();
        }
    };

    const handleExportExcel = () => {
        if (!pendingPeriods || pendingPeriods.length === 0) {
            toast.error('No pending periods data available to export');
            return;
        }

        const dataToExport = pendingPeriods.map((user, idx) => ({
            'SL. NO.': idx + 1,
            Class: user.asmcL_ClassName,
            Section: user.asmC_SectionName,
            Staff: user.staffName,
            Subject: user.ismS_SubjectName,
            Day: user.ttmD_DayName,
            Period: user.ttmP_PeriodName
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pending Periods');
        XLSX.writeFile(workbook, 'Workload_Pending_Periods.xlsx');
    };

    const FormSelect = ({ label, name, control, options, valueKey, labelKey, placeholder, error, isLoading, showAllOption, required }: any) => (
        <div className='space-y-2'>
            <Label className='font-medium text-sm'>
                {label}
                {required && <span className='text-red-500'> *</span>}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select key={field.value || 'empty'} value={field.value || undefined} onValueChange={(v) => field.onChange(v || '')}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value='loading' disabled>
                                    Loading...
                                </SelectItem>
                            ) : (
                                <>
                                    {showAllOption && <SelectItem value='all'>All</SelectItem>}
                                    {options?.map((o: any) => (
                                        <SelectItem key={o[valueKey]} value={o[valueKey].toString()}>
                                            {o[labelKey]}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <p className='text-red-500 text-xs italic'>{error}</p>}
        </div>
    );

    const FormInput = ({ label, name, control, error, readOnly, required }: any) => (
        <div className='space-y-2'>
            <Label className='font-medium text-sm'>
                {label}
                {required && <span className='text-red-500'> *</span>}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        readOnly={readOnly}
                        className={`w-full ${readOnly ? 'cursor-not-allowed bg-muted text-muted-foreground' : ''}`}
                    />
                )}
            />
            {error && <p className='text-red-500 text-xs italic'>{error}</p>}
        </div>
    );

    return (
        <CollapsibleSection title='Time Table Generation' defaultOpen>
            <div className='rounded-xl border bg-card text-card-foreground shadow-sm'>
                <div className='p-6'>
                    <form onSubmit={handleSubmit(handleGenerate)} className='space-y-8'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            <FormSelect
                                label='Academic Year'
                                required
                                name='asmaY_Id'
                                placeholder='Select Academic Year'
                                control={control}
                                options={years}
                                valueKey='asmaY_Id'
                                labelKey='asmaY_Year'
                                error={errors.asmaY_Id?.message}
                                isLoading={isLoading}
                            />

                            <FormSelect
                                label='Category Name'
                                required
                                name='ttmC_Id'
                                placeholder='Select Category'
                                control={control}
                                options={categories}
                                valueKey='ttmC_Id'
                                labelKey='ttmC_CategoryName'
                                error={errors.ttmC_Id?.message}
                                isLoading={isLoading}
                                showAllOption={true}
                            />

                            <FormInput
                                label='Total No Of Periods'
                                name='asmcL_Id'
                                control={control}
                                error={errors.asmcL_Id?.message}
                                readOnly={true}
                            />

                            <FormInput
                                label='Total No Of Periods Allotted'
                                name='asms_Id'
                                control={control}
                                error={errors.asms_Id?.message}
                                readOnly={true}
                            />

                            <FormInput
                                label='Total No Of Period Not Allotted'
                                name='hrmE_Id'
                                control={control}
                                error={errors.hrmE_Id?.message}
                                readOnly={true}
                            />

                            <div className='flex items-end gap-2'>
                                <div className='flex-1'>
                                    <FormInput
                                        label='Not Confirmed Periods'
                                        name='notConfirmedPeriods'
                                        control={control}
                                        error={errors.notConfirmedPeriods?.message}
                                        readOnly={true}
                                    />
                                </div>
                                {counts.totalpending > 0 && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant='outline' size='icon' className='mb-2' title='Show Pending Periods'>
                                                <Eye className='h-4 w-4' />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className='flex max-h-[80vh] max-w-4xl flex-col overflow-hidden'>
                                            <DialogHeader>
                                                <DialogTitle>Not Confirmed (Pending) Periods</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className='mt-4 flex-1'>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>SL. NO.</TableHead>
                                                            <TableHead>Class</TableHead>
                                                            <TableHead>Section</TableHead>
                                                            <TableHead>Staff</TableHead>
                                                            <TableHead>Subject</TableHead>
                                                            <TableHead>Day</TableHead>
                                                            <TableHead>Period</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {pendingPeriods.map((user, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell>{user.asmcL_ClassName}</TableCell>
                                                                <TableCell>{user.asmC_SectionName}</TableCell>
                                                                <TableCell>{user.staffName}</TableCell>
                                                                <TableCell>{user.ismS_SubjectName}</TableCell>
                                                                <TableCell>{user.ttmD_DayName}</TableCell>
                                                                <TableCell>{user.ttmP_PeriodName}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>

                        <div className='flex flex-wrap items-center justify-start gap-4 border-t pt-6'>
                            <Button type='submit' className='min-w-[140px]' disabled={generating}>
                                {generating ? (
                                    <RefreshCcw className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <RefreshCcw className='mr-2 h-4 w-4' />
                                )}
                                Generate TT
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                className='min-w-[140px] border-blue-200 hover:bg-blue-50'
                                onClick={handleExportExcel}
                                disabled={!asmaY_Id || !ttmC_Id}>
                                <FileSpreadsheet className='mr-2 h-4 w-4 text-blue-600' />
                                Check Workload
                            </Button>

                            <Button type='button' variant='outline' className='min-w-[140px]' onClick={handleReset} disabled={resetting}>
                                {resetting ? <RotateCcw className='mr-2 h-4 w-4 animate-spin' /> : <RotateCcw className='mr-2 h-4 w-4' />}
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </CollapsibleSection>
    );
}

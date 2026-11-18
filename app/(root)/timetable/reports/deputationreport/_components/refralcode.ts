// 'use client';

// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import { Label } from '@/components/ui/label';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { cn } from '@/lib/utils';
// import { deputationReportSchema } from '@/schemas/timetable/reports';
// import { useClassDetails, useDeputationAcademicYear, useDeputationReportDetails, useDeputationReportLoadData, useSectionDropDown } from '@/hooks/timetable/reports';
// import { MultiSelect } from '@/components/ui/multi-select';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { format } from 'date-fns';
// import { CalendarIcon, Download, Printer, Search, X } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import { Controller, useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import type { z } from 'zod';
// import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

// import * as XLSX from 'xlsx';
// import CountReportTable from './count-report-table';
// import DetailsReportTable from './details-report-table';

// type FormValues = z.infer<typeof deputationReportSchema.search>;

// export default function DeputationReportForm() {
//     const { data: academicYearData, isLoading: academicYearLoading } = useDeputationAcademicYear();
//     const { data: classData, isLoading: classLoading } = useClassDetails();
//     const { data: sectionData, isLoading: sectionLoading } = useSectionDropDown();
//     const { data: loadData, isLoading: loadDataLoading } = useDeputationReportLoadData();
//     const { mutateAsync: getReport, isPending: loadingReport } = useDeputationReportDetails();

//     const academicList = Array.isArray(academicYearData) ? academicYearData : (academicYearData as any)?.data || [];
//     const classList = Array.isArray(classData) ? classData : (classData as any)?.data || [];
//     const sectionList = Array.isArray(sectionData) ? sectionData : (sectionData as any)?.data || [];
//     const staffList = (loadData as any)?.data?.stafflist || (loadData as any)?.stafflist || [];

//     const [reportData, setReportData] = useState<any[]>([]);
//     const [reportType, setReportType] = useState<'D' | 'C' | null>(null);
//     const componentRef = useRef<HTMLDivElement>(null);

//     const form = useForm<FormValues>({
//         resolver: zodResolver(deputationReportSchema.search),
//         defaultValues: {
//             flag: 'D',
//             date: new Date(),
//             Classids: [],
//             sectionids: [],
//             staffids: []
//         }
//     });

//     const {
//         control,
//         handleSubmit,
//         formState: { errors, isSubmitting },
//         setValue,
//         reset,
//         getValues
//     } = form;

//     // Initial value for asmaY_Id when academicList loads
//     useEffect(() => {
//         if (academicList && academicList.length > 0 && !getValues('asmaY_Id')) {
//             const firstItem = academicList[0];
//             const initialId = firstItem?.ttfG_Id || firstItem?.asmaY_Id;
//             if (initialId) {
//                 setValue('asmaY_Id', initialId);
//             }
//         }
//     }, [academicList, setValue, getValues]);

//     const handleFormSubmit = async (data: FormValues) => {
//         try {
//             const payload = {
//                 ASMAY_Id: data.asmaY_Id,
//                 date: format(data.date, 'yyyy-MM-dd'),
//                 flag: data.flag,
//                 Classids: data.Classids,
//                 sectionids: data.sectionids,
//                 staffids: data.staffids
//             };

//             const response = await getReport(payload);
//             const dataList = Array.isArray(response) ? response : (response?.data || []);

//             if (dataList && dataList.length > 0) {
//                 setReportData(dataList);
//                 setReportType(data.flag as 'D' | 'C');
//                 toast.success('Report generated successfully');
//             } else {
//                 setReportData([]);
//                 toast.info('No records found for the selected criteria');
//             }
//         } catch (error: any) {
//             toast.error(error.message || "Failed to generate report");
//         }
//     };

//     const handleCancel = () => {
//         reset({
//             flag: 'D',
//             asmaY_Id: academicList && academicList.length > 0 ? (academicList[0].ttfG_Id || academicList[0].asmaY_Id) : undefined,
//             date: new Date(),
//             Classids: [],
//             sectionids: [],
//             staffids: []
//         });
//         setReportData([]);
//         setReportType(null);
//     };

//     const handleExport = () => {
//         if (reportData.length === 0) return;
//         const worksheet = XLSX.utils.json_to_sheet(reportData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Deputation Report');
//         XLSX.writeFile(workbook, `Deputation_Report_${reportType === 'D' ? 'Details' : 'Count'}.xlsx`);
//     };

//     const handlePrint = () => {
//         if (!componentRef.current) return;
//         const printWindow = window.open('', '', 'width=1200,height=800');
//         if (!printWindow) return;

//         const content = componentRef.current.innerHTML;

//         printWindow.document.write(`
//             <html>
//                 <head>
//                     <title>Deputation Report</title>
//                     <style>
//                         body { font-family: Arial, sans-serif; padding: 20px; }
//                         table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #7e22ce; }
//                         th, td { border: 1px solid #9ca3af; padding: 8px; text-align: center; font-size: 12px; }
//                         th { background-color: #7e22ce; color: white; font-weight: bold; }
//                         h3 { text-align: center; color: #15803d; margin-bottom: 20px; font-size: 20px; }
//                         .no-print { display: none; }
//                         button { display: none !important; }
//                         input { display: none !important; }
//                     </style>
//                 </head>
//                 <body>
//                     <h3>Deputation ${reportType === 'D' ? 'Details' : 'Count'} Report</h3>
//                     ${content}
//                 </body>
//             </html>
//         `);

//         printWindow.document.close();
//         printWindow.focus();
//         setTimeout(() => {
//             printWindow.print();
//             printWindow.close();
//         }, 500);
//     };

//     return (
//         <div className='space-y-6'>
//             <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

//                     {/* Academic Year */}
//                     <div className="space-y-2">
//                         <Label>
//                             Academic Year <span className="text-red-500">*</span>
//                         </Label>
//                         <Controller
//                             control={control}
//                             name="asmaY_Id"
//                             render={({ field }) => (
//                                 <Select
//                                     onValueChange={(val) => field.onChange(Number(val))}
//                                     value={field.value ? field.value.toString() : ''}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select Year" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {academicList?.map((item: any) => {

//                                             // skip invalid ids
//                                             const id = item.ttfG_Id ?? item.asmaY_Id;

//                                             if (!id) return null; // prevent crash

//                                             return (
//                                                 <SelectItem key={id} value={id?.toString() || ''}>
//                                                     {item.asmaY_Year}
//                                                 </SelectItem>
//                                             );
//                                         })}
//                                     </SelectContent>
//                                 </Select>
//                             )}
//                         />
//                     </div>

//                     {/* Date */}
//                     <div className="space-y-2">
//                         <Label>
//                             Date <span className="text-red-500">*</span>
//                         </Label>
//                         <Controller
//                             control={control}
//                             name="date"
//                             render={({ field }) => (
//                                 <Popover>
//                                     <PopoverTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             className={cn(
//                                                 'pl-3 text-left font-normal w-full',
//                                                 !field.value && 'text-muted-foreground'
//                                             )}
//                                         >
//                                             {field.value ? format(field.value, 'PPP') : 'Pick a date'}
//                                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                         </Button>
//                                     </PopoverTrigger>
//                                     <PopoverContent className="w-auto p-0">
//                                         <Calendar
//                                             mode="single"
//                                             selected={field.value}
//                                             onSelect={field.onChange}
//                                             disabled={(date) => date > new Date()}
//                                             initialFocus
//                                         />
//                                     </PopoverContent>
//                                 </Popover>
//                             )}
//                         />
//                     </div>

//                     {/* Classes */}
//                     <div className="space-y-2">
//                         <Label>Classes</Label>
//                         <Controller
//                             control={control}
//                             name="Classids"
//                             render={({ field }) => (
//                                 <MultiSelect
//                                     options={classList.filter((cls: any) => cls.asmcL_Id != null).map((cls: any) => ({
//                                         label: cls.asmcL_ClassName,
//                                         value: cls.asmcL_Id.toString()
//                                     }))}
//                                     onValueChange={(vals) => field.onChange(vals.map(Number))}
//                                     value={field.value?.map(String) || []}
//                                     placeholder="Select Classes"
//                                 />
//                             )}
//                         />
//                     </div>

//                     {/* Sections */}
//                     <div className="space-y-2">
//                         <Label>Sections</Label>
//                         <Controller
//                             control={control}
//                             name="sectionids"
//                             render={({ field }) => (
//                                 <MultiSelect
//                                     options={sectionList.filter((sec: any) => sec.asmc_Id != null).map((sec: any) => ({
//                                         label: sec.asmC_SectionName,
//                                         value: sec.asmc_Id.toString()
//                                     }))}
//                                     onValueChange={(vals) => field.onChange(vals.map(Number))}
//                                     value={field.value?.map(String)}
//                                     placeholder="Select Sections"
//                                 />
//                             )}
//                         />
//                     </div>

//                     {/* Staff */}
//                     <div className="space-y-2">
//                         <Label>Staff</Label>
//                         <Controller
//                             control={control}
//                             name="staffids"
//                             render={({ field }) => (
//                                 <MultiSelect
//                                     options={staffList.filter((stf: any) => stf.hrmE_Id != null).map((stf: any) => ({
//                                         label: stf.staffName,
//                                         value: stf.hrmE_Id.toString()
//                                     }))}

//                                     onValueChange={(vals) => field.onChange(vals.map(Number))}
//                                     value={field.value?.map(String) || []}
//                                     placeholder="Select Staff"
//                                 />
//                             )}
//                         />
//                     </div>
//                 </div>

//                 <div className='flex justify-center mt-4'>
//                     <Controller
//                         control={control}
//                         name='flag'
//                         render={({ field }) => (
//                             <RadioGroup
//                                 onValueChange={field.onChange}
//                                 value={field.value}
//                                 className='flex flex-row space-x-6 rounded-md border bg-muted/20 p-4'>
//                                 <div className='flex items-center space-x-3 space-y-0'>
//                                     <RadioGroupItem value='D' id='r1' />
//                                     <Label htmlFor='r1' className='cursor-pointer font-normal'>DETAILS</Label>
//                                 </div>
//                                 <div className='flex items-center space-x-3 space-y-0'>
//                                     <RadioGroupItem value='C' id='r2' />
//                                     <Label htmlFor='r2' className='cursor-pointer font-normal'>COUNT</Label>
//                                 </div>
//                             </RadioGroup>
//                         )}
//                     />
//                 </div>

//                 <div className='flex justify-center gap-4'>
//                     <Button type='submit' disabled={isSubmitting} className='bg-orange-600 hover:bg-orange-600'>
//                         <Search className='mr-2 h-4 w-4' /> Report
//                     </Button>
//                     <Button type='button' variant='outline' onClick={handleCancel}>
//                         <X className='mr-2 h-4 w-4' /> Cancel
//                     </Button>
//                 </div>
//             </form >

//             {
//                 reportData.length > 0 && (
//                     <CollapsibleSection title='Report Grid' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
//                         <div className='no-print flex items-center justify-between bg-gray-50 px-4 py-2 text-sm'>
//                             <span className='font-medium text-gray-700'>Total Records: {reportData.length}</span>
//                             <div className='flex items-center gap-3'>
//                                 <Button onClick={handlePrint} size='sm' className='bg-purple-600 hover:bg-purple-700'>
//                                     <Printer className='mr-2 h-4 w-4' /> Print
//                                 </Button>
//                                 <Button
//                                     onClick={handleExport}
//                                     size='sm'
//                                     variant='outline'
//                                     className='gap-2 border-green-600 text-green-700 hover:bg-green-50'>
//                                     <Download className='h-4 w-4' /> Export Excel
//                                 </Button>
//                             </div>
//                         </div>

//                         <div className='mt-6 rounded-md border bg-white p-4' ref={componentRef}>
//                             {reportType === 'D' && <DetailsReportTable data={reportData} />}
//                             {reportType === 'C' && <CountReportTable data={reportData} />}
//                         </div>
//                     </CollapsibleSection>
//                 )
//             }
//         </div >
//     );
// }

'use client';

import { format } from 'date-fns';
import { FileText, Loader2, Printer, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useBBKVCustomReportInitialDetails,
    useBBKVCustomReportStudentDetails,
    useBBKVCustomReportStudents,
    useBBKVCustomReportTCDetails
} from '@/hooks/admission/oldsharehost/reports/useBBKVCustomReport';

export default function BBKVCustomReportPage() {
    const { data: initialData, isLoading: isInitialLoading } = useBBKVCustomReportInitialDetails();

    const studentsMutation = useBBKVCustomReportStudents();
    const studentDetailsMutation = useBBKVCustomReportStudentDetails();
    const tcDetailsMutation = useBBKVCustomReportTCDetails();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            admname: 'regno',
            asmaY_Id: '',
            tctempper: 'per',
            amsT_Id: '',
            asmcL_Id: ''
        }
    });

    const formValues = watch();

    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Watch for changes that should trigger student search
    useEffect(() => {
        if (formValues.asmaY_Id) {
            handleSearchStudents();
        }
    }, [formValues.asmaY_Id, formValues.admname, formValues.tctempper]);

    const handleSearchStudents = async () => {
        if (!formValues.asmaY_Id) return;

        setStudentDropdown([]);
        setValue('amsT_Id', '');
        setReportData(null);

        const payload = {
            admnoorname: formValues.admname,
            ASMAY_Id: formValues.asmaY_Id,
            tctemporper: formValues.tctempper
        };

        try {
            const res = await studentsMutation.mutateAsync(payload);
            const students = res?.data?.studentlist || (Array.isArray(res?.data) ? res.data : []);
            if (students.length > 0) {
                setStudentDropdown(students);
            } else {
                toast.info('Student is not available for this selection');
            }
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    const handleStudentChange = async (val: string) => {
        setValue('amsT_Id', val);
        setReportData(null);

        if (!val || !formValues.asmaY_Id) return;

        const payload = {
            AMST_Id: val,
            ASMAY_Id: formValues.asmaY_Id
        };

        try {
            await studentDetailsMutation.mutateAsync(payload);
            // The angular code just sets some labels that are not used in the UI outside the report
        } catch (error) {
            // Silently handle
        }
    };

    const SwitchFuction = (sno: string) => {
        switch (sno) {
            case 'I':
                return 'FIRST';
            case 'II':
                return 'SECOND';
            case 'III':
                return 'THIRD';
            case 'IV':
                return 'FOURTH';
            case 'V':
                return 'FIFTH';
            case 'VI':
                return 'SIXTH';
            case 'VII':
                return 'SEVENTH';
            case 'VIII':
                return 'EIGHTH';
            case 'IX':
                return 'NINTH';
            case 'X':
                return 'TENTH';
            default:
                return sno;
        }
    };

    const onSubmit = async (data: any) => {
        if (!data.amsT_Id) {
            toast.error('Please select a student');
            return;
        }

        setIsGenerating(true);
        setReportData(null);

        const payload = {
            ASMAY_Id: data.asmaY_Id,
            AMST_Id: data.amsT_Id,
            tctemporper: data.tctempper
        };

        try {
            const res = await tcDetailsMutation.mutateAsync(payload);

            if (res?.data?.studentTCList?.length > 0) {
                const tcList = res.data.studentTCList[0];
                const tcDetails = res.data.studenttcdetails?.[0] || {};
                const studentDetails = res.data.getadm_m_student_details?.[0] || {};
                const masterCompany = res.data.masterCompany?.[0] || {};
                const subjectsDetails = res.data.getsubjectsdetails || [];

                // Calculate promoted class if selected
                let promotedclass = '';
                let promotedclassinfig = '';
                if (data.asmcL_Id && initialData?.data?.accclass) {
                    const selectedClass = initialData.data.accclass.find((c: any) => c.asmcL_Id.toString() === data.asmcL_Id);
                    if (selectedClass) {
                        promotedclass = selectedClass.asmcL_ClassName;
                        promotedclassinfig = SwitchFuction(promotedclass);
                    }
                }

                setReportData({
                    tcno: tcList.astc_tcno || tcList.astC_TCNO,
                    stsno: studentDetails.amsT_BPLCardNo,
                    admno: tcList.amst_registrationno || tcList.amsT_RegistrationNo,
                    studentname: tcList.studentname,
                    mothername: tcList.amst_mothername || tcList.amsT_MotherName,
                    fathername: tcList.amst_fathername || tcList.amsT_FatherName,
                    dob: tcList.amst_dob || tcList.amsT_DOB,
                    dobwords: tcList.amst_dob_words || tcList.amsT_DOB_Words,
                    nationality: tcList.nationality,
                    castecategory: tcList.caste || tcList.castecategory,
                    doa: tcList.amst_date || tcList.amsT_Date,
                    laststudied: tcList.last_class_studied || tcList.last_Class_Studied,
                    laststudiedinwords: SwitchFuction(tcList.last_class_studied || tcList.last_Class_Studied),
                    result: tcDetails.astc_result || tcDetails.astC_Result,
                    subjects: subjectsDetails.map((s: any) => s?.isms_subjectname || s?.ISMS_SUBJECTNAME).filter(Boolean),
                    promotionflag: tcList.promotionflag || tcList.promotedflag,
                    promotedclass,
                    promotedclassinfig,
                    totalworkingdays: tcList.noof_schooldays || tcList.totalworkingdays,
                    noworkingdays: tcList.noof_daysattended || tcList.noworkingdays,
                    nccdetails: tcDetails.astc_nccdetails || tcDetails.astC_NCCDetails,
                    gamesplayed: tcDetails.astc_extraactivities || tcDetails.astC_ExtraActivities,
                    conduct: tcList.astc_conduct || tcList.astC_Conduct,
                    applicationdate: tcList.astc_tcapplicationdate || tcDetails.astC_TCApplicationDate,
                    dateofissue: tcList.astc_tcissuedate || tcList.astC_TCIssueDate,
                    feeconcession: tcList.fee_concesion || tcList.feeconcession,
                    logo: tcList.logo,
                    todaydate: new Date()
                });
            } else {
                toast.info('Select any Student / No TC Details Found');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        if (!printRef.current) return;

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>TC Print</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 10px;
                            }
                            td {
                                padding: 5px;
                                vertical-align: top;
                            }
                            .border-bottom-dotted {
                                border-bottom: 1px dotted #000;
                            }
                            .border-bottom {
                                border-bottom: 1px solid #000;
                            }
                            .text-center {
                                text-align: center;
                            }
                            .text-right {
                                text-align: right;
                            }
                            .bold {
                                font-weight: bold;
                            }
                            .logo-img {
                                max-width: 100%;
                                height: auto;
                            }
                            @media print {
                                @page { size: auto; margin: 5mm; }
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body onload="setTimeout(function() { window.print(); }, 500);">
                        ${printContent}
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
            <CollapsibleSection
                title='TC Custom Report'
                description='Generate TC custom report'
                defaultOpen={true}
                variant='outline'
                className='shadow-md'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 rounded-lg bg-white p-6'>
                    <div className='mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-6'>
                            <div className='flex justify-center rounded-lg bg-gray-100 p-4'>
                                <Controller
                                    name='admname'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='regno' id='regno' />
                                                <Label htmlFor='regno' className='cursor-pointer'>
                                                    Admno
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='stdname' id='stdname' />
                                                <Label htmlFor='stdname' className='cursor-pointer'>
                                                    Name
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    rules={{ required: 'Academic Year is required' }}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialData?.data?.accyear?.map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <span className='text-red-500 text-xs'>{errors.asmaY_Id.message as string}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label className='font-bold text-sm'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='amsT_Id'
                                    control={control}
                                    rules={{ required: 'Student is required' }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(val) => handleStudentChange(val)}
                                            disabled={studentDropdown.length === 0}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Student' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studentDropdown.map((student: any) => (
                                                    <SelectItem key={student.amsT_Id} value={student.amsT_Id.toString()}>
                                                        {student.studentname}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.amsT_Id && <span className='text-red-500 text-xs'>{errors.amsT_Id.message as string}</span>}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-6'>
                            <div className='flex justify-center rounded-lg bg-gray-100 p-4'>
                                <Controller
                                    name='tctempper'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='temp' id='temp' />
                                                <Label htmlFor='temp' className='cursor-pointer'>
                                                    Temp Student
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='per' id='per' />
                                                <Label htmlFor='per' className='cursor-pointer'>
                                                    Permanent Student
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label className='font-bold text-sm'>Promoted Class:</Label>
                                <Controller
                                    name='asmcL_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange} disabled={isInitialLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialData?.data?.accclass?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-4'>
                        <Button
                            type='submit'
                            disabled={isGenerating}
                            className='min-w-[140px] bg-indigo-600 font-bold text-white shadow-lg hover:bg-indigo-700'>
                            {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            Report
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={() => {
                                window.location.reload();
                            }}
                            className='min-w-[140px] font-bold'>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        {reportData && (
                            <Button type='button' variant='outline' onClick={handlePrint} className='min-w-[140px] font-bold'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        )}
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <div className='mx-auto max-w-5xl overflow-x-auto rounded-lg bg-white p-8 shadow-md'>
                    <div ref={printRef} className='mx-auto min-w-[800px] max-w-[900px] bg-white p-4 font-serif text-black sm:p-6'>
                        {/* Header */}
                        <div className='mb-2 text-center'>
                            {reportData?.logo ? (
                                <img src={reportData.logo} alt='Institution Logo' className='mx-auto max-h-[70px]' />
                            ) : (
                                <img src='/images/BBKVTCLOGO.png' alt='Logo' className='mx-auto max-h-[70px]' />
                            )}
                        </div>

                        <div className='mb-4 text-center'>
                            <h2 className='font-bold text-xl uppercase'>Transfer Certificate</h2>
                        </div>

                        {/* Top Info Section */}
                        <div className='mb-1 text-right font-bold text-xs'>
                            <span className='mr-2'>DATE :</span>
                            <span>{reportData.todaydate ? format(new Date(reportData.todaydate), 'dd/MM/yyyy') : ''}</span>
                        </div>
                        <div className='mb-2 flex justify-between font-bold text-xs'>
                            <div>
                                Affiliation No: <span className='ml-2 font-normal'>{reportData.affiliationNo || '830892'}</span>
                            </div>
                            <div>
                                School Code: <span className='ml-2 font-normal'>{reportData.schoolCode || '41692'}</span>
                            </div>
                            <div>
                                DISE Code: <span className='ml-2 font-normal'>{reportData.diseCode || '29120910805'}</span>
                            </div>
                        </div>
                        <div className='mb-4 flex justify-between font-bold text-xs'>
                            <div className='flex items-end'>
                                <span className='mr-2'>TC.No:</span>
                                <span className='inline-block min-w-[100px] border-black border-b pb-0.5 text-center font-normal'>
                                    {reportData.tcno}
                                </span>
                            </div>
                            <div className='flex items-end'>
                                <span className='mr-2'>STS No.:</span>
                                <span className='inline-block min-w-[150px] border-black border-b pb-0.5 text-center font-normal'>
                                    {reportData.stsno}
                                </span>
                            </div>
                            <div className='flex items-end'>
                                <span className='mr-2'>Admission NO:</span>
                                <span className='inline-block min-w-[100px] border-black border-b pb-0.5 text-center font-normal'>
                                    {reportData.admno}
                                </span>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className='space-y-[7px] text-sm'>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>1.</div>
                                <div className='mr-2 whitespace-nowrap'>Name of Pupil</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>{reportData.studentname}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>2.</div>
                                <div className='mr-2 whitespace-nowrap'>Mother's Name :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>{reportData.mothername}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>3.</div>
                                <div className='mr-2 whitespace-nowrap'>Name of Father's / Guardian's Name :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>{reportData.fathername}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>4.</div>
                                <div className='mr-2 whitespace-nowrap'>
                                    Date of Birth(In christian)according to Admission & Withdrawal Register In Figure :
                                </div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                    {reportData.dob ? format(new Date(reportData.dob), 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                            <div className='flex items-end pl-8 leading-none'>
                                <div className='mr-2 whitespace-nowrap'>in words :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center font-bold uppercase'>
                                    {reportData.dobwords}
                                </div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>5.</div>
                                <div className='mr-2 whitespace-nowrap'>Nationality :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.nationality}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>6.</div>
                                <div className='mr-2 whitespace-nowrap'>Whether the Candidate belongs to SC/ST/OBC/GM :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center uppercase'>
                                    {reportData.castecategory}
                                </div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>7.</div>
                                <div className='mr-2 whitespace-nowrap'>Date of First admission in the school with class :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>
                                    {reportData.doa ? format(new Date(reportData.doa), 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>8.</div>
                                <div className='mr-2 whitespace-nowrap'>Class in which the pupil last studied (in figures) :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.laststudied}</div>
                                <div className='mx-2 whitespace-nowrap'>in words :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.laststudiedinwords}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>9.</div>
                                <div className='mr-2 whitespace-nowrap'>School/Board Annual Examination last taken with result :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.result}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>10.</div>
                                <div className='mr-2 whitespace-nowrap'>Whether failed (Give Reason) :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>No</div>
                            </div>
                            <div className='mb-1 flex'>
                                <div className='w-8'>11.</div>
                                <div className='mr-2 whitespace-nowrap'>Subjects Studied :</div>
                                <div className='flex-grow'>
                                    <div className='mb-2 flex items-end leading-none'>
                                        <div className='mr-2'>1.</div>
                                        <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                            {reportData.subjects?.[0] || ''}
                                        </div>
                                        <div className='mx-2'>2.</div>
                                        <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                            {reportData.subjects?.[1] || ''}
                                        </div>
                                        <div className='mx-2'>3.</div>
                                        <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                            {reportData.subjects?.[2] || ''}
                                        </div>
                                    </div>
                                    <div className='flex items-end leading-none'>
                                        <div className='mr-2'>4.</div>
                                        <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                            {reportData.subjects?.[3] || ''}
                                        </div>
                                        <div className='mx-2'>5.</div>
                                        <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                            {reportData.subjects?.[4] || ''}
                                        </div>
                                        <div className='mx-2'>6.</div>
                                        <div className='flex-grow border-black border-b pb-0.5 text-center font-bold'>
                                            {reportData.subjects?.[5] || ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>12.</div>
                                <div className='mr-2 whitespace-nowrap'>Whether qualified for promotion to the higher class :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>
                                    {reportData.promotedclass
                                        ? 'Yes'
                                        : reportData.promotionflag === 'Y' ||
                                            reportData.promotionflag === 'YES' ||
                                            reportData.promotionflag === true
                                          ? 'Yes'
                                          : 'No'}
                                </div>
                            </div>
                            <div className='flex items-end pl-8 leading-none'>
                                <div className='mr-2 whitespace-nowrap'>if so, to which class (in fig.)</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.promotedclass}</div>
                                <div className='mx-2 whitespace-nowrap'>(in words)</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.promotedclassinfig}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>13.</div>
                                <div className='mr-2 whitespace-nowrap'>Month upto which the pupil has paid school dues :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>March</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>14.</div>
                                <div className='mr-2 whitespace-nowrap'>Total No.of working days in the academic session :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.totalworkingdays}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>15.</div>
                                <div className='mr-2 whitespace-nowrap'>Total No.of working days pupil present in the school :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.noworkingdays}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>16.</div>
                                <div className='mr-2 whitespace-nowrap'>whether NCC cadet/boy scout/girl guide(details may be given) :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.nccdetails}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>17.</div>
                                <div className='mr-2 whitespace-nowrap'>
                                    Games played or extra-curricular activities in which the pupils usually took part :
                                </div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'></div>
                            </div>
                            <div className='flex items-end pl-8 leading-none'>
                                <div className='mr-2 whitespace-nowrap'>(Mention achievement their in) :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.gamesplayed}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>18.</div>
                                <div className='mr-2 whitespace-nowrap'>General conduct :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.conduct}</div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>19.</div>
                                <div className='mr-2 whitespace-nowrap'>Date of application for certificate :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>
                                    {reportData.applicationdate ? format(new Date(reportData.applicationdate), 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>20.</div>
                                <div className='mr-2 whitespace-nowrap'>Date of issue for certificate :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>
                                    {reportData.dateofissue ? format(new Date(reportData.dateofissue), 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                            <div className='flex items-end leading-none'>
                                <div className='w-8'>21.</div>
                                <div className='mr-2 whitespace-nowrap'>Whether availed any govt aid :</div>
                                <div className='flex-grow border-black border-b pb-0.5 text-center'>{reportData.feeconcession}</div>
                            </div>
                        </div>

                        {/* Footer Signatures */}
                        <div className='mt-8 flex justify-between px-8 text-sm'>
                            <div className='text-center'>
                                <div className='mb-1'>Checked By</div>
                                <div>(With full name and designation)</div>
                            </div>
                            <div className='text-center'>
                                <div className='mb-4'>Signature of the principal with date</div>
                                <div>school seal</div>
                            </div>
                        </div>

                        <div className='mt-4 text-justify text-[9px] text-gray-700 leading-tight'>
                            Transfer Certificate should be issued only under the signatures ofthe Regular Principal/Vice Principal and
                            itshould be counter-signed by an officer not below the rank of District Inspector ofSchools/Deputy Director of
                            Education / Education Officer of the Education Deptt. of the State/Union Territory concerned. Incase ofa student
                            migratingfrom the CBSE affiliated school to another CBSE affiliated school the transfer certificate ofa previous
                            school Ofsuch a student may be countersigned by the Regional oncer ofthe Board or The Asst. Commissioner ofthe
                            WS or The Deputy Director, Navodaya Vidyalaya Samiti in India or an officer of the Board at the Head Quartersand
                            by the FirstSecretary/Attache/CulturaIAttache oran equivalentofficerofthe Embassy/ High Commission oflndia in
                            the concerned country in respectof students studying in an affiliated school of the CBSE situated outside the
                            country and the student shall not be admitted to a school without such a counter signature. Assistant
                            Commissioners, KVS have also been authorised to countersign thl Transfer Certificates issued by the schools run
                            by Directorated General, Border Security force.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

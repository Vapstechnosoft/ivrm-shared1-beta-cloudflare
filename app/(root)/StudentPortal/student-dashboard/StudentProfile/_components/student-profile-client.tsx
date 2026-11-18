'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentViewDetails } from '@/hooks/staff-portal/useFeeOnlinePayment';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Banknote,
    BarChart3,
    BookOpen,
    Check,
    GraduationCap,
    Home,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type {
    AttendanceMonthRecord,
    AttendanceRecord,
    ExamRecord,
    FeeHeadRecord,
    FeeSummaryRecord,
    StudentAcademicYearDetail,
    StudentDetail,
    StudentJoinedDetail,
    StudentSubjectDetail,
    StudentViewDetailsResponse
} from '../types';

export default function StudentProfileClient() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('academic');

    // Fetch API data using the requested hook
    const { data: apiData, isLoading, refetch } = useStudentViewDetails();
    console.log('student view details data', apiData);

    // Use live API response directly
    const rawData: StudentViewDetailsResponse = useMemo(() => {
        if (!apiData) return {};
        // Check if data is nested inside data field or directly returned
        if (apiData.data && typeof apiData.data === 'object') {
            return apiData.data as StudentViewDetailsResponse;
        }
        return apiData as StudentViewDetailsResponse;
    }, [apiData]);

    // Parse Primary Student Information
    const studentJoined: StudentJoinedDetail | undefined = rawData.viewstudentjoineddetails?.[0];
    const studentDetail: StudentDetail | undefined = rawData.viewstudentdetails?.[0];

    const studentName =
        studentDetail?.amsT_FirstName ||
        studentJoined?.studentname ||
        [studentDetail?.amsT_FirstName, studentDetail?.amsT_MiddleName, studentDetail?.amsT_LastName].filter(Boolean).join(' ') ||
        'Student';

    const admNo = studentDetail?.amsT_AdmNo || studentJoined?.amsT_AdmNo || 'N/A';
    const regNo = studentDetail?.amsT_RegistrationNo || studentJoined?.amsT_RegistrationNo || 'N/A';
    const doa = studentDetail?.amsT_Date || studentJoined?.amsT_Date;
    const dob = studentDetail?.amsT_DOB || studentJoined?.amsT_DOB;
    const dobWords = studentDetail?.amsT_DOB_Words;
    const bloodGroup = studentDetail?.amsT_BloodGroup || studentJoined?.amsT_BloodGroup || 'N/A';
    const gender = studentDetail?.amsT_Sex || studentJoined?.amsT_Sex || 'N/A';
    const mobileNo = studentDetail?.amsT_MobileNo || studentJoined?.amsT_MobileNo || 'N/A';
    const emailId = studentDetail?.amsT_emailId || studentJoined?.amsT_emailId || 'N/A';
    const tpin = studentDetail?.amsT_Tpin || 'N/A';
    const age = studentDetail?.pasR_Age;
    const statusFlag = (studentJoined?.amsT_SOL || studentDetail?.amsT_SOL || 'S').toUpperCase();
    const photoUrl = studentJoined?.amsT_Photoname  || null;

    // Parse Academic Details
    const academicHistory: StudentAcademicYearDetail[] = useMemo(() => {
        if (rawData.viewstudentacademicyeardetailsnew && rawData.viewstudentacademicyeardetailsnew.length > 0) {
            return rawData.viewstudentacademicyeardetailsnew;
        }
        if (rawData.viewstudentacademicyeardetails && rawData.viewstudentacademicyeardetails.length > 0) {
            return rawData.viewstudentacademicyeardetails;
        }
        return [];
    }, [rawData]);

    const currentAcademic = academicHistory.find((a) => a.status_Flag?.toLowerCase().includes('current')) || academicHistory[0];

    // Format Date Helper
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr || dateStr.startsWith('0001')) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // Format Currency
    const formatCurrency = (amt?: number | null) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amt ?? 0);
    };

    // Parse Attendance Details (Handles array-of-tuples, 1D-array, or array-of-objects)
    const overallAttendance: AttendanceRecord[] = useMemo(() => {
        const raw = rawData.viewstudentattendancetails;
        if (!raw) return [];

        // Check if raw is a 1D flat array [ "2026-2027", "I", "A", 14, 263, 587, 232, 34560, 94, 94, 100, "Current Year" ]
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
            return [
                {
                    asmaY_Year: String(raw[0]),
                    asmcL_ClassName: String(raw[1] ?? ''),
                    asmC_SectionName: String(raw[2] ?? ''),
                    workingDays: Number(raw[8] ?? 0),
                    presentDays: Number(raw[9] ?? 0),
                    percentage: Number(raw[10] ?? 0),
                    statusFlag: String(raw[11] ?? '')
                }
            ];
        }

        // Array of arrays
        if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
            return raw.map((item: any[]) => ({
                asmaY_Year: String(item[0] ?? ''),
                asmcL_ClassName: String(item[1] ?? ''),
                asmC_SectionName: String(item[2] ?? ''),
                workingDays: Number(item[8] ?? 0),
                presentDays: Number(item[9] ?? 0),
                percentage: Number(item[10] ?? 0),
                statusFlag: String(item[11] ?? '')
            }));
        }

        // Array of objects
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
            return raw.map((item: any) => ({
                asmaY_Year: item.ASMAY_Year || item.asmaY_Year || '',
                asmcL_ClassName: item.ASMCL_ClassName || item.asmcL_ClassName || '',
                asmC_SectionName: item.ASMC_SectionName || item.asmC_SectionName || '',
                workingDays: Number(item.WORKINGDAYS ?? item.workingDays ?? 0),
                presentDays: Number(item.PRESENTDAYS ?? item.presentDays ?? 0),
                percentage: Number(item.PERCENTAGE ?? item.percentage ?? 0),
                statusFlag: item.status_Flag || item.statusFlag || ''
            }));
        }

        return [];
    }, [rawData]);

    // Parse Month-wise Attendance Details
    const monthAttendance: AttendanceMonthRecord[] = useMemo(() => {
        const raw = rawData.viewstudentattendanceMonthdetails;
        if (!raw) return [];

        // 1D flat tuple: [ 34560, "June     ", "2026", 6, 2026, 21, 21 ]
        if (Array.isArray(raw) && raw.length > 0 && (typeof raw[0] === 'number' || typeof raw[0] === 'string')) {
            const working = Number(raw[5] ?? 0);
            const present = Number(raw[6] ?? 0);
            return [
                {
                    months: String(raw[1] ?? '').trim(),
                    years: String(raw[2] ?? '').trim(),
                    workingCount: working,
                    presentCount: present,
                    percentage: working > 0 ? Math.round((present / working) * 100) : 0
                }
            ];
        }

        // Array of tuples
        if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
            return raw.map((item: any[]) => {
                const working = Number(item[5] ?? 0);
                const present = Number(item[6] ?? 0);
                return {
                    months: String(item[1] ?? '').trim(),
                    years: String(item[2] ?? '').trim(),
                    workingCount: working,
                    presentCount: present,
                    percentage: working > 0 ? Math.round((present / working) * 100) : 0
                };
            });
        }

        // Array of objects
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
            return raw.map((item: any) => {
                const working = Number(item.WorkingCount ?? item.workingCount ?? 0);
                const present = Number(item.PresentCount ?? item.presentCount ?? 0);
                return {
                    months: String(item.Months || item.months || '').trim(),
                    years: String(item.Years || item.years || '').trim(),
                    workingCount: working,
                    presentCount: present,
                    percentage: working > 0 ? Math.round((present / working) * 100) : 0
                };
            });
        }

        return [];
    }, [rawData]);

    // Parse Overall Fee Details
    const feeSummaryList: FeeSummaryRecord[] = useMemo(() => {
        const raw = rawData.viewstudentfeedetails;
        if (!raw) return [];

        // 1D flat tuple: [ 34560, 114000, 0, 114000, 0, 114000, "I/A", 587, 232, 263, "2026-2027" ]
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'number') {
            return [
                {
                    yearlyCharges: Number(raw[1] ?? 0),
                    concession: Number(raw[2] ?? 0),
                    payable: Number(raw[3] ?? 0),
                    paidAmount: Number(raw[4] ?? 0),
                    outstanding: Number(raw[5] ?? 0),
                    classSection: String(raw[6] ?? ''),
                    asmaY_Year: String(raw[10] ?? '')
                }
            ];
        }

        // Array of tuples
        if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
            return raw.map((item: any[]) => ({
                yearlyCharges: Number(item[1] ?? 0),
                concession: Number(item[2] ?? 0),
                payable: Number(item[3] ?? 0),
                paidAmount: Number(item[4] ?? 0),
                outstanding: Number(item[5] ?? 0),
                classSection: String(item[6] ?? ''),
                asmaY_Year: String(item[10] ?? '')
            }));
        }

        // Array of objects
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
            return raw.map((item: any) => ({
                yearlyCharges: Number(item.YearlyCharges ?? item.yearlyCharges ?? 0),
                concession: Number(item.Concession ?? item.concession ?? 0),
                payable: Number(item.Payable ?? item.payable ?? 0),
                paidAmount: Number(item.PaidAmount ?? item.paidAmount ?? 0),
                outstanding: Number(item.Outstanding ?? item.outstanding ?? 0),
                classSection: item.ClassSection || item.classSection || '',
                asmaY_Year: item.asmay_year || item.asmaY_Year || ''
            }));
        }

        return [];
    }, [rawData]);

    // Parse Fee Heads / Year-wise Details
    const feeHeadList: FeeHeadRecord[] = useMemo(() => {
        const raw = rawData.viewstudenfeeyeardetails;
        if (!raw) return [];

        // 1D flat tuple: [ "Annual Musical Concert Fee", "Yearly", 2000, 2000, 2000, 0, 0 ]
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
            return [
                {
                    feeHead: String(raw[0]),
                    installment: String(raw[1] ?? ''),
                    charges: Number(raw[2] ?? 0),
                    concession: Number(raw[3] ?? 0),
                    payable: Number(raw[4] ?? 0),
                    paid: Number(raw[5] ?? 0),
                    balance: Number(raw[6] ?? 0)
                }
            ];
        }

        // Array of tuples
        if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
            return raw.map((item: any[]) => ({
                feeHead: String(item[0] ?? ''),
                installment: String(item[1] ?? ''),
                charges: Number(item[2] ?? 0),
                concession: Number(item[3] ?? 0),
                payable: Number(item[4] ?? 0),
                paid: Number(item[5] ?? 0),
                balance: Number(item[6] ?? 0)
            }));
        }

        // Array of objects
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
            return raw.map((item: any) => ({
                feeHead: item.FMH_FeeName || item.fmH_FeeName || '',
                installment: item.fti_name || item.ftI_Name || '',
                charges: Number(item.Charges ?? item.charges ?? 0),
                concession: Number(item.Concession ?? item.concession ?? 0),
                payable: Number(item.Payable ?? item.payable ?? 0),
                paid: Number(item.Paid ?? item.paid ?? 0),
                balance: Number(item.Balance ?? item.balance ?? 0)
            }));
        }

        return [];
    }, [rawData]);

    // Parse Exam Details
    const examList: ExamRecord[] = useMemo(() => {
        const raw = rawData.viewstudentwiseexamdetails;
        if (!raw) return [];

        // 1D flat tuple: [ 263, 34560, 1219, "First Unit Test", 25, 250, "Fail", "D" ]
        if (Array.isArray(raw) && raw.length > 0 && (typeof raw[0] === 'number' || typeof raw[0] === 'string')) {
            const obt = Number(raw[4] ?? 0);
            const max = Number(raw[5] ?? 0);
            return [
                {
                    examName: String(raw[3] ?? 'Assessment'),
                    obtainedMarks: obt,
                    maxMarks: max,
                    percentage: max > 0 ? Math.round((obt / max) * 100) : 0,
                    result: String(raw[6] ?? ''),
                    grade: String(raw[7] ?? '')
                }
            ];
        }

        // Array of tuples
        if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
            return raw.map((item: any[]) => {
                const obt = Number(item[4] ?? 0);
                const max = Number(item[5] ?? 0);
                return {
                    examName: String(item[3] ?? 'Assessment'),
                    obtainedMarks: obt,
                    maxMarks: max,
                    percentage: max > 0 ? Math.round((obt / max) * 100) : 0,
                    result: String(item[6] ?? ''),
                    grade: String(item[7] ?? '')
                };
            });
        }

        // Array of objects
        if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
            return raw.map((item: any) => {
                const obt = Number(item.ESTMPS_ObtainedMarks ?? item.estmpS_ObtainedMarks ?? 0);
                const max = Number(item.ESTMPS_MaxMarks ?? item.estmpS_MaxMarks ?? 0);
                return {
                    examName: item.EME_ExamName || item.eme_ExamName || 'Assessment',
                    obtainedMarks: obt,
                    maxMarks: max,
                    percentage: max > 0 ? Math.round((obt / max) * 100) : 0,
                    result: item.ESTMPS_PassFailFlg || item.estmpS_PassFailFlg || '',
                    grade: item.ESTMPS_ObtainedGrade || item.estmpS_ObtainedGrade || ''
                };
            });
        }

        return [];
    }, [rawData]);

    // Parse Address Information
    const permanentAddress = useMemo(() => {
        const addrList = rawData.viewstudentaddressdetails;
        if (Array.isArray(addrList) && addrList[0] && addrList[0].trim().length > 0) {
            return addrList[0];
        }
        const parts = [
            studentDetail?.amsT_PerStreet,
            studentDetail?.amsT_PerArea,
            studentDetail?.amsT_PerCity,
            studentDetail?.amsT_PerState,
            studentDetail?.amsT_PerCountry,
            studentDetail?.amsT_PerPincode
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'No permanent address recorded';
    }, [rawData, studentDetail]);

    const communicationAddress = useMemo(() => {
        const addrList = rawData.viewstudentaddressdetails;
        if (Array.isArray(addrList) && addrList[1] && addrList[1].trim().length > 0) {
            return addrList[1];
        }
        const parts = [
            studentDetail?.amsT_ConStreet,
            studentDetail?.amsT_ConArea,
            studentDetail?.amsT_ConCity,
            studentDetail?.amsT_ConState,
            studentDetail?.amsT_ConCountry,
            studentDetail?.amsT_ConPincode
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Same as permanent address / Not specified';
    }, [rawData, studentDetail]);

    // Guardian details
    const guardian = rawData.viewstudentguardiandetails?.[0];

    // Subjects
    const subjectList: StudentSubjectDetail[] = rawData.viewstudentsubjectdetails || [];

    // Staff
    const classTeachers = rawData.classteacher || [];
    const subjectTeachers = rawData.sujectteachers || [];

    if (isLoading) {
        return (
            <div className='min-h-screen space-y-6 bg-slate-50/60 p-4 md:p-8 dark:bg-zinc-950/60'>
                <div className='flex items-center gap-3'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => router.push('/StudentPortal/student-dashboard')}
                        className='h-9 w-9 rounded-full shadow-sm'>
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div className='space-y-1.5'>
                        <Skeleton className='h-7 w-48' />
                        <Skeleton className='h-4 w-72' />
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                    <div className='space-y-6 lg:col-span-4'>
                        <Card className='space-y-4 border p-6 shadow-sm'>
                            <div className='flex justify-center'>
                                <Skeleton className='h-24 w-24 rounded-full' />
                            </div>
                            <Skeleton className='mx-auto h-6 w-3/4' />
                            <Skeleton className='mx-auto h-4 w-1/2' />
                            <Separator />
                            <div className='space-y-2'>
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-full' />
                            </div>
                        </Card>
                    </div>

                    <div className='lg:col-span-8'>
                        <Card className='space-y-4 border p-6 shadow-sm'>
                            <Skeleton className='h-10 w-full' />
                            <Skeleton className='h-64 w-full' />
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (!apiData) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center space-y-4 bg-slate-50/60 p-4 dark:bg-zinc-950/60'>
                <Card className='w-full max-w-md space-y-4 border p-6 text-center shadow-sm'>
                    <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50'>
                        <AlertCircle className='h-6 w-6' />
                    </div>
                    <div className='space-y-1'>
                        <h3 className='font-semibold text-lg text-slate-900 dark:text-slate-100'>No Student Profile Data</h3>
                        <p className='text-muted-foreground text-xs'>
                            No response received from the student view details API. Please try again.
                        </p>
                    </div>
                    <div className='flex items-center justify-center gap-3'>
                        <Button variant='outline' size='sm' onClick={() => router.push('/StudentPortal/student-dashboard')}>
                            <ArrowLeft className='mr-1.5 h-4 w-4' /> Back to Dashboard
                        </Button>
                        <Button size='sm' onClick={() => refetch()} className='bg-emerald-600 text-white hover:bg-emerald-700'>
                            <RefreshCw className='mr-1.5 h-4 w-4' /> Retry
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen space-y-6 bg-slate-50/60 p-4 md:p-8 dark:bg-zinc-950/60'>
            {/* Top Navigation & Title Bar */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-3'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => router.push('/StudentPortal/student-dashboard')}
                        className='h-9 w-9 rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-800'
                        title='Back to Dashboard'>
                        <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <div>
                        <div className='flex items-center gap-2'>
                            <h1 className='font-bold text-2xl text-slate-900 tracking-tight dark:text-slate-100'>Student Profile</h1>
                            <Badge
                                variant={statusFlag === 'S' ? 'default' : statusFlag === 'L' ? 'destructive' : 'secondary'}
                                className={statusFlag === 'S' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                {statusFlag === 'S' ? 'Active' : statusFlag === 'L' ? 'Left' : 'Deactivated'}
                            </Badge>
                        </div>
                        <p className='text-muted-foreground text-sm'>
                            Complete institutional academic records, profile and activity details
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    {isLoading && (
                        <span className='flex items-center gap-1.5 text-muted-foreground text-xs'>
                            <RefreshCw className='h-3.5 w-3.5 animate-spin' /> Loading live data...
                        </span>
                    )}
                    {/* <Button
                        variant='outline'
                        size='sm'
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className='gap-1.5 text-xs shadow-sm'>
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button> */}
                </div>
            </div>

            {/* Main Content Grid: Left Column Profile Card + Right Column Details Tabs */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                {/* Left Card: 4 Cols */}
                <div className='space-y-6 lg:col-span-4'>
                    <Card className='overflow-hidden border shadow-sm'>
                        {/* Header Gradient Banner */}
                        <div className='h-24 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600' />

                        <CardContent className='relative px-6 pt-0 pb-6'>
                            {/* Profile Image & Avatar */}
                            <div className='-mt-12 mb-4 flex items-end justify-between'>
                                <Avatar className='h-24 w-24 border-4 border-white shadow-md ring-2 ring-slate-100 dark:border-zinc-900 dark:ring-zinc-800'>
                                    {photoUrl ? (
                                        <AvatarImage src={photoUrl} alt={studentName} />
                                    ) : (
                                        <AvatarFallback className='bg-emerald-100 font-bold text-2xl text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'>
                                            {studentName
                                                .split(' ')
                                                .map((n) => n[0])
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .join('')}
                                        </AvatarFallback>
                                    )}
                                </Avatar>

                                <div className='rounded-lg bg-slate-100 px-3 py-1 text-right text-xs dark:bg-zinc-800'>
                                    <span className='font-semibold text-slate-700 dark:text-slate-300'>
                                        {currentAcademic?.asmaY_Year || '2026-2027'}
                                    </span>
                                    <div className='text-[10px] text-muted-foreground'>
                                        Roll No: {currentAcademic?.amaY_RollNo || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Name & Academic Meta */}
                            <div className='space-y-1'>
                                <h2 className='font-bold text-slate-900 text-xl dark:text-slate-100'>{studentName}</h2>
                                <p className='flex items-center gap-1.5 font-medium text-emerald-600 text-sm dark:text-emerald-400'>
                                    <GraduationCap className='h-4 w-4' />
                                    Class: {currentAcademic?.asmcL_ClassName || studentJoined?.asmcL_ClassName || 'N/A'} - Section{' '}
                                    {currentAcademic?.asmC_SectionName || studentJoined?.asmC_SectionName || 'N/A'}
                                </p>
                            </div>

                            <Separator className='my-4' />

                            {/* Student Meta Attributes List */}
                            <div className='space-y-3 text-sm'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Admission No.</span>
                                    <span className='font-semibold text-slate-800 dark:text-slate-200'>{admNo}</span>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Registration No.</span>
                                    <span className='font-medium text-slate-800 dark:text-slate-200'>{regNo}</span>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Date of Admission</span>
                                    <span className='font-medium text-slate-800 dark:text-slate-200'>{formatDate(doa)}</span>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Date of Birth</span>
                                    <span className='font-medium text-slate-800 dark:text-slate-200'>
                                        {formatDate(dob)} {age ? `(${age} yrs)` : ''}
                                    </span>
                                </div>

                                {/* {dobWords && (
                                    <div className='rounded bg-slate-50 p-2 text-[11px] text-muted-foreground italic dark:bg-zinc-900'>
                                        &quot;{dobWords}&quot;
                                    </div>
                                )} */}

                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Gender</span>
                                    <span className='font-medium text-slate-800 dark:text-slate-200'>{gender}</span>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>Blood Group</span>
                                    <Badge variant='outline' className='font-bold text-rose-600 text-xs'>
                                        {bloodGroup}
                                    </Badge>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground text-xs'>T-Pin</span>
                                    <span className='font-medium font-mono text-slate-800 dark:text-slate-200'>{tpin}</span>
                                </div>
                            </div>

                            <Separator className='my-4' />

                            {/* Contact Information */}
                            <div className='space-y-2.5 text-xs'>
                                <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300'>
                                    <Phone className='h-3.5 w-3.5 text-emerald-500' />
                                    <span>{mobileNo}</span>
                                </div>
                                <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300'>
                                    <Mail className='h-3.5 w-3.5 text-blue-500' />
                                    <span className='truncate'>{emailId}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Parent Preview Card */}
                    <Card className='border shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-sm'>
                                <Users className='h-4 w-4 text-emerald-600' /> Parent Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4 text-xs'>
                            {/* Father */}
                            <div className='rounded-lg border bg-slate-50/70 p-3 dark:bg-zinc-900/50'>
                                <div className='font-semibold text-slate-900 text-xs dark:text-slate-100'>
                                    Father: {studentDetail?.amsT_FatherName || 'N/A'} {studentDetail?.amsT_FatherSurname || ''}
                                </div>
                                <div className='mt-1 flex items-center gap-2 text-muted-foreground'>
                                    <Phone className='h-3 w-3' />
                                    <span>{studentDetail?.amsT_FatherMobleNo || 'N/A'}</span>
                                </div>
                                <div className='mt-0.5 flex items-center gap-2 text-muted-foreground'>
                                    <Mail className='h-3 w-3' />
                                    <span className='truncate'>{studentDetail?.amsT_FatheremailId || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Mother */}
                            <div className='rounded-lg border bg-slate-50/70 p-3 dark:bg-zinc-900/50'>
                                <div className='font-semibold text-slate-900 text-xs dark:text-slate-100'>
                                    Mother: {studentDetail?.amsT_MotherName || 'N/A'} {studentDetail?.amsT_MotherSurname || ''}
                                </div>
                                <div className='mt-1 flex items-center gap-2 text-muted-foreground'>
                                    <Phone className='h-3 w-3' />
                                    <span>{studentDetail?.amsT_MotherMobileNo || 'N/A'}</span>
                                </div>
                                <div className='mt-0.5 flex items-center gap-2 text-muted-foreground'>
                                    <Mail className='h-3 w-3' />
                                    <span className='truncate'>{studentDetail?.amsT_MotherEmailId || 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: 8 Cols (Tabbed details matching IVRM) */}
                <div className='lg:col-span-8'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full space-y-4'>
                        <div className='overflow-x-auto pb-1'>
                            <TabsList className='grid h-auto w-full grid-cols-4 gap-1 p-1 lg:grid-cols-7'>
                                <TabsTrigger value='academic' className='gap-1.5 py-2 text-xs'>
                                    <GraduationCap className='h-3.5 w-3.5' /> Academic
                                </TabsTrigger>
                                <TabsTrigger value='parents' className='gap-1.5 py-2 text-xs'>
                                    <Users className='h-3.5 w-3.5' /> Parents & Address
                                </TabsTrigger>
                                <TabsTrigger value='attendance' className='gap-1.5 py-2 text-xs'>
                                    <BarChart3 className='h-3.5 w-3.5' /> Attendance
                                </TabsTrigger>
                                <TabsTrigger value='fees' className='gap-1.5 py-2 text-xs'>
                                    <Banknote className='h-3.5 w-3.5' /> Fee Details
                                </TabsTrigger>
                                <TabsTrigger value='exams' className='gap-1.5 py-2 text-xs'>
                                    <Award className='h-3.5 w-3.5' /> Exams
                                </TabsTrigger>
                                <TabsTrigger value='subjects' className='gap-1.5 py-2 text-xs'>
                                    <BookOpen className='h-3.5 w-3.5' /> Subjects
                                </TabsTrigger>
                                <TabsTrigger value='staff' className='gap-1.5 py-2 text-xs'>
                                    <UserCheck className='h-3.5 w-3.5' /> Staff
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB 1: ACADEMIC DETAILS */}
                        <TabsContent value='academic' className='mt-0 space-y-4'>
                            <Card className='border shadow-sm'>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2 text-base'>
                                        <GraduationCap className='h-5 w-5 text-emerald-600' />
                                        Academic History & Enrollment
                                    </CardTitle>
                                    <CardDescription>Year-wise class progression and institutional enrollment records</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {academicHistory.length > 0 ? (
                                        <div className='relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800'>
                                            {academicHistory.map((item, idx) => {
                                                const isCurrent = item.status_Flag?.toLowerCase().includes('current') || idx === 0;
                                                return (
                                                    <div key={idx} className='group relative'>
                                                        {/* Dot */}
                                                        <div
                                                            className={`-left-6 absolute top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 ${isCurrent
                                                                    ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950'
                                                                    : 'bg-slate-300 dark:bg-zinc-700'
                                                                }`}
                                                        />

                                                        <div
                                                            className={`rounded-lg border p-4 transition-all ${isCurrent
                                                                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                                                                    : 'bg-white hover:bg-slate-50/50 dark:bg-zinc-900'
                                                                }`}>
                                                            <div className='flex flex-wrap items-center justify-between gap-2'>
                                                                <div className='flex items-center gap-2'>
                                                                    <span className='font-bold text-slate-900 text-sm dark:text-slate-100'>
                                                                        {item.asmaY_Year}
                                                                    </span>
                                                                    {item.status_Flag && (
                                                                        <Badge
                                                                            variant={isCurrent ? 'default' : 'secondary'}
                                                                            className={isCurrent ? 'bg-emerald-600' : ''}>
                                                                            {item.status_Flag}
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <span className='text-muted-foreground text-xs'>
                                                                    Roll No: <strong>{item.amaY_RollNo ?? 'N/A'}</strong>
                                                                </span>
                                                            </div>

                                                            <div className='mt-2 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3'>
                                                                <div>
                                                                    <span className='text-muted-foreground'>Class</span>
                                                                    <p className='font-semibold text-slate-800 dark:text-slate-200'>
                                                                        {item.asmcL_ClassName || 'N/A'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className='text-muted-foreground'>Section</span>
                                                                    <p className='font-semibold text-slate-800 dark:text-slate-200'>
                                                                        {item.asmC_SectionName || 'A'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className='text-muted-foreground'>Academic Order</span>
                                                                    <p className='font-semibold text-slate-800 dark:text-slate-200'>
                                                                        {item.order || idx + 1}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className='p-6 text-center text-muted-foreground text-sm'>
                                            No academic history records found.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 2: ADDRESS & PARENTS DETAILS */}
                        <TabsContent value='parents' className='mt-0 space-y-4'>
                            {/* Parents Details */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                {/* Father Details */}
                                <Card className='border shadow-sm'>
                                    <CardHeader className='bg-slate-50/70 pb-3 dark:bg-zinc-900/50'>
                                        <CardTitle className='flex items-center justify-between text-sm'>
                                            <span>Father Details</span>
                                            <Badge variant='outline' className='text-xs'>
                                                Father
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-3 pt-4 text-xs'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>Name:</span>
                                            <span className='font-semibold text-slate-800 dark:text-slate-200'>
                                                {studentDetail?.amsT_FatherName || 'N/A'} {studentDetail?.amsT_FatherSurname || ''}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>Mobile:</span>
                                            <span className='font-medium text-slate-800 dark:text-slate-200'>
                                                {studentDetail?.amsT_FatherMobleNo || 'N/A'}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>Email:</span>
                                            <span className='max-w-[180px] truncate font-medium text-slate-800 dark:text-slate-200'>
                                                {studentDetail?.amsT_FatheremailId || 'N/A'}
                                            </span>
                                        </div>
                                        {studentDetail?.amsT_FatherOccupation && (
                                            <div className='flex items-center justify-between'>
                                                <span className='text-muted-foreground'>Occupation:</span>
                                                <span className='font-medium text-slate-800 dark:text-slate-200'>
                                                    {studentDetail.amsT_FatherOccupation}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Mother Details */}
                                <Card className='border shadow-sm'>
                                    <CardHeader className='bg-slate-50/70 pb-3 dark:bg-zinc-900/50'>
                                        <CardTitle className='flex items-center justify-between text-sm'>
                                            <span>Mother Details</span>
                                            <Badge variant='outline' className='text-xs'>
                                                Mother
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-3 pt-4 text-xs'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>Name:</span>
                                            <span className='font-semibold text-slate-800 dark:text-slate-200'>
                                                {studentDetail?.amsT_MotherName || 'N/A'} {studentDetail?.amsT_MotherSurname || ''}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>Mobile:</span>
                                            <span className='font-medium text-slate-800 dark:text-slate-200'>
                                                {studentDetail?.amsT_MotherMobileNo || 'N/A'}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-muted-foreground'>Email:</span>
                                            <span className='max-w-[180px] truncate font-medium text-slate-800 dark:text-slate-200'>
                                                {studentDetail?.amsT_MotherEmailId || 'N/A'}
                                            </span>
                                        </div>
                                        {studentDetail?.amsT_MotherOccupation && (
                                            <div className='flex items-center justify-between'>
                                                <span className='text-muted-foreground'>Occupation:</span>
                                                <span className='font-medium text-slate-800 dark:text-slate-200'>
                                                    {studentDetail.amsT_MotherOccupation}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Guardian Details if Available */}
                            {guardian?.amstG_GuardianName && (
                                <Card className='border shadow-sm'>
                                    <CardHeader className='pb-3'>
                                        <CardTitle className='flex items-center gap-2 text-sm'>
                                            <ShieldCheck className='h-4 w-4 text-emerald-600' /> Guardian Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='grid grid-cols-1 gap-3 text-xs sm:grid-cols-3'>
                                        <div>
                                            <span className='text-muted-foreground'>Name</span>
                                            <p className='font-semibold'>{guardian.amstG_GuardianName}</p>
                                        </div>
                                        <div>
                                            <span className='text-muted-foreground'>Phone</span>
                                            <p className='font-semibold'>{guardian.amstG_GuardianPhoneNo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className='text-muted-foreground'>Relation</span>
                                            <p className='font-semibold'>{guardian.amstG_Relation || 'Guardian'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Addresses Grid */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                <Card className='border shadow-sm'>
                                    <CardHeader className='pb-3'>
                                        <CardTitle className='flex items-center gap-2 text-sm'>
                                            <Home className='h-4 w-4 text-emerald-600' /> Permanent Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='text-slate-700 text-xs leading-relaxed dark:text-slate-300'>
                                        <p>{permanentAddress}</p>
                                    </CardContent>
                                </Card>

                                <Card className='border shadow-sm'>
                                    <CardHeader className='pb-3'>
                                        <CardTitle className='flex items-center gap-2 text-sm'>
                                            <MapPin className='h-4 w-4 text-blue-600' /> Communication Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='text-slate-700 text-xs leading-relaxed dark:text-slate-300'>
                                        <p>{communicationAddress}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* TAB 3: ATTENDANCE DETAILS */}
                        <TabsContent value='attendance' className='mt-0 space-y-4'>
                            {/* KPI Metrics */}
                            {overallAttendance.length > 0 && (
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                                    <Card className='border border-blue-100 bg-blue-50/40 shadow-sm dark:border-blue-900 dark:bg-blue-950/20'>
                                        <CardContent className='p-4'>
                                            <div className='font-medium text-muted-foreground text-xs'>Total Working Days</div>
                                            <div className='mt-1 font-bold text-2xl text-blue-600'>{overallAttendance[0].workingDays}</div>
                                        </CardContent>
                                    </Card>

                                    <Card className='border border-emerald-100 bg-emerald-50/40 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20'>
                                        <CardContent className='p-4'>
                                            <div className='font-medium text-muted-foreground text-xs'>Present Days</div>
                                            <div className='mt-1 font-bold text-2xl text-emerald-600'>
                                                {overallAttendance[0].presentDays}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className='border border-teal-100 bg-teal-50/40 shadow-sm dark:border-teal-900 dark:bg-teal-950/20'>
                                        <CardContent className='p-4'>
                                            <div className='font-medium text-muted-foreground text-xs'>Attendance Rate</div>
                                            <div className='mt-1 font-bold text-2xl text-teal-600'>{overallAttendance[0].percentage}%</div>
                                            <Progress value={overallAttendance[0].percentage} className='mt-2 h-1.5 bg-teal-100' />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Overall Attendance Table */}
                            <Card className='border shadow-sm'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center justify-between text-sm'>
                                        <span>Overall Attendance Details</span>
                                        <Badge variant='outline' className='text-xs'>
                                            Consolidated
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {overallAttendance.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50 text-xs dark:bg-zinc-900'>
                                                    <TableHead className='w-12 text-center'>Sl.No</TableHead>
                                                    <TableHead>Year</TableHead>
                                                    <TableHead>Class / Section</TableHead>
                                                    <TableHead className='text-center'>Working Days</TableHead>
                                                    <TableHead className='text-center'>Present Days</TableHead>
                                                    <TableHead className='text-center'>Percentage</TableHead>
                                                    <TableHead className='text-right'>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className='text-xs'>
                                                {overallAttendance.map((row, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                                        <TableCell className='font-semibold'>{row.asmaY_Year}</TableCell>
                                                        <TableCell>
                                                            {row.asmcL_ClassName} / {row.asmC_SectionName}
                                                        </TableCell>
                                                        <TableCell className='text-center'>{row.workingDays}</TableCell>
                                                        <TableCell className='text-center font-semibold text-emerald-600'>
                                                            {row.presentDays}
                                                        </TableCell>
                                                        <TableCell className='text-center font-bold'>
                                                            <span
                                                                className={
                                                                    row.percentage >= 75
                                                                        ? 'text-emerald-600'
                                                                        : row.percentage >= 60
                                                                            ? 'text-amber-600'
                                                                            : 'text-rose-600'
                                                                }>
                                                                {row.percentage}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className='text-right'>
                                                            <Badge variant='outline'>{row.statusFlag || 'Current'}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className='py-6 text-center text-muted-foreground text-sm'>No attendance records found.</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Month Wise Attendance Breakdown */}
                            {monthAttendance.length > 0 && (
                                <Card className='border shadow-sm'>
                                    <CardHeader className='pb-3'>
                                        <CardTitle className='flex items-center justify-between text-sm'>
                                            <span>Month-Wise Attendance</span>
                                            <span className='font-normal text-muted-foreground text-xs'>Monthly breakdown</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='grid grid-cols-1 items-center gap-6 lg:grid-cols-2'>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className='bg-slate-50 text-xs dark:bg-zinc-900'>
                                                        <TableHead className='w-12 text-center'>Sl.No</TableHead>
                                                        <TableHead>Month & Year</TableHead>
                                                        <TableHead className='text-center'>Working Days</TableHead>
                                                        <TableHead className='text-center'>Present Days</TableHead>
                                                        <TableHead className='text-center'>%</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className='text-xs'>
                                                    {monthAttendance.map((m, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                                            <TableCell className='font-semibold'>
                                                                {m.months} {m.years}
                                                            </TableCell>
                                                            <TableCell className='text-center'>{m.workingCount}</TableCell>
                                                            <TableCell className='text-center font-semibold text-emerald-600'>
                                                                {m.presentCount}
                                                            </TableCell>
                                                            <TableCell className='text-center font-bold text-emerald-600'>
                                                                {m.percentage}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            {/* Bar Chart Container */}
                                            <div className='h-52 w-full'>
                                                <ResponsiveContainer width='100%' height='100%'>
                                                    <BarChart data={monthAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray='3 3' vertical={false} opacity={0.3} />
                                                        <XAxis dataKey='months' fontSize={11} tickLine={false} />
                                                        <YAxis fontSize={11} tickLine={false} />
                                                        <Tooltip />
                                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                                        <Bar
                                                            dataKey='workingCount'
                                                            name='Working Days'
                                                            fill='#94a3b8'
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                        <Bar
                                                            dataKey='presentCount'
                                                            name='Present Days'
                                                            fill='#10b981'
                                                            radius={[4, 4, 0, 0]}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* TAB 4: FEE DETAILS */}
                        <TabsContent value='fees' className='mt-0 space-y-4'>
                            {/* KPI Metrics */}
                            {feeSummaryList.length > 0 && (
                                <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                                    <Card className='border p-4 shadow-sm'>
                                        <div className='text-muted-foreground text-xs'>Yearly Charges</div>
                                        <div className='mt-1 font-bold text-lg text-slate-900 dark:text-slate-100'>
                                            {formatCurrency(feeSummaryList[0].yearlyCharges)}
                                        </div>
                                    </Card>

                                    <Card className='border p-4 shadow-sm'>
                                        <div className='text-muted-foreground text-xs'>Concession</div>
                                        <div className='mt-1 font-bold text-amber-600 text-lg'>
                                            {formatCurrency(feeSummaryList[0].concession)}
                                        </div>
                                    </Card>

                                    <Card className='border p-4 shadow-sm'>
                                        <div className='text-muted-foreground text-xs'>Paid Amount</div>
                                        <div className='mt-1 font-bold text-emerald-600 text-lg'>
                                            {formatCurrency(feeSummaryList[0].paidAmount)}
                                        </div>
                                    </Card>

                                    <Card className='border border-rose-100 bg-rose-50/30 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/20'>
                                        <div className='font-semibold text-rose-600 text-xs'>Outstanding Balance</div>
                                        <div className='mt-1 font-bold text-lg text-rose-600'>
                                            {formatCurrency(feeSummaryList[0].outstanding)}
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {/* Overall Fee Table */}
                            <Card className='border shadow-sm'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center justify-between text-sm'>
                                        <span>Annual Fee Summary</span>
                                        <Badge variant='outline' className='text-xs'>
                                            Yearly
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {feeSummaryList.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50 text-xs dark:bg-zinc-900'>
                                                    <TableHead className='w-12 text-center'>Sl.No</TableHead>
                                                    <TableHead>Year</TableHead>
                                                    <TableHead>Class / Sec</TableHead>
                                                    <TableHead className='text-right'>Yearly Charges</TableHead>
                                                    <TableHead className='text-right'>Concession</TableHead>
                                                    <TableHead className='text-right'>Payable</TableHead>
                                                    <TableHead className='text-right'>Paid</TableHead>
                                                    <TableHead className='text-right'>Outstanding</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className='text-xs'>
                                                {feeSummaryList.map((f, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                                        <TableCell className='font-semibold'>{f.asmaY_Year}</TableCell>
                                                        <TableCell>{f.classSection}</TableCell>
                                                        <TableCell className='text-right font-medium'>
                                                            {formatCurrency(f.yearlyCharges)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-medium text-amber-600'>
                                                            {formatCurrency(f.concession)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-semibold'>
                                                            {formatCurrency(f.payable)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-semibold text-emerald-600'>
                                                            {formatCurrency(f.paidAmount)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-bold text-rose-600'>
                                                            {formatCurrency(f.outstanding)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className='py-6 text-center text-muted-foreground text-sm'>
                                            No fee summary records available.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Head-wise fee breakdown if available */}
                            {feeHeadList.length > 0 && (
                                <Card className='border shadow-sm'>
                                    <CardHeader className='pb-3'>
                                        <CardTitle className='flex items-center justify-between text-sm'>
                                            <span>Fee Heads & Installments Breakdown</span>
                                            <span className='font-normal text-muted-foreground text-xs'>Detailed analysis</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50 text-xs dark:bg-zinc-900'>
                                                    <TableHead className='w-12 text-center'>Sl.No</TableHead>
                                                    <TableHead>Fee Head</TableHead>
                                                    <TableHead>Installment</TableHead>
                                                    <TableHead className='text-right'>Charges</TableHead>
                                                    <TableHead className='text-right'>Concession</TableHead>
                                                    <TableHead className='text-right'>Payable</TableHead>
                                                    <TableHead className='text-right'>Paid</TableHead>
                                                    <TableHead className='text-right'>Balance</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className='text-xs'>
                                                {feeHeadList.map((item, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                                        <TableCell className='font-semibold'>{item.feeHead}</TableCell>
                                                        <TableCell>{item.installment}</TableCell>
                                                        <TableCell className='text-right'>{formatCurrency(item.charges)}</TableCell>
                                                        <TableCell className='text-right text-amber-600'>
                                                            {formatCurrency(item.concession)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-medium'>
                                                            {formatCurrency(item.payable)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-medium text-emerald-600'>
                                                            {formatCurrency(item.paid)}
                                                        </TableCell>
                                                        <TableCell className='text-right font-bold text-rose-600'>
                                                            {formatCurrency(item.balance)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* TAB 5: CURRENT YEAR EXAM DETAILS */}
                        <TabsContent value='exams' className='mt-0 space-y-4'>
                            <Card className='border shadow-sm'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center gap-2 text-base'>
                                        <Award className='h-5 w-5 text-indigo-600' /> Current Year Exam & Marks Details
                                    </CardTitle>
                                    <CardDescription>Assessment results, obtained marks and grading performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {examList.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50 text-xs dark:bg-zinc-900'>
                                                    <TableHead className='w-12 text-center'>Sl.No</TableHead>
                                                    <TableHead>Exam Name</TableHead>
                                                    <TableHead className='text-center'>Max Marks</TableHead>
                                                    <TableHead className='text-center'>Obtained Marks</TableHead>
                                                    <TableHead className='text-center'>Percentage</TableHead>
                                                    <TableHead className='text-center'>Result</TableHead>
                                                    <TableHead className='text-right'>Grade</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className='text-xs'>
                                                {examList.map((ex, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                                        <TableCell className='font-semibold'>{ex.examName}</TableCell>
                                                        <TableCell className='text-center'>{ex.maxMarks}</TableCell>
                                                        <TableCell className='text-center font-bold text-slate-800 dark:text-slate-200'>
                                                            {ex.obtainedMarks}
                                                        </TableCell>
                                                        <TableCell className='text-center font-medium'>{ex.percentage}%</TableCell>
                                                        <TableCell className='text-center'>
                                                            <Badge
                                                                variant={ex.result?.toLowerCase() === 'pass' ? 'default' : 'destructive'}
                                                                className={ex.result?.toLowerCase() === 'pass' ? 'bg-emerald-500' : ''}>
                                                                {ex.result || 'Completed'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className='text-right font-bold text-indigo-600'>
                                                            {ex.grade || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className='space-y-2 py-8 text-center text-muted-foreground text-sm'>
                                            <Award className='mx-auto h-8 w-8 text-slate-300' />
                                            <p>No exam results recorded for the active academic cycle.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 6: SUBJECT DETAILS */}
                        <TabsContent value='subjects' className='mt-0 space-y-4'>
                            <Card className='border shadow-sm'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center gap-2 text-base'>
                                        <BookOpen className='h-5 w-5 text-emerald-600' /> Enrolled Subjects
                                    </CardTitle>
                                    <CardDescription>
                                        Mandatory and elective curriculum subjects for the current academic session
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {subjectList.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-slate-50 text-xs dark:bg-zinc-900'>
                                                    <TableHead className='w-12 text-center'>Sl.No</TableHead>
                                                    <TableHead>Subject Name</TableHead>
                                                    <TableHead className='text-right'>Elective Subject</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className='text-xs'>
                                                {subjectList.map((sub, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                                        <TableCell className='font-semibold'>{sub.ismS_SubjectName}</TableCell>
                                                        <TableCell className='text-right'>
                                                            {sub.estsU_ElecetiveFlag ? (
                                                                <Badge variant='outline' className='border-emerald-300 text-emerald-600'>
                                                                    <Check className='mr-1 h-3 w-3' /> Elective
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant='secondary'>Core</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className='space-y-2 py-8 text-center text-muted-foreground text-sm'>
                                            <BookOpen className='mx-auto h-8 w-8 text-slate-300' />
                                            <p>Curriculum subjects will be updated shortly by the administration.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* TAB 7: STAFF DETAILS */}
                        <TabsContent value='staff' className='mt-0 space-y-4'>
                            <Card className='border shadow-sm'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center gap-2 text-base'>
                                        <UserCheck className='h-5 w-5 text-emerald-600' /> Assigned Teachers & Faculty
                                    </CardTitle>
                                    <CardDescription>Class teacher and assigned subject mentors for this academic session</CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    {/* Class Teacher */}
                                    <div>
                                        <h4 className='mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            Class Teacher
                                        </h4>
                                        {classTeachers.length > 0 ? (
                                            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                                                {classTeachers.map((teacher: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className='flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-zinc-900'>
                                                        <Avatar className='h-10 w-10'>
                                                            <AvatarFallback className='bg-emerald-100 font-bold text-emerald-800 text-xs'>
                                                                {teacher.emp_name?.[0] || 'T'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className='font-semibold text-slate-900 text-xs dark:text-slate-100'>
                                                                {teacher.emp_name}
                                                            </p>
                                                            <p className='text-[11px] text-muted-foreground'>Class Teacher</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='rounded-lg border border-dashed p-4 text-center text-muted-foreground text-xs'>
                                                Class teacher allocation in progress.
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Subject Teachers */}
                                    <div>
                                        <h4 className='mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            Subject Teachers
                                        </h4>
                                        {subjectTeachers.length > 0 ? (
                                            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                                                {subjectTeachers.map((teacher: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className='flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-zinc-900'>
                                                        <Avatar className='h-10 w-10'>
                                                            <AvatarFallback className='bg-blue-100 font-bold text-blue-800 text-xs'>
                                                                {teacher.emp_name?.[0] || 'T'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className='font-semibold text-slate-900 text-xs dark:text-slate-100'>
                                                                {teacher.emp_name}
                                                            </p>
                                                            <p className='font-medium text-[11px] text-emerald-600'>
                                                                {teacher.ISMS_SubjectName || 'Subject Teacher'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='rounded-lg border border-dashed p-4 text-center text-muted-foreground text-xs'>
                                                Subject faculty allocation in progress.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

'use client';

import {
    useStudentNameChange,
    useStudentNameRegNo,
    useTCGetDetailsRecord,
    useTCInitialData,
    useTCYearChange
} from '@/hooks/admission/preadmission/reports/useSophiaTCReport';
import { format } from 'date-fns';
import { FileText, Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function SophiaTransferCertificate() {
    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<number>(0);
    const [admName, setAdmName] = useState<string>('regno'); // 'regno' or 'stdname'
    const [tcTempPer, setTcTempPer] = useState<string>('per'); // 'temp' or 'per'
    const [amstId, setAmstId] = useState<number>(0);
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [report, setReport] = useState<any>(null);
    const [printFlag, setPrintFlag] = useState(false);

    /* -------------------- Refs -------------------- */
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Hooks -------------------- */
    const { data: initialData } = useTCInitialData();
    const yearChangeMutation = useTCYearChange();
    const getStudentListMutation = useStudentNameRegNo();
    const studentChangeMutation = useStudentNameChange();
    const getTCDetailsMutation = useTCGetDetailsRecord();

    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (val: string) => {
        const id = Number(val);
        setAsmayId(id);
        setAmstId(0);
        setStudentDropdown([]);
        setPrintFlag(false);
        try {
            await yearChangeMutation.mutateAsync(id);
            fetchStudents(id, admName, tcTempPer);
        } catch (e) {
            toast.error('Error updating year data');
        }
    };

    const fetchStudents = async (yId: number, searchBy: string, studentType: string) => {
        if (!yId) return;
        try {
            const res = await getStudentListMutation.mutateAsync({
                ASMAY_Id: yId,
                admnoorname: searchBy,
                tctemporper: studentType
            });
            setStudentDropdown(res?.data || []);
        } catch (e) {
            toast.error('Failed to load students');
        }
    };

    const handleStudentChange = async (val: string) => {
        const sId = Number(val);
        setAmstId(sId);
        setPrintFlag(false);
        // We could call studentNameChange API if needed for label updates,
        // but getTcdetails usually returns everything.
    };

    const handleGenerateReport = async () => {
        if (!asmayId || !amstId) {
            toast.error('Please select year and student');
            return;
        }

        try {
            const res = await getTCDetailsMutation.mutateAsync({
                ASMAY_Id: asmayId,
                AMST_Id: amstId,
                tctemporper: tcTempPer
            });
            const pData = res?.data || res;
            if (pData.studentTCList && pData.studentTCList.length > 0) {
                // Merge the main student record with the full data object for easier access
                setReport({ ...pData, ...pData.studentTCList[0] });
                setPrintFlag(true);
            } else {
                toast.warning('No records found');
                setPrintFlag(false);
            }
        } catch (e) {
            toast.error('Failed to generate report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Transfer_Certificate_${report?.studentname || 'Record'}`,
        pageStyle: `
            @page { 
                size: B5; 
                margin: 10mm; 
            }
            @media print {
                body { 
                    visibility: hidden;
                    -webkit-print-color-adjust: exact;
                }
                .print-content { 
                    visibility: visible !important;
                    display: block !important; 
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 176mm !important;
                    min-height: 250mm !important;
                    background-color: white !important;
                    padding: 25px !important;
                    font-family: "Times New Roman", Times, serif !important;
                }
                .print-content p, .print-content div {
                    white-space: nowrap !important;
                }
                .print-content * {
                    visibility: visible !important;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
            }
        `
    });

    const formatClassName = (className: string) => {
        const classMap: Record<string, string> = {
            I: 'FIRST',
            II: 'SECOND',
            III: 'THIRD',
            IV: 'FOURTH',
            V: 'FIFTH',
            VI: 'SIXTH',
            VII: 'SEVENTH',
            VIII: 'EIGHTH',
            IX: 'NINTH',
            X: 'TENTH'
        };
        return classMap[className] || className;
    };

    const filteredDropdown = useMemo(() => {
        if (!studentSearch) return studentDropdown;
        return studentDropdown.filter((s) => s.studentname?.toLowerCase().includes(studentSearch.toLowerCase()));
    }, [studentDropdown, studentSearch]);

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen space-y-8 bg-gray-50/30 p-6'>
            <CollapsibleSection
                title='TC Custom Report'
                description='Generate detailed transfer certificate for a student'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='rounded-xl bg-white p-8'>
                    <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-8'>
                            <div className='space-y-3'>
                                <Label className='flex items-center font-bold text-gray-700 text-sm'>
                                    Left Year:<span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Select value={asmayId?.toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 shadow-sm'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(initialData?.data as any)?.accyear?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4'>
                                <Label className='font-bold text-indigo-600 text-xs uppercase tracking-wider'>Search By:</Label>
                                <RadioGroup
                                    value={admName}
                                    onValueChange={(v) => {
                                        setAdmName(v);
                                        fetchStudents(asmayId, v, tcTempPer);
                                    }}
                                    className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='regno' id='regno' />
                                        <Label htmlFor='regno' className='cursor-pointer font-medium'>
                                            Adm. No
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='stdname' id='stdname' />
                                        <Label htmlFor='stdname' className='cursor-pointer font-medium'>
                                            Student Name
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-8'>
                            <div className='space-y-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4'>
                                <Label className='font-bold text-orange-600 text-xs uppercase tracking-wider'>Student Type:</Label>
                                <RadioGroup
                                    value={tcTempPer}
                                    onValueChange={(v) => {
                                        setTcTempPer(v);
                                        fetchStudents(asmayId, admName, v);
                                    }}
                                    className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='temp' id='temp' />
                                        <Label htmlFor='temp' className='cursor-pointer font-medium'>
                                            Temporary
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='per' id='per' />
                                        <Label htmlFor='per' className='cursor-pointer font-medium'>
                                            Permanent
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='space-y-3'>
                                <Label className='flex items-center font-bold text-gray-700 text-sm'>
                                    Student:<span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={amstId?.toString()}
                                    onValueChange={handleStudentChange}
                                    disabled={studentDropdown.length === 0}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 shadow-sm'>
                                        <SelectValue placeholder={studentDropdown.length > 0 ? 'Select Student' : 'No students found'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className='border-b p-2'>
                                            <div className='relative'>
                                                <Search className='absolute top-2.5 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                                <Input
                                                    placeholder='Search student...'
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    className='h-8 pl-8 text-xs'
                                                />
                                            </div>
                                        </div>
                                        {filteredDropdown.map((s: any) => (
                                            <SelectItem key={s.amsT_Id} value={s.amsT_Id.toString()}>
                                                {s.studentname} {s.astC_TCDate ? `(${format(new Date(s.astC_TCDate), 'dd-MMM-yyyy')})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator className='my-8' />

                    <div className='flex justify-center gap-4'>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={getTCDetailsMutation.isPending || !amstId}
                            className='h-11 rounded-full bg-indigo-600 px-10 shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 active:scale-95'>
                            {getTCDetailsMutation.isPending ? (
                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                            ) : (
                                <FileText className='mr-2 h-5 w-5' />
                            )}
                            REPORT
                        </Button>
                        <Button
                            variant='outline'
                            onClick={() => window.location.reload()}
                            className='h-11 rounded-full border-gray-200 px-10 hover:bg-gray-50'>
                            <RotateCcw className='mr-2 h-5 w-5' />
                            CANCEL
                        </Button>
                        {printFlag && (
                            <Button variant='secondary' onClick={() => handlePrint()} className='h-11 rounded-full px-10 shadow-lg'>
                                <Printer className='mr-2 h-5 w-5' />
                                PRINT
                            </Button>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {/* TC Preview Section */}
            {printFlag && report && (
                <Card className='overflow-hidden border-none shadow-2xl'>
                    <CardContent className='p-0'>
                        <div className='flex justify-center bg-gray-100 p-4 md:p-8'>
                            <div
                                ref={printRef}
                                className='print-content bg-white p-8 shadow-sm sm:p-12'
                                style={{ width: '176mm', minHeight: '250mm', fontFamily: '"Times New Roman", Times, serif' }}>
                                <div className='relative flex h-full flex-col'>
                                    <h1 className='mt-12 mb-8 text-center'>
                                        <span
                                            style={{
                                                borderBottom: '2px solid black',
                                                paddingBottom: '2px',
                                                fontSize: '26px',
                                                fontWeight: 'bold'
                                            }}>
                                            TRANSFER CERTIFICATE
                                        </span>
                                    </h1>

                                    <div className='pt-2 pb-1'>
                                        <div className='flex items-center justify-between px-2 font-bold text-[15px] text-black'>
                                            <div>Admission Number: {report.amst_admno}</div>
                                            <div>Sl. No: {report.astc_tcno}</div>
                                        </div>
                                    </div>
                                    <div className='mb-6 border-black border-t'></div>

                                    <div className='mb-4 space-y-2.5 text-[15px] text-black leading-relaxed'>
                                        {[
                                            { label: 'Name of Pupil', value: report.studentname?.trim(), num: '1' },
                                            { label: "Father's Name", value: report.amst_fathername, num: '2' },
                                            { label: "Mother's Name", value: report.amst_mothername, num: '3' },
                                            {
                                                label: 'Religion/Caste',
                                                value: `${report.religion || '-'} / ${report.caste || '-'}`,
                                                num: '4'
                                            },
                                            { label: 'Nationality', value: report.nationality || 'Indian', num: '5' },
                                            {
                                                label: 'Date of Birth',
                                                value: report.amst_dob ? format(new Date(report.amst_dob), 'dd-MMM-yyyy') : '',
                                                num: '6'
                                            },
                                            { label: 'School Last Attended', value: report.institutionname || 'N/A', num: '7' },
                                            {
                                                label: 'Date Of Admission',
                                                value: report.amst_date ? format(new Date(report.amst_date), 'dd-MMM-yyyy') : '',
                                                num: '8'
                                            },
                                            { label: 'Conduct', value: report.astc_conduct || 'good', num: '9' },
                                            {
                                                label: 'Date Of Leaving',
                                                value: report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : '',
                                                num: '10'
                                            },
                                            {
                                                label: 'Studying In',
                                                value: `${report.classname || report.last_class_studied || '-'} ${report.asmc_sectionname || ''}`,
                                                num: '11'
                                            },
                                            { label: 'Remarks', value: report.astc_remarks || '-', num: '12' }
                                        ].map((item, i) => (
                                            <div key={i} className='grid grid-cols-[50px_180px_20px_1fr] items-baseline'>
                                                <div className='mr-6 text-right'>{item.num}</div>
                                                <div className='font-medium'>{item.label}</div>
                                                <div className='text-center'>:</div>
                                                <div className='pl-2'>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='mb-10 border-black border-t-2'></div>
                                    <div className='mt-2 space-y-12'>
                                        <div className='flex items-center justify-between px-4 font-medium text-[15px] text-black'>
                                            <div>PEN No.</div>
                                            <div>SATS No.</div>
                                        </div>

                                        <div className='whitespace-nowrap px-2 text-[15px] text-black leading-relaxed'>
                                            Certified that the above-mentioned information is in accordance with the school register.
                                        </div>

                                        <div className='mt-24 flex items-center justify-between px-4 text-black'>
                                            <div className='font-medium text-[15px]'>
                                                Date:{' '}
                                                {report.astc_tcissuedate
                                                    ? format(new Date(report.astc_tcissuedate), 'dd-MMM-yyyy')
                                                    : format(new Date(), 'dd-MMM-yyyy')}
                                            </div>
                                            <div className='font-bold text-[15px]'>PRINCIPAL</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

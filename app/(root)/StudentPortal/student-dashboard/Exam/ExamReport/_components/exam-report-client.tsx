'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    getAcademicYearList,
    getExamDataforExamReport,
    getExamReportDataforExamReport,
    getSubjectDataforExamReport
} from '@/server/exam/exam-module/reports/StudentportalExamReport';
import type { AcademicYear, Exam, ExamReportData } from '@/types/exam/reports';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ExamReportClientProps {
    initialYears: AcademicYear[];
    initialExams: Exam[];
    rcode: string | number;
}

export default function ExamReportClient() {
    // State
    const [detailsrdo, setDetailsrdo] = useState<'EWAS' | 'SWAE' | 'ESW' | 'OVERALL'>('EWAS');

    // Selections
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedExam, setSelectedExam] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [subjectDataDropDown, setSubjectDataDropDown] = useState<any[]>([]);
    const [examDataDropDown, setExamDataDropDown] = useState<any[]>([]);
    const [isExamDropDownLoading, setIsExamDropDownLoading] = useState<boolean>(false);
    const [isSubjectDropDownLoading, setIsSubjectDropDownLoading] = useState<boolean>(false);

    // Report Data State
    const [reportData, setReportData] = useState<ExamReportData[]>([]);
    const [isReportGenerated, setIsReportGenerated] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);

    // Initial Data Load
    useEffect(() => {
        const fetchLoadData = async () => {
            try {
                const response = await getAcademicYearList();
                console.log('Load Data Response:', response);
                // Handle response if it's directly an array or wrapped in data property
                const data = Array.isArray(response) ? response : (response as any)?.data || [];
                setAcademicYears(data);
            } catch (error) {
                console.error('Failed to fetch load data:', error);
            }
        };
        fetchLoadData();
    }, []);

    // Filter Logic
    const handleRadioChange = (value: 'EWAS' | 'SWAE' | 'ESW' | 'OVERALL') => {
        setDetailsrdo(value);
        setSelectedYear('');
        setSelectedExam('');
        setSelectedSubject('');
        setReportData([]);
        setIsReportGenerated(false);
    };

    useEffect(() => {
        if (!selectedYear) {
            setExamDataDropDown([]);
            return;
        }

        const fetchExam = async () => {
            setIsExamDropDownLoading(true);
            try {
                const response = await getExamDataforExamReport(Number(selectedYear), detailsrdo);
                const data = Array.isArray(response) ? response : (response as any)?.data || [];
                setExamDataDropDown(data);
            } catch (error) {
                console.error('Failed to fetch exam data:', error);
                setExamDataDropDown([]);
            } finally {
                setIsExamDropDownLoading(false);
            }
        };

        fetchExam();
    }, [selectedYear]);

    useEffect(() => {
        if (!selectedYear) {
            setSubjectDataDropDown([]);
            return;
        }

        const fetchSubject = async () => {
            setIsSubjectDropDownLoading(true);
            try {
                const response = await getSubjectDataforExamReport(Number(selectedYear));
                console.log('Subject API Response:', response);
                const data = Array.isArray(response) ? response : (response as any)?.data || [];
                console.log('Parsed Subject Data:', data);
                setSubjectDataDropDown(data);
            } catch (error) {
                console.error('Failed to fetch subject data:', error);
                setSubjectDataDropDown([]);
            } finally {
                setIsSubjectDropDownLoading(false);
            }
        };

        fetchSubject();
    }, [selectedYear]);

    const handleGenerateReport = async () => {
        if (!selectedYear) return;

        setIsReportLoading(true);
        setIsReportGenerated(false);
        setReportData([]);

        try {
            const payload = {
                Type: detailsrdo,
                ASMAY_Id: Number(selectedYear),
                EME_Id: selectedExam ? Number(selectedExam) : 0,
                ISMS_Id: selectedSubject ? Number(selectedSubject) : 0
            };

            console.log('Generating Report with payload:', payload);
            const response = await getExamReportDataforExamReport(payload);
            console.log('Report Response:', response);

            let reportList = [];
            if (Array.isArray(response)) {
                reportList = response;
            } else if (response && (response as any).data) {
                // Handle nested data structures
                const responseData = (response as any).data;
                reportList = Array.isArray(responseData) ? responseData : responseData.examReportList || [];
            } else {
                reportList = [];
            }

            if (reportList.length > 0) {
                setReportData(reportList);
                setIsReportGenerated(true);
            } else {
                setReportData([]);
                setIsReportGenerated(true); // Show "No Records Found"
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            setReportData([]);
        } finally {
            setIsReportLoading(false);
        }
    };

    // Helper to get Subject Color (Ported from legacy)
    const subjectColorList = [
        'linear-gradient(135deg, #FFD700, #FFA500)', // Gold-Orange
        'linear-gradient(135deg, #4CAF50, #2E7D32)', // Green
        'linear-gradient(135deg, #2196F3, #1565C0)', // Blue
        'linear-gradient(135deg, #FF5722, #E64A19)', // Orange-Red
        'linear-gradient(135deg, #9C27B0, #6A1B9A)', // Purple
        'linear-gradient(135deg, #00BCD4, #0097A7)', // Teal
        'linear-gradient(135deg, #E91E63, #C2185B)', // Pink
        'linear-gradient(135deg, #607D8B, #455A64)' // Grey-Blue
    ];

    const getSubjectColor = (subjectName: string) => {
        let hash = 0;
        for (let i = 0; i < subjectName.length; i++) {
            hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % subjectColorList.length;
        return subjectColorList[index];
    };

    return (
        <div className='space-y-6'>
            {/* Filter Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Exam Report</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {/* Radio Options */}
                    <div className='flex justify-center rounded-lg bg-muted/20 p-4'>
                        <RadioGroup
                            value={detailsrdo}
                            onValueChange={(val: any) => handleRadioChange(val)}
                            className='flex flex-wrap gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='EWAS' id='r1' />
                                <Label htmlFor='r1' className='cursor-pointer'>
                                    Exam Wise
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='SWAE' id='r2' />
                                <Label htmlFor='r2' className='cursor-pointer'>
                                    Subject Wise
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='ESW' id='r3' />
                                <Label htmlFor='r3' className='cursor-pointer'>
                                    Exam-Subject Wise
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='OVERALL' id='r4' />
                                <Label htmlFor='r4' className='cursor-pointer'>
                                    Overall
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className='mx-auto grid max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {detailsrdo !== 'OVERALL' && (
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {academicYears &&
                                            academicYears.length > 0 &&
                                            academicYears.map((y: any) => (
                                                <SelectItem key={y.asmaY_Id || y.ASMAY_Id} value={String(y.asmaY_Id || y.ASMAY_Id)}>
                                                    {y.asmaY_Year || y.ASMAY_Year}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(detailsrdo === 'EWAS' || detailsrdo === 'ESW') && (
                            <div className='space-y-2'>
                                <Label>
                                    Exam <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={selectedExam}
                                    onValueChange={setSelectedExam}
                                    disabled={isExamDropDownLoading || !selectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isExamDropDownLoading ? 'Loading...' : 'Select Exam'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {examDataDropDown?.map((e: any) => (
                                            <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                {e.emE_ExamName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(detailsrdo === 'SWAE' || detailsrdo === 'ESW') && (
                            <div className='space-y-2'>
                                <Label>
                                    Subject <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isSubjectDropDownLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isSubjectDropDownLoading ? 'Loading...' : 'Select Subject'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectDataDropDown.map((s) => (
                                            <SelectItem key={s.ismS_Id} value={String(s.ismS_Id)}>
                                                {s.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className='flex justify-center space-x-4 pt-4'>
                        <Button onClick={handleGenerateReport} disabled={isReportLoading}>
                            {isReportLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Report
                        </Button>
                        <Button variant='destructive' onClick={() => handleRadioChange('EWAS')}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Report Display */}
            {isReportGenerated && reportData.length > 0 && (
                <div className='space-y-6'>
                    {/* Data Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Report Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-[60px] text-center'>Sl.No.</TableHead>
                                            {detailsrdo === 'EWAS' && <TableHead>Subjects</TableHead>}
                                            {detailsrdo === 'SWAE' && <TableHead>Exam</TableHead>}
                                            {detailsrdo === 'ESW' && <TableHead>Year</TableHead>}
                                            {detailsrdo === 'OVERALL' && (
                                                <>
                                                    <TableHead>Year</TableHead>
                                                    <TableHead>Exam Name</TableHead>
                                                </>
                                            )}

                                            <TableHead className='text-center'>Max Marks</TableHead>

                                            {detailsrdo !== 'OVERALL' && (
                                                <>
                                                    <TableHead className='text-center'>Min Marks</TableHead>
                                                    <TableHead className='text-center'>Obtained Marks</TableHead>
                                                    <TableHead className='text-center'>Grade</TableHead>
                                                    <TableHead className='text-center'>Result</TableHead>
                                                </>
                                            )}

                                            {detailsrdo === 'OVERALL' && (
                                                <>
                                                    <TableHead className='text-center'>Obtained Marks</TableHead>
                                                    <TableHead className='text-center'>Grade</TableHead>
                                                    <TableHead className='text-center'>Percentage</TableHead>
                                                    <TableHead className='text-center'>Class Rank</TableHead>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className='text-center'>{index + 1}</TableCell>
                                                {detailsrdo === 'EWAS' && <TableCell>{row.ISMS_SubjectName}</TableCell>}
                                                {detailsrdo === 'SWAE' && <TableCell>{row.EME_ExamName}</TableCell>}
                                                {detailsrdo === 'ESW' && <TableCell>{row.ASMAY_Year}</TableCell>}
                                                {detailsrdo === 'OVERALL' && (
                                                    <>
                                                        <TableCell>{row.ASMAY_Year}</TableCell>
                                                        <TableCell>{row.EME_ExamName}</TableCell>
                                                    </>
                                                )}

                                                <TableCell className='text-center'>{row.ESTMPS_MaxMarks}</TableCell>

                                                {detailsrdo !== 'OVERALL' && (
                                                    <>
                                                        <TableCell className='text-center'>{row.EYCES_MinMarks}</TableCell>
                                                        <TableCell className='text-center font-bold'>
                                                            {row.ESTMPS_PassFailFlg === 'Pass'
                                                                ? row.ESTMPS_ObtainedMarks
                                                                : row.ESTMPS_PassFailFlg}
                                                        </TableCell>
                                                        <TableCell className='text-center'>{row.ESTMPS_ObtainedGrade}</TableCell>
                                                        <TableCell
                                                            className={`text-center font-bold ${row.ESTMPS_PassFailFlg === 'Pass' ? 'text-green-600' : 'text-red-500'}`}>
                                                            {row.ESTMPS_PassFailFlg}
                                                        </TableCell>
                                                    </>
                                                )}

                                                {detailsrdo === 'OVERALL' && (
                                                    <>
                                                        <TableCell className='text-center'>{row.ESTMPS_ObtainedMarks}</TableCell>
                                                        <TableCell className='text-center'>{row.ESTMP_TotalGrade}</TableCell>
                                                        <TableCell className='text-center'>{row.ESTMP_Percentage}%</TableCell>
                                                        <TableCell className='text-center'>{row.ESTMP_ClassRank}</TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Graphs & Hover Cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Graph</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Hover Cards */}
                            <div className='mb-8 flex flex-wrap justify-center gap-4'>
                                {reportData.map((row, i) => (
                                    <div
                                        key={i}
                                        className='relative min-w-[300px] max-w-[350px] overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl'
                                        style={{ background: getSubjectColor(row.ISMS_SubjectName || row.EME_ExamName || 'Default') }}>
                                        <div className='mb-4 rounded-lg bg-white/20 p-2 text-center font-bold backdrop-blur-sm'>
                                            {detailsrdo === 'EWAS' ? row.ISMS_SubjectName : row.EME_ExamName}
                                        </div>

                                        <div className='flex items-center gap-4'>
                                            {/* Circular Progress Placeholder - Recharts Pie could work but SVG is simpler for this specific layout */}
                                            <div className='relative h-24 w-24'>
                                                <svg className='h-full w-full' viewBox='0 0 36 36'>
                                                    <path
                                                        className='text-white/30'
                                                        d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        strokeWidth='4'
                                                    />
                                                    <path
                                                        className='text-white drop-shadow-md'
                                                        strokeDasharray={`${(row.ESTMPS_ObtainedMarks / row.ESTMPS_MaxMarks) * 100}, 100`}
                                                        d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        strokeWidth='4'
                                                    />
                                                </svg>
                                                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                                                    <span className='font-bold text-xl'>{row.ESTMPS_ObtainedMarks}</span>
                                                    <span className='text-xs opacity-80'>/ {row.ESTMPS_MaxMarks}</span>
                                                </div>
                                            </div>

                                            <div className='flex-1 space-y-1 text-sm'>
                                                <div className='flex justify-between'>
                                                    <span>Max:</span> <b>{row.ESTMPS_MaxMarks}</b>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span>Min:</span> <b>{row.EYCES_MinMarks}</b>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span>Class Highest:</span> <b>{row.ESTMPS_ClassHighest}</b>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span>Class Avg:</span> <b>{row.ESTMPS_ClassAverage}</b>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bar Chart using Recharts */}
                            <div className='h-[400px] w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray='3 3' />
                                        <XAxis dataKey='ISMS_SubjectName' />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: '#333' }}
                                        />
                                        <Legend />
                                        <Bar dataKey='ESTMPS_ClassAverage' name='Class Avg' fill='#8884d8' radius={[4, 4, 0, 0]} />
                                        <Bar dataKey='ESTMPS_SectionAverage' name='Section Avg' fill='#82ca9d' radius={[4, 4, 0, 0]} />
                                        <Bar dataKey='ESTMPS_ObtainedMarks' name='Obtained' fill='#ffc658' radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isReportGenerated && reportData.length === 0 && !isReportLoading && (
                <div className='rounded-lg border bg-muted/10 p-8 text-center text-muted-foreground'>No Records Found</div>
            )}
        </div>
    );
}

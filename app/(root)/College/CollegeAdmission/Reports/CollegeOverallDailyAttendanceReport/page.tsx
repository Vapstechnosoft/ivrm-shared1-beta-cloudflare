'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    useCollegeOverallDailyAttendanceInitialData,
    useCollegeOverallDailyAttendanceReport,
    useCollegeStudentAbsentDetails
} from '@/hooks/college/useCollegeOverallDailyAttendanceReport';
import { ensureArray, exportToExcel } from '@/lib/utils';
import type {
    AbsenteeTeacherRecord,
    AttendanceRecord,
    CollegeOverallDailyAttendanceFormData
} from '@/schemas/college/college-overall-daily-attendance-report.schema';
import { format } from 'date-fns';
import { ChevronDown, FileCheck, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AbsenteeDetailsModal } from './_components/absentee-details-modal';
import { FilterForm } from './_components/filter-form';
import { ReportGrid } from './_components/report-grid';

export default function CollegeOverallDailyAttendanceReportPage() {
    // Queries & Mutations
    const { data: initialData, isLoading: isInitLoading } = useCollegeOverallDailyAttendanceInitialData();
    const reportMutation = useCollegeOverallDailyAttendanceReport();
    const absentDetailsMutation = useCollegeStudentAbsentDetails();

    // UI state
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [reportRecords, setReportRecords] = useState<AttendanceRecord[] | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedYearId, setSelectedYearId] = useState<number>(0);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRowForDetails, setSelectedRowForDetails] = useState<AttendanceRecord | null>(null);
    const [absenteeList, setAbsenteeList] = useState<AbsenteeTeacherRecord[]>([]);

    // Parse initial dropdowns & default academic year
    const { academicYears, defaultYearId } = useMemo(() => {
        const raw = (initialData as any)?.data || initialData || {};
        const acdList = ensureArray<any>(raw.acdlist || raw.academicList);
        const defaultList = ensureArray<any>(raw.academicListdefault || raw.allyear1);

        let defId = 0;
        if (defaultList.length > 0 && acdList.length > 0) {
            const found = acdList.find((item) =>
                defaultList.some((def) => Number.parseInt(String(def.asmaY_Id)) === Number.parseInt(String(item.asmaY_Id)))
            );
            if (found) {
                defId = found.asmaY_Id;
            }
        }

        if (!defId && acdList.length > 0) {
            defId = acdList[0].asmaY_Id;
        }

        return {
            academicYears: acdList,
            defaultYearId: defId
        };
    }, [initialData]);

    // Active academic year label
    const selectedYearName = useMemo(() => {
        const found = academicYears.find(
            (y) => Number.parseInt(String(y.asmaY_Id)) === Number.parseInt(String(selectedYearId || defaultYearId))
        );
        return found ? found.asmaY_Year : '';
    }, [academicYears, selectedYearId, defaultYearId]);

    // Handle Form Submit
    const handleFilterSubmit = (values: CollegeOverallDailyAttendanceFormData) => {
        setSelectedYearId(values.asmaY_Id);
        setSelectedDate(values.fromdate);
        setSelectedRowIds(new Set());

        const d = new Date(values.fromdate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const selectedDateStr = `${year}-${month}-${day}T00:00:00.000Z`;

        const payload = {
            asmaY_Id: values.asmaY_Id,
            amB_Id: 0,
            amcO_Id: 0,
            fromDate: selectedDateStr,
            fromdate: selectedDateStr,
            temp_branchDTO: [
                {
                    amB_Id: 0,
                    amB_BranchName: 'string'
                }
            ]
        };

        reportMutation.mutate(payload, {
            onSuccess: (res: any) => {
                console.log('[CollegeOverallDailyAttendanceReport] Response:', res);
                const raw = res?.data?.data || res?.data || res;
                const list = ensureArray<AttendanceRecord>(
                    raw?.getstudentlist1 ||
                    raw?.getstudentlist1?.$values ||
                    res?.data?.getstudentlist1 ||
                    res?.data?.getstudentlist1?.$values ||
                    res?.getstudentlist1 ||
                    res?.getstudentlist1?.$values ||
                    raw?.collegestudentAttendanceList ||
                    raw?.collegestudentAttendanceList?.$values ||
                    res?.collegestudentAttendanceList
                );

                if (Array.isArray(list) && list.length > 0) {
                    setReportRecords(list);
                    toast.success('Attendance report generated successfully!');
                } else {
                    setReportRecords([]);
                    toast.info('No records found for the selected criteria');
                }
            },
            onError: (err: any) => {
                console.error('[CollegeOverallDailyAttendanceReport] Error:', err);
                toast.error('Failed to generate report. Please try again.');
                setReportRecords([]);
            }
        });
    };

    // Handle Reset
    const handleReset = () => {
        setReportRecords(null);
        setSelectedRowIds(new Set());
        setSelectedRowForDetails(null);
        setAbsenteeList([]);
        setIsFormOpen(true);
    };

    // Selection handlers for main grid
    const handleToggleSelectRow = (_record: AttendanceRecord, rowId: string | number) => {
        setSelectedRowIds((prev) => {
            const next = new Set(prev);
            if (next.has(rowId)) {
                next.delete(rowId);
            } else {
                next.add(rowId);
            }
            return next;
        });
    };

    const handleToggleSelectAll = (checked: boolean, filteredRecords: AttendanceRecord[]) => {
        const newSet = new Set<string | number>();
        if (checked) {
            filteredRecords.forEach((r, idx) => newSet.add(r.Id ?? idx));
        }
        setSelectedRowIds(newSet);
    };

    // Export Main Grid to Excel
    const handleExportMainGrid = () => {
        if (!reportRecords || reportRecords.length === 0) {
            toast.warning('No report data available to export');
            return;
        }

        const selectedRecords = reportRecords.filter((r, idx) => selectedRowIds.has(r.Id ?? idx));

        if (selectedRecords.length === 0) {
            toast.warning('Please Select Records to be Exported');
            return;
        }

        const exportData = selectedRecords.map((item, index) => ({
            'SL. No.': index + 1,
            'Branch - sem': `${item.AMB_BranchName} - ${item.AMSE_SEMName}`,
            Strength: item.TOTAL,
            Present: item.PRESENT,
            Absent: item.ABSENT
        }));

        const filename = `College_Overall_Daily_Attendance_${format(selectedDate, 'dd_MM_yyyy')}`;
        exportToExcel(exportData, filename);
        toast.success(`Exported ${selectedRecords.length} record(s) to Excel`);
    };

    // Handle View Details Click
    const handleViewDetails = (user: AttendanceRecord) => {
        setSelectedRowForDetails(user);
        setIsDetailsModalOpen(true);

        const d = new Date(selectedDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const payload = {
            AMB_Id: user.AMB_Id,
            AMSE_Id: user.AMSE_Id,
            ASMAY_Id: selectedYearId || defaultYearId,
            FromDate: dateStr,
            fromdate: dateStr
        };

        absentDetailsMutation.mutate(payload, {
            onSuccess: (res: any) => {
                console.log('[AbsenteeDetails] Response:', res);
                const raw = res?.data?.data || res?.data || res;
                const rawList = ensureArray<AbsenteeTeacherRecord>(
                    raw?.getstudentlist1 ||
                    raw?.getstudentlist1?.$values ||
                    res?.data?.getstudentlist1 ||
                    res?.data?.getstudentlist1?.$values ||
                    res?.getstudentlist1 ||
                    res?.getstudentlist1?.$values ||
                    raw?.studentAbsent_teacherList ||
                    raw?.studentAbsent_teacherList?.$values ||
                    res?.data?.studentAbsent_teacherList ||
                    res?.studentAbsent_teacherList
                );

                // Filter absentees where ABSENT >= 1 as in original code
                const hasAbsentFlags = rawList.some((item) => item.ABSENT !== undefined && item.ABSENT !== null);
                const filtered = hasAbsentFlags
                    ? rawList.filter((item) => Number(item.ABSENT) >= 1)
                    : rawList;

                setAbsenteeList(filtered.length > 0 ? filtered : rawList);
            },
            onError: (err: any) => {
                console.error('[AbsenteeDetails] Error:', err);
                toast.error('Failed to load student absent details.');
                setAbsenteeList([]);
            }
        });
    };

    return (
        <div className='fade-in flex min-h-screen animate-in flex-col gap-6 bg-slate-50/60 p-4 duration-500 sm:p-6 lg:p-8'>
            {/* Filter Card */}
            <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className='w-full'>
                <Card className='rounded-2xl border border-slate-200/90 bg-white/95 shadow-md backdrop-blur'>
                    <CardHeader className='flex flex-row items-center justify-between border-slate-100 border-b px-6 py-4'>
                        <div className='space-y-0.5'>
                            <CardTitle className='flex items-center gap-2 font-bold text-lg text-slate-800'>
                                <FileCheck className='h-5 w-5 text-primary' />
                                Overall Daily Attendance Report:
                            </CardTitle>
                            <CardDescription className='text-slate-500 text-xs'>
                                Select academic year and date to generate the attendance report
                            </CardDescription>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-9 w-9 rounded-full p-0 hover:bg-slate-100'>
                                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className='p-6 sm:p-8'>
                            {isInitLoading ? (
                                <div className='flex flex-col items-center justify-center gap-2 py-8 text-slate-500'>
                                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                    <span className='font-medium text-xs'>Loading form criteria...</span>
                                </div>
                            ) : (
                                <FilterForm
                                    academicYears={academicYears}
                                    defaultYearId={defaultYearId}
                                    onSubmit={handleFilterSubmit}
                                    onReset={handleReset}
                                    onExport={handleExportMainGrid}
                                    isGenerating={reportMutation.isPending}
                                    hasReportData={Boolean(reportRecords && reportRecords.length > 0)}
                                />
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Report Grid Section */}
            {reportRecords && reportRecords.length > 0 && (
                <div className='slide-in-from-bottom-6 animate-in duration-500'>
                    <ReportGrid
                        records={reportRecords}
                        selectedRowIds={selectedRowIds}
                        onToggleSelectRow={handleToggleSelectRow}
                        onToggleSelectAll={handleToggleSelectAll}
                        onViewDetails={handleViewDetails}
                        onExport={handleExportMainGrid}
                    />
                </div>
            )}

            {/* Absentee and Teacher Details Dialog Modal */}
            <AbsenteeDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                selectedRow={selectedRowForDetails}
                academicYearName={selectedYearName}
                selectedDate={selectedDate}
                absenteeList={absenteeList}
                isLoading={absentDetailsMutation.isPending}
            />
        </div>
    );
}

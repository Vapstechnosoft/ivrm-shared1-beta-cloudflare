'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getSubjectWiseDetails } from '@/server/timetable/reports/subjectwisett';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SubjectWiseForm from './_components/subjectwise-form';
import SubjectWiseReportGrid from './_components/subjectwise-report-grid';
import SubjectWiseReportPrintable from './_components/subjectwise-report-printable';

export default function SubjectWiseReportPage() {
    const [initialData, setInitialData] = useState<any>({});
    const [reportData, setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getSubjectWiseDetails({});
                if (data) {
                    setInitialData({
                        acaYear: data.year,
                        classDrp: data.clsdrp,
                        subjectDrp: data.subdrp
                    });
                } else {
                    toast.error('No details received from server.');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to fetch initial details.');
            }
        };
        fetchDetails();
    }, []);

    const handleReportGenerated = (response: any, payload: any) => {
        const data = response.data || response;
        if (data?.tt?.length > 0) {
            processReportData(data, payload.subarray);
            setIsReportVisible(true);
            toast.success('Report generated successfully');
        } else if (data?.gridweeks?.length > 0 || data?.allperiods?.length > 0) {
            processReportData(data, payload.subarray);
            setIsReportVisible(true);
            toast.success('Report generated successfully (No Timetable Entries)');
        } else {
            const msg =
                response.success === false && response.message ? response.message : 'TimeTable is Not Generated For Selected Details !!!!';
            toast.error(msg);
            setReportData([]);
            setIsReportVisible(false);
        }
    };

    const handleCancel = () => {
        setReportData([]);
        setIsReportVisible(false);
    };

    const processReportData = (response: any, selectedSubjects: any[]) => {
        const processedList: any[] = [];

        // Helper to find the object containing TimeTable data (following classwise-report logic)
        const findRoot = (obj: any): any => {
            if (!obj) return null;
            const hasData = (o: any) =>
                o &&
                ((o.tt && Array.isArray(o.tt)) ||
                    (o.TT && Array.isArray(o.TT)) ||
                    (o.timetable && Array.isArray(o.timetable)) ||
                    (o.Table4 && Array.isArray(o.Table4)));
            if (hasData(obj)) return obj;
            if (obj.data) return findRoot(obj.data);
            return obj;
        };

        const root = findRoot(response);

        // Map alternate keys (gridweeks, allperiods, etc.)
        const getList = (obj: any, ...keys: string[]): any[] => {
            if (!obj) return [];
            for (const k of keys) {
                if (obj[k] && Array.isArray(obj[k])) return obj[k];
                const lowerK = k.toLowerCase();
                const foundKey = Object.keys(obj).find((key) => key.toLowerCase() === lowerK);
                if (foundKey && Array.isArray(obj[foundKey])) return obj[foundKey];
            }
            return [];
        };

        const timetable = getList(root, 'tt', 'TT', 'timetable', 'Table4', 'Table');
        const periodList = getList(root, 'allperiods', 'periodslst', 'periodList', 'periodsLst', 'Table1');
        const gridWeeks = getList(root, 'gridweeks', 'gridWeeks', 'day_list', 'day_List', 'Table');
        const breakList = getList(root, 'tT_Break_list', 'breakList', 'Table2', 'tt_break_list');

        console.log('SubjectWise Report Analysis:', {
            periods: periodList.length,
            days: gridWeeks.length,
            tt: timetable.length
        });

        const subjectsToProcess = Array.isArray(selectedSubjects) ? selectedSubjects : [];

        subjectsToProcess.forEach((sub: any) => {
            const subId = sub.ismS_Id || sub.ISM_Id || sub.isms_Id;
            const subName = sub.ismS_SubjectName || sub.subjectName || sub.subject || '';

            const tableRows: any[] = [];
            const periodSequence: any[] = [];

            // Reconstruct timeline (Periods + Breaks)
            periodList.forEach((period: any) => {
                const pedId = period.ttmP_Id || period.TTMP_Id || period.ped_id;
                const pedName = period.ttmP_PeriodName || period.periodName || period.ped_name;

                periodSequence.push({
                    ped_id: pedId,
                    ped_name: String(pedName),
                    is_break: false
                });

                // Check for breaks
                const breakItem = breakList.find((b: any) => {
                    const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                    return Number.parseFloat(String(pedName)) === Number.parseFloat(String(bAfter));
                });

                if (breakItem) {
                    periodSequence.push({
                        ped_id: 0,
                        ped_name: 'Break',
                        is_break: true,
                        brk_name: breakItem.ttmB_BreakName || 'Break'
                    });
                }
            });

            gridWeeks.forEach((day: any) => {
                const rowCells: any[] = [];
                const dayId = day.ttmD_Id || day.TTMD_Id || day.day_id || day.ttmd_id;
                const dayName = day.ttmD_DayName || day.dayName || day.day_name || '';

                periodSequence.forEach((periodCol: any) => {
                    let cellContent = '';
                    let cellColor = 'black';

                    if (!periodCol.is_break) {
                        const entries = timetable.filter((t: any) => {
                            const tPedId = t.ttmP_Id || t.TTMP_Id || t.ped_id;
                            const tDayId = t.ttmD_Id || t.TTMD_Id || t.day_id;
                            const tSubId = t.ismS_Id || t.ISM_Id || t.isms_Id;

                            return (
                                Number(tPedId) === Number(periodCol.ped_id) &&
                                Number(tDayId) === Number(dayId) &&
                                Number(tSubId) === Number(subId)
                            );
                        });

                        if (entries.length > 0) {
                            cellContent = entries
                                .map((t: any) => {
                                    const cls = t.asmcL_ClassName || t.className || t.asmcl_classname || '';
                                    const sec = t.asmC_SectionName || t.sectionName || t.asmc_sectionname || '';
                                    const stf = t.staffName || t.empName || t.hrmE_EmployeeName || '';
                                    return `${cls} : ${sec} : ${stf}`;
                                })
                                .join(' && ');
                        }
                    } else {
                        cellContent = periodCol.brk_name || 'Break';
                        cellColor = 'red';
                    }

                    rowCells.push({
                        ...periodCol,
                        content: cellContent,
                        color: cellColor
                    });
                });

                tableRows.push({ dayName: String(dayName), cells: rowCells });
            });

            processedList.push({
                header: `Subject : ${subName}`,
                periodList: periodSequence,
                rows: tableRows
            });
        });

        setReportData(processedList);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Subject Wise TimeTable Report' defaultOpen={true} className='shadow-lg'>
                <SubjectWiseForm initialData={initialData} onReportGenerated={handleReportGenerated} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Report Grid' defaultOpen={true} className='shadow-lg'>
                    <SubjectWiseReportGrid reportData={reportData} onPrint={handlePrint} />
                    <SubjectWiseReportPrintable ref={printRef} reportData={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}

'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import ClassWiseForm from './_components/classwise-form';
import ClassWiseReportGrid from './_components/classwise-report-grid';
import ClassWiseReportPrintable from './_components/classwise-report-printable';

export default function ClassWiseReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (response: any, payload: any) => {
        const data = response.data || response;
        // Robust check: as long as we have periods and days, we can show the structure
        const hasData =
            data &&
            ((data.tt && data.tt.length > 0) ||
                (data.TT && data.TT.length > 0) ||
                (data.timetable && data.timetable.length > 0) ||
                (data.allperiods && data.allperiods.length > 0) ||
                (data.gridweeks && data.gridweeks.length > 0) ||
                (data.Table4 && data.Table4.length > 0));

        if (hasData) {
            processReportData(data, payload.classarray, payload.sectionarray);
            setIsReportVisible(true);
            toast.success('Report generated successfully');
        } else {
            const msg = response.message || 'TimeTable data is not available for selected details!!!!';
            toast.error(msg);
            setReportData([]);
            setIsReportVisible(false);
        }
    };

    const handleCancel = () => {
        setReportData([]);
        setIsReportVisible(false);
    };

    const processReportData = (response: any, selectedClasses: any[], selectedSections: any[]) => {
        const processedList: any[] = [];

        // Helper to find the object containing TimeTable data (VAPS nesting varies)
        const findRoot = (obj: any): any => {
            if (!obj) return null;
            // Check for core keys at this level
            const hasData = (o: any) =>
                o &&
                ((o.tt && Array.isArray(o.tt)) ||
                    (o.TT && Array.isArray(o.TT)) ||
                    (o.timetable && Array.isArray(o.timetable)) ||
                    (o.allperiods && Array.isArray(o.allperiods)) ||
                    (o.gridweeks && Array.isArray(o.gridweeks)) ||
                    (o.Table4 && Array.isArray(o.Table4)));

            if (hasData(obj)) return obj;
            if (obj.data) return findRoot(obj.data);
            return obj;
        };

        const root = findRoot(response);

        // Helper for case-insensitive and alternative key access
        const getList = (obj: any, ...keys: string[]): any[] => {
            if (!obj) return [];
            for (const k of keys) {
                if (obj[k] && Array.isArray(obj[k])) return obj[k];
                // Case-insensitive search
                const lowerK = k.toLowerCase();
                const foundKey = Object.keys(obj).find((key) => key.toLowerCase() === lowerK);
                if (foundKey && Array.isArray(obj[foundKey])) return obj[foundKey];
            }
            return [];
        };

        const timetable = getList(root, 'tt', 'TT', 'timetable', 'Table4', 'Table');
        const periodList = getList(root, 'periodslst', 'periodList', 'allperiods', 'periodsLst', 'periodsList', 'Table1');
        const gridWeeks = getList(root, 'gridweeks', 'gridWeeks', 'day_list', 'day_List', 'Table', 'grid_Weeks');
        const breakList = getList(root, 'tT_Break_list', 'breakList', 'Table2', 'tt_break_list', 'tt_Break_list');
        const allBreakList = getList(root, 'tT_Break_list_all', 'allBreakList', 'Table3', 'tt_break_list_all', 'tt_Break_list_all');

        console.log('ClassWise Report Deep Analysis:', {
            rootKeys: root ? Object.keys(root) : 'none',
            counts: {
                periods: periodList.length,
                days: gridWeeks.length,
                tt: timetable.length,
                breaks: breakList.length,
                allBreaks: allBreakList.length
            }
        });

        // Use selected items from payload but handle potential key differences
        const classesToProcess = Array.isArray(selectedClasses) ? selectedClasses : [];
        const sectionsToProcess = Array.isArray(selectedSections) ? selectedSections : [];

        classesToProcess.forEach((cls: any) => {
            const clsId = cls.asmcL_Id || cls.ASMC_Id || cls.asmcl_Id;
            const clsName = cls.asmcL_ClassName || cls.className || cls.asmcL_ClassName || '';

            sectionsToProcess.forEach((sec: any) => {
                const secId = sec.asmS_Id || sec.ASMS_Id || sec.asms_Id;
                const secName = sec.asmC_SectionName || sec.sectionName || sec.asmC_SectionName || '';

                const tableRows: any[] = [];
                const classPeriodSequence: any[] = [];

                // 1. Reconstruct logical timeline for this specific class (Periods + Breaks)
                periodList.forEach((period: any) => {
                    const pedId = period.ttmP_Id || period.TTMP_Id || period.ped_id || period.ttmp_id;
                    const pedName = period.ttmP_PeriodName || period.periodName || period.ped_name;

                    classPeriodSequence.push({
                        ped_id: pedId,
                        ped_name: String(pedName),
                        is_break: false
                    });

                    // Check for class-specific breaks mapped after this period
                    const breakItem = breakList.find((b: any) => {
                        const bClsId = b.asmcL_Id || b.ASMC_Id || b.asmcl_Id;
                        const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                        return Number(bClsId) === Number(clsId) && Number.parseFloat(String(pedName)) === Number.parseFloat(String(bAfter));
                    });

                    if (breakItem) {
                        classPeriodSequence.push({
                            ped_id: 0,
                            ped_name: 'Break',
                            brk_name: breakItem.ttmB_BreakName || breakItem.breakName || 'Break',
                            is_break: true,
                            after_ped_name: String(pedName)
                        });
                    }
                });

                // 2. Map TimeTable entries to the constructed Matrix
                gridWeeks.forEach((day: any) => {
                    const rowCells: any[] = [];
                    const dayId = day.ttmD_Id || day.TTMD_Id || day.day_id || day.ttmd_id;
                    const dayName = day.ttmD_DayName || day.dayName || day.day_name || '';

                    classPeriodSequence.forEach((periodCol: any) => {
                        let cellContent = '';
                        let cellColor = 'black';

                        if (!periodCol.is_break) {
                            const entries = timetable.filter((t: any) => {
                                const tPedId = t.ttmP_Id || t.TTMP_Id || t.ped_id || t.ttmp_id;
                                const tDayId = t.ttmD_Id || t.TTMD_Id || t.day_id || t.ttmd_id;
                                const tClsId = t.asmcL_Id || t.ASMC_Id || t.asmcl_Id;
                                const tSecId = t.asmS_Id || t.ASMS_Id || t.asms_Id;

                                return (
                                    Number(tPedId) === Number(periodCol.ped_id) &&
                                    Number(tDayId) === Number(dayId) &&
                                    Number(tClsId) === Number(clsId) &&
                                    Number(tSecId) === Number(secId)
                                );
                            });

                            if (entries.length > 0) {
                                cellContent = entries
                                    .map((t: any) => {
                                        const sub = t.ismS_SubjectName || t.subjectName || t.subject || t.isms_subjectname || '';
                                        const stf = t.staffName || t.empName || t.staff || t.hrmE_EmployeeName || t.hrme_employeename || '';
                                        return `${sub} : ${stf}`;
                                    })
                                    .join(' && ');
                            }
                        } else {
                            // Priority: Day-Specific Break from Table3 (allBreakList)
                            const daySpecificBreak = allBreakList.find((b: any) => {
                                const bDayId = b.ttmD_Id || b.TTMD_Id || b.day_id || b.ttmd_id;
                                const bClsId = b.asmcL_Id || b.ASMC_Id || b.asmcl_Id;
                                const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                                return (
                                    Number(bDayId) === Number(dayId) &&
                                    Number(bClsId) === Number(clsId) &&
                                    Number.parseFloat(String(periodCol.after_ped_name)) === Number.parseFloat(String(bAfter))
                                );
                            });

                            if (daySpecificBreak) {
                                cellContent = daySpecificBreak.ttmB_BreakName || daySpecificBreak.breakName || 'Break';
                                cellColor = 'red';
                            } else {
                                cellContent = periodCol.brk_name || 'Break';
                                cellColor = 'red';
                            }
                        }

                        rowCells.push({
                            ...periodCol,
                            dayId: dayId,
                            content: cellContent,
                            color: cellColor
                        });
                    });

                    tableRows.push({ dayName: String(dayName), cells: rowCells });
                });

                processedList.push({
                    header: `Class : ${clsName} & Section : ${secName}`,
                    periodList: classPeriodSequence,
                    rows: tableRows
                });
            });
        });

        setReportData(processedList);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Class Wise TimeTable Report' defaultOpen={true}>
                <ClassWiseForm onReportGenerated={handleReportGenerated} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Grid View' defaultOpen={true}>
                    <ClassWiseReportGrid reportData={reportData} onPrint={handlePrint} />

                    <ClassWiseReportPrintable ref={printRef} reportData={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}

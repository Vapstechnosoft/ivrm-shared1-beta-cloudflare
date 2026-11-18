import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import StaffWiseForm from './staffwise-form';
import StaffWiseReportGrid from './staffwise-report-grid';
import StaffWiseReportPrintable from './staffwise-report-printable';

export default function StaffWiseReportContent() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = (response: any, payload: any) => {
        const data = response.data || response;
        // Check for tt or timetable or TT as requested by user
        const hasData =
            data && ((data.tt && data.tt.length > 0) || (data.timetable && data.timetable.length > 0) || (data.TT && data.TT.length > 0));

        if (hasData) {
            processReportData(data, payload.staffarray, payload.rpttyp);
            setIsReportVisible(true);
            toast.success('Report generated successfully');
        } else {
            toast.error('TimeTable is Not Generated For Selected Details !!!!');
            setReportData([]);
            setIsReportVisible(false);
        }
    };

    const processReportData = (response: any, selectedStaff: any[], rptTyp: string) => {
        const findRoot = (obj: any): any => {
            if (!obj) return null;
            const hasData = (o: any) =>
                o &&
                ((o.tt && Array.isArray(o.tt)) ||
                    (o.TT && Array.isArray(o.TT)) ||
                    (o.timetable && Array.isArray(o.timetable)) ||
                    (o.Table4 && Array.isArray(o.Table4)) ||
                    (o.periodslst && Array.isArray(o.periodslst)) ||
                    (o.gridweeks && Array.isArray(o.gridweeks)));

            if (hasData(obj)) return obj;
            if (obj.data) return findRoot(obj.data);
            return obj;
        };

        const root = findRoot(response);

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

        const processedList: any[] = [];
        const timetable = getList(root, 'timetable', 'tt', 'TT', 'Table4', 'Table');
        const periodList = getList(root, 'periodslst', 'periodList', 'periodsLst', 'allperiods', 'Table1');
        const gridWeeks = getList(root, 'gridweeks', 'gridWeeks', 'day_list', 'day_List', 'Table');
        const subjectNames = getList(root, 'subjectNames', 'nameswithclas', 'namesWithClas', 'nameswithclas_', 'Table5');
        const staffNames = getList(root, 'staffNames', 'staffnameswithclas', 'staffNamesWithClas', 'staffnameswithclas_', 'Table6');

        const breakList = getList(root, 'tT_Break_list', 'breakList', 'Table2', 'tt_break_list', 'tt_Break_list');
        const allBreakList = getList(root, 'tT_Break_list_all', 'allBreakList', 'Table3', 'tt_break_list_all', 'tt_Break_list_all');

        console.log('StaffWise Report Deep Analysis:', {
            rootKeys: root ? Object.keys(root) : 'none',
            counts: {
                periods: periodList.length,
                days: gridWeeks.length,
                tt: timetable.length,
                breaks: breakList.length,
                allBreaks: allBreakList.length
            }
        });

        selectedStaff.forEach((staff: any) => {
            const hrmE_Id = staff.hrmE_Id || staff.HRME_Id;
            const staffName = staff.staffName || '';
            const tableRows: any[] = [];
            const staffPeriodSequence: any[] = [];

            // 1. Construct Period Sequence (including breaks if available)
            periodList.forEach((period: any) => {
                const pedId = period.ttmP_Id || period.TTMP_Id || period.ped_id;
                const pedName = period.ttmP_PeriodName || period.periodName || period.ped_name;

                staffPeriodSequence.push({
                    ped_id: pedId,
                    ped_name: String(pedName),
                    is_break: false
                });

                // Check for breaks after this period
                const breakItem = breakList.find((b: any) => {
                    const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                    return Number.parseFloat(String(pedName)) === Number.parseFloat(String(bAfter));
                });

                if (breakItem) {
                    staffPeriodSequence.push({
                        ped_id: 0,
                        ped_name: 'Break',
                        brk_name: breakItem.ttmB_BreakName || breakItem.breakName || 'Break',
                        is_break: true,
                        after_ped_name: String(pedName)
                    });
                }
            });

            // Find complementary names for header
            const subNameEntry = subjectNames.find((s: any) => (s.hrmE_Id || s.HRME_Id || s.hrme_id) === hrmE_Id);
            const stfNameEntry = staffNames.find((s: any) => (s.hrmE_Id || s.HRME_Id || s.hrme_id) === hrmE_Id);

            // 2. Map TimeTable entries to the constructed Matrix
            gridWeeks.forEach((day: any) => {
                const rowCells: any[] = [];
                const dayId = day.ttmD_Id || day.TTMD_Id || day.day_id || day.ttmd_id;
                const dayName = day.ttmD_DayName || day.dayName || day.day_name || day.ttmD_DayCode || '';

                staffPeriodSequence.forEach((periodCol: any) => {
                    let cellContent = '';
                    let cellColor = 'black';

                    if (!periodCol.is_break) {
                        const entries = timetable.filter((t: any) => {
                            const tPedId = t.ttmP_Id || t.TTMP_Id || t.ped_id || t.ttmp_id;
                            const tDayId = t.ttmD_Id || t.TTMD_Id || t.day_id || t.ttmd_id;
                            const tStfId = t.hrmE_Id || t.HRME_Id || t.hrme_id;
                            return (
                                Number(tPedId) === Number(periodCol.ped_id) &&
                                Number(tDayId) === Number(dayId) &&
                                Number(tStfId) === Number(hrmE_Id)
                            );
                        });

                        if (entries.length > 0) {
                            if (rptTyp === 'SAWC') {
                                cellContent = entries
                                    .map((t: any) => {
                                        const cls = t.asmcL_ClassName || t.className || t.asmcl_classname || '';
                                        const sec = t.asmC_SectionName || t.sectionName || t.asmc_sectionname || '';
                                        const sub = t.ismS_SubjectName || t.subjectName || t.isms_subjectname || '';
                                        return `${sub} : ${cls} : ${sec}`;
                                    })
                                    .join(' && ');
                            } else {
                                cellContent = entries
                                    .map((t: any) => t.ismS_SubjectName || t.subjectName || t.isms_subjectname || '')
                                    .join(' && ');
                            }
                        }
                    } else {
                        // Handle Breaks logic
                        const daySpecificBreak = allBreakList.find((b: any) => {
                            const bDayId = b.ttmD_Id || b.TTMD_Id || b.day_id || b.ttmd_id;
                            const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                            return (
                                Number(bDayId) === Number(dayId) &&
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
                        content: cellContent,
                        color: cellColor
                    });
                });
                tableRows.push({ dayName: String(dayName), cells: rowCells });
            });

            processedList.push({
                header: staffName,
                periodList: staffPeriodSequence,
                rows: tableRows
            });
        });

        setReportData(processedList);
    };

    const handleCancel = () => {
        setReportData([]);
        setIsReportVisible(false);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Staff Wise TimeTable Report' defaultOpen={true}>
                <StaffWiseForm onReportGenerated={handleReportGenerated} onCancel={handleCancel} />
            </CollapsibleSection>

            {isReportVisible && reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true}>
                    <StaffWiseReportGrid reportData={reportData} onPrint={handlePrint} />
                    <StaffWiseReportPrintable ref={printRef} reportData={reportData} />
                </CollapsibleSection>
            )}
        </div>
    );
}

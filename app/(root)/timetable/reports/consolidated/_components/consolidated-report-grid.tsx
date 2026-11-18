'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ConsolidatedReportGridProps {
    reportData: any[];
    fullResponse: any;
    onPrint: () => void;
    reportType: string;
    initialData: any;
}

export default function ConsolidatedReportGrid({
    reportData,
    fullResponse,
    onPrint,
    reportType,
    initialData
}: ConsolidatedReportGridProps) {
    // Shared formatting and matching helpers
    const getClassSectionLabel = (cs: any) => {
        const cls = cs?.asmcL_ClassName || cs?.ASMCL_ClassName || cs?.className || '';
        const sec = cs?.asmC_SectionName || cs?.ASMC_SectionName || cs?.sectionName || '';
        if (cls && sec && !cls.includes(sec)) {
            return `${cls} : ${sec}`;
        }
        return cls || sec || '-';
    };

    const matchClassSection = (tt: any, cs: any) => {
        const ttCls = Number(tt?.asmcL_Id ?? tt?.ASMCL_Id);
        const csCls = Number(cs?.asmcL_Id ?? cs?.ASMCL_Id);
        if (ttCls !== csCls) return false;

        const csSec = cs?.asmS_Id ?? cs?.ASMS_Id;
        if (csSec !== undefined && csSec !== null) {
            const ttSec = tt?.asmS_Id ?? tt?.ASMS_Id;
            return Number(ttSec) === Number(csSec);
        }
        return true;
    };

    const getStaffName = (staff: any) => staff?.empName ?? staff?.EmpName ?? staff?.ename ?? staff?.ENAME ?? staff?.staffName ?? '';
    const getStaffAbbr = (staff: any) =>
        staff?.ttmsaB_Abbreviation ??
        staff?.TTMSAB_Abbreviation ??
        staff?.abbr ??
        staff?.ABBR ??
        staff?.ttmsaB_Name ??
        staff?.TTMSAB_Name ??
        '';
    const getDayName = (day: any) => day?.ttmD_DayName ?? day?.TTMD_DayName ?? '';
    const getPeriodName = (period: any) => period?.ttmP_PeriodName ?? period?.TTMP_PeriodName ?? '';
    const getSubjectName = (sub: any) => sub?.ismS_SubjectName ?? sub?.ISMS_SubjectName ?? '';

    // Generate formatted 2D array matching the table display for Excel export
    const getExportData = (): any[][] => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];
        const subjectList = fullResponse?.subjectlist || fullResponse?.subjectlst || [];
        const classSections =
            fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || initialData?.classlists || [];
        const roomList = fullResponse?.roomlst || fullResponse?.roomlist || [];
        const breakList = fullResponse?.tT_Break_list_all || fullResponse?.brklist || [];

        switch (reportType) {
            case 'STD': {
                const header = ['SL. NO.', 'STAFF NAME', 'ABBR', ...days.map((d: any) => getDayName(d)), 'TOTAL'];
                const rows: any[][] = [];
                staffList.forEach((staff: any, idx: number) => {
                    const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                    const staffData = reportData.filter((tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staffId));
                    let total = 0;
                    const row: any[] = [idx + 1, getStaffName(staff), getStaffAbbr(staff)];
                    days.forEach((day: any) => {
                        const dayId = day.ttmD_Id ?? day.TTMD_Id;
                        const dayMatches = staffData.filter((tt: any) => Number(tt.ttmD_Id ?? tt.TTMD_Id) === Number(dayId));
                        const count = dayMatches.reduce((acc: number, m: any) => acc + Number(m.pcount ?? m.PCOUNT ?? 0), 0);
                        total += count;
                        row.push(count || '');
                    });
                    row.push(total);
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'SPW': {
                const header = ['PERIOD', ...staffList.map((staff: any) => getStaffName(staff))];
                const rows: any[][] = [];
                periods.forEach((period: any) => {
                    const periodId = period.ttmP_Id ?? period.TTMP_Id;
                    const row: any[] = [getPeriodName(period)];
                    staffList.forEach((staff: any) => {
                        const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                        const matches = reportData.filter((tt: any) => {
                            const tt_periodId = tt.ttmP_Id ?? tt.TTMP_Id;
                            const tt_staffId = tt.hrmE_Id ?? tt.HRME_Id;
                            return Number(tt_periodId) === Number(periodId) && Number(tt_staffId) === Number(staffId);
                        });
                        const count = matches.reduce((sum: number, m: any) => sum + Number(m.pcount ?? m.PCOUNT ?? 0), 0);
                        row.push(count || '');
                    });
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'STSUB': {
                const header = ['SL. NO.', 'SUBJECT', ...classSections.map((cs: any) => getClassSectionLabel(cs))];
                const rows: any[][] = [];
                subjectList.forEach((sub: any, idx: number) => {
                    const subId = sub.ismS_Id ?? sub.ISMS_Id;
                    const subData = reportData.filter((tt: any) => Number(tt.ismS_Id ?? tt.ISMS_Id) === Number(subId));
                    const row: any[] = [idx + 1, getSubjectName(sub)];
                    classSections.forEach((cs: any) => {
                        const matches = subData.filter((tt: any) => matchClassSection(tt, cs));
                        const teacherNames = Array.from(
                            new Set(matches.map((m: any) => m.ename || m.ENAME || m.empName || m.EmpName || '').filter(Boolean))
                        );
                        row.push(teacherNames.join(', '));
                    });
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'CSUB': {
                const header = ['SL. NO.', 'SUBJECT', ...classSections.map((cs: any) => getClassSectionLabel(cs)), 'TOTAL'];
                const rows: any[][] = [];
                subjectList.forEach((sub: any, idx: number) => {
                    const subId = sub.ismS_Id ?? sub.ISMS_Id;
                    const subData = reportData.filter((tt: any) => Number(tt.ismS_Id ?? tt.ISMS_Id) === Number(subId));
                    let total = 0;
                    const row: any[] = [idx + 1, getSubjectName(sub)];
                    classSections.forEach((cs: any) => {
                        const matches = subData.filter((tt: any) => matchClassSection(tt, cs));
                        const count = matches.reduce((sum: number, m: any) => sum + Number(m.pcount ?? m.PCOUNT ?? 0), 0);
                        total += count;
                        row.push(count || '');
                    });
                    row.push(total);
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'ST': {
                const header = [
                    'DAY/PERIOD',
                    ...staffList.map((staff: any) =>
                        fullResponse?.rpttypairods ? getStaffName(staff) : getStaffAbbr(staff) || getStaffName(staff)
                    )
                ];
                const rows: any[][] = [];
                days.forEach((day: any) => {
                    const dayId = day.ttmD_Id ?? day.TTMD_Id;
                    const dayName = getDayName(day);
                    periods.forEach((period: any) => {
                        const periodId = period.ttmP_Id ?? period.TTMP_Id;
                        const periodName = getPeriodName(period);
                        const row: any[] = [`${dayName}/${periodName}`];

                        staffList.forEach((staff: any) => {
                            const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                            const matches = reportData.filter((tt: any) => {
                                const tt_dayId = tt.ttmD_Id ?? tt.TTMD_Id;
                                const tt_periodId = tt.ttmP_Id ?? tt.TTMP_Id;
                                const tt_staffId = tt.hrmE_Id ?? tt.HRME_Id;
                                return (
                                    Number(tt_dayId) === Number(dayId) &&
                                    Number(tt_periodId) === Number(periodId) &&
                                    Number(tt_staffId) === Number(staffId)
                                );
                            });
                            row.push(
                                matches
                                    .map((m: any) => m.staffSubject || m.StaffSubject || '')
                                    .filter(Boolean)
                                    .join(' && ')
                            );
                        });
                        rows.push(row);
                    });
                });
                return [header, ...rows];
            }

            case 'STFP': {
                const header = ['SL. NO.', 'STAFF NAME', ...periods.map((prd: any) => getPeriodName(prd))];
                const rows: any[][] = [];
                let rowIdx = 1;
                staffList.forEach((staff: any) => {
                    const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                    const staffData = reportData.filter((tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staffId));
                    if (staffData.length === 0) return;
                    const row: any[] = [rowIdx++, getStaffName(staff)];
                    periods.forEach((prd: any) => {
                        const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                        const match = staffData.find((tt: any) => Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId));
                        row.push(match ? match.periodFree || match.PeriodFree || '' : '');
                    });
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'PSTF': {
                const header = ['SL. NO.', 'STAFF NAME', 'ABBREVIATION', 'EMP. CODE'];
                const rows = reportData.map((row: any, idx: number) => [
                    idx + 1,
                    row.ename || row.ENAME || row.empName || row.EmpName || '',
                    row.abbr || row.ABBR || row.ttmsaB_Abbreviation || row.TTMSAB_Abbreviation || '',
                    row.empcode || row.EMPCODE || row.hrmE_EmployeeCode || row.HRME_EmployeeCode || ''
                ]);
                return [header, ...rows];
            }

            case 'SPC': {
                const header = ['SL. NO.', 'STAFF NAME', 'ABBR', ...periods.map((prd: any) => getPeriodName(prd))];
                const rows: any[][] = [];
                staffList.forEach((staff: any, idx: number) => {
                    const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                    const row: any[] = [idx + 1, getStaffName(staff), getStaffAbbr(staff)];
                    periods.forEach((prd: any) => {
                        const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                        const matches = reportData.filter(
                            (tt: any) =>
                                Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staffId) && Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId)
                        );
                        const details = matches
                            .map((tt: any) => {
                                const minId = tt.minid ?? tt.MINID ?? 0;
                                const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                const pcount = maxId - minId + 1;
                                const minDay = tt.minDay ?? tt.MinDay ?? '';
                                const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;
                                const className = tt.asmcL_ClassName ?? tt.ASMCL_ClassName ?? '';
                                const sectionName = tt.asmC_SectionName ?? tt.ASMC_SectionName ?? '';
                                const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';
                                return `${className}::${sectionName}::${subName}::${dayRange}::${pcount}`;
                            })
                            .join(' && ');
                        row.push(details);
                    });
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'CSPC': {
                const header = ['SL. NO.', 'CLASS/SECTION', ...periods.map((prd: any) => getPeriodName(prd))];
                const rows: any[][] = [];
                classSections.forEach((cs: any, idx: number) => {
                    const row: any[] = [idx + 1, getClassSectionLabel(cs)];
                    periods.forEach((prd: any) => {
                        const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                        const matches = reportData.filter(
                            (tt: any) => matchClassSection(tt, cs) && Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId)
                        );
                        const details = matches
                            .map((tt: any) => {
                                const minId = tt.minid ?? tt.MINID ?? 0;
                                const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                const pcount = maxId - minId + 1;
                                const minDay = tt.minDay ?? tt.MinDay ?? '';
                                const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;
                                const empName = tt.empName ?? tt.EmpName ?? tt.ename ?? tt.ENAME ?? '';
                                const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';
                                return `${empName}::${subName}::${dayRange}::${pcount}`;
                            })
                            .join(' && ');
                        row.push(details);
                    });
                    rows.push(row);
                });
                return [header, ...rows];
            }

            case 'ATG': {
                const header = ['STAFF', 'CLASS', 'SECTION', 'SUBJECT', 'PERIODS COUNT'];
                let totalCount = 0;
                const rows = reportData.map((row: any) => {
                    const count = Number(row.pcount ?? row.PCOUNT ?? 0);
                    totalCount += count;
                    return [
                        row.ename || row.ENAME || row.empName || row.EmpName || '',
                        row.asmcL_ClassName || row.ASMCL_ClassName || '',
                        row.asmC_SectionName || row.ASMC_SectionName || '',
                        row.ismS_SubjectName || row.ISMS_SubjectName || '',
                        count
                    ];
                });
                rows.push(['', '', '', 'TOTAL:', totalCount]);
                return [header, ...rows];
            }

            case 'RMR': {
                const header = [
                    'ROOM NAME',
                    ...days.flatMap((d: any) => periods.map((p: any) => `${getDayName(d)} - ${getPeriodName(p)}`))
                ];
                const rows: any[][] = [];
                roomList.forEach((room: any) => {
                    const roomId = room.ttmrM_Id ?? room.TTMRM_Id;
                    const row: any[] = [room.ttmrM_RoomName ?? room.TTMRM_RoomName ?? ''];
                    days.forEach((day: any) => {
                        const dayId = day.ttmD_Id ?? day.TTMD_Id;
                        periods.forEach((prd: any) => {
                            const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                            const isBreak = breakList.find(
                                (brk: any) =>
                                    Number(getPeriodName(prd)) === Number(brk.ttmB_AfterPeriod) &&
                                    Number(brk.ttmD_Id ?? brk.TTMD_Id) === Number(dayId)
                            );
                            if (isBreak) {
                                row.push(isBreak.ttmB_BreakName || 'BREAK');
                                return;
                            }
                            const match = reportData.find(
                                (tt: any) =>
                                    Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId) &&
                                    Number(tt.ttmD_Id ?? tt.TTMD_Id) === Number(dayId) &&
                                    Number(tt.ttmrM_Id ?? tt.TTMRM_Id) === Number(roomId)
                            );
                            row.push(match ? match.staffSubject || match.StaffSubject || '' : '');
                        });
                    });
                    rows.push(row);
                });
                return [header, ...rows];
            }

            default: {
                if (!reportData.length) return [];
                const headers = Object.keys(reportData[0]);
                const rows = reportData.map((row: any, idx: number) => [
                    idx + 1,
                    ...headers.map((h) => (row[h] !== undefined && row[h] !== null ? row[h] : ''))
                ]);
                return [['SL. NO.', ...headers.map((h) => h.replace(/_/g, ' ').toUpperCase())], ...rows];
            }
        }
    };

    const exportToExcel = () => {
        if (!reportData || !reportData.length) {
            toast.error('No data to export!');
            return;
        }

        const wsData = getExportData();
        if (!wsData || !wsData.length) {
            toast.error('No data to export!');
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Auto-fit column widths
        if (wsData.length > 0 && wsData[0]) {
            const colWidths = wsData[0].map((_, colIdx) => {
                let maxLen = 10;
                for (let r = 0; r < Math.min(wsData.length, 100); r++) {
                    const val = wsData[r]?.[colIdx];
                    if (val !== undefined && val !== null) {
                        const len = String(val).length;
                        if (len > maxLen) maxLen = len;
                    }
                }
                return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
            });
            ws['!cols'] = colWidths;
        }

        const cleanReportType = (reportType || 'Report').replace(/[:\\/?*[\]]/g, '_');
        const sheetName = cleanReportType.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const fileName = `Consolidated_Report_${cleanReportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // 1. STAFF WISE DETAILS (ST)
    const renderStaffWiseDetails = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        const rows: any[] = [];
        days.forEach((day: any) => {
            const dayId = day.ttmD_Id ?? day.TTMD_Id;
            const dayName = getDayName(day);
            periods.forEach((period: any) => {
                const periodId = period.ttmP_Id ?? period.TTMP_Id;
                const periodName = getPeriodName(period);
                const dayPeriodLabel = `${dayName}/${periodName}`;
                const rowData: any = { label: dayPeriodLabel, dayId, periodId };

                staffList.forEach((staff: any) => {
                    const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                    const match = reportData.filter((tt: any) => {
                        const tt_dayId = tt.ttmD_Id ?? tt.TTMD_Id;
                        const tt_periodId = tt.ttmP_Id ?? tt.TTMP_Id;
                        const tt_staffId = tt.hrmE_Id ?? tt.HRME_Id;
                        return (
                            Number(tt_dayId) === Number(dayId) &&
                            Number(tt_periodId) === Number(periodId) &&
                            Number(tt_staffId) === Number(staffId)
                        );
                    });

                    if (match.length > 0) {
                        rowData[`id${staffId}`] = match.map((m: any) => m.staffSubject || m.StaffSubject).join(' && ');
                    }
                });
                rows.push(rowData);
            });
        });

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-xs'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-2 py-3 font-bold uppercase'>DAY/PERIOD</th>
                            {staffList.map((staff: any) => {
                                const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                                return (
                                    <th key={staffId} className='border border-purple-800 px-2 py-3 font-bold uppercase'>
                                        {fullResponse?.rpttypairods ? getStaffName(staff) : getStaffAbbr(staff) || getStaffName(staff)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 bg-gray-50 px-2 py-2 font-semibold'>{row.label}</td>
                                {staffList.map((staff: any) => {
                                    const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                                    return (
                                        <td key={staffId} className='border border-gray-200 px-2 py-2 text-center'>
                                            {row[`id${staffId}`] || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 2. STAFF DAY WISE (STD)
    const renderStaffDayWise = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>ABBR</th>
                            {days.map((day: any) => {
                                const dayId = day.ttmD_Id ?? day.TTMD_Id;
                                return (
                                    <th key={dayId} className='border border-purple-800 px-4 py-3 font-bold'>
                                        {getDayName(day)}
                                    </th>
                                );
                            })}
                            <th className='border border-purple-800 bg-purple-800 px-4 py-3 font-bold'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                            const staffData = reportData.filter((tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staffId));
                            let total = 0;
                            return (
                                <tr key={staffId ?? idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{getStaffName(staff)}</td>
                                    <td className='border border-gray-200 px-4 py-2'>{getStaffAbbr(staff)}</td>
                                    {days.map((day: any) => {
                                        const dayId = day.ttmD_Id ?? day.TTMD_Id;
                                        const dayMatches = staffData.filter(
                                            (tt: any) => Number(tt.ttmD_Id ?? tt.TTMD_Id) === Number(dayId)
                                        );
                                        const count = dayMatches.reduce(
                                            (acc: number, m: any) => acc + Number(m.pcount ?? m.PCOUNT ?? 0),
                                            0
                                        );
                                        total += count;
                                        return (
                                            <td key={dayId} className='border border-gray-200 px-4 py-2 text-center'>
                                                {count || ''}
                                            </td>
                                        );
                                    })}
                                    <td className='border border-gray-200 bg-purple-50 px-4 py-2 text-center font-bold text-purple-700'>
                                        {total}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 3. CLASS SUBJECT (CSUB)
    const renderClassSubject = () => {
        const subjectList = fullResponse?.subjectlist || fullResponse?.subjectlst || [];
        const classSections =
            fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || initialData?.classlists || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>SUBJECT</th>
                            {classSections.map((cs: any, idx: number) => (
                                <th key={idx} className='border border-purple-800 px-2 py-3 font-bold text-xs'>
                                    {getClassSectionLabel(cs)}
                                </th>
                            ))}
                            <th className='border border-purple-800 bg-purple-800 px-4 py-3 font-bold'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectList.map((sub: any, idx: number) => {
                            const subId = sub.ismS_Id ?? sub.ISMS_Id;
                            const subData = reportData.filter((tt: any) => Number(tt.ismS_Id ?? tt.ISMS_Id) === Number(subId));
                            let total = 0;
                            return (
                                <tr key={subId ?? idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{getSubjectName(sub)}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const matches = subData.filter((tt: any) => matchClassSection(tt, cs));
                                        const count = matches.reduce((sum: number, m: any) => sum + Number(m.pcount ?? m.PCOUNT ?? 0), 0);
                                        total += count;
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center'>
                                                {count || ''}
                                            </td>
                                        );
                                    })}
                                    <td className='border border-gray-200 bg-purple-50 px-4 py-2 text-center font-bold text-purple-700'>
                                        {total}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 4. STAFF SUBJECT (STSUB)
    const renderStaffSubject = () => {
        const subjectList = fullResponse?.subjectlist || fullResponse?.subjectlst || [];
        const classSections =
            fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || initialData?.classlists || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>SUBJECT</th>
                            {classSections.map((cs: any, idx: number) => (
                                <th key={idx} className='border border-purple-800 px-2 py-3 font-bold text-xs'>
                                    {getClassSectionLabel(cs)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjectList.map((sub: any, idx: number) => {
                            const subId = sub.ismS_Id ?? sub.ISMS_Id;
                            const subData = reportData.filter((tt: any) => Number(tt.ismS_Id ?? tt.ISMS_Id) === Number(subId));
                            return (
                                <tr key={subId ?? idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{getSubjectName(sub)}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const matches = subData.filter((tt: any) => matchClassSection(tt, cs));
                                        const teacherNames = Array.from(
                                            new Set(
                                                matches.map((m: any) => m.ename || m.ENAME || m.empName || m.EmpName || '').filter(Boolean)
                                            )
                                        );
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center text-xs'>
                                                {teacherNames.join(', ')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 5. STAFF PERIOD WISE WORKLOAD (SPW) - Matrix View
    const renderStaffPeriodMatrix = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>PERIOD</th>
                            {staffList.map((staff: any) => {
                                const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                                return (
                                    <th key={staffId} className='border border-purple-800 px-2 py-3 font-bold text-xs uppercase'>
                                        {getStaffName(staff)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {periods.map((period: any, pIdx: number) => {
                            const periodId = period.ttmP_Id ?? period.TTMP_Id;
                            return (
                                <tr key={periodId ?? pIdx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 bg-gray-50 px-4 py-2 font-semibold'>{getPeriodName(period)}</td>
                                    {staffList.map((staff: any) => {
                                        const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                                        const matches = reportData.filter((tt: any) => {
                                            const tt_periodId = tt.ttmP_Id ?? tt.TTMP_Id;
                                            const tt_staffId = tt.hrmE_Id ?? tt.HRME_Id;
                                            return Number(tt_periodId) === Number(periodId) && Number(tt_staffId) === Number(staffId);
                                        });
                                        const count = matches.reduce((sum: number, m: any) => sum + Number(m.pcount ?? m.PCOUNT ?? 0), 0);
                                        return (
                                            <td
                                                key={staffId}
                                                className='border border-gray-200 px-2 py-2 text-center font-bold text-purple-700'>
                                                {count || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Default Table for other types
    const renderDefaultTable = () => {
        if (!reportData.length) return <div className='p-4 text-center text-gray-500'>No data available for this report type.</div>;
        const headers = Object.keys(reportData[0]);
        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3'>SL. NO.</th>
                            {headers.map((h) => (
                                <th key={h} className='border border-purple-800 px-4 py-3 font-bold text-xs uppercase'>
                                    {h.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, idx) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                {headers.map((h) => (
                                    <td key={h} className='border border-gray-200 px-4 py-2 text-sm'>
                                        {row[h]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 6. STAFF FREE PERIOD (STFP)
    const renderStaffFreePeriod = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            {periods.map((prd: any) => {
                                const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                return (
                                    <th key={prdId} className='border border-purple-800 px-2 py-3 font-bold text-xs uppercase'>
                                        {getPeriodName(prd)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                            const staffData = reportData.filter((tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staffId));
                            if (staffData.length === 0) return null;
                            return (
                                <tr key={staffId ?? idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center text-xs'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium text-xs'>{getStaffName(staff)}</td>
                                    {periods.map((prd: any) => {
                                        const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                        const match = staffData.find((tt: any) => Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId));
                                        return (
                                            <td
                                                key={prdId}
                                                className='border border-gray-200 px-2 py-2 text-center font-bold text-orange-600 text-xs'>
                                                {match ? match.periodFree || match.PeriodFree || '' : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 7. PERIOD WISE STAFF FREE (PSTF)
    const renderPeriodWiseStaffFree = () => {
        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 text-center font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>ABBREVIATION</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>EMP. CODE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, idx: number) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-200 px-4 py-2 font-medium'>
                                    {row.ename || row.ENAME || row.empName || row.EmpName || ''}
                                </td>
                                <td className='border border-gray-200 px-4 py-2'>
                                    {row.abbr || row.ABBR || row.ttmsaB_Abbreviation || row.TTMSAB_Abbreviation || ''}
                                </td>
                                <td className='border border-gray-200 px-4 py-2'>
                                    {row.empcode || row.EMPCODE || row.hrmE_EmployeeCode || row.HRME_EmployeeCode || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 8. STAFF-PERIOD CONSOLIDATED (SPC)
    const renderStaffPeriodConsolidated = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-[10px]'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-1 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-2 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-1 py-3 text-left font-bold'>ABBR</th>
                            {periods.map((prd: any) => {
                                const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                return (
                                    <th key={prdId} className='border border-purple-800 px-1 py-3 text-center font-bold uppercase'>
                                        {getPeriodName(prd)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffId = staff.hrmE_Id ?? staff.HRME_Id;
                            return (
                                <tr key={staffId ?? idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-1 py-2 text-center'>{idx + 1}</td>
                                    <td className='whitespace-nowrap border border-gray-200 px-2 py-2 font-semibold'>
                                        {getStaffName(staff)}
                                    </td>
                                    <td className='border border-gray-200 px-1 py-2'>{getStaffAbbr(staff)}</td>
                                    {periods.map((prd: any) => {
                                        const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                        const matches = reportData.filter(
                                            (tt: any) =>
                                                Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staffId) &&
                                                Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId)
                                        );

                                        const details = matches
                                            .map((tt: any) => {
                                                const minId = tt.minid ?? tt.MINID ?? 0;
                                                const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                                const pcount = maxId - minId + 1;
                                                const minDay = tt.minDay ?? tt.MinDay ?? '';
                                                const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                                const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;

                                                const className = tt.asmcL_ClassName ?? tt.ASMCL_ClassName ?? '';
                                                const sectionName = tt.asmC_SectionName ?? tt.ASMC_SectionName ?? '';
                                                const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';

                                                return `${className}::${sectionName}::${subName}::${dayRange}::${pcount}`;
                                            })
                                            .join(' && ');

                                        return (
                                            <td
                                                key={prdId}
                                                className='border border-gray-200 px-1 py-2 text-center text-[9px] leading-tight'>
                                                {details || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 9. CLASS-SECTION PERIOD CONSOLIDATED (CSPC)
    const renderClassSectionPeriodConsolidated = () => {
        const classSections =
            fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || initialData?.classlists || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-[10px]'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-1 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-2 py-3 text-left font-bold'>CLASS/SECTION</th>
                            {periods.map((prd: any) => {
                                const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                return (
                                    <th key={prdId} className='border border-purple-800 px-1 py-3 text-center font-bold uppercase'>
                                        {getPeriodName(prd)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {classSections.map((cs: any, idx: number) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 px-1 py-2 text-center'>{idx + 1}</td>
                                <td className='whitespace-nowrap border border-gray-200 px-2 py-2 font-semibold'>
                                    {getClassSectionLabel(cs)}
                                </td>
                                {periods.map((prd: any) => {
                                    const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                    const matches = reportData.filter(
                                        (tt: any) => matchClassSection(tt, cs) && Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId)
                                    );

                                    const details = matches
                                        .map((tt: any) => {
                                            const minId = tt.minid ?? tt.MINID ?? 0;
                                            const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                            const pcount = maxId - minId + 1;
                                            const minDay = tt.minDay ?? tt.MinDay ?? '';
                                            const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                            const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;

                                            const empName = tt.empName ?? tt.EmpName ?? tt.ename ?? tt.ENAME ?? '';
                                            const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';

                                            return `${empName}::${subName}::${dayRange}::${pcount}`;
                                        })
                                        .join(' && ');

                                    return (
                                        <td key={prdId} className='border border-gray-200 px-1 py-2 text-center text-[9px] leading-tight'>
                                            {details || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 10. STAFF WORKLOAD AFTER TIMETABLE GENERATION (ATG)
    const renderStaffWorkloadAfterGeneration = () => {
        let totalCount = 0;
        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>STAFF</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>CLASS</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SECTION</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>SUBJECT</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold uppercase'>PERIODS COUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, idx: number) => {
                            const count = Number(row.pcount || row.PCOUNT || 0);
                            totalCount += count;
                            return (
                                <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>
                                        {row.ename || row.ENAME || row.empName || row.EmpName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>
                                        {row.asmcL_ClassName || row.ASMCL_ClassName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>
                                        {row.asmC_SectionName || row.ASMC_SectionName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2'>
                                        {row.ismS_SubjectName || row.ISMS_SubjectName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2 text-center font-bold text-purple-700'>{count}</td>
                                </tr>
                            );
                        })}
                        <tr className='bg-purple-50 font-bold'>
                            <td colSpan={4} className='border border-gray-200 px-4 py-3 text-right text-purple-900'>
                                TOTAL:
                            </td>
                            <td className='border border-gray-200 px-4 py-3 text-center text-purple-900'>{totalCount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    // 11. ROOM-WISE REPORT (RMR)
    const renderRoomWiseReport = () => {
        const roomList = fullResponse?.roomlst || fullResponse?.roomlist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];
        const breakList = fullResponse?.tT_Break_list_all || fullResponse?.brklist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-[10px]'>
                    <thead>
                        <tr className='bg-purple-800 text-white'>
                            <th rowSpan={2} className='sticky left-0 z-10 border border-purple-900 bg-purple-800 px-2 py-3 font-bold'>
                                ROOM NAME
                            </th>
                            {days.map((day: any) => {
                                const dayId = day.ttmD_Id ?? day.TTMD_Id;
                                return (
                                    <th
                                        key={dayId}
                                        colSpan={periods.length}
                                        className='border border-purple-900 border-b-purple-400 px-2 py-2 text-center font-bold uppercase'>
                                        {getDayName(day)}
                                    </th>
                                );
                            })}
                        </tr>
                        <tr className='bg-purple-700 text-white'>
                            {days.map((day: any) => {
                                const dayId = day.ttmD_Id ?? day.TTMD_Id;
                                return periods.map((prd: any) => {
                                    const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                    return (
                                        <th
                                            key={`${dayId}-${prdId}`}
                                            className='min-w-[80px] border border-purple-800 px-1 py-2 text-center font-bold uppercase'>
                                            {getPeriodName(prd)}
                                        </th>
                                    );
                                });
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {roomList.map((room: any) => {
                            const roomId = room.ttmrM_Id ?? room.TTMRM_Id;
                            return (
                                <tr key={roomId} className='transition-colors hover:bg-purple-50'>
                                    <td className='sticky left-0 z-10 border border-gray-200 bg-gray-50 px-2 py-2 font-semibold'>
                                        {room.ttmrM_RoomName ?? room.TTMRM_RoomName ?? ''}
                                    </td>
                                    {days.map((day: any) => {
                                        const dayId = day.ttmD_Id ?? day.TTMD_Id;
                                        return periods.map((prd: any) => {
                                            const prdId = prd.ttmP_Id ?? prd.TTMP_Id;
                                            // Check for Break
                                            const isBreak = breakList.find(
                                                (brk: any) =>
                                                    Number(getPeriodName(prd)) === Number(brk.ttmB_AfterPeriod) &&
                                                    Number(brk.ttmD_Id ?? brk.TTMD_Id) === Number(dayId)
                                            );

                                            if (isBreak) {
                                                return (
                                                    <td
                                                        key={`${dayId}-${prdId}`}
                                                        className='border border-gray-200 bg-yellow-50 px-1 py-1 text-center font-bold text-[8px] text-red-600'>
                                                        {isBreak.ttmB_BreakName || 'BREAK'}
                                                    </td>
                                                );
                                            }

                                            const match = reportData.find(
                                                (tt: any) =>
                                                    Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prdId) &&
                                                    Number(tt.ttmD_Id ?? tt.TTMD_Id) === Number(dayId) &&
                                                    Number(tt.ttmrM_Id ?? tt.TTMRM_Id) === Number(roomId)
                                            );

                                            return (
                                                <td
                                                    key={`${dayId}-${prdId}`}
                                                    className='border border-gray-200 px-1 py-1 text-center leading-tight'>
                                                    {match ? match.staffSubject || match.StaffSubject || '' : ''}
                                                </td>
                                            );
                                        });
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Rendering logic based on reportType
    const renderTable = () => {
        switch (reportType) {
            case 'ST':
                return renderStaffWiseDetails();
            case 'STD':
                return renderStaffDayWise();
            case 'CSUB':
                return renderClassSubject();
            case 'STSUB':
                return renderStaffSubject();
            case 'SPW':
                return renderStaffPeriodMatrix();
            case 'STFP':
                return renderStaffFreePeriod();
            case 'PSTF':
                return renderPeriodWiseStaffFree();
            case 'SPC':
                return renderStaffPeriodConsolidated();
            case 'CSPC':
                return renderClassSectionPeriodConsolidated();
            case 'ATG':
                return renderStaffWorkloadAfterGeneration();
            case 'RMR':
                return renderRoomWiseReport();
            default:
                return renderDefaultTable();
        }
    };

    return (
        <div className='space-y-6'>
            <div className='hidden text-center print:mb-4 print:block'>
                <h1 className='font-bold text-lg text-purple-900 uppercase'>{reportType.replace(/_/g, ' ')} CONSOLIDATED REPORT</h1>
                <p className='text-gray-500 text-xs'>Generated on: {new Date().toLocaleString()}</p>
            </div>

            <div className='no-print flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                    <span className='h-2 w-2 rounded-full bg-purple-600'></span>
                    <h2 className='font-semibold text-gray-700 text-sm uppercase tracking-wider'>
                        {reportType.replace(/_/g, ' ')} Report View
                    </h2>
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        onClick={onPrint}
                        size='sm'
                        className='bg-purple-600 shadow-md transition-all hover:bg-purple-700 active:scale-95'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                    <Button
                        onClick={exportToExcel}
                        size='sm'
                        variant='outline'
                        className='gap-2 border-green-600 text-green-700 shadow-sm transition-all hover:bg-green-50 hover:text-green-800'>
                        <Download className='h-4 w-4' /> Export Excel
                    </Button>
                </div>
            </div>
            {renderTable()}
            <div className='flex items-center justify-between px-2 font-medium text-gray-500 text-xs italic'>
                <p>* This is a generated consolidated report summary.</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}

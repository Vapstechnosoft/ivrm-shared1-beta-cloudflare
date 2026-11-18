'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getExamReportCard } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProgressCardReportForm from './_components/add-form';

import { Loader2 } from 'lucide-react';
import ProgressCardReport from './_components/progress-card-report';

export default function ProgressCardReportGMVPS_X_Page() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [saveList, setSaveList] = useState<any[]>([]);
    const [extraData, setExtraData] = useState<any>({});
    const [examName, setExamName] = useState<string>('');
    const [examCode, setExamCode] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [institution, setInstitution] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isReportVisible]);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res?.success) {
                    setInstitution(res.data);
                }
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, []);

    const handleReportSuccess = async (payload: any) => {
        try {
            setIsLoading(true);
            console.log('GMVPS X Request Payload:', payload);
            const res = await getExamReportCard(payload);
            console.log('GMVPS X API Response:', res);

            const apiData = res?.data;
            const flatRows: any[] = apiData?.list || (Array.isArray(apiData) ? apiData : []);
            console.log('GMVPS X Flat Rows Count:', flatRows.length);

            if (!Array.isArray(flatRows) || flatRows.length === 0) {
                toast.error('No record found');
                setIsReportVisible(false);
                return;
            }

            const studentMap = new Map<number, any>();
            flatRows.forEach((row: any) => {
                const sId = row.amsT_Id ?? row.AMST_Id ?? row.AMST_ID ?? row.amst_Id ?? row.studentId ?? row.StudentId;
                if (sId && !studentMap.has(sId)) {
                    studentMap.set(sId, { ...row, amsT_Id: sId });
                }
            });

            const report_list = Array.from(studentMap.values());
            console.log('GMVPS X Unique Students Count:', report_list.length);
            const savelist = flatRows;

            const activity_main_list_area = apiData?.activity_main_list_area || (res as any).activity_main_list_area || [];
            const getstudentwiseactiviteslist = apiData?.getstudentwiseactiviteslist || (res as any).getstudentwiseactiviteslist || [];

            report_list.forEach((stu: any) => {
                const studentId = stu.amsT_Id;
                const activityname_temp: any[] = [];

                getstudentwiseactiviteslist.forEach((act: any) => {
                    const actStudentId = act.AMST_Id ?? act.amsT_Id ?? act.studentId ?? act.StudentId;
                    if (actStudentId === studentId) {
                        if (activityname_temp.length === 0) {
                            activityname_temp.push(act);
                        } else {
                            const count1 = activityname_temp.filter(
                                (dd) =>
                                    (dd.ECACT_SkillName || dd.ecacT_SkillName || dd.activityName) ===
                                    (act.ECACT_SkillName || act.ecacT_SkillName || act.activityName)
                            ).length;
                            if (count1 === 0) {
                                activityname_temp.push(act);
                            }
                        }
                    }
                });
                stu.activity_main_list_area = activityname_temp;
            });

            setReportData(report_list);
            setSaveList(savelist);
            setExtraData({
                getstudentwiseactiviteslist: getstudentwiseactiviteslist,
                work_attendence:
                    apiData?.work_attendence || apiData?.stud_work_attendence || res.work_attendence || res.stud_work_attendence,
                present_attendence:
                    apiData?.present_attendence ||
                    apiData?.stud_present_attendence ||
                    res.present_attendence ||
                    res.stud_present_attendence,
                exammastername:
                    apiData?.exammastername ||
                    apiData?.strudentwisedentalandvision ||
                    res.exammastername ||
                    res.strudentwisedentalandvision,
                studentdetailsgraph: apiData?.studentdetailsgraph || res.studentdetailsgraph
            });

            setExamName(payload.examName || flatRows[0]?.emE_ExamName || '');
            setExamCode(payload.examCode || flatRows[0]?.emE_ExamCode || '');
            setYear(payload.yearName || flatRows[0]?.asmaY_Year || '');

            setIsReportVisible(true);
            toast.success(`${report_list.length} progress card(s) generated successfully!`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Error generating report');
            setIsReportVisible(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 500);
    };

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Progress Card Report' defaultOpen>
                <ProgressCardReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isLoading && (
                <div className='flex justify-center p-12'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                </div>
            )}

            {isReportVisible && !isLoading && (
                <div ref={printRef}>
                    <CollapsibleSection title='Report Preview' defaultOpen>
                        <ProgressCardReport
                            reportData={reportData}
                            saveList={saveList}
                            extraData={extraData}
                            institution={institution}
                            examName={examName}
                            examCode={examCode}
                            year={year}
                            onPrint={handlePrint}
                        />
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}

'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import StJamesNurseryReportForm from './_components/report-form';
import StJamesNurseryReportList from './_components/report-list';

export default function StJamesNurseryReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | Institution | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isReportVisible]);

    const handleReportSuccess = async (payload: any) => {
        try {
            // Bypass API call for testing and use mock data
            // const response = await getStJamesNurseryReport(payload);

            const mockResponse = {
                data: {
                    getstudentdetails: [
                        {
                            studentname: 'AYAN CHAKRABORTY',
                            dob: '12-Jan-2019',
                            ASMCL_ClassName: 'NURSERY',
                            AMAY_RollNo: '05',
                            ASMC_SectionName: 'B',
                            AMST_AdmNo: 'STJ/NUR/2023/452',
                            TOTALWORKINGDAYS: 192,
                            PRESENTDAYS: 184,
                            remaks: 'Ayan is a very bright student. He is very active in class activities and shows great interest in storytelling.',
                            subjectlist: [
                                {
                                    ISMS_SubjectName: 'ENGLISH',
                                    Style: 'bold',
                                    subsubjectlist: [
                                        {
                                            EMSS_SubSubjectName: 'Phonetics',
                                            studentmarks: [{ ObtainedGrade: 'A+', GRADEREMAKS: 'Excellent' }]
                                        },
                                        {
                                            EMSS_SubSubjectName: 'Letter Recognition',
                                            studentmarks: [{ ObtainedGrade: 'A+', GRADEREMAKS: 'Outstanding' }]
                                        }
                                    ]
                                },
                                {
                                    ISMS_SubjectName: 'MATHEMATICS',
                                    Style: 'bold',
                                    subsubjectlist: [
                                        {
                                            EMSS_SubSubjectName: 'Counting (1-50)',
                                            studentmarks: [{ ObtainedGrade: 'A', GRADEREMAKS: 'Very Good' }]
                                        },
                                        {
                                            EMSS_SubSubjectName: 'Object Identification',
                                            studentmarks: [{ ObtainedGrade: 'A+', GRADEREMAKS: 'Brilliant' }]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            studentname: 'SARA ALAM',
                            dob: '24-Mar-2019',
                            ASMCL_ClassName: 'NURSERY',
                            AMAY_RollNo: '21',
                            ASMC_SectionName: 'B',
                            AMST_AdmNo: 'STJ/NUR/2023/488',
                            TOTALWORKINGDAYS: 192,
                            PRESENTDAYS: 175,
                            remaks: 'Sara is showing steady progress. She needs to focus a bit more on her handwriting skills.',
                            subjectlist: [
                                {
                                    ISMS_SubjectName: 'ENGLISH',
                                    Style: 'bold',
                                    subsubjectlist: [
                                        { EMSS_SubSubjectName: 'Phonetics', studentmarks: [{ ObtainedGrade: 'A', GRADEREMAKS: 'Good' }] },
                                        {
                                            EMSS_SubSubjectName: 'Letter Recognition',
                                            studentmarks: [{ ObtainedGrade: 'B', GRADEREMAKS: 'Satisfactory' }]
                                        }
                                    ]
                                },
                                {
                                    ISMS_SubjectName: 'MATHEMATICS',
                                    Style: 'bold',
                                    subsubjectlist: [
                                        {
                                            EMSS_SubSubjectName: 'Counting (1-50)',
                                            studentmarks: [{ ObtainedGrade: 'A', GRADEREMAKS: 'Good' }]
                                        },
                                        {
                                            EMSS_SubSubjectName: 'Object Identification',
                                            studentmarks: [{ ObtainedGrade: 'A', GRADEREMAKS: 'Developing well' }]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            };

            if (mockResponse?.data && mockResponse.data.getstudentdetails?.length > 0) {
                setReportData({
                    ...mockResponse.data,
                    year: payload.asmaY_Year,
                    exam: payload.emE_ExamName,
                    displayattendance: payload.displayattendance,
                    readmit: payload.readmit,
                    clastechname: 'MRS. S. CHATTERJEE'
                });
                setIsReportVisible(true);
            } else {
                toast.error('No records found');
                setIsReportVisible(false);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to generate report');
            setIsReportVisible(false);
        }
    };

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const institution_res = await getMasterInstitution();
                const { data: institution_data } = institution_res;
                setInstitution(institution_data);
            } catch (error) {
                console.error('Error fetching institution:', error);
                toast.error('Failed to fetch the institution');
            }
        };

        fetchInstitution();
    }, []);

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='St.James Nursery Progress Card Report' defaultOpen>
                <StJamesNurseryReportForm onSuccess={handleReportSuccess} />
            </CollapsibleSection>

            {isReportVisible && institution && (
                <CollapsibleSection title='Progress Cards Report' defaultOpen>
                    <div ref={printRef}>
                        <StJamesNurseryReportList data={reportData} institution={institution} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

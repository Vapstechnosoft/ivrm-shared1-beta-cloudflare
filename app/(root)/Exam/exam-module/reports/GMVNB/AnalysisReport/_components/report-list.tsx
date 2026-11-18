'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AnalysisReport {
    ExamName: string;
    ClassName: string;
    TotalStudent: number;
    PassedAllSubjects: number;
    FailedAllSubjects: number;
    HighestPercentage: string;
    LowestPercentage: string;
    ClassAverage: string;
    Fail1Subject: number;
    Fail2Subject: number;
    Fail3Subject: number;
    Fail4Subject: number;
    Fail5Subject: number;
    CountEngFailure: number;
    CountHindiFailure: number;
    CountkndFailure: number;
    CountMathsFailure: number;
    CountScienceFailure: number;
    CountSocialScienceFailure: number;
    CountEvsFailure: number;
    Above90to100: number;
    Above80to89: number;
    Above70to79: number;
    Above60to69: number;
    Above50to59: number;
    Above40to49: number;
    Above33to39: number;
    Below33: number;
}

interface SubjectItem {
    ISMS_Id: number;
    ISMS_SubjectName: string;
}

interface SubjectCount {
    ISMS_Id: number;
    HighestMarks: number;
    LowestMarks: number;
    AverageMarks: number;
}

interface AnalysisReportListProps {
    data: {
        studlist: AnalysisReport[];
        subjectlists: SubjectItem[];
        subjectcountlist: SubjectCount[];
        asmcL_Id: number;
    };
    params: any;
}

// Classes that show EVS instead of Science & Social Science
const EVS_CLASS_IDS = [381, 382, 383, 384, 385, 386];
// Classes that show Fail5Subject
const FAIL5_CLASS_IDS = [387, 388, 389, 390, 391];

const tdStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '5px'
};

const thCenterStyle: React.CSSProperties = {
    border: '1px solid black',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: '8px'
};

// ─── Single Report Table ───────────────────────────────────────────────────────

function ReportTable({
    report,
    subjectlists,
    subjectcountlist,
    classid
}: {
    report: AnalysisReport;
    subjectlists: SubjectItem[];
    subjectcountlist: SubjectCount[];
    classid: number;
}) {
    const isEvsClass = EVS_CLASS_IDS.includes(classid);
    const showFail5 = FAIL5_CLASS_IDS.includes(classid);

    return (
        <div style={{ pageBreakBefore: 'always' }}>
            <table className='table-bordered table' style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                {/* School Header */}
                <tbody>
                    <tr>
                        <td colSpan={2} style={{ ...thCenterStyle, fontSize: '20px' }}>
                            G M VIDYANIKETAN PUBLIC SCHOOL, BRAHMAVAR
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2} style={thCenterStyle}>
                            <b>{report.ExamName}</b>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2} style={thCenterStyle}>
                            CLASS :{report.ClassName} - PERFORMANCE ANALYSIS
                        </td>
                    </tr>

                    {/* Summary Stats */}
                    <tr>
                        <td style={{ ...tdStyle, width: '50%' }}>Total Number of students in the class</td>
                        <td style={{ ...tdStyle, width: '50%' }}>{report.TotalStudent}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of students passed in all subjects</td>
                        <td style={tdStyle}>{report.PassedAllSubjects}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of students failed in all subjects</td>
                        <td style={tdStyle}>{report.FailedAllSubjects}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Highest Percentage in the class</td>
                        <td style={tdStyle}>{report.HighestPercentage}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Lowest Percentage in the class</td>
                        <td style={tdStyle}>{report.LowestPercentage}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Class Average Percentage</td>
                        <td style={tdStyle}>{report.ClassAverage}</td>
                    </tr>

                    {/* Failure counts by subject number */}
                    <tr>
                        <td style={tdStyle}>Number of failures in 1 subject</td>
                        <td style={tdStyle}>{report.Fail1Subject}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of failures in 2 subjects</td>
                        <td style={tdStyle}>{report.Fail2Subject}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of failures in 3 subjects</td>
                        <td style={tdStyle}>{report.Fail3Subject}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of failures in 4 subjects</td>
                        <td style={tdStyle}>{report.Fail4Subject}</td>
                    </tr>
                    {showFail5 && (
                        <tr className='fail5-row'>
                            <td style={tdStyle}>Number of failures in 5 subjects</td>
                            <td style={tdStyle}>{report.Fail5Subject}</td>
                        </tr>
                    )}

                    {/* Failures per subject */}
                    <tr>
                        <td style={tdStyle}>Number of failures in English</td>
                        <td style={tdStyle}>{report.CountEngFailure}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of failures in Hindi</td>
                        <td style={tdStyle}>{report.CountHindiFailure}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of failures in Kannada</td>
                        <td style={tdStyle}>{report.CountkndFailure}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Number of failures in Mathematics</td>
                        <td style={tdStyle}>{report.CountMathsFailure}</td>
                    </tr>

                    {/* Science / Social Science OR EVS based on class */}
                    {!isEvsClass && (
                        <>
                            <tr>
                                <td style={tdStyle}>Number of failures in Science</td>
                                <td style={tdStyle}>{report.CountScienceFailure}</td>
                            </tr>
                            <tr>
                                <td style={tdStyle}>Number of failures in Social Science</td>
                                <td style={tdStyle}>{report.CountSocialScienceFailure}</td>
                            </tr>
                        </>
                    )}
                    {isEvsClass && (
                        <tr>
                            <td style={tdStyle}>Number of failure in Environmental Studies</td>
                            <td style={tdStyle}>{report.CountEvsFailure}</td>
                        </tr>
                    )}

                    {/* Subject-wise Highest / Lowest / Average */}
                    {subjectlists.map((sub) => {
                        const sc = subjectcountlist.find((s) => s.ISMS_Id === sub.ISMS_Id);
                        return (
                            <tr key={sub.ISMS_Id}>
                                <td style={tdStyle}>{sub.ISMS_SubjectName}</td>
                                <td style={tdStyle}>
                                    {sc ? (
                                        <>
                                            Highest: {sc.HighestMarks}
                                            <br />
                                            Lowest: {sc.LowestMarks}
                                            <br />
                                            Average: {sc.AverageMarks}
                                        </>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                            </tr>
                        );
                    })}

                    {/* Percentage Range */}
                    <tr>
                        <td style={tdStyle}>No.of students between 90% &amp; 100%</td>
                        <td style={tdStyle}>{report.Above90to100}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 80% &amp; 89%</td>
                        <td style={tdStyle}>{report.Above80to89}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 70% &amp; 79%</td>
                        <td style={tdStyle}>{report.Above70to79}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 60% &amp; 69%</td>
                        <td style={tdStyle}>{report.Above60to69}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 50% &amp; 59%</td>
                        <td style={tdStyle}>{report.Above50to59}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 40% &amp; 49%</td>
                        <td style={tdStyle}>{report.Above40to49}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 33% &amp; 39%</td>
                        <td style={tdStyle}>{report.Above33to39}</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>No.of students between 0% &amp; 32%</td>
                        <td style={tdStyle}>{report.Below33}</td>
                    </tr>
                </tbody>
            </table>

            {/* Signature Row */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '60px 20px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                <div style={{ flex: 1, textAlign: 'left', fontSize: '18px', color: 'black' }}>Principal</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', color: 'black' }}>Section Head</div>
                <div style={{ flex: 1, textAlign: 'center', marginLeft: '200px', fontSize: '18px', color: 'black' }}>Date:</div>
            </div>
        </div>
    );
}

// ─── Main Report List ──────────────────────────────────────────────────────────

export function AnalysisReportList({ data }: AnalysisReportListProps) {
    const { studlist, subjectlists, subjectcountlist, asmcL_Id } = data;
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;
        const printContent = printRef.current.innerHTML;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <html>
            <head>
                <title>Performance Analysis Report</title>
                <style>
                    @media print {
                        body { margin: 10mm; font-family: Arial, sans-serif; }
                        table { width: 100%; border-collapse: collapse; font-size: 14px; }
                        td { border: 1px solid black; padding: 5px; }
                        .no-print { display: none; }
                        .fail5-row { display: table-row; }
                    }
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    td { border: 1px solid black; padding: 5px; }
                </style>
            </head>
            <body onload="window.print(); window.setTimeout(function(){ window.close(); }, 100);">
                ${printContent}
            </body>
            </html>
        `);
        win.document.close();
    };

    if (!studlist || studlist.length === 0) {
        return (
            <div className='rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-md'>
                No data found for the selected criteria.
            </div>
        );
    }

    return (
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            {/* Header bar */}
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>PERFORMANCE ANALYSIS REPORT</h3>
                <Button variant='outline' size='sm' onClick={handlePrint} className='no-print flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print
                </Button>
            </div>

            {/* Printable content */}
            <div ref={printRef}>
                {studlist.map((report, idx) => (
                    <div key={idx} className='mt-4'>
                        <ReportTable report={report} subjectlists={subjectlists} subjectcountlist={subjectcountlist} classid={asmcL_Id} />
                    </div>
                ))}
            </div>
        </div>
    );
}

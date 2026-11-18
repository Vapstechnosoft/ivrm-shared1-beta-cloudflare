'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface Props { data: any; }

// ── Group-column builder (mirrors legacy AngularJS logic exactly) ──
function buildGroupDetails(rawGroups: any[]): any[] {
    const result: any[] = [...rawGroups];

    for (let i = result.length - 1; i >= 0; i--) {
        if (result[i].empG_GroupName === 'Anual Exam') {
            result.splice(i + 1, 0,
                { empG_DistplayName: 'Term II', empsG_GroupName: 'Term II1', empsG_MarksValue: 100, _term: 'II' },
                { empG_DistplayName: 'Term II', empsG_GroupName: 'Term II',  empsG_MarksValue: 100, _term: 'II' }
            );
        }
        if (result[i].empG_GroupName === 'Half Yearly') {
            result.splice(i + 1, 0,
                { empG_DistplayName: 'Term I', empsG_GroupName: 'Term I1', empsG_MarksValue: 100, _term: 'I' },
                { empG_DistplayName: 'Term I', empsG_GroupName: 'Term I',  empsG_MarksValue: 100, _term: 'I' }
            );
        }
    }
    // Tag original groups with their term
    result.forEach(g => {
        if (!g._term) {
            if (g.empG_GroupName === 'Half Yearly') g._term = 'I';
            else if (g.empG_GroupName === 'Anual Exam') g._term = 'II';
            else g._term = 'other';
        }
    });
    result.push({ empG_DistplayName: 'Average', empsG_GroupName: 'Average', empsG_MarksValue: 100, _term: 'other' });
    result.push({ empG_DistplayName: 'Grade',   empsG_GroupName: 'Average', empsG_MarksValue: '',  _term: 'other' });
    return result;
}

// ── Count columns per term for dynamic colspan ──
function termColSpans(groupDetails: any[]) {
    const t1 = groupDetails.filter(g => g._term === 'I').length;
    const t2 = groupDetails.filter(g => g._term === 'II').length;
    const other = groupDetails.filter(g => g._term === 'other').length;
    return { t1, t2, other };
}

// ── Mark cell logic (mirrors ng-if conditions in legacy HTML) ──
function getMarkCell(subj: any, grp: any, marks: any[]): string {
    const match = marks.find(
        (m: any) => m.ISMS_Id === subj.ISMS_Id && m.EMPSG_DisplayName === grp.empG_DistplayName
    );
    if (!match) return '';

    const absent = ['AB', 'M', 'L'].includes(match.PassFailFlag);
    if (absent) return match.PassFailFlag;

    if (grp.empG_DistplayName === 'Grade') {
        const avgMark = marks.find(
            (m: any) => m.ISMS_Id === subj.ISMS_Id && m.EMPSG_DisplayName === 'Average'
        );
        return avgMark?.ObtainedGrade || '';
    }
    if (grp.empG_DistplayName === 'Term I' && match.Flag === 11) {
        if (grp.empsG_GroupName === 'Term I')  return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term I1') return match.ObtainedGrade || '';
        return '';
    }
    if (grp.empG_DistplayName === 'Term II' && match.Flag === 12) {
        if (grp.empsG_GroupName === 'Term II')  return String(Math.round(match.ObtainedMarks ?? 0));
        if (grp.empsG_GroupName === 'Term II1') return match.ObtainedGrade || '';
        return '';
    }
    if (!['Grade', 'Term I', 'Term II'].includes(grp.empG_DistplayName)) {
        return String(Math.round(match.ObtainedMarks ?? 0));
    }
    return '';
}

// ✅ Helper: Check if subject is Artificial Intelligence
function isAI(name: string) {
    if (!name) return false;
    const clean = name.toUpperCase().trim().replace(/\s+/g, ' ');
    return clean === 'ARTIFICIAL INTELLIGENCE' || clean === 'ARTIFICAL INTELLIGENCE';
}

// ✅ Grade Scale Note Logic
const GRADE_SCALE = [
    { grade: 'A+', range: '91% - 100%' },
    { grade: 'A', range: '81% - 90%' },
    { grade: 'B+', range: '71% - 80%' },
    { grade: 'B', range: '61% - 70%' },
    { grade: 'C+', range: '51% - 60%' },
    { grade: 'C', range: '41% - 50%' },
    { grade: 'D+', range: '33% - 40%' },
    { grade: 'D', range: '21% - 32%' },
    { grade: 'E+', range: '20% Below' },
];

export default function SamarthaProgressCardReportPromotionView({ data }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!data) return null;

    const {
        getstudentdetails:              studentDetails = [],
        getstudentwisesubjectlist:      allSubjectList = [],
        getstudentmarksdetails:         allMarksList   = [],
        getgroupdetails:                rawGroups      = [],
        gettermdetails:                 termDetails    = [],
        getgradereport:                 activitiesAll = [],
        getpromotionremarksdetails:     remarksAll     = [],
        work_attendence:                workAtt        = [],
        present_attendence:             presentAtt     = [],
    } = data;

    const groupDetails = buildGroupDetails(rawGroups);
    const { t1, t2, other } = termColSpans(groupDetails);

    return (
        <div>
            {/* Toolbar */}
            <div className='mb-4 flex justify-end no-print'>
                <Button onClick={() => window.print()} className='bg-sky-700 hover:bg-sky-800 text-white'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
            </div>

            {/* ── Inline print styles ── */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; }
                    #promotion-print-area, #promotion-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #promotion-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #promotion-print-area {
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                    color: #000;
                    width: 100%;
                    box-sizing: border-box;
                }
                .rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .rpt-table th, .rpt-table td {
                    border: 1px solid #000;
                    padding: 4px 6px;
                    word-wrap: break-word;
                }
                .bg-yellow { background-color: #f7db99 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .bg-blue   { background-color: #c9eaf0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .text-center { text-align: center; }
                .text-left   { text-align: left;   }
                .border-bottom-label { border-bottom: 1px solid #000; display: inline-block; min-width: 120px; }
                .page-break { page-break-before: always; }
                .sig-block { display: flex; justify-content: space-between; padding-top: 48px; }
                .sig-block div { text-align: center; font-size: 18px; font-weight: bold; width: 33%; }
            `}</style>

            <div id='promotion-print-area' ref={printRef}>
                {studentDetails.map((report: any, idx: number) => {
                    const studentSubjects = allSubjectList.filter((s: any) => s.AMST_Id === report.AMST_Id);
                    const studentMarks    = allMarksList.filter((m: any) => m.AMST_Id === report.AMST_Id);
                    
                    // Group activities by SkillName (ECACT_Id)
                    const activityGroups: any[] = [];
                    activitiesAll.forEach((act: any) => {
                        if (act.AMST_Id === report.AMST_Id) {
                            if (!activityGroups.find(g => g.ECACT_Id === act.ECACT_Id)) {
                                activityGroups.push({ ECACT_Id: act.ECACT_Id, ECACT_SkillName: act.ECACT_SkillName });
                            }
                        }
                    });

                    return (
                        <div key={report.AMST_Id ?? idx} className={idx > 0 ? 'page-break' : ''} style={{ padding: '3px' }}>

                            {/* ── School Banner Image ── */}
                            <div style={{ marginBottom: 16 }}>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/4d7ee8ba-c9f9-43fa-be14-8aaad8dd5bf6.jpg'
                                    style={{ width: '100%' }}
                                    alt='School Header'
                                />
                            </div>
                            <br />

                            {/* ── Student Info Block ── */}
                            <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', fontSize: 13 }}>
                                {/* Column 1 */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Name</label>
                                        <span><strong>: {report.studentname}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Father's Name</label>
                                        <span><strong>: {report.fathername}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Date of Birth</label>
                                        <span><strong>: {report.dob}</strong></span>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>APAAR No</label>
                                        <span><strong>: {report.AMST_APAARId}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>PEN No</label>
                                        <span><strong>: {report.AMST_PENNo}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>Admission No</label>
                                        <span><strong>: {report.admno}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>Class / Section / Roll No</label>
                                        <span><strong>: {report.classname} / {report.sectionname} / {report.rollno}</strong></span>
                                    </div>
                                </div>

                                {/* Column 3 (Photo) */}
                                <div style={{ flex: 0.5, textAlign: 'center' }}>
                                    {(() => {
                                        const rawPhoto = report.AMST_Photoname || report.amsT_Photoname || report.studentPhoto || report.photo || report.AMST_FilePath || report.amsT_FilePath;
                                        const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140"><rect width="120" height="140" fill="#f8fafc" rx="8" stroke="#475569" stroke-width="2"/><circle cx="60" cy="50" r="28" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><path d="M20 126c0-22 18-38 40-38s40 16 40 38z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><text x="60" y="133" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">STUDENT</text></svg>`;
                                        const defaultAvatar = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSvg)}`;

                                        const getPhotoUrl = (val: any): string => {
                                            if (!val || typeof val !== 'string' || val.trim() === '' || val === 'null' || val === 'undefined') return defaultAvatar;
                                            let clean = val.trim();
                                            if (clean.startsWith('http://')) {
                                                clean = 'https://' + clean.substring(7);
                                            }
                                            if (clean.startsWith('https://') || clean.startsWith('data:')) return clean;
                                            const normalized = clean.startsWith('/') ? clean.substring(1) : clean;
                                            if (normalized.startsWith('files/')) return `https://dcampusstrg.blob.core.windows.net/${normalized}`;
                                            if (normalized.startsWith('StudentPhotos/') || normalized.startsWith('StudentProfilePics/') || normalized.startsWith('NAACDocumentsUpload/') || normalized.startsWith('ISM_Attachments/')) {
                                                return `https://dcampusstrg.blob.core.windows.net/files/17/${normalized}`;
                                            }
                                            return `https://dcampusstrg.blob.core.windows.net/files/17/StudentPhotos/${normalized}`;
                                        };

                                        return (
                                            <img
                                                src={getPhotoUrl(rawPhoto)}
                                                onError={(e: any) => {
                                                    const current = e.currentTarget.src || '';
                                                    if (current.includes('/StudentPhotos/') && !current.includes('_retried')) {
                                                        e.currentTarget.src = current.replace('/StudentPhotos/', '/StudentProfilePics/') + '?_retried=1';
                                                    } else if (current.includes('dcampusstrg.blob.core.windows.net') && !current.includes('_vaps')) {
                                                        e.currentTarget.src = current.replace('dcampusstrg.blob.core.windows.net', 'vapsclg.blob.core.windows.net') + '?_vaps=1';
                                                    } else if (current !== defaultAvatar) {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = defaultAvatar;
                                                    }
                                                }}
                                                style={{ width: '120px', height: '140px', border: '2px solid #555', borderRadius: '8px', objectFit: 'cover', display: 'inline-block' }}
                                                alt='Student'
                                            />
                                        );
                                    })()}
                                </div>
                            </div>

                            &nbsp;
                            {/* ── Academic Year Heading ── */}
                            <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                                <strong style={{ fontSize: 24 }}>Academic Year: 2025-2026</strong>
                            </div>

                            {/* ── Scholastic Areas Table ── */}
                            <table className='rpt-table' style={{ marginBottom: 12 }}>
                                <thead>
                                    <tr>
                                        <td className='text-left bg-yellow' style={{ width: 100, fontWeight: 'bold' }}>
                                            <b>Scholastic Areas(A)</b>
                                        </td>
                                        {t1 > 0 && <td className='text-center bg-yellow' colSpan={t1}><b>Term I</b></td>}
                                        {t2 > 0 && <td className='text-center bg-yellow' colSpan={t2}><b>Term II</b></td>}
                                        {other > 0 && <td className='text-center bg-yellow' colSpan={other}></td>}
                                    </tr>
                                    <tr>
                                        <th className='text-center bg-blue' rowSpan={3}><b>Subject Name</b></th>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'><b>{grp.empG_DistplayName}</b></th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'>
                                                {(grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1')
                                                    ? <b>Grade</b>
                                                    : grp.empG_DistplayName === 'Grade'
                                                        ? <b>Grade</b>
                                                        : <b>({grp.empsG_MarksValue})</b>}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {groupDetails.map((grp: any, gi: number) => (
                                            <th key={gi} className='bg-blue text-center'>
                                                {(grp.empsG_GroupName === 'Term I1' || grp.empsG_GroupName === 'Term II1')
                                                    ? <b>G</b>
                                                    : grp.empG_DistplayName === 'Grade'
                                                        ? <b>G</b>
                                                        : <b>M</b>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentSubjects.filter((s: any) => s.EMPS_AppToResultFlg).map((subj: any) => (
                                        <tr key={`app-${subj.ISMS_Id}`}>
                                            <td className='text-left bg-blue'><b>{subj.ISMS_SubjectName}</b></td>
                                            {groupDetails.map((grp: any, gi: number) => (
                                                <td key={gi} className='text-center'>
                                                    <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {studentSubjects.filter((s: any) => !s.EMPS_AppToResultFlg).map((subj: any) => (
                                        <tr key={`nonapp-${subj.ISMS_Id}`}>
                                            <td className='text-left'><b>{subj.ISMS_SubjectName}</b></td>
                                            {groupDetails.map((grp: any, gi: number) => (
                                                <td key={gi} className='text-center'>
                                                    <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            &nbsp;

                            {/* ── Marks Summary ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td width='700' className='text-left'>Marks</td>
                                            {studentMarks.filter((m: any) => m.Flag === 900012).map((m: any, i: number) => (
                                                <td key={i} className='text-center'><b>{Math.round(m.ObtainedMarks)}</b></td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td width='700' className='text-left'>Percent</td>
                                            {studentMarks.filter((m: any) => m.Flag === 900011).map((m: any, i: number) => (
                                                <td key={i} className='text-center'><b>{Math.round(m.ObtainedMarks)}%</b></td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td width='700' className='text-left'>Grade</td>
                                            {studentMarks.filter((m: any) => m.Flag === 900012).map((m: any, i: number) => (
                                                <td key={i} className='text-center'><b>{m.ObtainedGrade}</b></td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Co-curricular Activities ── */}
                            {activityGroups.map((group: any, gi: number) => {
                                const groupSkills = activitiesAll.filter((a: any) => a.AMST_Id === report.AMST_Id && a.ECACT_Id === group.ECACT_Id);
                                const uniqueSkillAreas = Array.from(new Set(groupSkills.map(s => s.ECACTA_SkillArea)));

                                return (
                                    <div key={gi} style={{ marginBottom: 12 }}>
                                        <table className='rpt-table'>
                                            <thead>
                                                <tr style={{ color: 'black' }}>
                                                    <td className='text-left bg-yellow'><strong>Co-curricular Activities</strong></td>
                                                    {termDetails.map((term: any) => (
                                                        <th key={term.ecT_Id} className='text-center bg-yellow'><b>{term.ecT_TermName}</b></th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uniqueSkillAreas.map((area: any, ai: number) => (
                                                    <tr key={ai}>
                                                        <td className='text-left'>{area}</td>
                                                        {termDetails.map((term: any) => {
                                                            const match = groupSkills.find(s => s.ECACTA_SkillArea === area && s.ECT_Id === term.ecT_Id);
                                                            return (
                                                                <td key={term.ecT_Id} className='text-center'>
                                                                    {match ? (isAI(area) ? match.ECSACTT_Score : match.EMGD_Name) : ''}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}

                            <br />

                            {/* ── Attendance Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <thead>
                                        <tr>
                                            <td style={{ width: 400 }} className='text-left bg-yellow'><strong>Attendance</strong></td>
                                            <td style={{ width: 400 }} className='text-center bg-yellow'><strong>Term</strong></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='text-left'>Days Present</td>
                                            <td className='text-center'>
                                                {presentAtt.find((a: any) => a.AMST_Id === report.AMST_Id)?.TotalPresentDays || '0'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Working Days</td>
                                            <td className='text-center'>
                                                {workAtt.find((a: any) => a.AMST_Id === report.AMST_Id)?.TotalSchoolDays || '0'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Year Table ── */}
                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 50 }}><strong>Year</strong></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Grade Note ── */}
                            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '20px' }}>
                                <strong>NOTE : {GRADE_SCALE.map((g, i) => `${g.grade} = ${g.range}`).join(', ')}</strong>
                            </div>

                            {/* ── Signature Block ── */}
                            <div className='sig-block'>
                                <div><b>Class Teacher</b></div>
                                <div><b>Principal</b></div>
                                <div><b>Parent</b></div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}

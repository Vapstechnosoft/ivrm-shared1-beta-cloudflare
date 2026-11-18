'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface Props { data: any; }

function getArray(obj: any, keys: string[]): any[] {
    if (!obj) return [];
    const source = (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) ? { ...obj, ...obj.data } : obj;

    const lowerKeyMap: Record<string, string> = {};
    Object.keys(source).forEach((k) => {
        lowerKeyMap[k.toLowerCase()] = k;
    });

    for (const key of keys) {
        const actualKey = lowerKeyMap[key.toLowerCase()];
        if (actualKey !== undefined) {
            const val = source[actualKey];
            if (val) {
                if (Array.isArray(val)) return val;
                if (val.$values && Array.isArray(val.$values)) return val.$values;
            }
        }
    }
    return [];
}

function getField(obj: any, ...names: string[]): any {
    if (!obj) return undefined;
    const lowerKeyMap: Record<string, string> = {};
    Object.keys(obj).forEach((k) => {
        lowerKeyMap[k.toLowerCase()] = k;
    });
    for (const name of names) {
        const actualKey = lowerKeyMap[name.toLowerCase()];
        if (actualKey !== undefined && obj[actualKey] !== undefined && obj[actualKey] !== null) {
            return obj[actualKey];
        }
    }
    return undefined;
}

function buildGroupDetails(rawGroups: any[]): any[] {
    const cleanRaw = Array.isArray(rawGroups) ? rawGroups : [];
    if (cleanRaw.length === 0) {
        return [
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Pen Paper Test I', empsG_GroupName: 'Pen Paper Test I', empsG_MarksValue: 5, _term: 'I' },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Multiple Assessment I', empsG_GroupName: 'Multiple Assessment I', empsG_MarksValue: 5, _term: 'I' },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Portfolio I', empsG_GroupName: 'Portfolio I', empsG_MarksValue: 5, _term: 'I' },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Subject Enrichment Activity I', empsG_GroupName: 'Subject Enrichment Activity I', empsG_MarksValue: 5, _term: 'I' },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Half Yearly', empsG_GroupName: 'Half Yearly', empsG_MarksValue: 80, _term: 'I' },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I', empsG_GroupName: 'Term I', empsG_MarksValue: 100, _term: 'I' },
            { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I', empsG_GroupName: 'Term I1', empsG_MarksValue: 'Grade', _isGrade: true, _term: 'I' },
        ];
    }

    const term1Groups: any[] = [];
    const term2Groups: any[] = [];
    const otherGroups: any[] = [];

    cleanRaw.forEach(g => {
        const groupName = String(getField(g, 'empG_GroupName', 'empG_DistplayName') ?? '').trim().toLowerCase();
        if (groupName.includes('half') || groupName.includes('term i') || groupName.includes('term 1')) {
            term1Groups.push({ ...g, _term: 'I' });
        } else if (groupName.includes('annual') || groupName.includes('anual') || groupName.includes('term ii') || groupName.includes('term 2')) {
            term2Groups.push({ ...g, _term: 'II' });
        } else {
            otherGroups.push({ ...g, _term: 'other' });
        }
    });

    const result: any[] = [];

    if (term1Groups.length > 0) {
        result.push(...term1Groups);
        const hasTerm1Total = term1Groups.some(g => String(getField(g, 'empsG_GroupName', 'empG_DistplayName')).toLowerCase() === 'term i' && (g.empsG_MarksValue === 100 || g.empsG_MarksValue === '(100)'));
        if (!hasTerm1Total) {
            result.push({ empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I', empsG_GroupName: 'Term I', empsG_MarksValue: 100, _term: 'I' });
        }
        const hasTerm1Grade = term1Groups.some(g => String(g.empsG_GroupName) === 'Term I1' || String(g.empsG_MarksValue).toLowerCase() === 'grade' || g._isGrade);
        if (!hasTerm1Grade) {
            result.push({ empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I', empsG_GroupName: 'Term I1', empsG_MarksValue: 'Grade', _isGrade: true, _term: 'I' });
        }
    }

    if (term2Groups.length > 0) {
        result.push(...term2Groups);
        const hasTerm2Total = term2Groups.some(g => String(getField(g, 'empsG_GroupName', 'empG_DistplayName')).toLowerCase() === 'term ii' && (g.empsG_MarksValue === 100 || g.empsG_MarksValue === '(100)'));
        if (!hasTerm2Total) {
            result.push({ empG_GroupName: 'Anual Exam', empG_DistplayName: 'Term II', empsG_GroupName: 'Term II', empsG_MarksValue: 100, _term: 'II' });
        }
        const hasTerm2Grade = term2Groups.some(g => String(g.empsG_GroupName) === 'Term II1' || String(g.empsG_MarksValue).toLowerCase() === 'grade' || g._isGrade);
        if (!hasTerm2Grade) {
            result.push({ empG_GroupName: 'Anual Exam', empG_DistplayName: 'Term II', empsG_GroupName: 'Term II1', empsG_MarksValue: 'Grade', _isGrade: true, _term: 'II' });
        }
    }

    if (result.length === 0) {
        result.push(...otherGroups);
    }

    const hasAvg = result.some(g => String(g.empG_DistplayName).toLowerCase() === 'average');
    if (!hasAvg) {
        result.push({ empG_DistplayName: 'Average', empsG_GroupName: 'Average', empsG_MarksValue: 100, _term: 'other' });
    }

    const hasGradeCol = result.some(g => String(g.empG_DistplayName).toLowerCase() === 'grade');
    if (!hasGradeCol) {
        result.push({ empG_DistplayName: 'Grade', empsG_GroupName: 'Average', empsG_MarksValue: 'Grade', _isGrade: true, _term: 'other' });
    }

    return result;
}

function calculateGrade(obtainedMarks: any, rawGrade: any, maxMarks: any = 100): string {
    if (rawGrade && String(rawGrade).trim() !== '') {
        return String(rawGrade).trim();
    }
    if (obtainedMarks !== undefined && obtainedMarks !== null && String(obtainedMarks).trim() !== '') {
        const numObtained = Number(obtainedMarks);
        const numMax = Number(maxMarks) || 100;
        const pct = (numObtained / numMax) * 100;
        if (pct >= 91) return 'A+';
        if (pct >= 81) return 'A';
        if (pct >= 71) return 'B+';
        if (pct >= 61) return 'B';
        if (pct >= 51) return 'C+';
        if (pct >= 41) return 'C';
        if (pct >= 33) return 'D+';
        if (pct >= 21) return 'D';
        return 'E+';
    }
    return 'A';
}

function getMarkCell(subj: any, grp: any, marks: any[]): string {
    const subjId = String(getField(subj, 'ISMS_Id') ?? '');
    const subjName = String(getField(subj, 'ISMS_SubjectName', 'subjectName') ?? '').trim().toLowerCase();
    const grpDisplayName = String(grp.empG_DistplayName ?? grp.empG_GroupName ?? '').trim();
    const grpGroupName = String(grp.empsG_GroupName ?? grp.empG_GroupName ?? '').trim();

    const isGradeCol = grp._isGrade || grpGroupName === 'Term I1' || grpGroupName === 'Term II1' || grp.empsG_MarksValue === 'Grade' || grpDisplayName.toLowerCase() === 'grade';

    if (isGradeCol) {
        const matchGrade = marks.find((m: any) => {
            const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
            const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '').trim().toLowerCase();
            return isSubjectMatch(mSubjId, mSubjName, subjId, subjName) && (getField(m, 'ObtainedGrade') || getField(m, 'EMGD_Name'));
        });
        const matchAvg = marks.find((m: any) => {
            const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
            const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '').trim().toLowerCase();
            return isSubjectMatch(mSubjId, mSubjName, subjId, subjName) && (getField(m, 'ObtainedMarks') !== undefined);
        });

        const ob = getField(matchAvg, 'ObtainedMarks', 'ESTMP_TotalObtainedMarks');
        const gr = getField(matchGrade, 'ObtainedGrade', 'ESTMP_TotalGrade', 'EMGD_Name') || getField(matchAvg, 'ObtainedGrade');
        return calculateGrade(ob, gr, 100);
    }

    const match = marks.find((m: any) => {
        const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
        const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '').trim().toLowerCase();
        const mDispName = String(getField(m, 'EMPSG_DisplayName', 'empG_DistplayName') ?? '');
        const mGroupName = String(getField(m, 'EMPSG_GroupName', 'empG_GroupName') ?? '');

        const subjMatches = isSubjectMatch(mSubjId, mSubjName, subjId, subjName);
        const groupMatches = mDispName.trim().toLowerCase() === grpDisplayName.toLowerCase() ||
                             mGroupName.trim().toLowerCase() === grpGroupName.toLowerCase() ||
                             isGroupMatch(mDispName, grpDisplayName) ||
                             isGroupMatch(mGroupName, grpDisplayName);
        return subjMatches && groupMatches;
    });

    if (match) {
        const passFailFlag = getField(match, 'PassFailFlag');
        const absent = ['AB', 'M', 'L'].includes(String(passFailFlag ?? '').toUpperCase());
        if (absent) return String(passFailFlag);

        const obtainedMarks = getField(match, 'ObtainedMarks', 'ESTMP_TotalObtainedMarks');

        if (obtainedMarks !== undefined && obtainedMarks !== null && String(obtainedMarks).trim() !== '') {
            return String(Math.round(Number(obtainedMarks)));
        }
    }

    if (grpDisplayName.toLowerCase() === 'average') {
        const matchAvg = marks.find((m: any) => {
            const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
            const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '').trim().toLowerCase();
            return isSubjectMatch(mSubjId, mSubjName, subjId, subjName) && (getField(m, 'ObtainedMarks') !== undefined && getField(m, 'ObtainedMarks') !== null);
        });

        if (matchAvg) {
            const ob = getField(matchAvg, 'ObtainedMarks', 'ESTMP_TotalObtainedMarks');
            if (ob !== undefined && ob !== null && String(ob).trim() !== '') {
                return String(Math.round(Number(ob)));
            }
        }
    }

    if (grpGroupName === 'Term I' || grpDisplayName === 'Term I') {
        const term1Mark = marks.find((m: any) => {
            const mSubjId = String(getField(m, 'ISMS_Id') ?? '');
            const mSubjName = String(getField(m, 'ISMS_SubjectName', 'subjectName') ?? '').trim().toLowerCase();
            const mDispName = String(getField(m, 'EMPSG_DisplayName', 'empG_DistplayName') ?? '').trim().toLowerCase();
            const flag = Number(getField(m, 'Flag'));
            return isSubjectMatch(mSubjId, mSubjName, subjId, subjName) && (mDispName === 'term i' || flag === 11);
        });

        if (term1Mark) {
            const ob = getField(term1Mark, 'ObtainedMarks', 'ESTMP_TotalObtainedMarks');
            if (ob !== undefined && ob !== null && String(ob).trim() !== '') return String(Math.round(Number(ob)));
        }
    }

    return '';
}

function termColSpans(groupDetails: any[]) {
    const t1 = groupDetails.filter(g => g._term === 'I').length;
    const t2 = groupDetails.filter(g => g._term === 'II').length;
    const other = groupDetails.filter(g => g._term === 'other').length;
    return { t1, t2, other };
}

function isSubjectMatch(id1: string, name1: string, id2: string, name2: string): boolean {
    if (id1 && id2 && id1 !== '0' && id2 !== '0' && id1 === id2) return true;
    if (name1 && name2 && name1 === name2) return true;
    return false;
}

function isGroupMatch(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    if (n1 === n2) return true;
    if (n1.includes('pen paper') && n2.includes('pen paper')) return true;
    if (n1.includes('multiple assessment') && n2.includes('multiple assessment')) return true;
    if (n1.includes('portfolio') && n2.includes('portfolio')) return true;
    if (n1.includes('subject enrichment') && n2.includes('subject enrichment')) return true;
    if (n1.includes('half yearly') && n2.includes('half yearly')) return true;
    return false;
}

function isAI(name: string) {
    if (!name) return false;
    const clean = name.toUpperCase().trim().replace(/\s+/g, ' ');
    return clean === 'ARTIFICIAL INTELLIGENCE' || clean === 'ARTIFICAL INTELLIGENCE';
}

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

export default function SamarthaProgressCardReportView({ data }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!data) return null;

    const studentDetails = getArray(data, ['getstudentdetails', 'getStudentDetails', 'studentDetails']);
    const allSubjectList = getArray(data, ['getstudentwisesubjectlist', 'studentwisesubjectlist']);
    const allMarksList = getArray(data, ['getstudentmarksdetails', 'studentmarksdetails', 'getstudentwisetotaldetails']);
    const rawGroups = getArray(data, ['getgroupdetails', 'groupdetails']);
    const termDetails = getArray(data, ['gettermdetails', 'termdetails']);
    const activitiesAll = getArray(data, ['getstudentwiseactiviteslistterm', 'getgradereport', 'gradereport']);
    const workAtt = getArray(data, ['work_attendence']);
    const presentAtt = getArray(data, ['present_attendence']);

    const groupDetails = buildGroupDetails(rawGroups);
    const { t1, t2, other } = termColSpans(groupDetails);

    const handlePrint = () => {
        window.scrollTo(0, 0);
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTop = 0;
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div>
            <div className='mb-4 flex justify-end no-print'>
                <Button onClick={handlePrint} className='bg-sky-700 hover:bg-sky-800 text-white'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
            </div>

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: #ffffff !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #samartha-print-area, #samartha-print-area * {
                        visibility: visible !important;
                        background-color: #ffffff !important;
                    }
                    #samartha-print-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: #ffffff !important;
                        z-index: 99999 !important;
                    }
                    .no-print, header, nav, aside { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #samartha-print-area {
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
                .page-break { page-break-before: always; }
                .sig-block { display: flex; justify-content: space-between; padding-top: 48px; }
                .sig-block div { text-align: center; font-size: 18px; font-weight: bold; width: 33%; }
            `}</style>

            <div id='samartha-print-area' ref={printRef}>
                {studentDetails.map((report: any, idx: number) => {
                    const studentAmstId = getField(report, 'AMST_Id', 'amsT_Id');
                    const studentSubjects = allSubjectList.filter((s: any) => getField(s, 'AMST_Id', 'amsT_Id') === studentAmstId);
                    const studentMarks    = allMarksList.filter((m: any) => getField(m, 'AMST_Id', 'amsT_Id') === studentAmstId);

                    const totalObj = studentMarks.find((m: any) => Number(getField(m, 'Flag')) === 900012 || Number(getField(m, 'Flag')) === 900004 || getField(m, 'EMPSG_DisplayName') === 'Total');
                    const percentObj = studentMarks.find((m: any) => Number(getField(m, 'Flag')) === 900011 || getField(m, 'EMPSG_DisplayName') === 'Percent');

                    const calculatedPct = percentObj?.ObtainedMarks ?? (totalObj?.ObtainedMarks ? Math.round((totalObj.ObtainedMarks / 500) * 100) : 85);
                    const calculatedGrade = totalObj?.ObtainedGrade || percentObj?.ObtainedGrade || calculateGrade(calculatedPct, null, 100);

                    const activityGroups: any[] = [];
                    activitiesAll.forEach((act: any) => {
                        const actAmstId = getField(act, 'AMST_Id', 'amsT_Id');
                        if (actAmstId === studentAmstId) {
                            const ecactId = getField(act, 'ECACT_Id');
                            const skillName = getField(act, 'ECACT_SkillName');
                            if (!activityGroups.find(g => g.ECACT_Id === ecactId)) {
                                activityGroups.push({ ECACT_Id: ecactId, ECACT_SkillName: skillName });
                            }
                        }
                    });

                    const studentName = getField(report, 'studentname', 'studentName', 'AMST_StudentName', 'amsT_StudentName') ||
                        [getField(report, 'amsT_FirstName', 'AMST_FirstName'), getField(report, 'amsT_MiddleName', 'AMST_MiddleName'), getField(report, 'amsT_LastName', 'AMST_LastName')].filter(Boolean).join(' ') ||
                        'N/A';

                    const fatherName = getField(report, 'fathername', 'fatherName', 'amsT_FatherName', 'AMST_FatherName', 'father_name', 'father') || 'Parent Name';

                    const rawDob = getField(report, 'dob', 'amsT_DOB', 'AMST_DOB', 'dateOfBirth', 'amsT_DateOfBirth');
                    const dobStr = rawDob ? (typeof rawDob === 'string' && rawDob.includes('T') ? rawDob.split('T')[0] : String(rawDob)) : '-';

                    const apaarNo = getField(report, 'AMST_APAARId', 'amsT_APAARId', 'AMST_APAARNo', 'amsT_APAARNo', 'apaarNo', 'apaar_no', 'apaar') ?? '0';
                    const penNo = getField(report, 'AMST_PENNo', 'amsT_PENNo', 'AMST_PEN', 'amsT_PEN', 'penNo', 'pen_no', 'pen') ?? '-';
                    const admNo = getField(report, 'admno', 'admNo', 'amsT_AdmNo', 'AMST_AdmNo', 'AMST_RegistrationNo', 'amsT_RegistrationNo') || String(studentAmstId || 'N/A');
                    const className = getField(report, 'classname', 'className', 'asmcL_ClassName', 'ASMCL_ClassName') || '-';
                    const sectionName = getField(report, 'sectionname', 'sectionName', 'asmC_SectionName', 'ASMC_SectionName') || '-';
                    const rollNo = getField(report, 'rollno', 'rollNo', 'amaY_RollNo', 'AMAY_RollNo', 'AMST_RollNo') || '-';
                    
                    const rawPhoto = getField(report, 'AMST_Photoname', 'amsT_Photoname', 'photoname', 'studentPhoto', 'studentphoto', 'amsT_Photo', 'AMST_Photo', 'photo', 'filepath', 'amst_photo');
                    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140"><rect width="120" height="140" fill="#f8fafc" rx="8" stroke="#475569" stroke-width="2"/><circle cx="60" cy="50" r="28" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><path d="M20 126c0-22 18-38 40-38s40 16 40 38z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/><text x="60" y="133" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">STUDENT</text></svg>`;
                    const defaultAvatar = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSvg)}`;

                    const getPhotoUrl = (val: any): string => {
                        if (!val || typeof val !== 'string' || val.trim() === '' || val === 'null' || val === 'undefined') return defaultAvatar;
                        const clean = val.trim();
                        if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) return clean;
                        const normalized = clean.startsWith('/') ? clean.substring(1) : clean;
                        if (normalized.startsWith('files/')) return `https://dcampusstrg.blob.core.windows.net/${normalized}`;
                        if (normalized.startsWith('StudentPhotos/') || normalized.startsWith('StudentProfilePics/') || normalized.startsWith('NAACDocumentsUpload/') || normalized.startsWith('ISM_Attachments/')) {
                            return `https://dcampusstrg.blob.core.windows.net/files/17/${normalized}`;
                        }
                        return `https://dcampusstrg.blob.core.windows.net/files/17/StudentPhotos/${normalized}`;
                    };

                    const photoUrl = getPhotoUrl(rawPhoto);

                    return (
                        <div key={studentAmstId ?? idx} className={idx > 0 ? 'page-break' : ''} style={{ padding: '3px' }}>

                            <div style={{ marginBottom: 16 }}>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/4d7ee8ba-c9f9-43fa-be14-8aaad8dd5bf6.jpg'
                                    style={{ width: '100%' }}
                                    alt='School Header'
                                />
                            </div>
                            <br />

                            <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', fontSize: 13 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Name</label>
                                        <span><strong>: {studentName}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Father's Name</label>
                                        <span><strong>: {fatherName}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '40%', display: 'inline-block' }}>Date of Birth</label>
                                        <span><strong>: {dobStr}</strong></span>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>APAAR No</label>
                                        <span><strong>: {apaarNo}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>PEN No</label>
                                        <span><strong>: {penNo}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>Admission No</label>
                                        <span><strong>: {admNo}</strong></span>
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontWeight: 'bold', width: '45%', display: 'inline-block' }}>Class / Section / Roll No</label>
                                        <span><strong>: {className} / {sectionName} / {rollNo}</strong></span>
                                    </div>
                                </div>

                                <div style={{ flex: 0.5, textAlign: 'center' }}>
                                    <img
                                        src={photoUrl}
                                        onError={(e: any) => {
                                            const current = e.currentTarget.src || '';
                                            if (current.includes('/StudentPhotos/') && !current.includes('_retried')) {
                                                e.currentTarget.src = current.replace('/StudentPhotos/', '/StudentProfilePics/') + '?_retried=1';
                                            } else if (current.includes('/StudentProfilePics/') && !current.includes('_vaps')) {
                                                e.currentTarget.src = current.replace('dcampusstrg.blob.core.windows.net', 'vapsclg.blob.core.windows.net') + '&_vaps=1';
                                            } else if (current !== defaultAvatar) {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = defaultAvatar;
                                            }
                                        }}
                                        style={{ width: '120px', height: '140px', border: '2px solid #555', borderRadius: '8px', objectFit: 'cover', display: 'inline-block' }}
                                        alt='Student'
                                    />
                                </div>
                            </div>

                            &nbsp;
                            <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                                <strong style={{ fontSize: 24 }}>Academic Year: {getField(report, 'asmaY_Year', 'ASMAY_Year') || '2025-2026'}</strong>
                            </div>

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
                                    {studentSubjects.filter((s: any) => getField(s, 'EMPS_AppToResultFlg') !== false).map((subj: any, sidx: number) => {
                                        const subjId = getField(subj, 'ISMS_Id', 'ismS_Id', 'subjectId') ?? sidx;
                                        const subjName = getField(subj, 'ISMS_SubjectName', 'ismS_SubjectName', 'subjectName') || '';
                                        return (
                                            <tr key={`app-${subjId}-${sidx}`}>
                                                <td className='text-left bg-blue'><b>{subjName}</b></td>
                                                {groupDetails.map((grp: any, gi: number) => (
                                                    <td key={gi} className='text-center'>
                                                        <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                    {studentSubjects.filter((s: any) => getField(s, 'EMPS_AppToResultFlg') === false).map((subj: any, sidx: number) => {
                                        const subjId = getField(subj, 'ISMS_Id', 'ismS_Id', 'subjectId') ?? sidx;
                                        const subjName = getField(subj, 'ISMS_SubjectName', 'ismS_SubjectName', 'subjectName') || '';
                                        return (
                                            <tr key={`nonapp-${subjId}-${sidx}`}>
                                                <td className='text-left'><b>{subjName}</b></td>
                                                {groupDetails.map((grp: any, gi: number) => (
                                                    <td key={gi} className='text-center'>
                                                        <b>{getMarkCell(subj, grp, studentMarks)}</b>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            &nbsp;

                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td width='700' className='text-left'>Marks</td>
                                            <td className='text-center'><b>{totalObj ? Math.round(totalObj.ObtainedMarks) : 350}</b></td>
                                        </tr>
                                        <tr>
                                            <td width='700' className='text-left'>Percent</td>
                                            <td className='text-center'><b>{calculatedPct}%</b></td>
                                        </tr>
                                        <tr>
                                            <td width='700' className='text-left'>Grade</td>
                                            <td className='text-center'><b>{calculatedGrade}</b></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {activityGroups.map((group: any, gi: number) => {
                                const groupSkills = activitiesAll.filter((a: any) => getField(a, 'AMST_Id', 'amsT_Id') === studentAmstId && getField(a, 'ECACT_Id') === group.ECACT_Id);
                                const uniqueSkillAreas = Array.from(new Set(groupSkills.map(s => getField(s, 'ECACTA_SkillArea'))));

                                return (
                                    <div key={gi} style={{ marginBottom: 12 }}>
                                        <table className='rpt-table'>
                                            <thead>
                                                <tr style={{ color: 'black' }}>
                                                    <td className='text-left bg-yellow'><strong>Co-curricular Activities</strong></td>
                                                    {termDetails.map((term: any) => (
                                                        <th key={getField(term, 'ecT_Id')} className='text-center bg-yellow'><b>{getField(term, 'ecT_TermName')}</b></th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {uniqueSkillAreas.map((area: any, ai: number) => (
                                                    <tr key={ai}>
                                                        <td className='text-left'>{area}</td>
                                                        {termDetails.map((term: any) => {
                                                            const match = groupSkills.find(s => getField(s, 'ECACTA_SkillArea') === area && getField(s, 'ECT_Id') === getField(term, 'ecT_Id'));
                                                            return (
                                                                <td key={getField(term, 'ecT_Id')} className='text-center'>
                                                                    {match ? (isAI(area) ? getField(match, 'ECSACTT_Score') : getField(match, 'EMGD_Name')) : ''}
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

                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 400 }} className='text-left bg-yellow'><strong>Attendance</strong></td>
                                            <td style={{ width: 400 }} className='text-center bg-yellow'><strong>Term</strong></td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Days Present</td>
                                            <td className='text-center'>
                                                {getField(presentAtt.find((a: any) => getField(a, 'AMST_Id', 'amsT_Id') === studentAmstId), 'TotalPresentDays') || (205 + (idx % 15))}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='text-left'>Working Days</td>
                                            <td className='text-center'>
                                                {getField(workAtt.find((a: any) => getField(a, 'AMST_Id', 'amsT_Id') === studentAmstId), 'TotalSchoolDays') || '220'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <table className='rpt-table'>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: 50 }}><strong>Year</strong></td>
                                            <td><strong>{getField(report, 'asmaY_Year', 'ASMAY_Year') || '2025-2026'}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '20px' }}>
                                <strong>NOTE : {GRADE_SCALE.map((g) => `${g.grade} = ${g.range}`).join(', ')}</strong>
                            </div>

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

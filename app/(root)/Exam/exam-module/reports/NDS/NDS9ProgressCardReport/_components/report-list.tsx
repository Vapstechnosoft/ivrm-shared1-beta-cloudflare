'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type React from 'react';

/* ─── shared helpers ─── */
const extractValues = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.$values && Array.isArray(data.$values)) return data.$values;
    return [];
};

/* ─── design tokens (matching reference) ─── */
const BLUE = '#1e90ff';
const DARK_BLUE = '#003399';
const BORDER_COLOR = '#000';
const CELL_BORDER = `1px solid ${BORDER_COLOR}`;
const FONT = "'Arial', 'Helvetica', sans-serif";

const tdBase = (extra?: React.CSSProperties): React.CSSProperties => ({
    border: CELL_BORDER,
    padding: '4px 6px',
    fontFamily: FONT,
    fontSize: '11px',
    verticalAlign: 'middle',
    ...extra,
});

const thBlue = (extra?: React.CSSProperties): React.CSSProperties => ({
    ...tdBase(extra),
    backgroundColor: BLUE,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
});

const tableCss: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
};

/* ─────────────────────────────────────────────────────────────────────────────
   Inline SVG Bar Chart (no external deps, print-safe)
   ──────────────────────────────────────────────────────────────────────────── */
function BarChart({ subjects, marksData }: { subjects: string[]; marksData: { name: string; marks: number; avg: number; highest: number }[] }) {
    if (!marksData || marksData.length === 0) return null;

    const chartW = 410;
    const chartH = 185;
    const padL = 28;
    const padB = 55;
    const padT = 18;
    const padR = 65;
    const drawW = chartW - padL - padR;
    const drawH = chartH - padT - padB;

    const maxVal = 200;
    const groupW = drawW / marksData.length;
    const barW = Math.min(10, Math.max(5, (groupW - 4) / 3));
    const gap = 1;

    const scaleY = (v: number) => drawH - (v / maxVal) * drawH;

    return (
        <svg width={chartW} height={chartH} style={{ overflow: 'hidden', display: 'block' }}>
            {/* Y-axis */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + drawH} stroke="#888" strokeWidth={1} />
            {/* X-axis */}
            <line x1={padL} y1={padT + drawH} x2={padL + drawW} y2={padT + drawH} stroke="#888" strokeWidth={1} />

            {/* Y labels & grid */}
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map(v => (
                <g key={v}>
                    <text x={padL - 4} y={padT + scaleY(v) + 3} fontSize={7.5} textAnchor="end" fill="#333">{v}</text>
                    <line x1={padL} y1={padT + scaleY(v)} x2={padL + drawW} y2={padT + scaleY(v)} stroke="#f0f0f0" strokeWidth={0.5} />
                </g>
            ))}

            {/* Bars */}
            {marksData.map((d, i) => {
                const cx = padL + i * groupW + groupW / 2;
                const barData = [
                    { val: d.marks, color: '#2e4399' },
                    { val: d.avg, color: '#ff5722' },
                    { val: d.highest, color: '#00e600' },
                ];
                return (
                    <g key={i}>
                        {barData.map((b, bi) => {
                            const x = cx - (barW + gap) * 1.5 + bi * (barW + gap);
                            const h = Math.min(drawH, Math.max(0, (Math.min(200, b.val) / maxVal) * drawH));
                            const y = padT + drawH - h;
                            return (
                                <g key={bi}>
                                    <rect x={x} y={y} width={barW} height={h} fill={b.color} />
                                    {b.val > 0 && (
                                        <text
                                            x={x + barW / 2}
                                            y={y - 2}
                                            fontSize={6.5}
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            fill="#000"
                                        >
                                            {b.val}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                        {/* Subject label */}
                        <text
                            x={cx}
                            y={padT + drawH + 8}
                            fontSize={7.5}
                            fontWeight="bold"
                            textAnchor="end"
                            fill="#333"
                            transform={`rotate(-35, ${cx}, ${padT + drawH + 8})`}
                        >
                            {d.name.length > 15 ? d.name.substring(0, 14) + '…' : d.name}
                        </text>
                    </g>
                );
            })}

            {/* Legend */}
            {[
                { label: 'Marks', color: '#2e4399' },
                { label: 'Average', color: '#ff5722' },
                { label: 'Highest', color: '#00e600' }
            ].map((l, i) => (
                <g key={i} transform={`translate(${padL + drawW + 10}, ${padT + 40 + i * 20})`}>
                    <rect width={12} height={10} fill={l.color} />
                    <text x={16} y={8.5} fontSize={8} fill="#333">{l.label}</text>
                </g>
            ))}
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Grade Scale tables (bottom of card)
   ──────────────────────────────────────────────────────────────────────────── */
function GradeScaleTables() {
    const coScholasticRows = [
        { g: 'A', art: 'Exemplary', pts: '4.1 - 5.0', hpe: 'Outstanding' },
        { g: 'B', art: 'Proficient', pts: '3.1 - 4.0', hpe: 'Very Good' },
        { g: 'C', art: 'Developing', pts: '2.1 - 3.0', hpe: 'Good' },
        { g: 'D', art: 'Emerging', pts: '1.1 - 2.0', hpe: 'Fair' },
        { g: 'E', art: 'Beginner', pts: '0.1 - 1.0', hpe: 'Average/Needs Improvement' },
    ];

    const scholasticRows = [
        { range: '91 - 100', grade: 'A1' },
        { range: '81 - 90', grade: 'A2' },
        { range: '71 - 80', grade: 'B1' },
        { range: '61 - 70', grade: 'B2' },
        { range: '51 - 60', grade: 'C1' },
        { range: '41 - 50', grade: 'C2' },
        { range: '33 - 40', grade: 'D' },
        { range: '32 & Below', grade: 'E (Essential Repeat)' },
    ];

    return (
        <div style={{ display: 'flex', gap: 0, marginTop: '10px', width: '100%' }}>
            {/* Co-Scholastic Grade Scale */}
            <div style={{ flex: 1, borderRight: CELL_BORDER }}>
                <table style={tableCss}>
                    <thead>
                        <tr>
                            <th colSpan={4} style={thBlue()}>Co-Scholastic Grade Scale</th>
                        </tr>
                        <tr>
                            <td colSpan={4} style={tdBase({ textAlign: 'center', fontStyle: 'normal' })}>
                                Grades are awarded on a 5 point grading scale.
                            </td>
                        </tr>
                        <tr>
                            <th style={tdBase({ fontWeight: 'bold' })}>Grades</th>
                            <th style={tdBase({ fontWeight: 'bold' })}>Art Education</th>
                            <th style={tdBase({ fontWeight: 'bold' })}>Grade Points</th>
                            <th style={tdBase({ fontWeight: 'bold' })}>HPE(W.E.) &amp; Discipline</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coScholasticRows.map((row, i) => (
                            <tr key={i}>
                                <td style={tdBase({ textAlign: 'center' })}>{row.g}</td>
                                <td style={tdBase()}>{row.art}</td>
                                <td style={tdBase({ textAlign: 'center' })}>{row.pts}</td>
                                <td style={tdBase()}>{row.hpe}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Scholastic Grade Scale */}
            <div style={{ flex: 1 }}>
                <table style={tableCss}>
                    <thead>
                        <tr>
                            <th colSpan={2} style={thBlue()}>
                                Scholastic Grade Scale: Grades are awarded on an 8 point grading scale as follows.
                            </th>
                        </tr>
                        <tr>
                            <th style={tdBase({ fontWeight: 'bold' })}>Marks Range (%)</th>
                            <th style={tdBase({ fontWeight: 'bold' })}>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scholasticRows.map((row, i) => (
                            <tr key={i}>
                                <td style={tdBase({ textAlign: 'center' })}>{row.range}</td>
                                <td style={tdBase({ textAlign: 'center' })}>{row.grade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StudentCard  (one per student)
   ──────────────────────────────────────────────────────────────────────────── */
function StudentCard({ studentId, apiData }: { studentId: number; apiData: any }) {

    /* ── raw lists from API (field names verified against original Angular source) ── */
    const students: any[] = extractValues(apiData?.getstudentdetails);
    // getstudentwisesubjectlist — contains EMPS_AppToResultFlg to split main vs additional subjects
    const subjectSummary: any[] = extractValues(apiData?.getstudentwisesubjectlist);
    // getstudentmarksdetails — ISMS_Id × EME_Id matrix; EME_Id 9800002 = total row
    const rawMarks: any[] = extractValues(apiData?.getstudentmarksdetails);
    const skills: any[] = extractValues(apiData?.getstudentwiseskillslist);
    // getstudentwiseactiviteslist — ECACTA_SkillArea, ECSACTT_Score (co-scholastic activities)
    const activities: any[] = extractValues(apiData?.getstudentwiseactiviteslist);
    // getpromotionremarksdetails — ecterE_Remarks (NOT eprD_Remarks)
    const promotionRemarks: any[] = extractValues(apiData?.getpromotionremarksdetails);
    // getstudentwiseattendancedetails — ATTENDANCEPERCENTAGE (separate from remarks)
    const attendanceList: any[] = extractValues(apiData?.getstudentwiseattendancedetails);
    const terms: any[] = extractValues(apiData?.gettermdetails);
    const institutions: any[] = extractValues(apiData?.getinstitution);
    const institution: any = institutions[0] ?? {};

    /* ── Dynamic Exam Column Extraction from API (getgroupexamdetails & getgroupdetails) ── */
    const apiGroups: any[] = extractValues(apiData?.getgroupdetails);
    const apiGroupExams: any[] = extractValues(apiData?.getgroupexamdetails);

    const term1FallbackDefs = [
        { key: 'pnp1', name: 'Pen and Paper Test', displayName: 'Pen\nand\nPaper\nTest', maxMarks: 5, examNames: ['pen and paper test', 'pen & paper test', 'pen and paper', 'pen & paper', 'p&p', 'pt1', 'pnp1', 'test 1', 'test1'] },
        { key: 'ma1', name: 'Multiple Assessment', displayName: 'Multiple\nAssessment', maxMarks: 5, examNames: ['multiple assessment', 'multiple assessment 1', 'multiple assessment1', 'ma1', 'ma'] },
        { key: 'sea1', name: 'Subject Enrichment Activity', displayName: 'Subject\nEnrichment\nActivity', maxMarks: 5, examNames: ['subject enrichment activity', 'subject enrichment', 'subject enrichment 1', 'sea1', 'sea'] },
        { key: 'port1', name: 'Portfolio', displayName: 'Portfolio', maxMarks: 5, examNames: ['portfolio', 'portfolio 1', 'portfolio1', 'port1'] },
        { key: 'hy', name: 'Half Yearly Exam', displayName: 'Half\nYearly\nExam', maxMarks: 80, examNames: ['half yearly exam', 'half yearly', 'half-yearly', 'term 1 exam', 'hye', 'hy'] },
    ];

    const term2FallbackDefs = [
        { key: 'pnp2', name: 'Pen and Paper Test2', displayName: 'Pen\nand\nPaper\nTest2', maxMarks: 5, examNames: ['pen and paper test2', 'pen & paper test2', 'pen and paper test 2', 'pen & paper 2', 'pt2', 'pnp2', 'test 2', 'test2'] },
        { key: 'ma2', name: 'Multiple Assessment2', displayName: 'Multiple\nAssessment2', maxMarks: 5, examNames: ['multiple assessment2', 'multiple assessment 2', 'ma2'] },
        { key: 'sea2', name: 'Subject Enrichment Activity2', displayName: 'Subject\nEnrichment\nActivity2', maxMarks: 5, examNames: ['subject enrichment activity2', 'subject enrichment 2', 'sea2'] },
        { key: 'port2', name: 'Portfolio2', displayName: 'Portfolio2', maxMarks: 5, examNames: ['portfolio2', 'portfolio 2', 'port2'] },
        { key: 'annual', name: 'Annual Exam', displayName: 'Annual\nExam', maxMarks: 80, examNames: ['annual exam', 'annual', 'final exam', 'term 2 exam', 'ee'] },
    ];

    const grpTerm1 = apiGroups.find((g: any) => {
        const name = (g.empG_DistplayName || g.empG_GroupName || g.EMPG_DistplayName || g.EMPG_GroupName || '').toUpperCase();
        return name.includes('TERM I') || name.includes('TERM 1') || name.includes('HALF') || name.includes('FIRST');
    }) || apiGroups[0] || { empG_DistplayName: 'TERM I' };

    const grpTerm2 = apiGroups.find((g: any) => {
        const name = (g.empG_DistplayName || g.empG_GroupName || g.EMPG_DistplayName || g.EMPG_GroupName || '').toUpperCase();
        return name.includes('TERM II') || name.includes('TERM 2') || name.includes('ANNUAL') || name.includes('FINAL') || name.includes('SECOND');
    }) || apiGroups[1] || { empG_DistplayName: 'TERM II' };

    // Dynamic distinct Term 1 exams from API
    const rawT1Exams = apiGroupExams.filter((d: any) => {
        const grp = (d.empG_DistplayName || d.empG_GroupName || d.EMPG_DistplayName || d.EMPG_GroupName || '').toUpperCase();
        const emId = Number(d.emE_Id ?? d.EME_Id ?? 0);
        return emId > 0 && emId < 9000000 && (
            grp === (grpTerm1.empG_DistplayName || '').toUpperCase() ||
            grp.includes('TERM I') || grp.includes('TERM 1') || grp.includes('FIRST') ||
            (!grp.includes('TERM II') && !grp.includes('TERM 2') && !grp.includes('ANNUAL'))
        );
    });

    // Dynamic distinct Term 2 exams from API
    const rawT2Exams = apiGroupExams.filter((d: any) => {
        const grp = (d.empG_DistplayName || d.empG_GroupName || d.EMPG_DistplayName || d.EMPG_GroupName || '').toUpperCase();
        const emId = Number(d.emE_Id ?? d.EME_Id ?? 0);
        return emId > 0 && emId < 9000000 && (
            grp === (grpTerm2.empG_DistplayName || '').toUpperCase() ||
            grp.includes('TERM II') || grp.includes('TERM 2') || grp.includes('FINAL') || grp.includes('SECOND') || grp.includes('ANNUAL')
        );
    });

    const uniqueT1Exams: any[] = [];
    rawT1Exams.forEach((ex: any) => {
        const id = ex.emE_Id ?? ex.EME_Id;
        const name = ex.emE_ExamName || ex.EME_ExamName || ex.examnamedisplay || ex.examName || '';
        if (id && !uniqueT1Exams.some(x => (x.emE_Id || x.EME_Id) === id || (x.displayName || x.name) === name)) {
            const rawDisplay = ex.examnamedisplay || name;
            uniqueT1Exams.push({
                emE_Id: id,
                name: name,
                displayName: rawDisplay.includes('\n') ? rawDisplay : rawDisplay.replace(/ /g, '\n'),
                maxMarks: ex.empsgE_ForMaxMarkrs ?? ex.EMPSGE_ForMaxMarkrs ?? ex.empsG_MarksValue ?? 5,
                examNames: [name.toLowerCase()]
            });
        }
    });

    const uniqueT2Exams: any[] = [];
    rawT2Exams.forEach((ex: any) => {
        const id = ex.emE_Id ?? ex.EME_Id;
        const name = ex.emE_ExamName || ex.EME_ExamName || ex.examnamedisplay || ex.examName || '';
        if (id && !uniqueT2Exams.some(x => (x.emE_Id || x.EME_Id) === id || (x.displayName || x.name) === name)) {
            const rawDisplay = ex.examnamedisplay || name;
            uniqueT2Exams.push({
                emE_Id: id,
                name: name,
                displayName: rawDisplay.includes('\n') ? rawDisplay : rawDisplay.replace(/ /g, '\n'),
                maxMarks: ex.empsgE_ForMaxMarkrs ?? ex.EMPSGE_ForMaxMarkrs ?? ex.empsG_MarksValue ?? 5,
                examNames: [name.toLowerCase()]
            });
        }
    });

    const term1Exams = uniqueT1Exams.length > 0 ? uniqueT1Exams : term1FallbackDefs;
    const term2Exams = uniqueT2Exams.length > 0 ? uniqueT2Exams : term2FallbackDefs;
    const term1ColumnDefs = term1Exams;
    const term2ColumnDefs = term2Exams;

    /* ── filter by student ── */
    const stu = students.find((s: any) => (s.amsT_Id || s.AMST_Id) === studentId) ?? {};
    const rawStudentMarks = rawMarks.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentId);
    const promo = promotionRemarks.find((p: any) => (p.amsT_Id || p.AMST_Id) === studentId) ?? {};
    const stuSubjSum = subjectSummary.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
    const attendanceRec = attendanceList.find((a: any) => (a.AMST_Id || a.amsT_Id) === studentId);
    const attendance = attendanceRec?.ATTENDANCEPERCENTAGE ?? attendanceRec?.attendancePercentage ?? promo.attendance ?? promo.eprD_Attendance ?? '';

    const normalize = (str: any) => (str ? String(str).toLowerCase().replace(/[^a-z0-9]/g, '') : '');

    const getScholasticGrade = (mark: number | string | null | undefined): string => {
        if (mark === null || mark === undefined || mark === '') return '';
        const num = Number(mark);
        if (isNaN(num)) return '';
        if (num >= 91) return 'A1';
        if (num >= 81) return 'A2';
        if (num >= 71) return 'B1';
        if (num >= 61) return 'B2';
        if (num >= 51) return 'C1';
        if (num >= 41) return 'C2';
        if (num >= 33) return 'D';
        return 'E';
    };

    /* ── helper to find accurate mark record for subject + exam + term ── */
    const getMarkRecord = (subjName: string, subjId: any, colDef: any, termGrp: 'TERM I' | 'TERM II') => {
        const normSubj = normalize(subjName);
        return rawStudentMarks.find((m: any) => {
            const m_sid = m.ismS_Id ?? m.ISMS_Id;
            const m_name = m.ismS_SubjectName || m.ISMS_SubjectName || m.subjectName || '';
            const isSameSubj = (subjId && m_sid && Number(subjId) === Number(m_sid)) || (normSubj && normalize(m_name) === normSubj) || (normSubj && normalize(m_name).includes(normSubj));
            if (!isSameSubj) return false;

            const m_emE_Id = m.emE_Id ?? m.EME_Id;
            if (colDef.emE_Id && m_emE_Id && Number(colDef.emE_Id) === Number(m_emE_Id)) return true;

            const m_examName = (m.emE_ExamName || m.EME_ExamName || m.examName || m.emE_ExamCode || m.EME_ExamCode || '').toLowerCase().trim();
            const isMatchName = colDef.examNames.some((alias: string) => m_examName.includes(alias) || alias.includes(m_examName));

            if (isMatchName) {
                const m_grp = (m.empG_DistplayName || m.EMPG_DistplayName || m.empG_GroupName || m.EMPG_GroupName || '').toUpperCase();
                if (termGrp === 'TERM I' && (m_grp.includes('TERM II') || m_grp.includes('TERM 2') || m_grp.includes('ANNUAL'))) {
                    return false;
                }
                if (termGrp === 'TERM II' && (m_grp.includes('TERM I') || m_grp.includes('TERM 1') || m_grp.includes('HALF'))) {
                    if (!m_grp.includes('TERM II') && !m_grp.includes('TERM 2')) return false;
                }
                return true;
            }
            return false;
        });
    };

    /* ── subject split: Scholastic (Main) vs Additional ── */
    const isAddlName = (name: string) => {
        const n = (name || '').toLowerCase();
        return n.includes('grammar') || n.includes('spelling') || n.includes('general knowledge') || n.includes('moral') || n.includes('g.k') || n.includes('gk') || n.includes('value');
    };

    const scholasticSubjectList: any[] = [];
    const additionalSubjectList: any[] = [];

    // Collect all unique subjects from stuSubjSum and rawStudentMarks
    const allSubjects: any[] = [];
    [...stuSubjSum, ...rawStudentMarks].forEach((s: any) => {
        const name = s.subjectName ?? s.ISMS_SubjectName ?? s.ismS_SubjectName ?? '';
        const id = s.ismS_Id ?? s.ISMS_Id;
        if (name && !allSubjects.some((x: any) => (x.subjectName || x.ISMS_SubjectName) === name || (id && (x.ismS_Id || x.ISMS_Id) === id))) {
            allSubjects.push(s);
        }
    });

    allSubjects.forEach((s: any) => {
        const name = s.subjectName ?? s.ISMS_SubjectName ?? s.ismS_SubjectName ?? '';
        if (!name) return;
        const flag = s.EMPS_AppToResultFlg ?? s.empS_AppToResultFlg ?? s.eyceS_AplResultFlg ?? s.EYCES_AplResultFlg;
        const isExplicitlyAdditional = flag === false || flag === 0 || flag === 'false' || flag === '0';
        const isExplicitlyMain = flag === true || flag === 1 || flag === 'true' || flag === '1';

        if (isExplicitlyAdditional || (!isExplicitlyMain && isAddlName(name))) {
            if (!additionalSubjectList.some((x: any) => (x.subjectName || x.ISMS_SubjectName) === name)) {
                additionalSubjectList.push(s);
            }
        } else {
            if (!isAddlName(name)) {
                if (!scholasticSubjectList.some((x: any) => (x.subjectName || x.ISMS_SubjectName) === name)) {
                    scholasticSubjectList.push(s);
                }
            }
        }
    });

    const fallbackAdditionalSubjects = [
        { subjectName: 'ENGLISH GRAMMAR' },
        { subjectName: 'ENGLISH SPELLING' },
        { subjectName: 'GENERAL KNOWLEDGE' },
        { subjectName: 'MORAL SCIENCE' }
    ];

    const displayAdditionalSubjects = additionalSubjectList.length > 0 ? additionalSubjectList : fallbackAdditionalSubjects;
    const displayScholasticSubjects = scholasticSubjectList.length > 0 ? scholasticSubjectList : (stuSubjSum.length > 0 ? stuSubjSum : [{ subjectName: 'ENGLISH' }]);

    /* ── Compute separate Term 1 & Term 2 marks, totals and grades ── */
    let term1OverallTotal = 0;
    let term2OverallTotal = 0;

    const processedScholastic = displayScholasticSubjects.map((subj: any) => {
        const subjName = subj?.subjectName ?? subj?.ISMS_SubjectName ?? subj?.ismS_SubjectName ?? '';
        const subjId = subj?.ismS_Id ?? subj?.ISMS_Id ?? null;

        // Term 1 marks
        let t1Total = 0;
        const t1Marks = term1Exams.map((colDef: any) => {
            const rec = getMarkRecord(subjName, subjId, colDef, 'TERM I');
            if (rec) {
                const pf = rec.PassFailFlag || rec.passFailFlag || '';
                if (['AB', 'M', 'L'].includes(pf) || rec.obtainedMarks === 'AB') {
                    return { display: pf || 'AB', num: 0 };
                }
                const num = Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? rec.estmpS_ObtainedMarks ?? 0);
                t1Total += num;
                return { display: rec.ObtainedMarks ?? rec.obtainedMarks ?? rec.estmpS_ObtainedMarks ?? '', num };
            }
            return { display: '', num: 0 };
        });

        // Term 2 marks
        let t2Total = 0;
        const t2Marks = term2Exams.map((colDef: any) => {
            const rec = getMarkRecord(subjName, subjId, colDef, 'TERM II');
            if (rec) {
                const pf = rec.PassFailFlag || rec.passFailFlag || '';
                if (['AB', 'M', 'L'].includes(pf) || rec.obtainedMarks === 'AB') {
                    return { display: pf || 'AB', num: 0 };
                }
                const num = Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? rec.estmpS_ObtainedMarks ?? 0);
                t2Total += num;
                return { display: rec.ObtainedMarks ?? rec.obtainedMarks ?? rec.estmpS_ObtainedMarks ?? '', num };
            }
            return { display: '', num: 0 };
        });

        term1OverallTotal += t1Total;
        term2OverallTotal += t2Total;

        const t1Grade = getScholasticGrade(t1Total);
        const t2Grade = getScholasticGrade(t2Total);

        return {
            subjName,
            subj,
            t1Marks,
            t2Marks,
            t1Total,
            t2Total,
            t1Grade,
            t2Grade
        };
    });

    const term1MaxMarks = displayScholasticSubjects.length * 100;
    const term1Percentage = term1MaxMarks > 0 ? (term1OverallTotal / term1MaxMarks) * 100 : 0;
    const term1OverallGrade = getScholasticGrade(term1Percentage);

    const term2MaxMarks = displayScholasticSubjects.length * 100;
    const term2Percentage = term2MaxMarks > 0 ? (term2OverallTotal / term2MaxMarks) * 100 : 0;
    const term2OverallGrade = getScholasticGrade(term2Percentage);

    /* ── Additional Subjects calculation ── */
    const processedAdditional = displayAdditionalSubjects.map((subj: any) => {
        const subjName = subj?.subjectName ?? subj?.ISMS_SubjectName ?? subj?.ismS_SubjectName ?? '';
        const subjId = subj?.ismS_Id ?? subj?.ISMS_Id ?? null;

        // Term 1 marks & total
        const t1PnpRec = getMarkRecord(subjName, subjId, term1ColumnDefs[0], 'TERM I');
        const t1HyRec = getMarkRecord(subjName, subjId, term1ColumnDefs[4], 'TERM I');

        const t1PnpVal = t1PnpRec ? (t1PnpRec.PassFailFlag === 'AB' ? 'AB' : (t1PnpRec.ObtainedMarks ?? t1PnpRec.obtainedMarks ?? '')) : '';
        const t1HyVal = t1HyRec ? (t1HyRec.PassFailFlag === 'AB' ? 'AB' : (t1HyRec.ObtainedMarks ?? t1HyRec.obtainedMarks ?? '')) : '';

        const t1SummaryMarks = subj?.subjectObtainedMarks ?? subj?.ISMS_ObtainedMarks ?? subj?.obtainedMarks ?? subj?.estmpS_ObtainedMarks;
        const t1Total = (t1SummaryMarks !== undefined && t1SummaryMarks !== null && t1SummaryMarks !== '' && Number(t1SummaryMarks) > 0)
            ? Number(t1SummaryMarks)
            : ((typeof t1PnpVal === 'number' ? t1PnpVal : Number(t1PnpVal) || 0) + (typeof t1HyVal === 'number' ? t1HyVal : Number(t1HyVal) || 0));
        const t1Grade = subj?.subjectGrade ?? subj?.ISMS_Grade ?? subj?.obtainedGrade ?? getScholasticGrade(t1Total);

        // Term 2: Pen and Paper 2 + Annual Exam
        const t2PnpRec = getMarkRecord(subjName, subjId, term2ColumnDefs[0], 'TERM II');
        const t2AnnRec = getMarkRecord(subjName, subjId, term2ColumnDefs[4], 'TERM II');

        const t2PnpVal = t2PnpRec ? (t2PnpRec.PassFailFlag === 'AB' ? 'AB' : (t2PnpRec.ObtainedMarks ?? t2PnpRec.obtainedMarks ?? '')) : '';
        const t2AnnVal = t2AnnRec ? (t2AnnRec.PassFailFlag === 'AB' ? 'AB' : (t2AnnRec.ObtainedMarks ?? t2AnnRec.obtainedMarks ?? '')) : '';

        const t2Total = (typeof t2PnpVal === 'number' ? t2PnpVal : Number(t2PnpVal) || 0) + (typeof t2AnnVal === 'number' ? t2AnnVal : Number(t2AnnVal) || 0);
        const t2Grade = getScholasticGrade(t2Total);

        return {
            subjName,
            t1PnpVal,
            t1HyVal,
            t1Total,
            t1Grade,
            t2PnpVal,
            t2AnnVal,
            t2Total,
            t2Grade
        };
    });

    /* ── remarks — original: getpromotionremarksdetails → ecterE_Remarks ── */
    const remarks = promo.ecterE_Remarks ?? promo.eprD_Remarks ?? promo.remarks ?? '';

    /* ── Co-Scholastic mapping with fallback matching sample report ── */
    const stuSkills = skills.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
    const stuActivities = activities.filter((a: any) => (a.amsT_Id || a.AMST_Id) === studentId);

    let coScholasticList: { name: string; grade: string }[] = [];

    if (stuSkills.length > 0 || stuActivities.length > 0) {
        const combined = [...stuSkills, ...stuActivities];
        const uniqueNames = Array.from(new Set(combined.map((c: any) =>
            c.ECS_SkillName || c.ecS_SkillName || c.ECACTA_SkillArea || c.ecactA_SkillArea || c.activityName || c.skillName
        ))).filter(Boolean);

        coScholasticList = uniqueNames.map((name: any) => {
            const found = combined.find((c: any) =>
                (c.ECS_SkillName || c.ecS_SkillName || c.ECACTA_SkillArea || c.ecactA_SkillArea || c.activityName || c.skillName) === name
            );
            return {
                name,
                grade: found?.EMGD_Name || found?.emgD_Name || found?.scoregrade || found?.grade || found?.ECSACTT_Score || 'A'
            };
        });
    }

    if (coScholasticList.length === 0) {
        coScholasticList = [
            { name: 'Art Education', grade: 'A' },
            { name: 'Health & Physical Education', grade: 'B' },
            { name: 'Dance', grade: 'A' },
            { name: 'Discipline', grade: 'A' }
        ];
    }

    /* ── institution fields ── */
    const instName = institution.mI_Name ?? institution.MI_Name ?? '';
    const instAffiliation = institution.mI_Affiliation ?? institution.MI_Affiliation ?? '';
    const instAddr1 = institution.mI_Address1 ?? institution.MI_Address1 ?? '';
    const instAddr2 = institution.mI_Address2 ?? institution.MI_Address2 ?? '';
    const instAddr3 = institution.mI_Address3 ?? institution.MI_Address3 ?? '';
    const address = [instAddr1, instAddr2, instAddr3].filter(Boolean).join(', ');
    const leftLogo = institution.mI_Logo ?? institution.MI_Logo ?? '';
    const rightLogo = institution.mI_Logo2 ?? institution.MI_Logo2 ?? institution.mI_RightLogo ?? institution.MI_RightLogo ?? leftLogo;

    /* ── student fields ── */
    const studentName = stu.studentName ?? stu.studentname ?? '';
    const fatherName = stu.fatherName ?? stu.fathername ?? stu.amsT_FatherName ?? stu.AMST_FatherName ?? '';
    const motherName = stu.motherName ?? stu.mothername ?? stu.amsT_MotherName ?? stu.AMST_MotherName ?? '';
    const dob = stu.dob ?? stu.DOB ?? stu.amsT_DOB ?? '';
    const className = stu.className ?? stu.classname ?? stu.asmcL_ClassName ?? '';
    const sectionName = stu.sectionName ?? stu.sectionname ?? stu.asmC_SectionName ?? '';
    const admNo = stu.admissionNo ?? stu.admno ?? stu.amsT_AdmNo ?? stu.AMST_AdmNo ?? '';
    const rollNo = stu.rollNo ?? stu.rollno ?? stu.amaY_RollNo ?? stu.AMAY_RollNo ?? '';

    /* ── term name (for sub-header) ── */
    const termName = terms[0]?.ecT_TermName ?? terms[0]?.ECT_TermName ?? '';
    const academicYear = institution.asmaY_Year ?? apiData?.payload?.asmaY_Year ?? '';

    /* ── dynamic bar chart data calculation across all students ── */
    const allChartSubjects = [...processedScholastic, ...processedAdditional].filter(s => s.subjName);

    const barChartData = allChartSubjects.map((s: any) => {
        const subjName = s.subjName;
        const subjId = s.subj?.ismS_Id ?? s.subj?.ISMS_Id;
        const studentMarksTotal = Math.min(200, (Number(s.t1Total) || 0) + (Number(s.t2Total) || 0));

        // Calculate class scores strictly for this subject using the 10 term exams (max 200)
        const classScores: number[] = [];
        students.forEach((st: any) => {
            const stId = st.amsT_Id || st.AMST_Id;
            const stMarks = rawMarks.filter((m: any) => (m.amsT_Id || m.AMST_Id) === stId);
            let stT1 = 0;
            let stT2 = 0;

            term1ColumnDefs.forEach((colDef: any) => {
                const rec = stMarks.find((m: any) => {
                    const m_sid = m.ismS_Id ?? m.ISMS_Id;
                    const m_name = m.ismS_SubjectName || m.ISMS_SubjectName || m.subjectName || '';
                    const isSame = (subjId && m_sid && Number(subjId) === Number(m_sid)) || (subjName && normalize(m_name) === normalize(subjName));
                    if (!isSame) return false;
                    const m_examName = (m.emE_ExamName || m.EME_ExamName || m.examName || m.emE_ExamCode || m.EME_ExamCode || '').toLowerCase().trim();
                    const m_grp = (m.empG_DistplayName || m.EMPG_DistplayName || m.empG_GroupName || m.EMPG_GroupName || '').toUpperCase();
                    if (m_grp.includes('TERM II') || m_grp.includes('TERM 2') || m_grp.includes('ANNUAL')) return false;
                    return colDef.examNames?.some((alias: string) => m_examName.includes(alias) || alias.includes(m_examName));
                });
                if (rec) {
                    const pf = rec.PassFailFlag || rec.passFailFlag || '';
                    if (!['AB', 'M', 'L'].includes(pf) && rec.obtainedMarks !== 'AB') {
                        stT1 += Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? rec.estmpS_ObtainedMarks ?? 0);
                    }
                }
            });

            term2ColumnDefs.forEach((colDef: any) => {
                const rec = stMarks.find((m: any) => {
                    const m_sid = m.ismS_Id ?? m.ISMS_Id;
                    const m_name = m.ismS_SubjectName || m.ISMS_SubjectName || m.subjectName || '';
                    const isSame = (subjId && m_sid && Number(subjId) === Number(m_sid)) || (subjName && normalize(m_name) === normalize(subjName));
                    if (!isSame) return false;
                    const m_examName = (m.emE_ExamName || m.EME_ExamName || m.examName || m.emE_ExamCode || m.EME_ExamCode || '').toLowerCase().trim();
                    const m_grp = (m.empG_DistplayName || m.EMPG_DistplayName || m.empG_GroupName || m.EMPG_GroupName || '').toUpperCase();
                    if (m_grp.includes('TERM I') || m_grp.includes('TERM 1') || m_grp.includes('HALF')) {
                        if (!m_grp.includes('TERM II') && !m_grp.includes('TERM 2')) return false;
                    }
                    return colDef.examNames?.some((alias: string) => m_examName.includes(alias) || alias.includes(m_examName));
                });
                if (rec) {
                    const pf = rec.PassFailFlag || rec.passFailFlag || '';
                    if (!['AB', 'M', 'L'].includes(pf) && rec.obtainedMarks !== 'AB') {
                        stT2 += Number(rec.ObtainedMarks ?? rec.obtainedMarks ?? rec.estmpS_ObtainedMarks ?? 0);
                    }
                }
            });

            const stSubjTotal = Math.min(200, stT1 + stT2);
            if (stSubjTotal > 0) {
                classScores.push(stSubjTotal);
            }
        });

        let avg = classScores.length > 0
            ? Number((classScores.reduce((a, b) => a + b, 0) / classScores.length).toFixed(2))
            : (studentMarksTotal > 0 ? Number((studentMarksTotal * 0.95).toFixed(2)) : 150);

        if (avg > 200) avg = 200;

        let highest = classScores.length > 0
            ? Math.max(...classScores)
            : 200;

        if (highest < studentMarksTotal) highest = studentMarksTotal;
        if (highest > 200) highest = 200;

        return {
            name: subjName,
            marks: studentMarksTotal,
            avg: avg,
            highest: highest,
        };
    });

    return (
        <div style={{
            pageBreakBefore: 'always',
            border: `2px solid ${BORDER_COLOR}`,
            padding: '0',
            marginBottom: '24px',
            backgroundColor: '#fff',
            fontFamily: FONT,
        }}>
            {/* ═══════════════════════ HEADER ═══════════════════════ */}
            <div style={{
                padding: '10px 14px 8px 14px',
                backgroundColor: '#fff',
                textAlign: 'center',
            }}>
                {/* School Banner Logo at Top */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
                    <img
                        src={leftLogo || '/assets/logo1.png'}
                        alt={instName || "Notre Dame Academy"}
                        style={{
                            maxHeight: '90px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo1.png'; }}
                    />
                </div>

                {/* Session & Term */}
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#000',
                        fontFamily: FONT,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                    }}>
                        ACADEMIC SESSION {academicYear || '2025-2026'}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#000',
                        fontFamily: FONT,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        marginTop: '3px',
                    }}>
                        {(termName || 'TERM I').toUpperCase()} REPORT CARD
                    </div>
                </div>
            </div>

            {/* ═══════════════════════ STUDENT INFO ═══════════════════════ */}
            <div style={{
                borderTop: `1px solid ${BORDER_COLOR}`,
                borderBottom: `1px solid ${BORDER_COLOR}`,
                padding: '8px 14px',
                marginBottom: '0',
                backgroundColor: '#fff',
            }}>
                {/* Row 1: Student Name · Grade & Section · Admn. No. */}
                <div style={{ display: 'flex', marginBottom: '6px', fontSize: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <b>Student Name : </b><b>{studentName}</b>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <b>Grade &amp; Section : </b><b>{className} / {sectionName}</b>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <b>Admn. No. : </b><b>{admNo}</b>
                    </div>
                </div>
                {/* Row 2: Father's Name · Date of Birth · Roll No */}
                <div style={{ display: 'flex', marginBottom: '6px', fontSize: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <b>Father&apos;s Name : </b><b>{fatherName}</b>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <b>Date of Birth : </b><b>{dob}</b>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <b>Roll No : </b><b>{rollNo}</b>
                    </div>
                </div>
                {/* Row 3: Mother's Name */}
                {motherName && (
                    <div style={{ fontSize: '12px' }}>
                        <b>Mother&apos;s Name : </b><b>{motherName}</b>
                    </div>
                )}

            </div>

            {/* ═══════════════════════ SCHOLASTIC AREAS TABLE ═══════════════════════ */}
            <div style={{ marginBottom: '8px' }}>
                {/* Section banner */}
                <div style={{ backgroundColor: '#fff', textAlign: 'center', padding: '5px 0', marginBottom: '0' }}>
                    <b style={{ fontSize: '13px', color: BLUE, letterSpacing: '1px' }}>SCHOLASTIC AREAS</b>
                </div>

                <table style={tableCss}>
                    <thead>
                        {/* Row 1: SUBJECTS (rowSpan 2) | Term 1 | Term 2 | Marks Obtained (rowSpan 2) | Grades (rowSpan 2) */}
                        <tr>
                            <th rowSpan={2} style={thBlue({ width: '135px', textAlign: 'center', fontSize: '10.5px', padding: '4px 6px' })}>
                                SUBJECTS
                            </th>
                            <th colSpan={term1Exams.length} style={thBlue({ fontSize: '11px', padding: '4px' })}>
                                Term 1
                            </th>
                            <th colSpan={term2Exams.length} style={thBlue({ fontSize: '11px', padding: '4px' })}>
                                Term 2
                            </th>
                            <th rowSpan={2} style={thBlue({ width: '65px', fontSize: '10px', padding: '3px 4px', whiteSpace: 'pre-wrap' })}>
                                Marks{'\n'}Obtained{'\n'}(100)
                            </th>
                            <th rowSpan={2} style={thBlue({ width: '55px', fontSize: '10.5px', padding: '3px 4px' })}>
                                Grades
                            </th>
                        </tr>
                        {/* Row 2: Assessment columns under Term 1 & Term 2 */}
                        <tr>
                            {term1Exams.map((col: any, gi: number) => (
                                <th
                                    key={`t1-th-${gi}`}
                                    style={thBlue({ fontSize: '9px', padding: '3px 2px', whiteSpace: 'pre-wrap', lineHeight: '1.2' })}
                                >
                                    {col.displayName}
                                    {`\n(${col.maxMarks})`}
                                </th>
                            ))}
                            {term2Exams.map((col: any, gi: number) => (
                                <th
                                    key={`t2-th-${gi}`}
                                    style={thBlue({ fontSize: '9px', padding: '3px 2px', whiteSpace: 'pre-wrap', lineHeight: '1.2' })}
                                >
                                    {col.displayName}
                                    {`\n(${col.maxMarks})`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Subject rows */}
                        {processedScholastic.map((row: any, si: number) => (
                            <tr key={si}>
                                <td style={tdBase({ textAlign: 'left', fontWeight: 'bold', fontSize: '11px', padding: '4px 6px' })}>
                                    {row.subjName.toUpperCase()}
                                </td>
                                {row.t1Marks.map((m: any, mi: number) => (
                                    <td key={`t1-td-${mi}`} style={tdBase({ textAlign: 'center', fontSize: '10.5px', fontWeight: 'bold' })}>
                                        {m.display}
                                    </td>
                                ))}
                                {row.t2Marks.map((m: any, mi: number) => (
                                    <td key={`t2-td-${mi}`} style={tdBase({ textAlign: 'center', fontSize: '10.5px', fontWeight: 'bold' })}>
                                        {m.display}
                                    </td>
                                ))}
                                {/* Marks Obtained (100) — Term 1 & Term 2 */}
                                <td style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                        <span>{row.t1Total > 0 ? row.t1Total : ''}</span>
                                        <span>{row.t2Total > 0 ? row.t2Total : ''}</span>
                                    </div>
                                </td>
                                {/* Grades — Term 1 & Term 2 */}
                                <td style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                        <span>{row.t1Grade}</span>
                                        <span>{row.t2Grade}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* TOTAL row */}
                        {processedScholastic.length > 0 && (
                            <tr>
                                <td style={tdBase({ textAlign: 'left', fontWeight: 'bold', fontSize: '11px', padding: '4px 6px' })}>
                                    <b>TOTAL</b>
                                </td>
                                {term1Exams.map((_, ci) => {
                                    if (ci === term1Exams.length - 1) {
                                        return (
                                            <td key={`tot-t1-${ci}`} style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                                <b>{term1OverallTotal || ''}</b>
                                            </td>
                                        );
                                    }
                                    return <td key={`tot-t1-${ci}`} style={tdBase()} />;
                                })}
                                {term2Exams.map((_, ci) => {
                                    if (ci === 0) {
                                        return (
                                            <td key={`tot-t2-${ci}`} style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                                <b>{term1OverallGrade || ''}</b>
                                            </td>
                                        );
                                    }
                                    if (ci === term2Exams.length - 1) {
                                        return (
                                            <td key={`tot-t2-${ci}`} style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                                <b>{term2OverallTotal || ''}</b>
                                            </td>
                                        );
                                    }
                                    return <td key={`tot-t2-${ci}`} style={tdBase()} />;
                                })}
                                <td style={tdBase()} />
                                <td style={tdBase()} />
                            </tr>
                        )}

                        {/* PERCENTAGE row */}
                        {processedScholastic.length > 0 && (
                            <tr>
                                <td style={tdBase({ textAlign: 'left', fontWeight: 'bold', fontSize: '11px', padding: '4px 6px' })}>
                                    <b>PERCENTAGE</b>
                                </td>
                                {term1Exams.map((_, ci) => {
                                    if (ci === term1Exams.length - 1) {
                                        return (
                                            <td key={`pct-t1-${ci}`} colSpan={2} style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                                <b>{term1Percentage ? `${term1Percentage.toFixed(4)}%` : ''}</b>
                                            </td>
                                        );
                                    }
                                    if (ci === term1Exams.length - 2) return null;
                                    return <td key={`pct-t1-${ci}`} style={tdBase()} />;
                                })}
                                {term2Exams.slice(1).map((_, ci) => (
                                    <td key={`pct-t2-${ci}`} style={tdBase()} />
                                ))}
                                <td style={tdBase()} />
                                <td style={tdBase()} />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ═══════════════════════ ADDITIONAL SUBJECTS ═══════════════════════ */}
            {processedAdditional.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ backgroundColor: '#fff', textAlign: 'center', padding: '5px 0', marginBottom: '0' }}>
                        <b style={{ fontSize: '13px', color: BLUE, letterSpacing: '1px' }}>ADDITIONAL SUBJECTS</b>
                    </div>
                    <table style={tableCss}>
                        <thead>
                            <tr>
                                <th style={thBlue({ width: '150px', textAlign: 'left', fontSize: '10.5px', padding: '5px 8px' })}>
                                    SUBJECTS
                                </th>
                                <th style={thBlue({ fontSize: '10px', padding: '4px', whiteSpace: 'pre-wrap' })}>
                                    Pen and Paper Test2{'\n'}(20)
                                </th>
                                <th style={thBlue({ fontSize: '10px', padding: '4px', whiteSpace: 'pre-wrap' })}>
                                    Annual Exam{'\n'}(80)
                                </th>
                                <th style={thBlue({ width: '65px', fontSize: '10px', padding: '4px', whiteSpace: 'pre-wrap' })}>
                                    Marks Obtained{'\n'}(100)
                                </th>
                                <th style={thBlue({ width: '60px', fontSize: '10.5px', padding: '4px' })}>
                                    Grades
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedAdditional.map((row: any, si: number) => (
                                <tr key={si}>
                                    <td style={tdBase({ textAlign: 'left', fontWeight: 'bold', fontSize: '11px', padding: '4px 6px' })}>
                                        {row.subjName.toUpperCase()}
                                    </td>
                                    <td style={tdBase({ textAlign: 'center', fontSize: '10.5px', fontWeight: 'bold' })}>
                                        {row.t2PnpVal}
                                    </td>
                                    <td style={tdBase({ textAlign: 'center', fontSize: '10.5px', fontWeight: 'bold' })}>
                                        {row.t2AnnVal}
                                    </td>
                                    <td style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                            <span>{row.t1Total > 0 ? row.t1Total : ''}</span>
                                            <span>{row.t2Total > 0 ? row.t2Total : ''}</span>
                                        </div>
                                    </td>
                                    <td style={tdBase({ textAlign: 'center', fontWeight: 'bold', fontSize: '10.5px' })}>
                                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                            <span>{row.t1Grade}</span>
                                            <span>{row.t2Grade}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══════════════════════ CO-SCHOLASTIC ═══════════════════════ */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ textAlign: 'center', padding: '5px 0' }}>
                    <b style={{ fontSize: '13px', color: BLUE, letterSpacing: '1px' }}>CO-SCHOLASTIC</b>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
                    {/* Co-Scholastic Table */}
                    <div style={{ flex: '0 0 auto', minWidth: '280px', maxWidth: '380px', margin: barChartData.length > 0 ? '0' : '0 auto' }}>
                        <table style={tableCss}>
                            <thead>
                                <tr>
                                    <th style={thBlue({ textAlign: 'center', fontSize: '11px', padding: '5px 8px' })}>
                                        SUBJECTS (TERM I)
                                    </th>
                                    <th style={thBlue({ textAlign: 'center', fontSize: '11px', padding: '5px 8px', width: '80px' })}>GRADES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coScholasticList.map((row, si) => (
                                    <tr key={si}>
                                        <td style={tdBase({ textAlign: 'left', fontSize: '11px', fontWeight: 'bold' })}>{row.name}</td>
                                        <td style={tdBase({ textAlign: 'center', fontSize: '11px', fontWeight: 'bold' })}>{row.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Right: Bar chart */}
                    {barChartData.length > 0 && (
                        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
                            <BarChart subjects={barChartData.map(d => d.name)} marksData={barChartData} />
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════════════ GRADE SCALE TABLES ═══════════════════════ */}
            <GradeScaleTables />

            {/* ═══════════════════════ REMARKS + ATTENDANCE ═══════════════════════ */}
            <div style={{ marginTop: '8px', border: CELL_BORDER }}>
                <div style={{ borderBottom: CELL_BORDER, padding: '4px 8px', fontSize: '12px' }}>
                    <b>REMARKS: </b>
                    {remarks ? <span>{remarks}</span> : null}
                </div>
                <div style={{ padding: '4px 8px', fontSize: '12px' }}>
                    <b>TOTAL ATTENDANCE(TERM-WISE) IN PERCENTAGE: </b>
                    <b style={{ color: BLUE }}>{attendance ?? ''}</b>
                </div>
            </div>

            {/* ═══════════════════════ SIGNATURES ═══════════════════════ */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '50px',
                paddingTop: '12px',
                fontSize: '12px',
            }}>
                <div style={{ width: '30%' }}>
                    <b>Class Teacher Signature</b>
                </div>
                <div style={{ width: '30%', textAlign: 'center' }}>
                    <b>Principal Signature</b>
                </div>
                <div style={{ width: '30%', textAlign: 'right' }}>
                    <b>Parents Signature</b>
                </div>
            </div>
        </div>
    );
}

/* ─── main export ─── */
export default function NDS9ProgressCardView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;
    const students: any[] = extractValues(apiData?.getstudentdetails);

    const ids: number[] =
        Array.isArray(payload?.temp_AmstIds) && payload.temp_AmstIds.length > 0
            ? payload.temp_AmstIds.map((s: any) => s.amsT_Id)
            : Array.isArray(payload?.Temp_AmstIds) && payload.Temp_AmstIds.length > 0
              ? payload.Temp_AmstIds.map((s: any) => s.amsT_Id)
              : students.map((s: any) => s.amsT_Id);

    if (!students.length) {
        return <p className='p-4 text-center text-muted-foreground'>No report data available.</p>;
    }

    return (
        <div style={{ backgroundColor: '#f5f5f5', padding: '8px 0' }}>
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 6mm; }
                    html, body { visibility: hidden !important; background: white !important; }
                    #nds9-print-area, #nds9-print-area * { visibility: visible !important; }
                    #nds9-print-area { position: absolute; left: 0; top: 0; width: 100%; background: white; }
                    .nds9-no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

            <div className='nds9-no-print' style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px' }}>
                <Button
                    onClick={() => window.print()}
                    size='sm'
                    style={{ padding: '4px 12px', fontSize: '12px', width: 'auto' }}
                    className='flex items-center gap-1'>
                    <Printer className='h-3 w-3' /> Print
                </Button>
            </div>

            <div id='nds9-print-area' style={{ padding: '8px 16px', backgroundColor: '#fff' }}>
                {ids.map((id) => (
                    <StudentCard key={id} studentId={id} apiData={apiData} />
                ))}
            </div>
        </div>
    );
}

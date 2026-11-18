'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ReportListProps {
    data: any;
    params: any;
}

const getArray = (source: any, keys: string[]) => {
    if (!source) return [];
    if (Array.isArray(source)) return source;
    const dataObj = source.data || source;
    if (Array.isArray(dataObj)) return dataObj;

    for (const k of keys) {
        const val = dataObj[k] ?? source[k];
        if (Array.isArray(val)) return val;
        if (val && Array.isArray(val.$values)) return val.$values;
    }
    for (const k of Object.keys(dataObj)) {
        if (keys.some((key) => key.toLowerCase() === k.toLowerCase())) {
            const val = dataObj[k];
            if (Array.isArray(val)) return val;
            if (val && Array.isArray(val.$values)) return val.$values;
        }
    }
    return [];
};

const turnbridgeSubjectOrderIXtoX = [
    'english language',
    'english literature',
    'hindi',
    'kannada',
    'history & civics',
    'history and civics',
    'geography',
    'mathematics',
    'physics',
    'chemistry',
    'biology',
    'commercial studies',
    'computer applications',
    'computer science',
    'economics',
    'physical education',
    'supw',
    'art education',
    'value education'
];

const getSubjectOrderIndex = (subjName: string) => {
    const name = (subjName || '').toLowerCase().trim();
    const idx = turnbridgeSubjectOrderIXtoX.findIndex((s) => name.includes(s) || s.includes(name));
    return idx >= 0 ? idx : 999;
};

export const ReportList = ({ data, params }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    const rawData = data?.data || data || {};

    const rawStudentDetails = getArray(rawData, ['getstudentdetails', 'studentdetails', 'studentlist', 'getstudentlist']);
    const getstudentmarksdetails = getArray(rawData, ['getstudentmarksdetails', 'studentmarksdetails', 'getStudentMarksDetails']);
    const getstudent_examwisemarks = getArray(rawData, ['getstudent_examwisemarks', 'student_examwisemarks', 'examwisemarks']);
    const getpromotionremarksdetails = getArray(rawData, [
        'getpromotionremarksdetails',
        'promotionremarksdetails',
        'getPromotionRemarksDetails'
    ]);
    const getgroupdetails = getArray(rawData, ['getgroupdetails', 'groupdetails', 'getGroupDetails']);
    const getgroupexamdetails = getArray(rawData, ['getgroupexamdetails', 'groupexamdetails', 'getGroupExamDetails']);
    const backendGroupWise = getArray(rawData, ['groupwiseexamlist', 'groupwiseExamList']);
    const examwiseremarks = getArray(rawData, ['examwiseremarks', 'getexamwiseremarks', 'remarksdetails', 'getremarksdetails']);
    const getstudentwiseattendancedetails = getArray(rawData, [
        'getstudentwiseattendancedetails',
        'studentwiseattendancedetails',
        'getStudentWiseAttendanceDetails',
        'attendancedetails'
    ]);
    const getstudentwisetermwisedetails = getArray(rawData, ['getstudentwisetermwisedetails', 'studentwisetermwisedetails']);
    const getexamwisetotaldetails = getArray(rawData, ['getexamwisetotaldetails', 'examwisetotaldetails']);

    // Map student details dynamically from backend API
    const studentdetails = rawStudentDetails.map((r: any, idx: number) => {
        const realAmstId =
            Number(r.amsT_Id ?? r.AMST_Id ?? r.amst_id ?? 0) ||
            Number(
                getstudentmarksdetails.find((m: any) => (m.admNo || m.amsT_AdmNo || m.r_isms_id) === (r.r_isms_id || r.admno))?.amsT_Id ?? 0
            ) ||
            Number(getstudentmarksdetails[0]?.amsT_Id ?? 0) ||
            Number(r.subject_wise_total_per ?? idx + 1);

        return {
            AMST_Id: realAmstId,
            rawAmstId: Number(r.amsT_Id ?? r.AMST_Id ?? 0),
            subjWiseId: Number(r.subject_wise_total_per ?? 0),
            studentname: r.studentname || r.studentName || r.amsT_FirstName || r.r_amst_id,
            admno: r.admno || r.admNo || r.amsT_AdmNo || r.r_isms_id,
            rollno: r.rollno || r.amaY_RollNo || r.r_isms_subjectname,
            classname: r.classname || r.className || r.asmcL_ClassName || r.r_grporder || params?.classname || '',
            sectionname: r.sectionname || r.sectionName || r.asmC_SectionName || r.r_emps_apptoresultflg || params?.sectionname || '',
            fathername: r.fathername,
            mothername: r.mothername,
            dob: r.dob || r.r_gropuflag,
            photoUrl: r.photoUrl || r.r_eyces_marksdisplayflg,
            totalObtMarks: r.totalObtMarks ?? r.ESTMPP_TotalObtMarks ?? r.estmpP_TotalObtMarks,
            totalMaxMarks: r.totalMaxMarks ?? r.ESTMPP_TotalMaxMarks ?? r.estmpP_TotalMaxMarks,
            attendance: r.attendance ?? r.overallAttendancePercentage ?? r.TOTALAttendancePercentage ?? r.r_emgr_id,
            presentDays: r.presentDays ?? r.r_estmppsg_groupobtgrade ?? r.totalPresentDays,
            workingDays: r.workingDays ?? r.r_eyces_gradedisplayflg ?? r.totalWorkingDays,
            percentage: r.percentage ?? r.ESTMPP_Percentage ?? r.estmpP_Percentage
        };
    });

    if (!studentdetails || studentdetails.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground'>
                No report data found for the selected criteria.
            </div>
        );
    }

    // Build groupwiseexamlist dynamically from backend API
    const groupwiseexamlist: any[] = [];

    if (backendGroupWise && backendGroupWise.length > 0) {
        backendGroupWise.forEach((g: any) => {
            groupwiseexamlist.push({
                EMPG_GroupName: g.groupName ?? g.EMPG_GroupName ?? g.empG_GroupName,
                EME_Id: Number(g.examId ?? g.EME_Id ?? g.emE_Id),
                EME_ExamName: g.examName ?? g.EME_ExamName ?? g.emE_ExamName,
                EME_ExamOrder: Number(g.examOrder ?? g.EME_ExamOrder ?? g.emE_ExamOrder ?? 0),
                EMPG_DistplayName: g.displayName ?? g.EMPG_DistplayName ?? g.empG_DistplayName ?? g.groupName,
                EMPSGE_ForMaxMarkrs: g.maxMarks ?? g.EMPSGE_ForMaxMarkrs ?? g.empsgE_ForMaxMarkrs,
                examnamedisplay: g.displayName ?? g.examnamedisplay ?? g.examName,
                colspan: g.colspan ?? null,
                Attcolspan: g.Attcolspan ?? null
            });
        });
    } else if (getgroupdetails.length > 0) {
        getgroupdetails.forEach((dd: any) => {
            let counttotal = 0;
            const displayName = dd.empG_DistplayName || dd.EMPG_DistplayName || dd.empG_GroupName;
            const groupExams = getgroupexamdetails.filter(
                (d: any) => (d.empG_DistplayName || d.EMPG_DistplayName || d.empG_GroupName) === displayName
            );
            groupExams.forEach((d: any) => {
                counttotal += Number(d.empsgE_ForMaxMarkrs || d.EMPSGE_ForMaxMarkrs || 0);
                groupwiseexamlist.push({
                    EMPG_GroupName: d.empG_GroupName || displayName,
                    EME_Id: Number(d.emE_Id || d.EME_Id),
                    EME_ExamName: d.emE_ExamName || d.EME_ExamName,
                    EME_ExamOrder: Number(d.emE_ExamOrder || 0),
                    EMPG_DistplayName: displayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs || d.EMPSGE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName || d.EME_ExamName,
                    colspan: null,
                    Attcolspan: null
                });
            });
            groupwiseexamlist.push({
                EMPG_GroupName: dd.empG_GroupName || displayName,
                EME_Id: 9800000,
                EME_ExamName: 'Marks Obtained',
                EME_ExamOrder: 9800000,
                EMPG_DistplayName: displayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Total',
                colspan: 2,
                Attcolspan: 2
            });
            groupwiseexamlist.push({
                EMPG_GroupName: dd.empG_GroupName || displayName,
                EME_Id: 9800001,
                EME_ExamName: 'Term Average',
                EME_ExamOrder: 9800001,
                EMPG_DistplayName: displayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                examnamedisplay: 'Term Average',
                colspan: null,
                Attcolspan: null
            });
        });
    }

    const visibleExams = groupwiseexamlist;

    const getStudentMarks = (amstId: number, rawAmstId?: number, subjWiseId?: number) => {
        let marks = getstudentmarksdetails.filter(
            (m: any) =>
                Number(m.amsT_Id ?? m.AMST_Id) === amstId ||
                (rawAmstId && Number(m.amsT_Id ?? m.AMST_Id) === rawAmstId) ||
                (subjWiseId && Number(m.amsT_Id ?? m.AMST_Id) === subjWiseId)
        );
        if (marks.length === 0 && studentdetails.length === 1) {
            marks = getstudentmarksdetails;
        }
        return marks;
    };

    // Derive subjects dynamically per student sorted in Turnbridge IX-X report card order
    const getStudentSubjects = (amstId: number) => {
        const rawSubjList = getArray(rawData, ['getstudentwisesubjectlist', 'studentwisesubjectlist']);
        const filteredFromList = rawSubjList.filter((s: any) => Number(s.amsT_Id ?? s.AMST_Id) === amstId);

        let list: any[] = [];
        if (filteredFromList.length > 0) {
            const distinctMap = new Map();
            filteredFromList.forEach((s: any) => {
                const subId = Number(s.ismS_Id ?? s.ISMS_Id);
                if (subId && !distinctMap.has(subId)) {
                    distinctMap.set(subId, {
                        ISMS_Id: subId,
                        ISMS_SubjectName: s.ismS_SubjectName || s.ISMS_SubjectName,
                        EYCES_MarksDisplayFlg: s.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? true,
                        EYCES_GradeDisplayFlg: s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? false,
                        subject_wise_total_per: s.subject_wise_total_per ?? s.ESTMPP_ObtGrade ?? s.subject_Wise_Total_Per,
                        order: Number(s.ismS_OrderFlag ?? s.ISMS_OrderFlag ?? s.ismS_SubjectOrder ?? 999)
                    });
                }
            });
            list = Array.from(distinctMap.values());
        } else {
            const marks = getStudentMarks(amstId);
            const distinctMap = new Map();
            marks.forEach((m: any) => {
                const subId = Number(m.ismS_Id ?? m.ISMS_Id);
                const subName = m.ismS_SubjectName || m.ISMS_SubjectName;
                if (subId && subName && !distinctMap.has(subName.toLowerCase())) {
                    distinctMap.set(subName.toLowerCase(), {
                        ISMS_Id: subId,
                        ISMS_SubjectName: subName,
                        EYCES_MarksDisplayFlg: m.eyceS_MarksDisplayFlg ?? m.EYCES_MarksDisplayFlg ?? true,
                        EYCES_GradeDisplayFlg: m.eyceS_GradeDisplayFlg ?? m.EYCES_GradeDisplayFlg ?? false,
                        subject_wise_total_per: m.subject_wise_total_per ?? m.estmpp_ObtGrade ?? m.ESTMPP_ObtGrade,
                        order: Number(m.ismS_OrderFlag ?? m.ISMS_OrderFlag ?? m.ismS_SubjectOrder ?? 999)
                    });
                }
            });
            list = Array.from(distinctMap.values());
        }

        list.sort((a, b) => getSubjectOrderIndex(a.ISMS_SubjectName) - getSubjectOrderIndex(b.ISMS_SubjectName));
        return list;
    };

    const getExamwiseMarks = (amstId: number, rawAmstId?: number, subjWiseId?: number) => {
        let marks = getstudent_examwisemarks.filter(
            (m: any) =>
                Number(m.amsT_Id ?? m.AMST_Id) === amstId ||
                (rawAmstId && Number(m.amsT_Id ?? m.AMST_Id) === rawAmstId) ||
                (subjWiseId && Number(m.amsT_Id ?? m.AMST_Id) === subjWiseId)
        );
        if (marks.length === 0 && studentdetails.length === 1) {
            marks = getstudent_examwisemarks;
        }
        return marks;
    };

    const getStudentAttendance = (amstId: number, rawAmstId?: number, subjWiseId?: number) => {
        let att = getstudentwiseattendancedetails.filter(
            (a: any) =>
                Number(a.amsT_Id ?? a.AMST_Id) === amstId ||
                (rawAmstId && Number(a.amsT_Id ?? a.AMST_Id) === rawAmstId) ||
                (subjWiseId && Number(a.amsT_Id ?? a.AMST_Id) === subjWiseId)
        );

        if (att.length === 0) {
            att = getexamwisetotaldetails.filter(
                (a: any) =>
                    Number(a.amsT_Id ?? a.AMST_Id) === amstId ||
                    (rawAmstId && Number(a.amsT_Id ?? a.AMST_Id) === rawAmstId) ||
                    (subjWiseId && Number(a.amsT_Id ?? a.AMST_Id) === subjWiseId)
            );
        }

        return att;
    };

    const getStudentRemarks = (amstId: number, rawAmstId?: number, subjWiseId?: number) => {
        let rem = examwiseremarks.filter(
            (r: any) =>
                Number(r.amsT_Id ?? r.AMST_Id) === amstId ||
                (rawAmstId && Number(r.amsT_Id ?? r.AMST_Id) === rawAmstId) ||
                (subjWiseId && Number(r.amsT_Id ?? r.AMST_Id) === subjWiseId)
        );
        if (rem.length === 0) {
            rem = getstudent_examwisemarks.filter(
                (m: any) =>
                    (Number(m.amsT_Id ?? m.AMST_Id) === amstId || (rawAmstId && Number(m.amsT_Id ?? m.AMST_Id) === rawAmstId)) &&
                    (m.emeR_Remarks || m.EMER_Remarks || m.remarks || m.estmP_ClassRank !== undefined || m.ESTMP_ClassRank !== undefined)
            );
        }
        return rem;
    };

    const matchExamGroup = (item: any, grpexam: any) => {
        if (!item) return false;
        const itemEmeId = Number(item.emE_Id ?? item.EME_Id ?? 0);
        const grpEmeId = Number(grpexam?.EME_Id ?? 0);

        if (grpEmeId > 0 && grpEmeId < 9000000 && itemEmeId === grpEmeId) {
            return true;
        }

        const itemGroup = String(item.empsG_DisplayName || item.EMPSG_DisplayName || item.emE_ExamName || item.EME_ExamName || '')
            .toLowerCase()
            .trim();
        const grpGroup = String(grpexam?.EMPG_DistplayName || grpexam?.EME_ExamName || grpexam?.examnamedisplay || '')
            .toLowerCase()
            .trim();

        if (itemGroup && grpGroup) {
            if (itemGroup === grpGroup) return true;
            if (
                (itemGroup.includes('unit test 1') || itemGroup.includes('i unit')) &&
                (grpGroup.includes('unit test 1') || grpGroup.includes('i unit'))
            )
                return true;
            if (
                (itemGroup.includes('term 1') || itemGroup.includes('i term')) &&
                (grpGroup.includes('term 1') || grpGroup.includes('i term'))
            )
                return true;
            if (
                (itemGroup.includes('unit test 2') || itemGroup.includes('ii unit')) &&
                (grpGroup.includes('unit test 2') || grpGroup.includes('ii unit'))
            )
                return true;
            if (
                (itemGroup.includes('term 2') || itemGroup.includes('ii term')) &&
                (grpGroup.includes('term 2') || grpGroup.includes('ii term'))
            )
                return true;
        }
        return false;
    };

    const getStudentMark = (studentmarks: any[], subj: any, examId: number, displayName: string) => {
        const subId = Number(subj.ISMS_Id);
        const subName = (subj.ISMS_SubjectName || '').toLowerCase().trim();

        const matches = studentmarks.filter((m: any) => {
            const mSubId = Number(m.ismS_Id ?? m.ISMS_Id ?? 0);
            const mSubName = (m.ismS_SubjectName || m.ISMS_SubjectName || '').toLowerCase().trim();

            const isSubjMatch =
                (subId > 0 && mSubId === subId) ||
                (subName && mSubName && (mSubName === subName || mSubName.includes(subName) || subName.includes(mSubName)));
            if (!isSubjMatch) return false;

            const mExamId = Number(m.emE_Id ?? m.EME_Id ?? 0);
            const mDisp = (m.empsG_DisplayName || m.EMPSG_DisplayName || m.emE_ExamName || m.EME_ExamName || '').toLowerCase().trim();
            const disp = (displayName || '').toLowerCase().trim();

            if (examId > 0 && examId < 9000000 && mExamId === examId) return true;
            if (mDisp && disp && (mDisp === disp || matchExamGroup(m, { EMPG_DistplayName: displayName, EME_Id: examId }))) return true;

            return false;
        });

        if (matches.length === 0) return null;
        if (matches.length === 1) return matches[0];

        const obtRow = matches.find(
            (m: any) =>
                (m.estmpP_ObtMarks !== undefined && m.estmpP_ObtMarks !== null) ||
                (m.obtainedMarks !== undefined && m.obtainedMarks !== null)
        );
        if (obtRow) return obtRow;

        return matches[0];
    };

    const getStudentExamMark = (examwisemarks: any[], examId: number, displayName: string) =>
        examwisemarks.find(
            (m: any) => Number(m.emE_Id ?? m.EME_Id) === examId || (m.empsG_DisplayName || m.EMPSG_DisplayName) === displayName
        );

    const renderMarkValue = (mark: any) => {
        if (!mark) return '';
        const passFailFlag = String(mark.passFailFlag || mark.PassFailFlag || '')
            .toUpperCase()
            .trim();
        if (['AB', 'M', 'L', 'ABSENT'].includes(passFailFlag)) {
            return passFailFlag === 'ABSENT' ? 'AB' : passFailFlag;
        }

        const obtMarks =
            mark.estmpP_ObtMarks ?? mark.obtainedMarks ?? mark.ObtainedMarks ?? mark.r_estmppsg_groupobtmarks ?? mark.ESTMPP_ObtMarks;

        if ((mark.eyceS_MarksDisplayFlg ?? mark.EYCES_MarksDisplayFlg ?? true) && obtMarks !== undefined && obtMarks !== null) {
            return String(obtMarks);
        }
        const obtGrade = mark.obtainedGrade ?? mark.ObtainedGrade ?? mark.estmpP_ObtGrade ?? mark.r_eyces_gradedisplayflg;
        if (obtGrade) {
            return String(obtGrade);
        }
        return obtMarks !== undefined && obtMarks !== null ? String(obtMarks) : '';
    };

    // Calculate Term Average dynamically from database obtained marks
    const getTermAverage = (subj: any, allSubjs: any[], studentmarks: any[], grpexam: any) => {
        const name = (subj.ISMS_SubjectName || '').toLowerCase();
        let groupSubjs = [subj];

        if (name.includes('english')) {
            groupSubjs = allSubjs.filter((s: any) => (s.ISMS_SubjectName || '').toLowerCase().includes('english'));
        } else if (name.includes('history') || name.includes('civics') || name.includes('geography')) {
            groupSubjs = allSubjs.filter((s: any) => {
                const n = (s.ISMS_SubjectName || '').toLowerCase();
                return n.includes('history') || n.includes('civics') || n.includes('geography');
            });
        } else if (name.includes('physics') || name.includes('chemistry') || name.includes('biology')) {
            groupSubjs = allSubjs.filter((s: any) => {
                const n = (s.ISMS_SubjectName || '').toLowerCase();
                return n.includes('physics') || n.includes('chemistry') || n.includes('biology');
            });
        }

        const vals: number[] = [];
        const grades: string[] = [];

        groupSubjs.forEach((s) => {
            const m = getStudentMark(studentmarks, s, grpexam.EME_Id, grpexam.EMPG_DistplayName);
            if (m) {
                const obt = m.estmpP_ObtMarks ?? m.obtainedMarks ?? m.ObtainedMarks ?? m.r_estmppsg_groupobtmarks ?? m.ESTMPP_ObtMarks;
                if (typeof obt === 'number') {
                    vals.push(obt);
                } else if (obt !== null && obt !== undefined && !Number.isNaN(Number(obt))) {
                    vals.push(Number(obt));
                } else if (m.obtainedGrade || m.ObtainedGrade || m.estmpP_ObtGrade) {
                    grades.push(m.obtainedGrade || m.ObtainedGrade || m.estmpP_ObtGrade);
                }
            }
        });

        if (vals.length > 0) {
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            return avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
        }
        if (grades.length > 0) return grades[0];
        return '';
    };

    const getSubjectExamMarks = (studentmarks: any[], subjectId: number) => {
        const subjMarks = studentmarks.filter((m: any) => Number(m.ismS_Id ?? m.ISMS_Id) === subjectId);
        const uniqueMarksMap = new Map();
        subjMarks.forEach((m: any) => {
            const key = m.empsG_DisplayName || m.EMPSG_DisplayName || m.emE_Id || m.EME_Id;
            if (!uniqueMarksMap.has(key)) {
                uniqueMarksMap.set(key, m);
            }
        });
        return Array.from(uniqueMarksMap.values());
    };

    const getYearlyAggregate = (subj: any, studentmarks: any[]) => {
        if (subj.EYCES_GradeDisplayFlg && (subj.ESTMPP_ObtGrade || subj.subject_wise_total_per)) {
            return subj.ESTMPP_ObtGrade || subj.subject_wise_total_per;
        }

        if (subj.subject_wise_total_per !== undefined && subj.subject_wise_total_per !== null && subj.subject_wise_total_per !== '') {
            const v = Number(subj.subject_wise_total_per);
            if (!Number.isNaN(v)) return v % 1 === 0 ? v.toString() : v.toFixed(1);
            return String(subj.subject_wise_total_per);
        }

        const m = studentmarks.find(
            (mark: any) =>
                Number(mark.ismS_Id ?? mark.ISMS_Id) === subj.ISMS_Id &&
                (mark.subject_wise_total_per || mark.estmpp_ObtGrade || mark.ESTMPP_ObtGrade)
        );
        if (m) {
            if ((m.eyceS_GradeDisplayFlg || m.EYCES_GradeDisplayFlg) && (m.estmpp_ObtGrade || m.ESTMPP_ObtGrade)) {
                return m.estmpp_ObtGrade || m.ESTMPP_ObtGrade;
            }
            if (m.subject_wise_total_per !== undefined && m.subject_wise_total_per !== null && m.subject_wise_total_per !== '') {
                const v = Number(m.subject_wise_total_per);
                if (!Number.isNaN(v)) return v % 1 === 0 ? v.toString() : v.toFixed(1);
                return String(m.subject_wise_total_per);
            }
        }

        const uniqueMarks = getSubjectExamMarks(studentmarks, subj.ISMS_Id);
        if (uniqueMarks.length === 0) return '';

        const isGrade =
            subj.EYCES_GradeDisplayFlg || uniqueMarks.some((mark: any) => mark.eyceS_GradeDisplayFlg || mark.EYCES_GradeDisplayFlg);
        if (isGrade) {
            const g = uniqueMarks[0]?.obtainedGrade || uniqueMarks[0]?.ObtainedGrade || uniqueMarks[0]?.estmpP_ObtGrade;
            return g || '';
        }

        const numVals: number[] = [];
        uniqueMarks.forEach((mark: any) => {
            const passFailFlag = String(mark.passFailFlag || mark.PassFailFlag || '')
                .toUpperCase()
                .trim();
            if (!['AB', 'M', 'L', 'ABSENT'].includes(passFailFlag)) {
                const val =
                    mark.estmpP_ObtMarks ??
                    mark.obtainedMarks ??
                    mark.ObtainedMarks ??
                    mark.r_estmppsg_groupobtmarks ??
                    mark.ESTMPP_ObtMarks;
                if (typeof val === 'number') numVals.push(val);
                else if (val !== null && val !== undefined && !Number.isNaN(Number(val))) numVals.push(Number(val));
            }
        });

        if (numVals.length === 0) return '';
        const avg = numVals.reduce((a, b) => a + b, 0) / numVals.length;
        return avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
    };

    const getExamAttendancePct = (
        attendanceDetails: any[],
        examwisemarks: any[],
        grpexam: any,
        colType: 'EXAM' | 'TOTAL',
        studentReport?: any
    ) => {
        if (attendanceDetails && attendanceDetails.length > 0) {
            const att = attendanceDetails.find((a: any) => matchExamGroup(a, grpexam));
            if (att) {
                if (colType === 'TOTAL') {
                    const val =
                        att.TOTALAttendancePercentage ?? att.totalAttendancePercentage ?? att.attendancePercentage ?? att.estmP_Percentage;
                    if (val !== undefined && val !== null && String(val) !== '') return String(val);
                }
                const val =
                    att.attendancePercentage ?? att.TOTALAttendancePercentage ?? att.totalAttendancePercentage ?? att.estmP_Percentage;
                if (val !== undefined && val !== null && String(val) !== '') return String(val);
            }
        }

        if (examwisemarks && examwisemarks.length > 0) {
            const exMark = examwisemarks.find((m: any) => matchExamGroup(m, grpexam));
            if (exMark) {
                const val = exMark.attendancePercentage ?? exMark.estmP_Percentage ?? exMark.attendance ?? exMark.present_attendence;
                if (val !== undefined && val !== null && String(val) !== '') return String(val);
            }
        }

        if (grpexam.EME_Id === 9800000 && studentReport?.attendance) {
            return String(studentReport.attendance);
        }

        return '';
    };

    const getExamAttendanceDays = (attendanceDetails: any[], examwisemarks: any[], grpexam: any, studentReport?: any) => {
        const getPres = (item: any) =>
            item?.totalPresentDays ??
            item?.TOTALPRESENTDAYS ??
            item?.presentDays ??
            item?.present_attendence ??
            item?.presenT_DAYS ??
            item?.estmP_TotalPresentDays ??
            item?.empsG_PresentDays;

        const getWork = (item: any) =>
            item?.totalWorkingDays ??
            item?.TOTALWORKINGDAYS ??
            item?.workingDays ??
            item?.work_attendence ??
            item?.workinG_DAYS ??
            item?.estmP_TotalWorkingDays ??
            item?.empsG_WorkingDays;

        if (attendanceDetails && attendanceDetails.length > 0) {
            const att = attendanceDetails.find((a: any) => matchExamGroup(a, grpexam));
            if (att) {
                const pres = getPres(att);
                const work = getWork(att);
                if (
                    pres !== undefined &&
                    work !== undefined &&
                    pres !== null &&
                    work !== null &&
                    String(pres) !== '' &&
                    String(work) !== '' &&
                    String(pres) !== '0'
                ) {
                    return `${pres}/${work}`;
                }
            }
        }

        if (examwisemarks && examwisemarks.length > 0) {
            const exMark = examwisemarks.find((m: any) => matchExamGroup(m, grpexam));
            if (exMark) {
                const pres = getPres(exMark);
                const work = getWork(exMark);
                if (
                    pres !== undefined &&
                    work !== undefined &&
                    pres !== null &&
                    work !== null &&
                    String(pres) !== '' &&
                    String(work) !== ''
                ) {
                    return `${pres}/${work}`;
                }
            }
        }

        if (grpexam.EME_Id === 9800000 && studentReport?.presentDays && studentReport?.workingDays) {
            const p = String(studentReport.presentDays).replace('.00', '').trim();
            const w = String(studentReport.workingDays).replace('.00', '').trim();
            if (p && w && p !== '0' && w !== '0' && !Number.isNaN(Number(p)) && !Number.isNaN(Number(w))) {
                return `${p}/${w}`;
            }
        }

        return '';
    };

    return (
        <div className='mx-auto w-[1400px]'>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='tb-print-area'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4 landscape; margin: 8mm; }
                        body {
                            visibility: hidden;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #tb-print-area, #tb-print-area * {
                            visibility: visible;
                        }
                        #tb-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .page-break {
                            page-break-before: always !important;
                            break-before: page !important;
                        }
                    }
                    .tb-pagelayout {
                        border: 1px solid #727272;
                        padding: 8px;
                        margin-bottom: 20px;
                        background-image: url('https://vapsclg.blob.core.windows.net/files/Logo02.jpg');
                        background-repeat: no-repeat;
                        background-size: 500px !important;
                        background-position: center !important;
                    }
                    .tb-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: 'Arial', sans-serif;
                        font-size: 13px;
                    }
                    .tb-table th, .tb-table td {
                        border: 1px solid black;
                        padding: 4px 6px;
                        text-align: center;
                    }
                    .tb-table thead {
                        color: black;
                        text-align: center;
                        background: white !important;
                    }
                    .tb-header-row th {
                        background: white !important;
                    }
                    .tb-subject-col {
                        text-align: left !important;
                        word-wrap: break-word;
                    }
                    .tb-exam-header {
                        word-wrap: break-word;
                        min-width: 80px;
                    }
                    .tb-yearly-agg-col {
                        min-width: 100px;
                    }
                    .tb-info-row th {
                        font-size: 14px;
                        padding: 5px 8px;
                        text-align: left;
                    }
                    .comments-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .comments-table th, .comments-table td {
                        border: 1px solid black;
                        padding: 4px 6px;
                        text-align: left;
                    }
                `
                    }}
                />

                {studentdetails.map((report: any, idx: number) => {
                    const amstId = report.AMST_Id;
                    const rawAmstId = report.rawAmstId;
                    const subjWiseId = report.subjWiseId;

                    const studentSubjects = getStudentSubjects(amstId);
                    const studentmarks = getStudentMarks(amstId, rawAmstId, subjWiseId);
                    const examwisemarks = getExamwiseMarks(amstId, rawAmstId, subjWiseId);
                    const attendanceDetails = getStudentAttendance(amstId, rawAmstId, subjWiseId);
                    const studentRemarks = getStudentRemarks(amstId, rawAmstId, subjWiseId);

                    const promotionRemarks =
                        getpromotionremarksdetails.find(
                            (r: any) =>
                                Number(r.amsT_Id ?? r.AMST_Id ?? 0) === amstId ||
                                (rawAmstId && Number(r.amsT_Id ?? r.AMST_Id) === rawAmstId) ||
                                r.AMST_Id === amstId
                        ) || getpromotionremarksdetails[0];

                    const termwiseDetail =
                        getstudentwisetermwisedetails.find(
                            (r: any) =>
                                Number(r.amsT_Id ?? r.AMST_Id ?? 0) === amstId ||
                                (rawAmstId && Number(r.amsT_Id ?? r.AMST_Id) === rawAmstId) ||
                                r.AMST_Id === amstId
                        ) || getstudentwisetermwisedetails[0];

                    const standardExamGroups = [
                        { name: 'Unit Test 1', id: 24 },
                        { name: 'Term 1', id: 25 },
                        { name: 'Unit Test 2', id: 26 },
                        { name: 'Term 2', id: 27 }
                    ];

                    const attAverageObj = attendanceDetails.find(
                        (a: any) => (a.EMPSG_DisplayName || a.empsG_DisplayName || '').toLowerCase() === 'att_average'
                    );

                    return (
                        <div key={`tb-report-ixtox-${amstId}-${idx}`} className={`tb-pagelayout ${idx > 0 ? 'page-break' : ''}`}>
                            {/* Student Info Header Row */}
                            <table className='tb-table' style={{ backgroundColor: 'transparent' }}>
                                <tbody>
                                    <tr className='tb-info-row'>
                                        <th style={{ width: '25%' }}>
                                            <b>TUNBRIDGE HIGH SCHOOL Report Card</b>
                                        </th>
                                        <th style={{ width: '25%' }}>
                                            <b>{report.studentname}</b>
                                        </th>
                                        <th style={{ width: '20%' }}>
                                            <b>
                                                {report.classname}&nbsp;&nbsp;{report.sectionname}
                                            </b>
                                        </th>
                                        <th style={{ width: '15%' }}>
                                            <b>Adm&nbsp;{report.admno}</b>
                                        </th>
                                        <th style={{ width: '15%' }}>
                                            <b>AY&nbsp;{params?.academicYearName || report.asmaY_Year || ''}</b>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>

                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    marginTop: '4px',
                                    backgroundColor: 'transparent'
                                }}>
                                <tbody>
                                    <tr>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <table className='tb-table' style={{ backgroundColor: 'transparent' }}>
                                                <thead>
                                                    <tr className='tb-header-row'>
                                                        <th style={{ width: '30px' }}>No</th>
                                                        <th style={{ width: '150px' }} className='tb-subject-col'>
                                                            <b>Subject</b>
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => (
                                                            <th key={`exam-hdr-${gi}`} className='tb-exam-header'>
                                                                <b>{grpexam.examnamedisplay}</b>
                                                                <br />
                                                                {grpexam.EMPSGE_ForMaxMarkrs && grpexam.EME_Id !== 9800001 ? (
                                                                    <b>({grpexam.EMPSGE_ForMaxMarkrs})</b>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </th>
                                                        ))}
                                                        <th className='tb-yearly-agg-col'>Yearly Aggregate</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {studentSubjects.map((subj: any, si: number) => {
                                                        const subjNameLower = (subj.ISMS_SubjectName || '').toLowerCase();
                                                        const isEngLit = subjNameLower.includes('english literature');
                                                        const isGeo = subjNameLower.includes('geography');
                                                        const isChemOrBio =
                                                            subjNameLower.includes('chemistry') || subjNameLower.includes('biology');

                                                        return (
                                                            <tr key={`subj-${si}`}>
                                                                <td>{si + 1}</td>
                                                                <td
                                                                    className='tb-subject-col'
                                                                    style={{ width: '150px', wordBreak: 'break-word' }}>
                                                                    {subj.ISMS_SubjectName}
                                                                </td>
                                                                {visibleExams.map((grpexam: any, gi: number) => {
                                                                    if (grpexam.EME_Id === 9800001) {
                                                                        if (isEngLit || isGeo || isChemOrBio) {
                                                                            return null;
                                                                        }
                                                                        const rowSpanVal = subjNameLower.includes('english language')
                                                                            ? 2
                                                                            : subjNameLower.includes('history') ||
                                                                                subjNameLower.includes('civics')
                                                                              ? 2
                                                                              : subjNameLower.includes('physics')
                                                                                ? 3
                                                                                : 1;

                                                                        return (
                                                                            <td
                                                                                key={`mark-${gi}`}
                                                                                rowSpan={rowSpanVal}
                                                                                style={{ verticalAlign: 'middle' }}>
                                                                                <b>
                                                                                    {getTermAverage(
                                                                                        subj,
                                                                                        studentSubjects,
                                                                                        studentmarks,
                                                                                        grpexam
                                                                                    )}
                                                                                </b>
                                                                            </td>
                                                                        );
                                                                    }
                                                                    let mark;
                                                                    if (grpexam.EME_Id === 9800000) {
                                                                        mark = studentmarks.find(
                                                                            (m: any) =>
                                                                                Number(m.ismS_Id ?? m.ISMS_Id) === subj.ISMS_Id &&
                                                                                (m.empsG_DisplayName || m.EMPSG_DisplayName) ===
                                                                                    grpexam.EMPG_DistplayName
                                                                        );
                                                                    } else {
                                                                        mark = getStudentMark(
                                                                            studentmarks,
                                                                            subj,
                                                                            grpexam.EME_Id,
                                                                            grpexam.EMPG_DistplayName
                                                                        );
                                                                    }
                                                                    return <td key={`mark-${gi}`}>{mark ? renderMarkValue(mark) : ''}</td>;
                                                                })}
                                                                <td>
                                                                    <b>{getYearlyAggregate(subj, studentmarks)}</b>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>

                                                <tbody>
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            TOTAL MARKS
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => {
                                                            if (grpexam.EME_Id === 9800001) {
                                                                return <th key={`total-avg-${gi}`}></th>;
                                                            }
                                                            const mark = getStudentExamMark(
                                                                examwisemarks,
                                                                grpexam.EME_Id,
                                                                grpexam.EMPG_DistplayName
                                                            );
                                                            const obt = mark?.obtainedMarks ?? mark?.ObtainedMarks ?? mark?.estmP_ObtMarks;
                                                            const tot = mark?.totalMarks ?? mark?.TotalMarks ?? mark?.estmP_TotalMaxMarks;
                                                            return (
                                                                <th key={`total-${gi}`}>
                                                                    {obt !== undefined && tot !== undefined ? `${obt}/${tot}` : ''}
                                                                </th>
                                                            );
                                                        })}
                                                        <th>
                                                            {termwiseDetail
                                                                ? `${termwiseDetail.ESTMPP_TotalObtMarks || termwiseDetail.estmpP_TotalObtMarks || report.totalObtMarks || ''} / ${termwiseDetail.ESTMPP_TotalMaxMarks || termwiseDetail.estmpP_TotalMaxMarks || report.totalMaxMarks || ''}`
                                                                : report.totalObtMarks && report.totalMaxMarks
                                                                  ? `${report.totalObtMarks} / ${report.totalMaxMarks}`
                                                                  : ''}
                                                        </th>
                                                    </tr>

                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Percentage
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => {
                                                            if (grpexam.EME_Id === 9800001) {
                                                                return <th key={`pct-avg-${gi}`}></th>;
                                                            }
                                                            const mark = getStudentExamMark(
                                                                examwisemarks,
                                                                grpexam.EME_Id,
                                                                grpexam.EMPG_DistplayName
                                                            );
                                                            const pct =
                                                                mark?.totalPercentage ?? mark?.TotalPercentage ?? mark?.estmP_Percentage;
                                                            return <th key={`pct-${gi}`}>{pct !== undefined ? `${pct}` : ''}</th>;
                                                        })}
                                                        <th>
                                                            {termwiseDetail?.ESTMPP_Percentage ||
                                                                termwiseDetail?.estmpP_Percentage ||
                                                                report.percentage ||
                                                                ''}
                                                        </th>
                                                    </tr>

                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Attendance %
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => {
                                                            if (grpexam.EME_Id === 9800001) {
                                                                return <th key={`att-avg-${gi}`}></th>;
                                                            }
                                                            const colType = grpexam.EME_Id === 9800000 ? 'TOTAL' : 'EXAM';
                                                            const val = getExamAttendancePct(
                                                                attendanceDetails,
                                                                examwisemarks,
                                                                grpexam,
                                                                colType,
                                                                report
                                                            );
                                                            return (
                                                                <th key={`att-${gi}`}>
                                                                    {val !== undefined && val !== null ? `${val}` : ''}
                                                                </th>
                                                            );
                                                        })}
                                                        <th>
                                                            {attAverageObj?.TOTALAttendancePercentage ??
                                                                attAverageObj?.totalAttendancePercentage ??
                                                                report.attendance ??
                                                                ''}
                                                        </th>
                                                    </tr>

                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Cumulative Attendance/Days
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => {
                                                            if (grpexam.EME_Id === 9800001) {
                                                                return <th key={`cum-att-avg-${gi}`}></th>;
                                                            }
                                                            const val = getExamAttendanceDays(
                                                                attendanceDetails,
                                                                examwisemarks,
                                                                grpexam,
                                                                report
                                                            );
                                                            return <th key={`cum-att-${gi}`}>{val}</th>;
                                                        })}
                                                        <th>
                                                            {attAverageObj?.totalPresentDays && attAverageObj?.totalWorkingDays
                                                                ? `${attAverageObj.totalPresentDays}/${attAverageObj.totalWorkingDays}`
                                                                : report.presentDays && report.workingDays
                                                                  ? `${String(report.presentDays).replace('.00', '')}/${String(report.workingDays).replace('.00', '')}`
                                                                  : ''}
                                                        </th>
                                                    </tr>

                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Teacher&apos;s Signature &amp; Date
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => (
                                                            <th key={`tsig-${gi}`} style={{ height: '40px' }}></th>
                                                        ))}
                                                        <th></th>
                                                    </tr>

                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Principal&apos;s Signature &amp; Date
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => (
                                                            <th key={`psig-${gi}`} style={{ height: '40px' }}></th>
                                                        ))}
                                                        <th></th>
                                                    </tr>

                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Parent&apos;s Signature &amp; Date
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => (
                                                            <th key={`parsig-${gi}`} style={{ height: '40px' }}></th>
                                                        ))}
                                                        <th></th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>

                                        <td style={{ verticalAlign: 'top', width: '250px' }}>
                                            <table className='comments-table'>
                                                <thead>
                                                    <tr>
                                                        <th style={{ height: '94px' }}>Teacher&apos;s Comments/Rank</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {standardExamGroups.map((grp, eIdx) => {
                                                        const remarkObj =
                                                            studentRemarks.find(
                                                                (r: any) =>
                                                                    matchExamGroup(r, {
                                                                        EMPG_DistplayName: grp.name,
                                                                        EME_ExamName: grp.name,
                                                                        EME_Id: grp.id
                                                                    }) || Number(r.emE_Id ?? r.EME_Id ?? 0) === grp.id
                                                            ) ||
                                                            getstudent_examwisemarks.find(
                                                                (m: any) =>
                                                                    matchExamGroup(m, {
                                                                        EMPG_DistplayName: grp.name,
                                                                        EME_ExamName: grp.name,
                                                                        EME_Id: grp.id
                                                                    }) || Number(m.emE_Id ?? m.EME_Id ?? 0) === grp.id
                                                            );

                                                        const examName =
                                                            remarkObj?.EME_ExamName ||
                                                            remarkObj?.emE_ExamName ||
                                                            remarkObj?.empsG_DisplayName ||
                                                            remarkObj?.EMPSG_DisplayName ||
                                                            grp.name;

                                                        const rank =
                                                            remarkObj?.ESTMP_ClassRank ??
                                                            remarkObj?.estmP_ClassRank ??
                                                            remarkObj?.rank ??
                                                            remarkObj?.ESTMP_SectionRank ??
                                                            remarkObj?.estmP_SectionRank;

                                                        const remarkText =
                                                            remarkObj?.EMER_Remarks ||
                                                            remarkObj?.emeR_Remarks ||
                                                            remarkObj?.remarks ||
                                                            remarkObj?.emer_Remarks ||
                                                            '';

                                                        return (
                                                            <tr key={`remark-box-${eIdx}`}>
                                                                <td
                                                                    style={{
                                                                        textAlign: 'left',
                                                                        padding: '6px',
                                                                        fontSize: '12px',
                                                                        minHeight: '50px'
                                                                    }}>
                                                                    <b>{examName}</b>
                                                                    {rank !== undefined && rank !== null && String(rank) !== '' && (
                                                                        <>
                                                                            <br />
                                                                            <b>RANK :{rank}</b>
                                                                        </>
                                                                    )}
                                                                    {remarkText ? (
                                                                        <>
                                                                            <br />
                                                                            {remarkText}
                                                                        </>
                                                                    ) : null}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    {promotionRemarks && (
                                                        <tr>
                                                            <td style={{ textAlign: 'left', padding: '6px', fontSize: '12px' }}>
                                                                <b>FINAL REMARKS &amp; RESULT</b>
                                                                <br />
                                                                {promotionRemarks.eprD_Remarks || promotionRemarks.EPRD_Remarks || ''}
                                                                {promotionRemarks.eprD_ClassPromoted ||
                                                                promotionRemarks.EPRD_ClassPromoted ||
                                                                promotionRemarks.ESTMPP_ClassRank ||
                                                                promotionRemarks.estmpP_ClassRank ? (
                                                                    <>
                                                                        <br />
                                                                        <b>OVERALL RANK :</b>{' '}
                                                                        {promotionRemarks.eprD_ClassPromoted ||
                                                                            promotionRemarks.EPRD_ClassPromoted ||
                                                                            promotionRemarks.ESTMPP_ClassRank ||
                                                                            promotionRemarks.estmpP_ClassRank}
                                                                    </>
                                                                ) : null}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

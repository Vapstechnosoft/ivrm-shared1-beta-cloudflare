'use client';

import { Button } from '@/components/ui/button';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    console.log('StThomos Report Card IX Raw Data:', data);

    // Normalize institution details
    const institution =
        (Array.isArray(data.institutionList) && data.institutionList[0]) ||
        (Array.isArray(data.masterinstitution) && data.masterinstitution[0]) ||
        (Array.isArray(data.institution) && data.institution[0]) ||
        (Array.isArray(data.getinstitution) && data.getinstitution[0]) ||
        data.institutionList ||
        data.masterinstitution ||
        data.institution ||
        data.getinstitution;

    // Normalizing and dynamically parsing groups & exams
    const groupDetailsRaw = data.getgroupdetails || data.groupdetails || [];
    const getgroupexamdetails = data.getgroupexamdetails || data.groupexamdetails || [];
    const rawGroupWiseExamList = data.groupwiseexamlist || [];

    let groupDetailsMapped = [...groupDetailsRaw];
    let groupWiseExamListMapped: any[] = [];

    // Case-insensitive/spelling robust group name matcher
    const matchGroupName = (g1: string, g2: string) => {
        const s1 = String(g1 || '')
            .replace(/distplay/g, 'display')
            .toLowerCase()
            .trim();
        const s2 = String(g2 || '')
            .replace(/distplay/g, 'display')
            .toLowerCase()
            .trim();
        return s1 === s2;
    };

    // Dynamically reconstruct groupWiseExamList if not provided or empty
    if (rawGroupWiseExamList.length === 0 && groupDetailsMapped.length > 0) {
        const tempGroupWiseExamList: any[] = [];

        groupDetailsMapped = groupDetailsMapped.map((dd: any) => {
            const tempGroupExams: any[] = [];
            let counttotal = 0;
            const grpDisplayName = dd.empG_DistplayName || dd.empG_DisplayName || dd.empsG_DisplayName || '';

            getgroupexamdetails.forEach((d: any) => {
                const examGrpDisplayName = d.empG_DistplayName || d.empG_DisplayName || d.empsG_DisplayName || '';

                if (matchGroupName(grpDisplayName, examGrpDisplayName)) {
                    const maxMarks = d.empsgE_ForMaxMarkrs || d.empsge_ForMaxMarkrs || d.maxMarks || 0;
                    counttotal += maxMarks;

                    const examItem = {
                        EME_Id: d.emE_Id || d.eme_Id,
                        examId: d.emE_Id || d.eme_Id,
                        EME_ExamName: d.emE_ExamName || d.eme_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder || d.eme_ExamOrder,
                        EMPG_DistplayName: grpDisplayName,
                        groupName: grpDisplayName,
                        EMPSGE_ForMaxMarkrs: maxMarks,
                        maxMarks: maxMarks,
                        examnamedisplay: d.emE_ExamCode || d.eme_ExamCode,
                        displayName: d.emE_ExamCode || d.eme_ExamCode
                    };

                    tempGroupExams.push(examItem);
                    tempGroupWiseExamList.push(examItem);
                }
            });

            // Total column
            const totalItem = {
                EME_Id: 9800000,
                examId: 9800000,
                EME_ExamName: 'Marks Obtained',
                EME_ExamOrder: 9800000,
                EMPG_DistplayName: grpDisplayName,
                groupName: grpDisplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                maxMarks: counttotal,
                examnamedisplay: 'Total',
                displayName: 'Total'
            };

            // AVG column
            const avgItem = {
                EME_Id: 9800001,
                examId: 9800001,
                EME_ExamName: 'AVG',
                EME_ExamOrder: 9800001,
                EMPG_DistplayName: grpDisplayName,
                groupName: grpDisplayName,
                EMPSGE_ForMaxMarkrs: counttotal,
                maxMarks: counttotal,
                examnamedisplay: 'AVG',
                displayName: 'AVG'
            };

            tempGroupExams.push(totalItem, avgItem);
            tempGroupWiseExamList.push(totalItem, avgItem);

            return {
                ...dd,
                empsG_MarksValue: counttotal,
                groupewiseexam: tempGroupExams
            };
        });

        groupWiseExamListMapped = tempGroupWiseExamList;
    } else {
        // Normalize keys of groupWiseExamList if already present
        groupWiseExamListMapped = rawGroupWiseExamList.map((exa: any) => ({
            ...exa,
            examId: exa.EME_Id ?? exa.emE_Id ?? exa.examId,
            displayName: exa.examnamedisplay ?? exa.displayName,
            maxMarks: exa.EMPSGE_ForMaxMarkrs ?? exa.maxMarks,
            groupName: exa.EMPG_DistplayName ?? exa.groupName ?? exa.EMPG_GroupName ?? ''
        }));

        groupDetailsMapped = groupDetailsMapped.map((grp: any) => {
            const grpDisplayName = grp.empG_DistplayName || grp.empG_DisplayName || grp.empsG_DisplayName;
            const grpExams = groupWiseExamListMapped.filter((exa: any) => matchGroupName(exa.groupName, grpDisplayName));
            return {
                ...grp,
                groupewiseexam: grpExams
            };
        });
    }

    // Flat Arrays from API response
    const rawStudentDetails = data.getstudentdetails || data.studentdetails || [];
    const studentWisesubjectList = data.getstudentwisesubjectlist || data.getstudentwisesubjects || [];
    const studentMarksdetails = data.getstudentmarksdetails || data.studentmarks || [];
    const examwiseremarks = data.examwiseremarks || data.getstudent_examwisemarks || [];
    const gradeDetails = data.getallgrade || [];
    const skillDetails = data.getstudentwiseskillslist || data.getskill || [];
    const examWiseTotalDetails = data.getstudentwiseexamwisetotaldetails || data.getexamwisetotaldetails || [];
    const promotionRemarks = data.getpromotionremarksdetails || [];

    // Map all lists onto student records for exact student-wise context
    const studentDetailsMapped = rawStudentDetails.map((stu: any) => {
        const studentId = Number(stu.amsT_Id ?? stu.AMST_Id);

        // Find subjects
        let subjects = stu.studentsubjects || [];
        if (subjects.length === 0 && studentWisesubjectList.length > 0) {
            subjects = studentWisesubjectList.filter((s: any) => Number(s.amsT_Id ?? s.AMST_Id) === studentId);
        }

        // Normalize subject properties
        subjects = subjects.map((subj: any) => ({
            ...subj,
            ismS_Id: subj.ismS_Id ?? subj.ISMS_Id,
            ismS_SubjectName: subj.ismS_SubjectName ?? subj.ISMS_SubjectName,
            empS_SubjOrder: subj.empS_SubjOrder ?? subj.EMPS_SubjOrder,
            estmppsG_GroupObtMarks: subj.estmppsG_GroupObtMarks !== undefined ? subj.estmppsG_GroupObtMarks : subj.ESTMPPSG_GroupObtMarks,
            estmppsG_GroupAVGMarks: subj.estmppsG_GroupAVGMarks !== undefined ? subj.estmppsG_GroupAVGMarks : subj.ESTMPPSG_GroupAVGMarks,
            estmppsG_GroupObtGrade: subj.estmppsG_GroupObtGrade !== undefined ? subj.estmppsG_GroupObtGrade : subj.ESTMPPSG_GroupObtGrade,
            esG_Id: subj.esG_Id !== undefined ? subj.esG_Id : subj.ESG_Id,
            groupAVGMarks: subj.groupAVGMarks !== undefined ? subj.groupAVGMarks : subj.ESTMPPSG_GroupAVGMarks,
            empS_AppToResultFlg:
                subj.empS_AppToResultFlg !== undefined
                    ? subj.empS_AppToResultFlg
                    : subj.EMPS_AppToResultFlg !== undefined
                      ? subj.EMPS_AppToResultFlg
                      : true
        }));

        // Sort subjects by order
        subjects.sort((a: any, b: any) => (a.empS_SubjOrder || 0) - (b.empS_SubjOrder || 0));

        // Find marks
        let marks = stu.studentmarks || stu.marks || [];
        if (marks.length === 0 && studentMarksdetails.length > 0) {
            marks = studentMarksdetails.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === studentId);
        }

        // Normalize marks properties
        marks = marks.map((m: any) => ({
            ...m,
            amsT_Id: Number(m.amsT_Id ?? m.AMST_Id),
            emE_Id: Number(m.emE_Id ?? m.EME_Id),
            emE_ExamName: m.emE_ExamName ?? m.EME_ExamName,
            ismS_SubjectName: m.ismS_SubjectName ?? m.ISMS_SubjectName,
            empsG_Id: Number(m.empsG_Id ?? m.EMPSG_Id),
            empsG_GroupName: m.empsG_GroupName ?? m.EMPSG_GroupName,
            empsG_DisplayName: m.empsG_DisplayName ?? m.EMPSG_DisplayName,
            obtainedMarks: m.obtainedMarks !== undefined ? m.obtainedMarks : m.ObtainedMarks,
            obtainedGrade: m.obtainedGrade !== undefined ? m.obtainedGrade : m.ObtainedGrade,
            passFailFlag: m.passFailFlag ?? m.PassFailFlag,
            esG_Id: m.esG_Id !== undefined ? m.esG_Id : m.ESG_Id,
            grouporder: m.grouporder !== undefined ? m.grouporder : m.Grouporder,
            ismS_Id: Number(m.ismS_Id ?? m.ISMS_Id)
        }));

        // Find exam-wise marks/totals
        let student_marks = stu.student_marks || [];
        if (student_marks.length === 0 && examwiseremarks.length > 0) {
            student_marks = examwiseremarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === studentId);
        }

        student_marks = student_marks.map((m: any) => ({
            ...m,
            emE_Id: Number(m.emE_Id ?? m.EME_Id),
            empsG_DisplayName: m.empsG_DisplayName ?? m.EMPSG_DisplayName,
            obtainedMarks: m.obtainedMarks !== undefined ? m.obtainedMarks : m.ObtainedMarks,
            totalPercentage: m.totalPercentage !== undefined ? m.totalPercentage : m.TotalPercentage,
            estmppS_SectionRank: m.estmppS_SectionRank !== undefined ? m.estmppS_SectionRank : m.ESTMPP_SectionRank
        }));

        return {
            ...stu,
            studentname: stu.studentname || stu.studentName,
            admno: stu.admno || stu.admNo || stu.amsT_AdmNo,
            amsT_Id: studentId,
            studentsubjects: subjects,
            studentmarks: marks,
            student_marks: student_marks
        };
    });

    // Config Flags
    const showLogo = params.printLogo;
    const showSuperAverage = params.superAverage;
    const examName = params.exmname;

    // Helper to get attendance percentage
    const getAttendance = (amsT_Id: number) => {
        const presentAttendance = data.stud_present_attendence || data.present_attendence || [];
        const present = presentAttendance.find((a: any) => Number(a.amsT_Id ?? a.AMST_Id) === amsT_Id);
        if (present) {
            const pct = present.attendancePercentage ?? present.ATTENDANCEPERCENTAGE ?? present.attendance_Percentage;
            if (pct !== undefined && pct !== null) {
                return Number(pct);
            }
        }
        return 0;
    };

    // Helper to check for parent subject prefix matching
    const isParentSubject = (subj: any, allSubjects: any[] = []) => {
        if (!subj) return false;
        const name = String(subj.ismS_SubjectName || '')
            .trim()
            .toUpperCase();

        const esG_Id = Number(subj.esG_Id || 0);
        const grouporder = Number(subj.grouporder || 0);
        if (esG_Id > 0 && grouporder > 0) {
            return true;
        }

        if (allSubjects && allSubjects.length > 0) {
            const hasChildrenWithSamePrefix = allSubjects.some((s) => {
                const sName = String(s.ismS_SubjectName || '')
                    .trim()
                    .toUpperCase();
                return s !== subj && sName.startsWith(name + ' ');
            });
            if (hasChildrenWithSamePrefix) return true;
        }

        const parentList = ['ENGLISH', 'SCIENCE', 'SOCIAL STUDIES', 'SOCIAL SCIENCE'];
        if (parentList.includes(name)) {
            return true;
        }

        return false;
    };

    // Helper to check for child subject prefix matching
    const isChildSubject = (subj: any, allSubjects: any[] = []) => {
        if (!subj) return false;
        const name = String(subj.ismS_SubjectName || '')
            .trim()
            .toUpperCase();

        if (allSubjects && allSubjects.length > 0) {
            const hasParentWithSamePrefix = allSubjects.some((s) => {
                const sName = String(s.ismS_SubjectName || '')
                    .trim()
                    .toUpperCase();
                return s !== subj && name.startsWith(sName + ' ');
            });
            if (hasParentWithSamePrefix) return true;
        }

        const childList = [
            'ENGLISH LANGUAGE',
            'ENGLISH LITERATURE',
            'HISTORY & CIVICS',
            'GEOGRAPHY',
            'PHYSICS',
            'CHEMISTRY',
            'BIOLOGY',
            'HISTORY',
            'CIVICS',
            'PRACTICAL',
            'PHYSICS PRACTICAL',
            'CHEMISTRY PRACTICAL',
            'BIOLOGY PRACTICAL'
        ];
        if (childList.includes(name)) {
            return true;
        }

        return false;
    };

    // Gather unique subjects combining marks list and standard list
    const getUniqueSubjects = (report: any) => {
        const uniqueSubjectsMap = new Map<string, any>();

        const rawSubjects = report.studentsubjects || [];
        rawSubjects.forEach((subj: any) => {
            const ismS_Id = subj.ismS_Id;
            const ismS_SubjectName = subj.ismS_SubjectName;
            if (!ismS_Id) return;

            const key = `${ismS_Id}_${ismS_SubjectName}`;
            if (!uniqueSubjectsMap.has(key)) {
                uniqueSubjectsMap.set(key, { ...subj });
            }
        });

        const marksArray = report.studentmarks || [];
        marksArray.forEach((mrk: any) => {
            const ismS_Id = mrk.ismS_Id;
            const ismS_SubjectName = mrk.ismS_SubjectName;
            if (!ismS_Id) return;

            const key = `${ismS_Id}_${ismS_SubjectName}`;
            if (!uniqueSubjectsMap.has(key)) {
                uniqueSubjectsMap.set(key, {
                    ismS_Id,
                    ismS_SubjectName,
                    empS_SubjOrder: mrk.empS_SubjOrder ?? 999,
                    empS_AppToResultFlg: mrk.empS_AppToResultFlg ?? true,
                    esG_Id: mrk.esG_Id ?? 0,
                    grouporder: mrk.grouporder ?? 0,
                    estmppsG_GroupObtMarks: mrk.estmppsG_GroupObtMarks ?? 0,
                    estmppsG_GroupAVGMarks: mrk.estmppsG_GroupAVGMarks ?? 0,
                    estmppsG_GroupObtGrade: mrk.estmppsG_GroupObtGrade ?? '',
                    groupAVGMarks: mrk.groupAVGMarks ?? 0
                });
            }
        });

        const subjectsList = Array.from(uniqueSubjectsMap.values());
        subjectsList.sort((a, b) => (a.empS_SubjOrder || 999) - (b.empS_SubjOrder || 999));
        return subjectsList;
    };

    // Helper to get mark for a cell
    const getMarkValue = (report: any, subj: any, examId: number, groupDisplayName: string, examNameDisplay: string) => {
        const subjectId = Number(subj?.ismS_Id ?? 0);
        const isScholastic = subj.empS_AppToResultFlg ?? true;

        const isAvgExam = examNameDisplay === 'AVG';
        const allSubjects = getUniqueSubjects(report);

        // 1. If parent subject and not AVG exam, must be empty cell!
        if (isScholastic && isParentSubject(subj, allSubjects) && !isAvgExam) {
            return '';
        }

        // 2. If child subject and AVG exam, must be empty cell!
        if (isScholastic && isChildSubject(subj, allSubjects) && isAvgExam) {
            return '';
        }

        let marksArray = report.studentmarks || [];
        if (!marksArray || marksArray.length === 0) {
            const amsT_Id = report.amsT_Id;
            const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? [];
            marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));
        }

        const mark = marksArray.find((m: any) => {
            const mSubId = m.ismS_Id;
            const mExamId = m.emE_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mSubId) === subjectId && Number(mExamId) === Number(examId) && matchGroupName(mGroupDispName, groupDisplayName);
        });

        if (mark) {
            const passFailFlag = mark.passFailFlag ?? mark.PassFailFlag;
            const obtainedMarks = mark.obtainedMarks !== undefined ? mark.obtainedMarks : mark.ObtainedMarks;
            const obtainedGrade = mark.obtainedGrade !== undefined ? mark.obtainedGrade : mark.ObtainedGrade;

            if (['AB', 'M', 'L'].includes(passFailFlag)) {
                if (!isScholastic && Number(obtainedMarks) > 0 && !isAvgExam) {
                    return `${passFailFlag} (${obtainedMarks})`;
                }
                return passFailFlag;
            }

            if (isScholastic) {
                const esG_Id = mark.esG_Id ?? mark.ESG_Id;
                const grouporder = mark.grouporder ?? mark.Grouporder;
                const isEsgZero = esG_Id === undefined || esG_Id === null || String(esG_Id) === '' || Number(esG_Id) === 0;
                const isGrouporderZero =
                    grouporder === undefined || grouporder === null || String(grouporder) === '' || Number(grouporder) === 0;

                if (!isAvgExam) {
                    if (isEsgZero && isGrouporderZero && obtainedMarks >= 0) {
                        return obtainedMarks;
                    }
                } else {
                    if (isEsgZero && obtainedMarks >= 0) {
                        return <b>{obtainedMarks}</b>;
                    }
                    if (!isEsgZero && Number(esG_Id) > 0) {
                        return <b>{obtainedMarks}</b>;
                    }
                }
            } else {
                if (isAvgExam) {
                    return <b>{obtainedGrade || obtainedMarks}</b>;
                } else {
                    return obtainedMarks;
                }
            }
        }

        return '';
    };

    // Total row helper
    const getTotalMarkValue = (report: any, examId: number, groupDisplayName: string, examNameDisplay?: string) => {
        const studentTotal = examWiseTotalDetails.find((t: any) => {
            const tAmstId = t.amsT_Id ?? t.AMST_Id;
            if (Number(tAmstId) !== Number(report.amsT_Id)) return false;

            const tGroupDispName = t.empsG_DisplayName ?? t.EMPSG_DisplayName ?? t.empsG_GroupName ?? t.EMPSG_GroupName;
            return tGroupDispName && matchGroupName(tGroupDispName, groupDisplayName);
        });

        if (studentTotal) {
            if (examNameDisplay === 'AVG') {
                const avg =
                    studentTotal.estmppsG_GroupAvgMarks ??
                    studentTotal.ESTMPPSG_GroupAvgMarks ??
                    studentTotal.estmppsG_GroupAVGMarks ??
                    studentTotal.ESTMPPSG_GroupAVGMarks ??
                    studentTotal.totaver ??
                    studentTotal.TOTAVER ??
                    studentTotal.totAver;
                if (avg !== undefined && avg !== null && avg !== '' && avg !== '-') {
                    return Number(avg).toFixed(0);
                }
            } else {
                const obt =
                    studentTotal.estmppsG_GroupObtMarks ??
                    studentTotal.ESTMPPSG_GroupObtMarks ??
                    studentTotal.obtainedMarks ??
                    studentTotal.ObtainedMarks;
                if (obt !== undefined && obt !== null && obt !== '' && obt !== '-') {
                    return Number(obt).toFixed(0);
                }
            }
        }

        const marksArray = report.student_marks || [];
        let mark = marksArray.find((m: any) => {
            const mExamId = m.emE_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mExamId) === Number(examId) && matchGroupName(mGroupDispName, groupDisplayName);
        });

        if (!mark) {
            mark = marksArray.find((m: any) => {
                const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
                if (!matchGroupName(mGroupDispName, groupDisplayName)) return false;
                const mExamName = String(m.emE_ExamName ?? m.EME_ExamName ?? '').toLowerCase();
                if (examNameDisplay === 'AVG') {
                    return mExamName.includes('avg') || mExamName.includes('average');
                } else {
                    return mExamName.includes('total');
                }
            });
        }

        if (mark) {
            const val = mark.obtainedMarks !== undefined ? mark.obtainedMarks : mark.ObtainedMarks;
            return val !== undefined && val !== null ? Number(val).toFixed(0) : '';
        }

        return '';
    };

    // Percentage row helper
    const getTotalPercentageValue = (report: any, examId: number, groupDisplayName: string, examNameDisplay?: string) => {
        const studentTotal = examWiseTotalDetails.find((t: any) => {
            const tAmstId = t.amsT_Id ?? t.AMST_Id;
            if (Number(tAmstId) !== Number(report.amsT_Id)) return false;

            const tGroupDispName = t.empsG_DisplayName ?? t.EMPSG_DisplayName ?? t.empsG_GroupName ?? t.EMPSG_GroupName;
            return tGroupDispName && matchGroupName(tGroupDispName, groupDisplayName);
        });

        if (studentTotal) {
            const pct = studentTotal.totalPercentage ?? studentTotal.TotalPercentage ?? studentTotal.percentage ?? studentTotal.Percentage;
            if (pct !== undefined && pct !== null && pct !== '' && pct !== '-') {
                return Number(pct).toFixed(0);
            }
        }

        const marksArray = report.student_marks || [];
        let mark = marksArray.find((m: any) => {
            const mExamId = m.emE_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mExamId) === Number(examId) && matchGroupName(mGroupDispName, groupDisplayName);
        });

        if (!mark) {
            mark = marksArray.find((m: any) => {
                const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
                if (!matchGroupName(mGroupDispName, groupDisplayName)) return false;
                const mExamName = String(m.emE_ExamName ?? m.EME_ExamName ?? '').toLowerCase();
                if (examNameDisplay === 'AVG') {
                    return mExamName.includes('avg') || mExamName.includes('average');
                } else {
                    return mExamName.includes('total');
                }
            });
        }

        if (mark) {
            const val = mark.totalPercentage ?? mark.TotalPercentage;
            return val !== undefined && val !== null ? Number(val).toFixed(0) : '';
        }

        return '';
    };

    // Rank row helper
    const getRankValue = (report: any, examId: number, groupDisplayName: string) => {
        const studentTotal = examWiseTotalDetails.find((t: any) => {
            const tAmstId = t.amsT_Id ?? t.AMST_Id;
            if (Number(tAmstId) !== Number(report.amsT_Id)) return false;

            const tGroupDispName = t.empsG_DisplayName ?? t.EMPSG_DisplayName ?? t.empsG_GroupName ?? t.EMPSG_GroupName;
            return tGroupDispName && matchGroupName(tGroupDispName, groupDisplayName);
        });

        if (studentTotal) {
            const rVal =
                studentTotal.estmppS_SectionRank ??
                studentTotal.ESTMPP_SectionRank ??
                studentTotal.sectionrank ??
                studentTotal.rank ??
                studentTotal.Rank;
            if (rVal !== undefined && rVal !== null && rVal !== '' && rVal !== '-') return rVal;
        }

        const marksArray = report.student_marks || [];
        let mark = marksArray.find((m: any) => {
            const mExamId = m.emE_Id;
            const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
            return Number(mExamId) === Number(examId) && matchGroupName(mGroupDispName, groupDisplayName);
        });

        if (!mark) {
            mark = marksArray.find((m: any) => {
                const mGroupDispName = m.empsG_DisplayName ?? m.EMPSG_DisplayName;
                if (!matchGroupName(mGroupDispName, groupDisplayName)) return false;
                const mExamName = String(m.emE_ExamName ?? m.EME_ExamName ?? '').toLowerCase();
                return mExamName.includes('total');
            });
        }

        if (mark) {
            return mark.estmppS_SectionRank ?? mark.ESTMPP_SectionRank ?? '';
        }

        return '';
    };

    // Obtained marks for performance graph
    const getSubjectGraphObtained = (report: any, subj: any) => {
        const direct = subj.estmppsG_GroupObtMarks ?? subj.ESTMPPSG_GroupObtMarks;
        if (direct !== undefined && direct !== null && Number(direct) > 0) {
            return Number(direct);
        }

        const amsT_Id = report.amsT_Id;
        const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? [];
        const marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));

        const subjMarks = marksArray.filter((m: any) => Number(m.ismS_Id ?? m.ISMS_Id) === Number(subj.ismS_Id));

        const examMarks = subjMarks.filter((m: any) => {
            const mExamName = m.emE_ExamName ?? m.EME_ExamName ?? '';
            return !mExamName.toLowerCase().includes('total') && !mExamName.toLowerCase().includes('avg');
        });

        if (examMarks.length > 0) {
            return examMarks.reduce((acc: number, curr: any) => acc + Number(curr.obtainedMarks ?? curr.ObtainedMarks ?? 0), 0);
        }
        return 0;
    };

    // Average marks for performance graph
    const getSubjectGraphAverage = (report: any, subj: any) => {
        const direct = subj.groupAVGMarks ?? subj.ESTMPPSG_GroupAVGMarks ?? subj.estmppsG_GroupAvgMarks ?? subj.ESTMPPSG_GroupAvgMarks;
        if (direct !== undefined && direct !== null && Number(direct) > 0) {
            return Number(direct);
        }

        const amsT_Id = report.amsT_Id;
        const rawMarks = data.getstudentmarksdetails ?? data.studentmarks ?? [];
        const marksArray = rawMarks.filter((m: any) => Number(m.amsT_Id ?? m.AMST_Id) === Number(amsT_Id));

        const subjMarks = marksArray.filter((m: any) => Number(m.ismS_Id ?? m.ISMS_Id) === Number(subj.ismS_Id));

        const examMarks = subjMarks.filter((m: any) => {
            const mExamName = m.emE_ExamName ?? m.EME_ExamName ?? '';
            return !mExamName.toLowerCase().includes('total') && !mExamName.toLowerCase().includes('avg');
        });

        if (examMarks.length > 0) {
            const sum = examMarks.reduce((acc: number, curr: any) => acc + Number(curr.obtainedMarks ?? curr.ObtainedMarks ?? 0), 0);
            return Number((sum / examMarks.length).toFixed(1));
        }
        return 0;
    };

    // Helpers to robustly match skills and exams in grades list
    const getSkillName = (skill: any) => {
        return skill?.ECACT_SkillName ?? skill?.ecacT_SkillName ?? skill?.skillName ?? skill?.ecactA_SkillArea ?? '';
    };

    const matchSkillName = (s1: string, s2: string) => {
        return (
            String(s1 || '')
                .trim()
                .toLowerCase() ===
            String(s2 || '')
                .trim()
                .toLowerCase()
        );
    };

    const matchExamType = (examName: string, type: 'hy' | 'final') => {
        const name = String(examName || '').toUpperCase();
        if (type === 'hy') {
            return (
                name.includes('HALF') ||
                name.includes('UNIT') ||
                name.includes('FIRST') ||
                name.includes('HY') ||
                name.includes('TERM 1') ||
                name.includes('TERM1')
            );
        } else {
            return (
                name.includes('FINAL') ||
                name.includes('SECOND') ||
                name.includes('ANNUAL') ||
                name.includes('TERM 2') ||
                name.includes('TERM2')
            );
        }
    };

    // Personality Profile Questions
    const personalityQuestions = [
        'IS SELF-MOTIVATED AND COMPLETES TASK',
        'WORKS WELL WITH MINIMUM DIRECTION',
        'ORIGINATES IDEAS BUT NEEDS CONSTANT GUIDANCE',
        'CONTRIBUTES READILY',
        'SOMETIMES TAKES PART',
        'EASILY DISTRACTED',
        'VERY CAREFUL WORKER',
        'USUALLY NEAT',
        'ACCEPTS RESPONSIBILITY FOR LEARNING'
    ];

    // Dynamic logo & watermark sources from institution
    const logoSrc =
        institution?.mI_Logo ||
        institution?.MI_Logo ||
        institution?.mI_Logo_Path ||
        institution?.mI_LogoPath ||
        'https://dcampusstrg.blob.core.windows.net/files/17/Trnsportdocuments/7115f492-3955-47e6-97d9-187413d0f3a5.jpg';

    const headerLogo =
        institution?.mI_Logo ||
        institution?.MI_Logo ||
        institution?.mI_Logo_Path ||
        institution?.mI_LogoPath ||
        'https://sthomashowrah.blob.core.windows.net/files/Logo Header stt.jpg';

    const watermarkBg =
        institution?.mI_BackgroundImage ||
        institution?.MI_BackgroundImage ||
        institution?.mI_Logo ||
        institution?.MI_Logo ||
        'https://sthomashowrah.blob.core.windows.net/files/4/stthomos.jpeg';

    // Watermark styling for the report card page
    const watermarkStyle = {
        backgroundColor: 'transparent'
    };

    return (
        <div className='printable-content space-y-6'>
            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex w-fit items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print Report
                </Button>
            </div>

            <div ref={printRef} className='print-area'>
                {studentDetailsMapped.length > 0 ? (
                    studentDetailsMapped.map((report: any, index: number) => {
                        const allSubjects = getUniqueSubjects(report);
                        const scholasticSubjects = allSubjects.filter((s: any) => {
                            const flg = s.empS_AppToResultFlg ?? s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.AppToResultFlg;
                            return flg === true || flg === 1 || String(flg).toLowerCase() === 'true';
                        });

                        const coScholasticSubjects = allSubjects.filter((s: any) => {
                            const flg = s.empS_AppToResultFlg ?? s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.AppToResultFlg;
                            return flg === false || flg === 0 || String(flg).toLowerCase() === 'false';
                        });

                        // Filter remarks for this student
                        const remarks = promotionRemarks.filter((r: any) => Number(r.amsT_Id ?? r.AMST_Id) === report.amsT_Id);

                        // Graph data processing (Scholastic subjects with obtained marks > 0)
                        const chartSubjects = scholasticSubjects.filter((s: any) => {
                            const obt = getSubjectGraphObtained(report, s);
                            return obt !== undefined && obt !== null && Number(obt) > 0;
                        });

                        const chartLabels = chartSubjects.map((s: any) => s.ismS_SubjectName);
                        const obtainedData = chartSubjects.map((s: any) => getSubjectGraphObtained(report, s));
                        const averageData = chartSubjects.map((s: any) => getSubjectGraphAverage(report, s));

                        // Class display name combining Class, Section, and branch group
                        const classDisplay = `${report.classname || params.ASMCL_Id_Name || ''}-${report.sectionname || params.ASMS_Id_Name || ''}${params.brngroup || ''}`;

                        return (
                            <div
                                key={index}
                                className='page-break-before-always mb-8 border border-gray-300 bg-white p-4 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                                {/* Header section */}
                                {showLogo ? (
                                    <div className='mb-4 flex flex-row items-center justify-between'>
                                        <div className='w-24'>
                                            <img
                                                src={logoSrc}
                                                className='h-auto w-20 object-contain'
                                                alt={institution?.mI_Name || 'School Logo'}
                                            />
                                        </div>
                                        <div className='flex-1 text-center'>
                                            <img
                                                src={headerLogo}
                                                className='mx-auto h-[60px] w-auto object-contain'
                                                alt={institution?.mI_Name || 'Header Logo'}
                                            />
                                            <div className='mt-1 text-[9px] leading-[1.2]'>
                                                <p className='text-center font-bold uppercase'>{institution?.mI_Name || '(Diocese of Calcutta, CNI)'}</p>
                                                <p className='text-center'>
                                                    {institution?.mI_Address1
                                                        ? [
                                                              institution.mI_Address1,
                                                              institution.mI_Address2,
                                                              institution.mI_Address3,
                                                              institution.mI_Pincode ? `Pin - ${institution.mI_Pincode}` : ''
                                                          ]
                                                              .filter(Boolean)
                                                              .join(', ')
                                                        : 'A Christian Minority Co-Educational English Medium School under Article 30 of the Indian Constitution'}
                                                </p>
                                                <p className='text-center'>
                                                    {institution?.mI_Address1
                                                        ? [institution.ivrmmcT_Name, institution.mI_AddressArea].filter(Boolean).join(', ') || ''
                                                        : '3, Church Road, Howrah-711101 West Bengal, India'}
                                                </p>
                                                <p className='text-center'>
                                                    {institution?.mI_PhoneNo || institution?.mI_EmailId
                                                        ? `Phone No: ${institution.mI_PhoneNo || '+91 33 2641 2138'}, Email ID: ${institution.mI_EmailId || 'stesh1860@gmail.com'}`
                                                        : 'Phone No: +91 33 2641 2138, +91 33 2641 3590 Email ID: stesh1860@gmail.com'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='w-24'>&nbsp;</div>
                                    </div>
                                ) : (
                                    <div className='h-[130px]'>&nbsp;</div>
                                )}

                                {/* Main Report Layout */}
                                <div className='watermarked-container relative p-2' style={watermarkStyle}>
                                    {/* Semi-transparent Watermark Overlay */}
                                    {watermarkBg && (
                                        <div
                                            className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden'
                                            aria-hidden='true'>
                                            <img
                                                src={watermarkBg}
                                                alt=''
                                                className='watermark-img h-[420px] w-[420px] max-h-[85%] max-w-[85%] object-contain select-none opacity-[0.10]'
                                                style={{ opacity: 0.10 }}
                                            />
                                        </div>
                                    )}

                                    <div className='relative z-10'>
                                        {/* Report Title */}
                                    <div className='mb-2 text-center font-bold text-md uppercase'>
                                        {examName} REPORT CARD {params.ASMAY_Year || ''}
                                    </div>

                                    {/* Student Header details */}
                                    <table className='st-thomas-table mb-2 w-full border-collapse bg-transparent text-[12px]'>
                                        <tbody>
                                            <tr>
                                                <td className='w-1/4 p-1.5 align-top'>
                                                    <div className='flex gap-1'>
                                                        <span className='font-bold'>NAME:</span>
                                                        <span className='font-bold uppercase'>{report.studentname}</span>
                                                    </div>
                                                    <div className='flex gap-1'>
                                                        <span className='font-bold'>CLASS:</span>
                                                        <span className='font-bold'>{classDisplay}</span>
                                                    </div>
                                                </td>
                                                <td className='w-1/4 p-1.5 text-center align-middle'>
                                                    <b>
                                                        NO. IN CLASS: <span>{studentDetailsMapped.length}</span>
                                                    </b>
                                                </td>
                                                <td className='w-1/4 p-1.5 text-center align-middle'>
                                                    <b>
                                                        ATTENDANCE: <span>{getAttendance(report.amsT_Id).toFixed(0)}%</span>
                                                    </b>
                                                </td>
                                                <td className='w-1/4 p-1.5 pr-4 text-right align-middle'>
                                                    <b>STUDENT&apos;S ID: {report.admno}</b>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th colSpan={4} className='p-1 text-center font-bold text-[13px] uppercase'>
                                                    STATEMENT OF MARKS
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Marks Table */}
                                    <table className='st-thomas-table w-full border-collapse bg-transparent text-[11px]'>
                                        <thead>
                                            <tr>
                                                <th className='w-[200px] p-1 text-left text-[12px]'>SUBJECTS</th>
                                                {groupDetailsMapped.map((grp: any, i: number) => (
                                                    <th
                                                        key={i}
                                                        colSpan={grp.groupewiseexam?.length || 0}
                                                        className='p-1 text-center text-[12px] uppercase'>
                                                        {grp.empG_DistplayName || grp.empG_DisplayName || grp.empsG_DisplayName}
                                                    </th>
                                                ))}
                                                <th colSpan={2} className='p-1 text-center text-[12px] uppercase'>
                                                    SUPER AVERAGE
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className='p-0.5' />
                                                {groupWiseExamListMapped.map((exa: any, i: number) => (
                                                    <th key={i} className='w-[60px] p-0.5 text-center font-normal text-[11px]'>
                                                        {exa.displayName !== 'Total' && exa.displayName !== 'AVG' && (
                                                            <span>{exa.maxMarks}</span>
                                                        )}
                                                        {exa.displayName === 'Total' && <span>{exa.maxMarks}/50</span>}
                                                        {exa.displayName === 'AVG' && <span>{exa.displayName}</span>}
                                                    </th>
                                                ))}
                                                <th className='w-[60px] p-0.5 text-center text-[11px]'>100/50</th>
                                                <th className='w-[60px] p-0.5 text-center font-bold text-[11px]'>AVG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* 1. Scholastic Subjects */}
                                            {scholasticSubjects.map((subj: any, i: number) => {
                                                const hasAvgValue = subj.groupAVGMarks > 0 || subj.estmppsG_GroupAVGMarks > 0;
                                                return (
                                                    <tr key={`scholastic-${i}`}>
                                                        <td className='p-1 pl-2 text-left'>
                                                            {isParentSubject(subj, allSubjects) ? (
                                                                <span className='font-semibold'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ismS_SubjectName}
                                                                </span>
                                                            ) : isChildSubject(subj, allSubjects) ? (
                                                                <span className='font-normal text-gray-700'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                    {subj.ismS_SubjectName}
                                                                </span>
                                                            ) : (
                                                                <span className='font-normal'>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subj.ismS_SubjectName}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {groupWiseExamListMapped.map((exa: any, j: number) => {
                                                            const val = getMarkValue(
                                                                report,
                                                                subj,
                                                                exa.examId,
                                                                exa.groupName,
                                                                exa.displayName
                                                            );
                                                            return (
                                                                <td key={j} className='p-1 text-center'>
                                                                    {val}
                                                                </td>
                                                            );
                                                        })}
                                                        {/* Super Average Columns */}
                                                        <td className='p-1 text-center'>
                                                            {subj.ismS_Id < 1000 && showSuperAverage && (
                                                                <span>{subj.estmppsG_GroupObtMarks}</span>
                                                            )}
                                                        </td>
                                                        <td className='p-1 text-center font-semibold'>
                                                            {(subj.esG_Id === 0 || subj.ismS_Id > 1000) && showSuperAverage && (
                                                                <span>{subj.groupAVGMarks ?? subj.estmppsG_GroupAVGMarks}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Total Row */}
                                            <tr className='bg-gray-50/50 font-semibold'>
                                                <td className='p-1 pl-2 text-left'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TOTAL</td>
                                                {groupWiseExamListMapped.map((exa: any, i: number) => (
                                                    <td key={i} className='p-1 text-center'>
                                                        {getTotalMarkValue(report, exa.examId, exa.groupName, exa.displayName)}
                                                    </td>
                                                ))}
                                                {/* Super Average Totals */}
                                                <td className='p-1 text-center font-bold'>
                                                    {showSuperAverage && (
                                                        <span>
                                                            {(() => {
                                                                const studentTotal = examWiseTotalDetails.find(
                                                                    (t: any) => Number(t.amsT_Id ?? t.AMST_Id) === report.amsT_Id
                                                                );
                                                                return (
                                                                    studentTotal?.estmppsG_GroupObtMarks ??
                                                                    studentTotal?.ESTMPPSG_GroupObtMarks ??
                                                                    ''
                                                                );
                                                            })()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='p-1 text-center font-bold'>
                                                    {showSuperAverage && (
                                                        <span>
                                                            {(() => {
                                                                const studentTotal = examWiseTotalDetails.find(
                                                                    (t: any) => Number(t.amsT_Id ?? t.AMST_Id) === report.amsT_Id
                                                                );
                                                                return (
                                                                    studentTotal?.estmppsG_GroupAvgMarks ??
                                                                    studentTotal?.ESTMPPSG_GroupAvgMarks ??
                                                                    studentTotal?.estmppsG_GroupAVGMarks ??
                                                                    studentTotal?.ESTMPPSG_GroupAVGMarks ??
                                                                    ''
                                                                );
                                                            })()}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Percentage Row */}
                                            <tr className='bg-gray-50/50 font-semibold'>
                                                <td className='p-1 pl-2 text-left'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PERCENTAGE</td>
                                                {groupWiseExamListMapped.map((exa: any, i: number) => (
                                                    <td key={i} className='p-1 text-center'>
                                                        {getTotalPercentageValue(report, exa.examId, exa.groupName, exa.displayName)}
                                                    </td>
                                                ))}
                                                {/* Super Average Percentage */}
                                                <td className='p-1 text-center font-bold'>
                                                    {showSuperAverage && (
                                                        <span>
                                                            {(() => {
                                                                const studentTotal = examWiseTotalDetails.find(
                                                                    (t: any) => Number(t.amsT_Id ?? t.AMST_Id) === report.amsT_Id
                                                                );
                                                                return studentTotal?.totalPercentage ?? studentTotal?.TotalPercentage ?? '';
                                                            })()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='p-1 text-center font-bold'>
                                                    {showSuperAverage && (
                                                        <span>
                                                            {(() => {
                                                                const studentTotal = examWiseTotalDetails.find(
                                                                    (t: any) => Number(t.amsT_Id ?? t.AMST_Id) === report.amsT_Id
                                                                );
                                                                return studentTotal?.totaver ?? studentTotal?.Totaver ?? '';
                                                            })()}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>

                                            {/* Rank Row */}
                                            <tr className='bg-gray-50/50 font-semibold'>
                                                <td className='p-1 pl-2 text-left'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RANK</td>
                                                {groupWiseExamListMapped.map((exa: any, i: number) => (
                                                    <td key={i} className='p-1 text-center'>
                                                        {getRankValue(report, exa.examId, exa.groupName)}
                                                    </td>
                                                ))}
                                                <td colSpan={2} className='p-1 text-center' />
                                            </tr>

                                            {/* 2. Co-Scholastic Subjects (appended in same table below Rank row) */}
                                            {coScholasticSubjects.map((subj: any, i: number) => (
                                                <tr key={`coscholastic-${i}`}>
                                                    <td className='p-1 pl-2 text-left font-normal'>{subj.ismS_SubjectName}</td>
                                                    {groupWiseExamListMapped.map((exa: any, j: number) => {
                                                        const val = getMarkValue(report, subj, exa.examId, exa.groupName, exa.displayName);
                                                        return (
                                                            <td key={j} className='p-1 text-center'>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                    {/* Super Average Columns */}
                                                    <td className='p-1 text-center font-semibold'>
                                                        {showSuperAverage && <span>{subj.estmppsG_GroupObtMarks}</span>}
                                                    </td>
                                                    <td className='p-1 text-center font-semibold'>
                                                        {showSuperAverage && <span>{subj.estmppsG_GroupObtGrade}</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Bottom Layout - Co-Scholastic left / Chart right */}
                                    <div className='flex w-full border-[#727272] border-[0.5px] border-t-0'>
                                        {/* Left Column: Graded subjects & Personality profile */}
                                        <div className='w-[50%] border-[#727272] border-r'>
                                            {/* Graded Subjects (Skills) */}
                                            <table className='st-thomas-table w-full border-collapse bg-transparent text-[11px]'>
                                                <thead>
                                                    <tr>
                                                        <th className='w-[180px] border-t-0 border-l-0 p-1 text-left text-[12px]'>
                                                            GRADED SUBJECTS
                                                        </th>
                                                        <th className='w-[70px] border-t-0 p-1 text-center text-[11px]'>HALF YEARLY</th>
                                                        <th className='w-[70px] border-t-0 border-r-0 p-1 text-center text-[11px]'>
                                                            FINAL
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {skillDetails.map((skill: any, sIdx: number) => {
                                                        const sName = getSkillName(skill);
                                                        // Filter gradeDetails matching current student and skill
                                                        const hyGrades = gradeDetails.filter((g: any) => {
                                                            const gAmstId = g.amsT_Id ?? g.AMST_Id;
                                                            const gSkill = getSkillName(g);
                                                            const gExam = g.emE_ExamName ?? g.eme_ExamName ?? '';
                                                            return (
                                                                Number(gAmstId) === report.amsT_Id &&
                                                                matchSkillName(gSkill, sName) &&
                                                                matchExamType(gExam, 'hy')
                                                            );
                                                        });

                                                        const finalGrades = gradeDetails.filter((g: any) => {
                                                            const gAmstId = g.amsT_Id ?? g.AMST_Id;
                                                            const gSkill = getSkillName(g);
                                                            const gExam = g.emE_ExamName ?? g.eme_ExamName ?? '';
                                                            return (
                                                                Number(gAmstId) === report.amsT_Id &&
                                                                matchSkillName(gSkill, sName) &&
                                                                matchExamType(gExam, 'final')
                                                            );
                                                        });

                                                        const hyGradeStr = hyGrades
                                                            .map((g: any) => g.emgD_Name ?? g.EMGD_Name ?? '')
                                                            .join(', ');
                                                        const finalGradeStr = finalGrades
                                                            .map((g: any) => g.emgD_Name ?? g.EMGD_Name ?? '')
                                                            .join(', ');

                                                        return (
                                                            <tr key={sIdx}>
                                                                <td className='border-l-0 p-1 pl-4 text-left font-normal'>
                                                                    &nbsp;&nbsp;&nbsp;{sName}
                                                                </td>
                                                                <td className='p-1 text-center text-[11px]'>{hyGradeStr}</td>
                                                                <td className='border-r-0 p-1 text-center text-[11px]'>{finalGradeStr}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>

                                            {/* Personality Profile */}
                                            <table className='st-thomas-table w-full border-collapse bg-transparent text-[11px]'>
                                                <thead>
                                                    <tr>
                                                        <th className='w-[180px] border-l-0 p-1 text-left font-medium text-[10px]'>
                                                            &nbsp;&nbsp;&nbsp;PERSONALITY PROFILE
                                                        </th>
                                                        {groupDetailsMapped.map((grp: any, gIdx: number) => (
                                                            <th
                                                                key={gIdx}
                                                                className={`w-[70px] p-1 text-center text-[10px] uppercase ${gIdx === groupDetailsMapped.length - 1 ? 'border-r-0' : ''}`}>
                                                                {matchGroupName(
                                                                    grp.empG_DistplayName ||
                                                                        grp.empG_DisplayName ||
                                                                        grp.empsG_DisplayName ||
                                                                        '',
                                                                    'HALF YEARLY EXAMINATION'
                                                                )
                                                                    ? 'HALF YEARLY'
                                                                    : 'FINAL'}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {personalityQuestions.map((q, idx) => (
                                                        <tr key={idx}>
                                                            <td className='border-l-0 p-0.5 pl-2 text-left text-[11px]'>
                                                                &middot; &nbsp;{q}
                                                            </td>
                                                            {groupDetailsMapped.map((_grp: any, gIdx: number) => (
                                                                <td
                                                                    key={gIdx}
                                                                    className={`p-0.5 text-center ${gIdx === groupDetailsMapped.length - 1 ? 'border-r-0' : ''}`}>
                                                                    <input
                                                                        type='checkbox'
                                                                        className='pointer-events-none h-3 w-3'
                                                                        readOnly
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Right Column: Chart */}
                                        <div className='flex w-[50%] flex-col items-center justify-start p-2'>
                                            <div className='mb-2 w-full border-[#727272] border-b pb-1 text-center font-bold text-[12px]'>
                                                PERFORMANCE ANALYSIS(TOTAL)
                                            </div>
                                            {chartLabels.length > 0 ? (
                                                <div className='relative h-[240px] w-full max-w-[340px]'>
                                                    <Bar
                                                        data={{
                                                            labels: chartLabels,
                                                            datasets: [
                                                                {
                                                                    label: 'Marks Obtained',
                                                                    data: obtainedData,
                                                                    backgroundColor: 'rgb(63, 81, 181)',
                                                                    borderWidth: 1
                                                                },
                                                                {
                                                                    label: 'Average Marks',
                                                                    data: averageData,
                                                                    backgroundColor: 'rgb(255, 87, 34)',
                                                                    borderWidth: 1
                                                                }
                                                            ]
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    position: 'top',
                                                                    labels: {
                                                                        boxWidth: 10,
                                                                        font: { size: 9 }
                                                                    }
                                                                }
                                                            },
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    ticks: { font: { size: 8 } }
                                                                },
                                                                x: {
                                                                    ticks: { font: { size: 7 } }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className='flex h-[200px] items-center justify-center text-gray-400 text-xs'>
                                                    No chart data available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remarks Table */}
                                    <table className='st-thomas-table w-full border-collapse bg-transparent text-[11px]'>
                                        <tbody>
                                            <tr className='h-[60px]'>
                                                <td className='w-[100px] p-2 align-top font-bold'>REMARKS:</td>
                                                <td className='p-2 align-top'>
                                                    {remarks.map((r: any, idx: number) => (
                                                        <span key={idx} className='block font-bold text-gray-800'>
                                                            {r.remarks}
                                                        </span>
                                                    ))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Signatures Table */}
                                    <table className='st-thomas-table w-full border-collapse bg-transparent text-[10px]'>
                                        <thead>
                                            <tr>
                                                <th className='h-[60px] w-1/4 p-1 text-center align-bottom font-bold'>DATE</th>
                                                <th className='h-[60px] w-1/4 p-1 text-center align-bottom font-bold'>
                                                    PRINCIPAL&apos;S SIGNATURE
                                                </th>
                                                <th className='h-[60px] w-1/4 p-1 text-center align-bottom font-bold'>
                                                    CLASS TEACHER&apos;S SIGNATURE
                                                </th>
                                                <th className='h-[60px] w-1/4 p-1 text-center align-bottom font-bold'>
                                                    PARENT&apos;S SIGNATURE
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className='rounded-md border bg-white p-10 text-center text-gray-500 shadow-sm'>
                        No student details found to display report.
                    </div>
                )}
            </div>

            <style jsx global>{`
                .st-thomas-table, .st-thomas-table th, .st-thomas-table td {
                    border: 0.5px solid #727272 !important;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-area {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break-before-always {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    .watermarked-container {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .watermark-img {
                        opacity: 0.10 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

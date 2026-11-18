'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches and transforms the Calcutta Promotion Report I-IX data
 */
export async function getCalcuttaPromotionReportI_IX(data: any) {
    const url = '/JSHSExamReports_/cbs_PromotionReportI_IV';
    const res = await api.post<any>('exam', url, data);
    const response = res?.data || res || {};

    const {
        getinstitution = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentmarksdetails = [],
        getstudent_examwisemarks = [],
        getstudentwiseskillslist = [],
        gettermdetails = [],
        getpromotionremarksdetails = [],
        getstudentwiseattendancedetails = [],
        getgradelist = [],
        getexamwisetotaldetails = [],
        exam_promotion_groupwise_remarks = [],
        examwiseremarks = []
    } = response;

    // 1. Group wise exam list construction
    const groupwiseexamlist = [];

    // Normalize group details to handle casing inconsistencies
    const normalizedGroupDetails = (getgroupdetails || []).map((dd: any) => {
        const displayName = dd.empG_DistplayName ?? dd.empg_DistplayName ?? dd.empG_DisplayName ?? dd.empg_DisplayName ?? '';
        const groupName = dd.empG_GroupName ?? dd.empg_GroupName ?? '';
        return {
            ...dd,
            empG_DistplayName: displayName,
            empg_DistplayName: displayName,
            empG_GroupName: groupName,
            empg_GroupName: groupName
        };
    });

    // Normalize group exam details to handle casing inconsistencies
    const normalizedGroupExamDetails = (getgroupexamdetails || []).map((d: any) => {
        const displayName = d.empG_DistplayName ?? d.empg_DistplayName ?? d.empG_DisplayName ?? d.empg_DisplayName ?? '';
        const groupName = d.empG_GroupName ?? d.empg_GroupName ?? '';
        const examId = d.emE_Id ?? d.eme_Id ?? 0;
        const examName = d.emE_ExamName ?? d.eme_ExamName ?? '';
        const examOrder = d.emE_ExamOrder ?? d.eme_ExamOrder ?? 0;
        const maxMarks = d.empsgE_ForMaxMarkrs ?? d.empsge_ForMaxMarkrs ?? 0;
        const examCode = d.emE_ExamCode ?? d.eme_ExamCode ?? '';
        return {
            ...d,
            empG_DistplayName: displayName,
            empg_DistplayName: displayName,
            empG_GroupName: groupName,
            empg_GroupName: groupName,
            emE_Id: examId,
            eme_Id: examId,
            emE_ExamName: examName,
            eme_ExamName: examName,
            emE_ExamOrder: examOrder,
            eme_ExamOrder: examOrder,
            empsgE_ForMaxMarkrs: maxMarks,
            empsge_ForMaxMarkrs: maxMarks,
            emE_ExamCode: examCode,
            eme_ExamCode: examCode
        };
    });
    for (const dd of normalizedGroupDetails) {
        let counttotal = 0;
        const groupewiseexamTemp = [];

        for (const d of normalizedGroupExamDetails) {
            const ddName = (dd.empG_DistplayName ?? '').trim().toUpperCase();
            const dName = (d.empG_DistplayName ?? '').trim().toUpperCase();
            if (ddName === dName) {
                if (Number(d.emE_Id) === 9800000 || Number(d.emE_Id) === 98000012) {
                    continue;
                }
                counttotal += d.empsgE_ForMaxMarkrs || 0;

                const examMap = {
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName
                };
                groupewiseexamTemp.push(examMap);
                groupwiseexamlist.push(examMap);
            }
        }

        // Add Marks Obtained & Highest in Class (similar to I-IV logic but only adding what's needed)
        // I-IX might need different columns, but we mirror I-IV for consistency in the response
        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: ''
        });

        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: 'Highest in Class',
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: 'Highest in Class',
            columname: ''
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: 'Marks'
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: 'Highest in Class',
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: 'Highest in Class'
        });

        dd.empsG_MarksValue = counttotal;
        dd.groupewiseexam = groupewiseexamTemp;
    }

    // 2. Map all related data to student details
    const studentListDetails = getstudentdetails.map((stu: any) => {
        const stuId = stu.amsT_Id || stu.AMST_Id;

        // Subjects
        const studentSubjects = getstudentwisesubjectlist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

        // Marks
        const studentMarks = getstudentmarksdetails.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Exam wise total marks
        const studentExamMarks = getstudent_examwisemarks.filter((m: any) => {
            const mId = m.AMST_Id || m.amsT_Id;
            return mId && stuId && Number(mId) === Number(stuId);
        });

        // Remarks
        const promotionRemarksObj = (getpromotionremarksdetails || []).find((d: any) => {
            const dId = d.amsT_Id ?? d.AMST_Id ?? d.amst_id ?? d.AMST_ID ?? 0;
            return dId && stuId && Number(dId) === Number(stuId);
        });
        const remarks =
            promotionRemarksObj?.eprD_Remarks ??
            promotionRemarksObj?.eprd_Remarks ??
            promotionRemarksObj?.eprd_remarks ??
            promotionRemarksObj?.EPRD_Remarks ??
            promotionRemarksObj?.remarks ??
            promotionRemarksObj?.Remarks ??
            '';
        const promotedclass =
            promotionRemarksObj?.eprD_ClassPromoted ??
            promotionRemarksObj?.eprd_ClassPromoted ??
            promotionRemarksObj?.eprd_classpromoted ??
            '';
        const conduct = promotionRemarksObj?.eprD_PromotionName ?? promotionRemarksObj?.eprd_PromotionName ?? '';

        // Attendance (I-IX logic mapsTOTALAttendancePercentage)
        const attendance = getstudentwiseattendancedetails
            .filter((d: any) => {
                const dId = d.AMST_Id || d.amsT_Id;
                const stuId = stu.amsT_Id || stu.AMST_Id;
                return dId && stuId && Number(dId) === Number(stuId);
            })
            .map((d: any) => {
                const termName =
                    d.EMPSG_DisplayName ??
                    d.empsG_DisplayName ??
                    d.empsg_DisplayName ??
                    d.EMPSG_GroupName ??
                    d.empg_GroupName ??
                    d.empsg_GroupName ??
                    '';
                const percentageVal =
                    d.TOTALAttendancePercentage ??
                    d.totalAttendancePercentage ??
                    d.TotalAttendancePercentage ??
                    d.attendancepercentage ??
                    d.attendancePercentage ??
                    d.ATTENDANCEPERCENTAGE ??
                    d.Percentage ??
                    d.percentage ??
                    null;
                return {
                    classheld: d.TOTALWORKINGDAYS ?? d.totalworkingdays ?? d.TotalWorkingDays ?? 0,
                    emE_Id: d.EME_Id ?? d.emE_Id ?? d.eme_Id ?? 0,
                    classatt: d.PRESENTDAYS ?? d.presentdays ?? d.PresentDays ?? 0,
                    percentage: percentageVal !== null && percentageVal !== undefined ? Number(percentageVal) : null,
                    term: termName
                };
            });

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => {
            const tId = t.AMST_Id || t.amsT_Id;
            const stuId = stu.amsT_Id || stu.AMST_Id;
            return tId && stuId && Number(tId) === Number(stuId);
        });

        // Skills for the specific student
        const studentSkills = getstudentwiseskillslist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

        // Suggestions (optional)
        const suggestions = (examwiseremarks || [])
            .filter((s: any) => {
                const sId = s.AMST_Id || s.amsT_Id;
                return sId && stuId && Number(sId) === Number(stuId);
            })
            .map((s: any) => s.ecterE_Remarks || s.eprD_Remarks || s.eprd_Remarks || s.eprd_remarks || '');

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        const studentChartSubjects = studentSubjects.filter(
            (s: any) =>
                s.EYCES_MarksDisplayFlg === true ||
                s.EYCES_MarksDisplayFlg === 'true' ||
                s.eyceS_MarksDisplayFlg === true ||
                s.eyceS_MarksDisplayFlg === 'true'
        );

        for (const subj of studentChartSubjects) {
            const subjectName = subj.ISMS_SubjectName || subj.ismS_SubjectName;
            const subjId = subj.ISMS_Id || subj.ismS_Id;

            const examTotal = examwisetotal.find(
                (t: any) =>
                    (t.ISMS_Id && subjId && Number(t.ISMS_Id) === Number(subjId)) ||
                    (t.ismS_Id && subjId && Number(t.ismS_Id) === Number(subjId)) ||
                    t.ISMS_SubjectName === subjectName ||
                    t.ismS_SubjectName === subjectName
            );

            chartData.push({
                subject: subjectName,
                highest: Number(examTotal?.ESTMPPS_ClassHighest || examTotal?.estmppS_ClassHighest || 0),
                average: Number(examTotal?.ESTMPPS_SectionAverage || examTotal?.estmppS_SectionAverage || 0),
                obtained: Number(examTotal?.ObtainedMarks || examTotal?.obtainedMarks || 0)
            });
        }

        return {
            ...stu,
            asmcL_ClassName: stu.classname ?? stu.asmcL_ClassName ?? stu.ASMCL_ClassName ?? '',
            asmC_SectionName: stu.sectionname ?? stu.asmC_SectionName ?? stu.ASMC_SectionName ?? '',
            studentsubjects: studentSubjects,
            studentmarks: studentMarks,
            student_marks: studentExamMarks,
            examwisetotal,
            remarks,
            promotedclass,
            conduct,
            attendance,
            suggestions,
            studentSkills,
            chartData
        };
    });

    // Unique skills list (skilllist_temp)
    const skilllist_temp: any[] = [];
    const activitylist_temp: any[] = [];

    for (const dev of getstudentwiseskillslist) {
        const ecsId = dev.ECS_Id ?? dev.ecS_Id;
        const ecsSkillName = dev.ECS_SkillName ?? dev.ecS_SkillName;
        const ecsaId = dev.ECSA_Id ?? dev.ecsA_Id;
        const ecsaSkillArea = dev.ECSA_SkillArea ?? dev.ecsA_SkillArea;

        if (ecsId && !skilllist_temp.find((emp) => (emp.ECS_Id ?? emp.ecS_Id) === ecsId)) {
            skilllist_temp.push({
                ECS_Id: ecsId,
                ECS_SkillName: ecsSkillName
            });
        }
        if (ecsaId && !activitylist_temp.find((act) => (act.ECSA_Id ?? act.ecsA_Id) === ecsaId)) {
            activitylist_temp.push({
                ECS_Id: ecsId,
                ECSA_Id: ecsaId,
                ECSA_SkillArea: ecsaSkillArea
            });
        }
    }

    // exam_promotion_groupwise_remarks processing for PE
    const examwiseremarkstemp = (exam_promotion_groupwise_remarks || []).filter((r: any) => {
        const flag = (r.ECTERE_Indi_OverAllFlag || r.ecterE_Indi_OverAllFlag || '').trim().toUpperCase();
        return flag === 'PE';
    });

    return {
        getinstitution,
        getgroupdetails: normalizedGroupDetails,
        groupwiseexamlist,
        gettermdetails,
        skilllist_temp,
        activitylist_temp,
        getgradelist,
        getpromotionremarksdetails,
        examwiseremarkstemp,
        studentdetails: studentListDetails,
        getstudentwiseattendancedetails
    };
}

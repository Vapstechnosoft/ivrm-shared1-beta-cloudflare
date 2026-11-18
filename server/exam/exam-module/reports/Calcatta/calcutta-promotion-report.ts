'use server';

import { api } from '@/lib/apiService';
import { ensureArray } from '@/lib/utils';

/**
 * Fetches the term details for the dropdown based on section selection
 */
export async function getTermsCalcutta(data: any) {
    const url = '/PromotionReportDetails/onchangesection';
    const response = await api.post<any>('exam', url, data);
    return response?.data || response || {};
}

/**
 * Fetches and transforms the Calcutta Promotion Report I-IV data
 * so the frontend UI can simply render without complex client-side mapping.
 */
export async function getCalcuttaPromotionReportI_IV(data: any) {
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
        getstudentwiseactiviteslist = [],
        gettermdetails = [],
        exam_promotion_groupwise_remarks = [],
        getpromotionremarksdetails = [],
        getstudentwiseattendancedetails = [],
        examwiseremarks = [],
        getexamwisetotaldetails = [],
        examWise_PaperType = [],
        getparticipatedetails = []
    } = response;

    // 1. Group wise exam list construction
    const groupwiseexamlist = [];

    for (const dd of getgroupdetails) {
        let counttotal = 0;
        const groupewiseexamTemp = [];

        for (const d of getgroupexamdetails) {
            if (dd.empG_DistplayName === d.empG_DistplayName) {
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

        // Add Marks Obtained & Highest in Class
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
        const stuId = stu.AMST_Id || stu.amsT_Id;

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
        const promotionRemarks = getpromotionremarksdetails.find((d: any) => {
            const dId = d.AMST_Id || d.amsT_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        });
        const remarks = promotionRemarks?.eprD_Remarks || '';
        const promotedclass = promotionRemarks?.eprD_ClassPromoted || '';

        // Attendance
        console.log('getstudentwiseattendancedetails', getstudentwiseattendancedetails);
        const attendance = getstudentwiseattendancedetails
            .filter((d: any) => {
                const dId = d.AMST_Id || d.amsT_Id;
                return dId && stuId && Number(dId) === Number(stuId);
            })
            .map((d: any) => ({
                classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
                emE_Id: d.EME_Id || d.emE_Id,
                classatt: d.PRESENTDAYS || d.presentdays,
                percentage: d.totalAttendancePercentage,
                term: d.EMPSG_DisplayName || d.empsG_DisplayName,
                extra_filed: d.totalAttendancePercentage
            }));

        // Suggestions
        const suggestions = examwiseremarks
            .filter((s: any) => {
                const sId = s.AMST_Id || s.amsT_Id;
                return sId && stuId && Number(sId) === Number(stuId);
            })
            .map((s: any) => s.ecterE_Remarks || s.eprd_remarks || '');

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => {
            const tId = t.AMST_Id || t.amsT_Id;
            return tId && stuId && Number(tId) === Number(stuId);
        });

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        for (const subj of studentSubjects) {
            const displayMarks =
                subj.EYCES_MarksDisplayFlg === true ||
                subj.EYCES_MarksDisplayFlg === 1 ||
                subj.EYCES_MarksDisplayFlg === '1' ||
                subj.EYCES_MarksDisplayFlg === 'true' ||
                subj.eyceS_MarksDisplayFlg === true ||
                subj.eyceS_MarksDisplayFlg === 1 ||
                subj.eyceS_MarksDisplayFlg === '1' ||
                subj.eyceS_MarksDisplayFlg === 'true';
            if (displayMarks) {
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
                    highest: examTotal?.ESTMPPS_ClassHighest || examTotal?.estmppS_ClassHighest || 0,
                    average: examTotal?.ESTMPPS_SectionAverage || examTotal?.estmppS_SectionAverage || 0,
                    obtained: examTotal?.ObtainedMarks || examTotal?.obtainedMarks || 0
                });
            }
        }

        // Skills for the specific student
        const studentSkills = getstudentwiseskillslist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

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
            attendance,
            suggestions,
            chartData,
            studentSkills
        };
    });

    // Unique skills list (skilllist_temp)
    const skilllist_temp: any[] = [];
    for (const dev of getstudentwiseskillslist) {
        const devId = dev.ECS_Id ?? dev.ecS_Id;
        if (!skilllist_temp.find((emp) => (emp.ECS_Id ?? emp.ecS_Id) === devId)) {
            skilllist_temp.push(dev);
        }
    }
    console.log('skilllist_temp', skilllist_temp);
    return {
        getinstitution,
        getgroupdetails,
        groupwiseexamlist,
        gettermdetails,
        skilllist_temp,
        studentdetails: studentListDetails
    };
}

/**
 * Fetches and transforms the Calcutta Promotion Report I-V data
 */
export async function getCalcuttaPromotionReportI_V(data: any) {
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
        getstudentwiseactiviteslist = [],
        gettermdetails = [],
        exam_promotion_groupwise_remarks = [],
        getpromotionremarksdetails = [],
        getstudentwiseattendancedetails = [],
        examwiseremarks = [],
        getexamwisetotaldetails = [],
        examWise_PaperType = [],
        getparticipatedetails = [],
        getgradelist = []
    } = response;

    // 1. Group wise exam list construction
    const groupwiseexamlist = [];

    for (const dd of getgroupdetails) {
        let counttotal = 0;
        const groupewiseexamTemp = [];

        for (const d of getgroupexamdetails) {
            if (dd.empG_DistplayName === d.empG_DistplayName || dd.empG_GroupName === d.empG_GroupName) {
                counttotal += d.empsgE_ForMaxMarkrs || 0;

                const examMap = {
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName || d.empG_GroupName,
                    EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    examnamedisplay: d.emE_ExamCode || d.emE_ExamName
                };
                groupewiseexamTemp.push(examMap);
                groupwiseexamlist.push(examMap);
            }
        }

        // Add Marks Obtained & Highest in Class
        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: ''
        });

        groupewiseexamTemp.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: 'Highest in Class',
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: 'Highest in Class',
            columname: ''
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            columname: 'Marks'
        });

        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 98000012,
            EME_ExamName: 'Highest in Class',
            EME_ExamOrder: 98000012,
            EMPG_DistplayName: dd.empG_DistplayName || dd.empG_GroupName,
            EMPSGE_ForMaxMarkrs: null,
            examnamedisplay: 'Highest in Class'
        });

        dd.empsG_MarksValue = counttotal;
        dd.groupewiseexam = groupewiseexamTemp;
    }

    // exam_promotion_groupwise_remarks processing for PE
    const examwiseremarkstemp = (exam_promotion_groupwise_remarks || []).filter(
        (r: any) => r.ECTERE_Indi_OverAllFlag === 'PE' || r.ecterE_Indi_OverAllFlag === 'PE'
    );

    // 2. Map all related data to student details
    const studentListDetails = getstudentdetails.map((stu: any) => {
        const stuId = stu.AMST_Id || stu.amsT_Id;

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
        const promotionRemarks = getpromotionremarksdetails.find((d: any) => {
            const dId = d.AMST_Id || d.amsT_Id;
            return dId && stuId && Number(dId) === Number(stuId);
        });
        const remarks = promotionRemarks?.eprD_Remarks || '';
        const promotedclass = promotionRemarks?.eprD_ClassPromoted || '';

        // Attendance
        const attendance = getstudentwiseattendancedetails
            .filter((d: any) => {
                const dId = d.AMST_Id || d.amsT_Id;
                return dId && stuId && Number(dId) === Number(stuId);
            })
            .map((d: any) => ({
                classheld: d.TOTALWORKINGDAYS || d.totalworkingdays,
                emE_Id: d.EME_Id || d.emE_Id,
                classatt: d.PRESENTDAYS || d.presentdays,
                percentage: d.ATTENDANCEPERCENTAGE || d.attendancepercentage,
                term: d.EMPSG_DisplayName || d.empsG_DisplayName
            }));

        // Suggestions (optional)
        const suggestions = examwiseremarks
            .filter((s: any) => {
                const sId = s.AMST_Id || s.amsT_Id;
                return sId && stuId && Number(sId) === Number(stuId);
            })
            .map((s: any) => s.ecterE_Remarks || s.eprd_remarks || '');

        // Exam wise total details
        const examwisetotal = getexamwisetotaldetails.filter((t: any) => {
            const tId = t.AMST_Id || t.amsT_Id;
            return tId && stuId && Number(tId) === Number(stuId);
        });

        // Generate Chart Data (Highest vs Average vs Obtained)
        const chartData = [];
        for (const subj of studentSubjects) {
            const displayMarks =
                subj.EYCES_MarksDisplayFlg === true ||
                subj.EYCES_MarksDisplayFlg === 1 ||
                subj.EYCES_MarksDisplayFlg === '1' ||
                subj.EYCES_MarksDisplayFlg === 'true' ||
                subj.eyceS_MarksDisplayFlg === true ||
                subj.eyceS_MarksDisplayFlg === 1 ||
                subj.eyceS_MarksDisplayFlg === '1' ||
                subj.eyceS_MarksDisplayFlg === 'true';
            if (displayMarks) {
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
                    highest: examTotal?.ESTMPPS_ClassHighest || examTotal?.estmppS_ClassHighest || 0,
                    average: examTotal?.ESTMPPS_SectionAverage || examTotal?.estmppS_SectionAverage || 0,
                    obtained: examTotal?.ObtainedMarks || examTotal?.obtainedMarks || 0
                });
            }
        }

        // Skills for the specific student
        const studentSkills = getstudentwiseskillslist.filter((s: any) => {
            const sId = s.AMST_Id || s.amsT_Id;
            return sId && stuId && Number(sId) === Number(stuId);
        });

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
            attendance,
            suggestions,
            chartData,
            studentSkills
        };
    });

    // Unique skills list (skilllist_temp)
    const skilllist_temp: any[] = [];
    for (const dev of getstudentwiseskillslist) {
        const devId = dev.ECS_Id ?? dev.ecS_Id;
        if (!skilllist_temp.find((emp) => (emp.ECS_Id ?? emp.ecS_Id) === devId)) {
            skilllist_temp.push(dev);
        }
    }

    return {
        getinstitution,
        getgroupdetails,
        groupwiseexamlist,
        gettermdetails,
        skilllist_temp,
        examwiseremarkstemp,
        studentdetails: studentListDetails,
        getgradelist,
        getpromotionremarksdetails
    };
}

/**
 * Fetches grades and exams based on selection
 */
export async function getGradeExamCalcutta(data: any) {
    const url = '/JSHSExamReports/get_Exam_grade';
    const res = await api.post<any>('exam', url, data);
    return res?.data || res || {};
}

/**
 * Fetches and transforms the Multiple Exam Cumulative Report data
 */
export async function getMultipleExamCumulativeReportCalcutta(data: any) {
    const url = '/JSHSExamReports_/Get_Multiple_Exam_Cumulative_CalcuttaAsync';
    const res = await api.post<any>('exam', url, data);
    const response = res?.data || res || {};

    console.log('=== CALCUTTA CUMULATIVE REPORT API RESPONSE === :', response);
    console.log('Response Keys:', Object.keys(response));

    // 1. Get raw arrays from response (supporting both casings and unwrapping $values wrapper)
    const getinstitution = ensureArray(response.getinstitution || response.getInstitution);
    const getcumulativereportdetails = ensureArray(
        response.getcumulativereportdetails || response.cumulativeReportDetails || response.getcumulativeReportDetails
    );
    const getsubjectslist = ensureArray(response.getsubjectslist || response.getSubjectsList);
    const getstudentlist = ensureArray(response.getstudentlist || response.getStudentList);
    const gettermdetails = ensureArray(response.gettermdetails || response.getTermDetails);
    const getsubjectwisetotaldetails = ensureArray(response.getsubjectwisetotaldetails || response.getSubjectWiseTotalDetails);

    console.log('getinstitution count:', getinstitution.length);
    console.log('getcumulativereportdetails count:', getcumulativereportdetails.length);
    console.log('getsubjectslist count:', getsubjectslist.length);
    console.log('getstudentlist count:', getstudentlist.length);
    console.log('gettermdetails count:', gettermdetails.length);
    console.log('getsubjectwisetotaldetails count:', getsubjectwisetotaldetails.length);

    if (getsubjectslist.length > 0) {
        console.log('First item in getsubjectslist:', JSON.stringify(getsubjectslist[0]));
    }
    if (gettermdetails.length > 0) {
        console.log('First item in gettermdetails:', JSON.stringify(gettermdetails[0]));
    }

    // 2. Normalize fields of getinstitution
    const normalizedInstitution = getinstitution.map((inst: any) => ({
        mI_Id: inst.mI_Id ?? inst.mi_Id ?? inst.mI_id ?? inst.mi_id,
        mI_Name: inst.mI_Name ?? inst.mi_Name ?? inst.mI_name ?? inst.mi_name ?? '',
        mI_Address1: inst.mI_Address1 ?? inst.mi_Address1 ?? inst.mI_address1 ?? inst.mi_address1 ?? '',
        ivrmmcT_Name: inst.ivrmmcT_Name ?? inst.ivrmmcT_name ?? inst.ivrmmct_Name ?? inst.ivrmmct_name ?? '',
        mI_Pincode: inst.mI_Pincode ?? inst.mi_Pincode ?? inst.mI_pincode ?? inst.mi_pincode ?? ''
    }));

    // 3. Normalize fields of gettermdetails (sub-columns raw data)
    const normalizedTermDetails = gettermdetails.map((term: any) => ({
        ISMS_Id: term.ISMS_Id ?? term.isms_Id ?? term.isms_id ?? term.ismS_Id ?? 0,
        EME_Id: term.EME_Id ?? term.eme_Id ?? term.eme_id ?? term.emE_Id ?? 0,
        EMSE_SubExamName: term.EMSE_SubExamName ?? term.emse_SubExamName ?? term.emsE_SubExamName ?? term.emse_subExamName ?? '',
        EME_ExamName: term.EME_ExamName ?? term.eme_ExamName ?? term.emE_ExamName ?? ''
    }));

    // 4. Build unique subcolmns list from normalized term details
    const subcolmns: any[] = [];
    for (const dev of normalizedTermDetails) {
        const exists = subcolmns.find(
            (emp) => emp.ISMS_Id === dev.ISMS_Id && emp.EME_Id === dev.EME_Id && emp.EMSE_SubExamName === dev.EMSE_SubExamName
        );
        if (!exists) {
            subcolmns.push(dev);
        }
    }

    // 5. Normalize fields of getsubjectslist and calculate colspan
    const normalizedSubjectsList = getsubjectslist.map((sub: any) => {
        const ismsId = sub.ISMS_Id ?? sub.isms_Id ?? sub.isms_id ?? sub.ismS_Id ?? 0;
        const subName = sub.ISMS_SubjectName ?? sub.isms_SubjectName ?? sub.isms_subjectName ?? sub.ismS_SubjectName ?? '';

        let colspant = 0;
        for (const dId of subcolmns) {
            if (dId.ISMS_Id === ismsId) {
                colspant++;
            }
        }

        return {
            ISMS_Id: ismsId,
            ISMS_SubjectName: subName,
            colspan: colspant
        };
    });

    // 6. Normalize fields of getcumulativereportdetails (marks details)
    const normalizedCumulativeReportDetails = getcumulativereportdetails.map((m: any) => ({
        AMST_Id: m.AMST_Id ?? m.amst_Id ?? m.amsT_Id ?? 0,
        ISMS_Id: m.ISMS_Id ?? m.isms_Id ?? m.isms_id ?? 0,
        EME_Id: m.EME_Id ?? m.eme_Id ?? m.eme_id ?? 0,
        ESTMPSSS_PassFailFlg: m.ESTMPSSS_PassFailFlg ?? m.estmpssS_PassFailFlg ?? m.estmpsss_PassFailFlg ?? '',
        EYCES_MarksDisplayFlg:
            m.EYCES_MarksDisplayFlg === true ||
            m.EYCES_MarksDisplayFlg === 1 ||
            m.EYCES_MarksDisplayFlg === '1' ||
            m.EYCES_MarksDisplayFlg === 'true' ||
            m.eyceS_MarksDisplayFlg === true ||
            m.eyceS_MarksDisplayFlg === 1 ||
            m.eyceS_MarksDisplayFlg === '1' ||
            m.eyceS_MarksDisplayFlg === 'true' ||
            m.eyces_MarksDisplayFlg === true ||
            m.eyces_MarksDisplayFlg === 1 ||
            m.eyces_MarksDisplayFlg === '1' ||
            m.eyces_MarksDisplayFlg === 'true' ||
            false,
        ESTMPSSS_ObtainedMarks: m.ESTMPSSS_ObtainedMarks ?? m.estmpssS_ObtainedMarks ?? m.estmpsss_ObtainedMarks ?? 0,
        EYCES_GradeDisplayFlg:
            m.EYCES_GradeDisplayFlg === true ||
            m.EYCES_GradeDisplayFlg === 1 ||
            m.EYCES_GradeDisplayFlg === '1' ||
            m.EYCES_GradeDisplayFlg === 'true' ||
            m.eyceS_GradeDisplayFlg === true ||
            m.eyceS_GradeDisplayFlg === 1 ||
            m.eyceS_GradeDisplayFlg === '1' ||
            m.eyceS_GradeDisplayFlg === 'true' ||
            m.eyces_GradeDisplayFlg === true ||
            m.eyces_GradeDisplayFlg === 1 ||
            m.eyces_GradeDisplayFlg === '1' ||
            m.eyces_GradeDisplayFlg === 'true' ||
            false,
        ESTMPSSS_ObtainedGrade: m.ESTMPSSS_ObtainedGrade ?? m.estmpssS_ObtainedGrade ?? m.estmpsss_ObtainedGrade ?? ''
    }));

    // 7. Normalize fields of getsubjectwisetotaldetails (total and percentage details)
    const normalizedSubjectWiseTotalDetails = getsubjectwisetotaldetails.map((t: any) => ({
        AMST_Id: t.AMST_Id ?? t.amst_Id ?? t.amsT_Id ?? 0,
        ISMS_Id: t.ISMS_Id ?? t.isms_Id ?? t.isms_id ?? 0,
        MARKSOBTAINED: t.MARKSOBTAINED ?? t.marksobtained ?? t.marksObtained ?? 0,
        PERCENTAGE: t.PERCENTAGE ?? t.percentage ?? 0
    }));

    // 8. Normalize fields of getstudentlist
    const normalizedStudentList = getstudentlist.map((stu: any) => ({
        AMST_Id: stu.AMST_Id ?? stu.amst_Id ?? stu.amsT_Id ?? 0,
        AMAY_RollNo: stu.AMAY_RollNo ?? stu.amay_RollNo ?? stu.amaY_RollNo ?? 0,
        AMST_FirstName: stu.AMST_FirstName ?? stu.amst_FirstName ?? stu.amsT_FirstName ?? '',
        AMST_AdmNo: stu.AMST_AdmNo ?? stu.amst_AdmNo ?? stu.amsT_AdmNo ?? '',
        ATTENDANCEPERCENTAGE: stu.ATTENDANCEPERCENTAGE ?? stu.attendancepercentage ?? 0
    }));

    // 9. Map marks and totals to students
    const studentListWithMarks = normalizedStudentList.map((stu: any) => {
        const markslist = normalizedCumulativeReportDetails.filter((m: any) => m.AMST_Id === stu.AMST_Id);
        const totallist = normalizedSubjectWiseTotalDetails.filter((m: any) => m.AMST_Id === stu.AMST_Id);
        return {
            ...stu,
            markslist,
            totallist
        };
    });

    return {
        getinstitution: normalizedInstitution,
        cumulativeReportDetails: normalizedCumulativeReportDetails,
        getcumulativereportdetails: normalizedCumulativeReportDetails,
        getsubjectslist: normalizedSubjectsList,
        studentlistd: studentListWithMarks,
        subcolmns,
        colnspan: 6 + subcolmns.length
    };
}

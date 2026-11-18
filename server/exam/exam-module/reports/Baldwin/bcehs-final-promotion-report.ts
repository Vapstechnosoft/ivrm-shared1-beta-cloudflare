'use server';

import { api } from '@/lib/apiService';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

/**
 * BCEHS Final Promotion Report - Shared Dropdowns & Specific Actions
 */

// 🔹 Initial Data (Academic Years)
export async function getInitialData() {
    const url = '/Baldwin_Final_P_Report/Getdetails';
    return await api.get<any>('exam', url);
}

// 🔹 Class Dropdown (Shared pattern)
export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

// 🔹 Section Dropdown (Shared pattern)
export async function getSectionsDropDownByAcademicYearandClasslist(asmaY_Id: number, asmcL_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

function getProp(obj: any, snake: string, camel: string) {
    if (!obj) return undefined;
    if (obj[camel] !== undefined) return obj[camel];
    if (obj[snake] !== undefined) return obj[snake];
    const lower = camel.toLowerCase();
    if (obj[lower] !== undefined) return obj[lower];
    return undefined;
}

// 🔹 Generate Report (Specific endpoint)
export async function getBCEHSFinalPromotionReport(data: any) {
    const url = '/Baldwin_All_Reports/Baldwin_Final_P_Report_card';

    const payload = {
        ASMAY_Id: Number(data.ASMAY_Id),
        ASMCL_Id: Number(data.ASMCL_Id),
        ASMS_Id: Number(data.ASMS_Id),
        Temp_AmstIds: (data.Temp_AmstIds || data.temp_AmstIds || []).map((item: any) => ({
            AMST_Id: Number(item.AMST_Id || item.amsT_Id)
        }))
    };

    const response = await api.post<any>('exam', url, payload);
    console.log('getBCEHSFinalPromotionReport response success:', response?.success);

    const actualData = response?.data || response;
    const examlist = getProp(actualData, 'examlist', 'examList');
    const subjectlist = getProp(actualData, 'subjectlist', 'subjectList');

    if (actualData && examlist && subjectlist) {
        const transformed = await transformReportData(
            actualData,
            Number(data.asmaY_Id || data.ASMAY_Id),
            Number(data.asmcL_Id || data.ASMCL_Id),
            Number(data.asmS_Id || data.ASMS_Id)
        );
        return {
            ...response,
            data: transformed
        };
    }
    return response;
}

/**
 * Data Transformation logic moved from AngularJS controller to Server Action
 */
export async function transformReportData(promise: any, ASMAY_Id: number, ASMCL_Id: number, ASMS_Id: number) {
    const getPropLocal = (obj: any, snake: string, camel: string) => {
        if (!obj) return undefined;
        if (obj[camel] !== undefined) return obj[camel];
        if (obj[snake] !== undefined) return obj[snake];
        const lower = camel.toLowerCase();
        if (obj[lower] !== undefined) return obj[lower];
        return undefined;
    };

    const examlist = getPropLocal(promise, 'examlist', 'examList') || [];
    const subjectlist = getPropLocal(promise, 'subjectlist', 'subjectList') || [];
    const studentlist = getPropLocal(promise, 'studentlist', 'studentList') || [];
    const studentmarks = getPropLocal(promise, 'studentmarks', 'studentMarks') || [];
    const examsubjectwise_details = getPropLocal(promise, 'examSubwiseDetails', 'examSubwiseDetails') || [];
    const process_examdetails = getPropLocal(promise, 'processExamDetails', 'processExamDetails') || [];
    const work_attendence = getPropLocal(promise, 'workAttendance', 'workAttendance') || [];
    const present_attendence = getPropLocal(promise, 'presentAttendance', 'presentAttendance') || [];
    const promotionDetails = getPropLocal(promise, 'promotionDetails', 'promotionDetails') || [];
    const promotion_stumarks_grpwise = getPropLocal(promise, 'promotion_stumarks_grpwise', 'promotionStumarksGrpwise') || [];
    const prom_subj_groupdetails = getPropLocal(promise, 'prom_subj_groupdetails', 'promSubjGroupdetails') || [];
    const prom_subj_grp_exms = getPropLocal(promise, 'prom_subj_grp_exms', 'promSubjGrpExms') || [];
    const prom_subj_groupdetails_all = getPropLocal(promise, 'prom_subj_groupdetails_all', 'promSubjGroupdetailsAll') || [];
    const promotion_subectdetails = getPropLocal(promise, 'promotion_subectdetails', 'promotionSubectdetails') || [];
    const promotion_mainmarks = getPropLocal(promise, 'promotion_mainmarks', 'promotionMainmarks') || [];
    const classteacher = getPropLocal(promise, 'classteacher', 'classTeacher') || [];
    const exmConfig_PromotionFlag = getPropLocal(promise, 'exmConfig_PromotionFlag', 'exmConfigPromotionFlag') ?? true;
    const emP_MarksPerFlg = getPropLocal(promise, 'emP_MarksPerFlg', 'emPMarksPerFlg') || 'P';

    // 1. Resolve Year_Name, Class_Name, Section_Name from lists or student fallback
    let Year_Name = '';
    const yearList = getPropLocal(promise, 'year_list', 'yearList') || getPropLocal(promise, 'yearlist', 'yearList') || [];
    const yearObj = yearList.find((y: any) => y.asmaY_Id === ASMAY_Id);
    if (yearObj) {
        Year_Name = yearObj.asmaY_Year;
    } else {
        Year_Name = studentlist?.[0]?.asmaY_Year || '';
    }

    let Class_Name = '';
    const classList = getPropLocal(promise, 'class_list', 'classList') || getPropLocal(promise, 'classlist', 'classList') || [];
    const classObj = classList.find((c: any) => c.asmcL_Id === ASMCL_Id);
    if (classObj) {
        Class_Name = classObj.asmcL_ClassName;
    } else {
        Class_Name = studentlist?.[0]?.asmcL_ClassName || '';
    }

    let Section_Name = '';
    const sectionList = getPropLocal(promise, 'section_list', 'sectionList') || getPropLocal(promise, 'sectionlist', 'sectionList') || [];
    const sectionObj = sectionList.find((s: any) => s.asmS_Id === ASMS_Id);
    if (sectionObj) {
        Section_Name = sectionObj.asmC_SectionName || sectionObj.asmS_SectionName;
    } else {
        Section_Name = studentlist?.[0]?.asmC_SectionName || '';
    }

    // 2. Identify Final Exam
    let Final_Exam_Id: number | null = null;
    let Final_EYCE_Id: number | null = null;
    for (const exm of examlist) {
        if (exm.emE_FinalExamFlag) {
            Final_Exam_Id = exm.emE_Id;
            Final_EYCE_Id = exm.eycE_Id;
        }
    }

    // 3. Calculate Max Marks for Exams (uses eyceS_MaxMarks as specified in angular)
    for (const exm of examlist) {
        const temp_subdetails = examsubjectwise_details.filter((sd: any) => sd.eycE_Id === exm.eycE_Id && sd.eyceS_AplResultFlg);
        const max_sub_marks =
            temp_subdetails.length > 0
                ? Math.max(
                      ...temp_subdetails.map((item: any) =>
                          item.eyceS_MaxMarks !== undefined ? item.eyceS_MaxMarks : item.eyceS_MarksEntryMax
                      )
                  )
                : 0;
        exm.marks = max_sub_marks;
    }

    // 4. Calculate total_max_sub_marks (sum of exam marks as in BBHS angular controller)
    let total_max_sub_marks = 0;
    for (const ex of examlist) {
        total_max_sub_marks += ex.marks || 0;
    }

    // 5. Process Subjects flag & final exam grade details mapping
    for (const sub of subjectlist) {
        const temp_subdetails = examsubjectwise_details.filter((sd: any) => sd.ismS_Id === sub.ismS_Id);
        const applicable_flag =
            temp_subdetails.length > 0 ? Math.max(...temp_subdetails.map((item: any) => item.eyceS_AplResultFlg)) : true;
        sub.flag = applicable_flag;

        const final_sd = temp_subdetails.find((sd: any) => sd.eycE_Id === Final_EYCE_Id);
        if (final_sd) {
            sub.emgR_Id = final_sd.emgR_Id;
        }

        console.log('sub:', JSON.stringify(sub, null, 2));
    }

    // 6. Transform Promotion Data headers if Flag is 'P'
    const temp_headers: any[] = [];
    if (exmConfig_PromotionFlag && emP_MarksPerFlg === 'P') {
        const final_exam_grps = prom_subj_grp_exms.filter((e1: any) =>
            examlist.some((e2: any) => e2.emE_Id === e1.emE_Id && e2.emE_FinalExamFlag)
        );
        const other_exam_grps = prom_subj_grp_exms.filter((e1: any) =>
            examlist.some((e2: any) => e2.emE_Id === e1.emE_Id && !e2.emE_FinalExamFlag)
        );

        const grp_ids_other = Array.from(new Set(other_exam_grps.map((ot: any) => ot.empsG_Id)));
        const grp_ids_final = Array.from(new Set(final_exam_grps.map((fin: any) => fin.empsG_Id)));

        let total_oth = 0;
        const oth_group_names: any[] = [];
        for (const grp of grp_ids_other) {
            const s_grp = prom_subj_groupdetails.find((sg: any) => sg.empsG_Id === grp);
            if (s_grp) {
                total_oth += Number(s_grp.empsG_PercentValue);
                oth_group_names.push(s_grp);
            }
        }
        if (total_oth > 0) {
            temp_headers.push({ flag: 'O', Per_val: total_oth, names: oth_group_names });
        }

        let total_fin = 0;
        const fin_group_names: any[] = [];
        for (const grp of grp_ids_final) {
            const s_grp = prom_subj_groupdetails.find((sg: any) => sg.empsG_Id === grp);
            if (s_grp) {
                total_fin += Number(s_grp.empsG_PercentValue);
                fin_group_names.push(s_grp);
            }
        }
        if (total_fin > 0) {
            let equal_flag = false;
            for (const exm of examlist) {
                if (exm.emE_FinalExamFlag && exm.marks === total_fin) {
                    equal_flag = true;
                }
            }
            temp_headers.push({ flag: 'F', Per_val: total_fin, names: fin_group_names, equal_flag });
        }
    }

    // 7. Calculate overall total_Exams for process details
    let total_Exams = 0;
    for (const ttotal of process_examdetails) {
        total_Exams += Number(ttotal.estmP_TotalObtMarks || 0);
    }

    // 8. Reconstruct student_list with student-wise mappings
    const student_list = studentlist.map((stu: any) => {
        const studentId = stu.amsT_Id;

        // Calculate studentwise subjects (ordered from subjectlist and only mapped ones)
        const stu_subjects_raw = getPropLocal(promise, 'stu_subjects', 'stuSubjects') || [];
        let stuWiseSubjects = subjectlist.filter((subj: any) =>
            stu_subjects_raw.some((stud_subj: any) => stud_subj.amsT_Id === studentId && stud_subj.ismS_Id === subj.ismS_Id)
        );
        if (stuWiseSubjects.length === 0) {
            stuWiseSubjects = subjectlist;
        }

        // Filter and map studentmarks (handles AB, M, L special cases for all branches)
        const stu_student_marks = studentmarks
            .filter((m: any) => m.amsT_Id === studentId)
            .map((marks: any) => {
                if (['AB', 'M', 'L'].includes(marks.estmpS_PassFailFlg)) {
                    return {
                        ...marks,
                        estmpS_ObtainedMarks: marks.estmpS_PassFailFlg,
                        estmpS_ObtainedGrade: marks.estmpS_PassFailFlg
                    };
                }
                return marks;
            });

        // Calculate student-wise group marks
        const temp_student_marks: any[] = [];
        const Temp_EMPSG_Ids: any[] = [];
        const subjectsForGroupMarks = promotion_subectdetails.length > 0 ? promotion_subectdetails : stuWiseSubjects;
        for (const sub of subjectsForGroupMarks) {
            const oth_empsg_ids: number[] = [];
            const fin_empsg_ids: number[] = [];

            const sub_grps = prom_subj_groupdetails_all.filter(
                (sg: any) =>
                    (sub.empS_Id !== undefined && sg.empS_Id === sub.empS_Id) || sg.ismS_Id === sub.ismS_Id || sg.ismS_id === sub.ismS_Id
            );
            for (const sub_grp of sub_grps) {
                for (const temp of temp_headers) {
                    if (temp.flag === 'O') {
                        for (const te of temp.names || []) {
                            if (te.empsG_GroupName === sub_grp.empsG_GroupName) {
                                oth_empsg_ids.push(sub_grp.empsG_Id);
                            }
                        }
                    } else if (temp.flag === 'F') {
                        for (const te of temp.names || []) {
                            if (te.empsG_GroupName === sub_grp.empsG_GroupName) {
                                fin_empsg_ids.push(sub_grp.empsG_Id);
                            }
                        }
                    }
                }
            }
            Temp_EMPSG_Ids.push({ ismS_Id: sub.ismS_Id, O_Ids: oth_empsg_ids, F_Ids: fin_empsg_ids });
        }

        // For this student, map the promotion group marks
        for (const subj of promotionDetails?.promotionStuMarks || []) {
            if (subj.amsT_Id === studentId) {
                let subject_marks_other = 0;
                let subject_marks_final = 0;

                const s_grp_id = Temp_EMPSG_Ids.find((s: any) => s.ismS_Id === subj.ismS_Id);
                if (s_grp_id) {
                    for (const ot of s_grp_id.O_Ids) {
                        const grpmar = promotion_stumarks_grpwise.find(
                            (gm: any) => gm.empsG_Id === ot && gm.estmppS_Id === subj.estmppS_Id
                        );
                        if (grpmar) {
                            subject_marks_other += Number(grpmar.estmppsG_GroupObtMarks || 0);
                        }
                    }
                    for (const fin of s_grp_id.F_Ids) {
                        const grpmar = promotion_stumarks_grpwise.find(
                            (gm: any) => gm.empsG_Id === fin && gm.estmppS_Id === subj.estmppS_Id
                        );
                        if (grpmar) {
                            subject_marks_final += Number(grpmar.estmppsG_GroupObtMarks || 0);
                        }
                    }
                }

                const sub_applicable = subjectlist.find((s: any) => s.ismS_Id === subj.ismS_Id);
                const applicableflag = sub_applicable ? (sub_applicable.flag ? 1 : 0) : 0;

                temp_student_marks.push({
                    ismS_Id: subj.ismS_Id,
                    grp_marks_o: subject_marks_other,
                    grp_marks_f: subject_marks_final,
                    amsT_Id: studentId,
                    applicableflag
                });
            }
        }

        // Calculate Grand Total for the student based on group marks
        let subj_total_grp_O = 0;
        let subj_total_grp_F = 0;
        for (const stu_marks_g of temp_student_marks) {
            if (stu_marks_g.applicableflag === 1) {
                subj_total_grp_O += Math.round(Number(stu_marks_g.grp_marks_o || 0));
                subj_total_grp_F += Math.round(Number(stu_marks_g.grp_marks_f || 0));
            }
        }

        const stu_Total_Array_Grp = [{ total_s_o: subj_total_grp_O, total_s_f: subj_total_grp_F }];
        const stu_Total_total_grp = Math.round(subj_total_grp_O) + Math.round(subj_total_grp_F);

        // Calculate Percentage max marks
        let Total_max_grp = 0;
        for (const subj of stuWiseSubjects) {
            const pro_sub_max_marks = promotion_subectdetails.find(
                (ps: any) => ps.ismS_Id === subj.ismS_Id && (subj.flag || subj.flag === undefined)
            );
            if (pro_sub_max_marks) {
                Total_max_grp += Math.round(Number(pro_sub_max_marks.empS_MaxMarks || 100));
            } else {
                Total_max_grp += 100;
            }
        }

        let total_percentage = 0;
        if (Total_max_grp > 0) {
            total_percentage = Number(((stu_Total_total_grp / Total_max_grp) * 100).toFixed(2));
        }

        // Student-specific sum of process obtained marks
        const student_process_details = process_examdetails.filter((tot: any) => tot.amsT_Id === studentId);
        const stu_total_Exams = student_process_details.reduce((sum: number, tot: any) => sum + Number(tot.estmP_TotalObtMarks || 0), 0);

        // Interleave marks details into final_subj_marks
        const final_subj_marks = stuWiseSubjects.map((sub: any) => {
            const subj_marks: any[] = [];
            const subj_obj: any = {};

            // 1. Exams not final
            for (const exm of examlist) {
                if (!exm.emE_FinalExamFlag) {
                    const mark = stu_student_marks.find((m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id);
                    if (mark) {
                        const isSpecial = ['AB', 'M', 'L'].includes(mark.estmpS_PassFailFlg);
                        subj_marks.push({
                            estmpS_ObtainedMarks: isSpecial ? mark.estmpS_PassFailFlg : mark.estmpS_ObtainedMarks,
                            estmpS_ObtainedGrade: isSpecial ? mark.estmpS_PassFailFlg : mark.estmpS_ObtainedGrade
                        });
                    } else {
                        subj_marks.push({ estmpS_ObtainedMarks: '', estmpS_ObtainedGrade: '' });
                    }
                }
            }

            // 2. Temp headers flag != 'F'
            for (const hdr of temp_headers) {
                if (hdr.flag !== 'F') {
                    const g_marks = temp_student_marks.find((m: any) => m.ismS_Id === sub.ismS_Id);
                    subj_marks.push({
                        estmpS_ObtainedMarks: g_marks ? Math.round(Number(g_marks.grp_marks_o || 0)) : ''
                    });
                }
            }

            // 3. Exams final
            for (const exm of examlist) {
                if (exm.emE_FinalExamFlag) {
                    const mark = stu_student_marks.find((m: any) => m.ismS_Id === sub.ismS_Id && m.emE_Id === exm.emE_Id);
                    if (mark) {
                        const isSpecial = ['AB', 'M', 'L'].includes(mark.estmpS_PassFailFlg);
                        subj_marks.push({
                            estmpS_ObtainedMarks: isSpecial ? mark.estmpS_PassFailFlg : mark.estmpS_ObtainedMarks,
                            estmpS_ObtainedGrade: isSpecial ? mark.estmpS_PassFailFlg : mark.estmpS_ObtainedGrade
                        });
                    } else {
                        subj_marks.push({ estmpS_ObtainedMarks: '', estmpS_ObtainedGrade: '' });
                    }
                }
            }

            // 4. Temp headers flag == 'F' && !equal_flag
            for (const hdr of temp_headers) {
                if (hdr.flag === 'F' && !hdr.equal_flag) {
                    const g_marks = temp_student_marks.find((m: any) => m.ismS_Id === sub.ismS_Id);
                    subj_marks.push({
                        estmpS_ObtainedMarks: g_marks ? Math.round(Number(g_marks.grp_marks_f || 0)) : ''
                    });
                }
            }

            // 5. Promotion stumarks
            const prom_mks = promotionDetails.promotionStuMarks.find((m: any) => m.amsT_Id === studentId && m.ismS_Id === sub.ismS_Id);
            if (prom_mks) {
                subj_obj.estmppS_ObtainedMarks = Math.round(Number(prom_mks.estmppS_ObtainedMarks || 0));
                subj_obj.estmppS_Remarks = prom_mks.estmppS_Remarks || '';
                subj_obj.estmppS_ObtainedGrade = prom_mks.estmppS_ObtainedGrade || '';
                subj_obj.estmppS_PassFailFlg = prom_mks.estmppS_PassFailFlg || '';
            } else {
                subj_obj.estmppS_ObtainedMarks = '';
                subj_obj.estmppS_Remarks = '';
                subj_obj.estmppS_ObtainedGrade = '';
                subj_obj.estmppS_PassFailFlg = '';
            }

            subj_obj.flag = sub.flag !== undefined ? sub.flag : true;
            subj_obj.ismS_Id = sub.ismS_Id;
            subj_obj.ismS_SubjectName = sub.ismS_SubjectName;

            return {
                sub_details: subj_obj,
                subj_marks_details: subj_marks
            };
        });
        const total_max_sub_marks = examlist.reduce((total: number, ex: any) => total + Number(ex.marks || 0), 0);

        return {
            ...stu,
            final_subj_marks,
            stu_subjects: stuWiseSubjects,
            stu_student_marks,
            stu_temp_student_marks: temp_student_marks,
            stu_Total_Array_Grp,
            stu_Total_total_grp,
            total_percentage,
            overall_percentage: total_percentage,
            stud_total_max_grp: Total_max_grp,
            total_Exams: stu_total_Exams
        };
    });

    const Class_Teacher_Name = classteacher?.[0]?.hrmE_EmployeeFirstName || '';

    return {
        ...promise,
        examlist,
        total_max_sub_marks,
        exam_list: examlist, // For BBHS
        subjectlist,
        studentlist,
        student_list, // For BCEHS & BBHS
        temp_headers,
        Final_Exam_Id,
        Final_EYCE_Id,
        process_examdetails,
        exam_process_details: process_examdetails, // For BBHS
        work_attendence,
        stud_work_attendence: work_attendence, // For BBHS
        present_attendence,
        stud_present_attendence: present_attendence, // For BBHS
        exmConfig_PromotionFlag,
        ExmConfig_PromotionFlag: exmConfig_PromotionFlag, // For BBHS
        emP_MarksPerFlg,
        EMP_MarksPerFlg: emP_MarksPerFlg, // For BBHS
        promotion_stumarks: promotionDetails.promotionStuMarks,
        promotion_student_marks: promotionDetails.promotionStuMarks, // For BBHS
        promotion_mainmarks,
        promotion_main_marks: promotion_mainmarks, // For BBHS
        classteacher,
        Class_Teacher_Name, // For BBHS
        Class_Name, // For BBHS
        Section_Name, // For BBHS
        Year_Name, // For BBHS
        total_Exams // For BBHS & BCEHS Format 2
    };
}

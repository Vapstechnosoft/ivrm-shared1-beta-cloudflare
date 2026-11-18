'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getCumulativeReport } from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { ApiSearchparams } from '@/types';
import type { ICumulativeReport, IMasterInstitution, IReportHeader, ISubject } from '@/types/exam/exam-module/report';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CumulativeReportForm from './_components/add-form';
import CumulativeReportGridView from './_components/columns';
import CumulativeReportExcel from './_components/cumulative-report-excel';
import CumulativeReportPrintView from './_components/cumulative-report-printable';

export default function CumulativeReportPage() {
    const [reportData, setReportData] = useState<ICumulativeReport[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [headerInfo, setHeaderInfo] = useState<Partial<IReportHeader>>({});
    const [isReportVisible, setIsReportVisible] = useState(false);
    const [searchParams] = useState<ApiSearchparams>({});
    const [institution, setInstitution] = useState<IMasterInstitution | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [columnFlags, setColumnFlags] = useState({
        admno: true,
        regno: false,
        rollno: true,
        classrank: true,
        sectionrank: true,
        attendancedispaly: false,
        applicable: true,
        nonapplicable: false,
        readmit: false,
        grdaeDisply: false,
        marksdisplay: false,
        gradecolm: false,
        status: false
    });

    const handleReportSuccess = async (payload: any, setSearchParams: any) => {
        if (!payload) return;

        // Hide the active report and clear previous data state immediately before fetching new data
        setIsReportVisible(false);
        setReportData([]);
        setSubjects([]);

        try {
            const res = await getCumulativeReport(payload, setSearchParams);
            const institudtion_res = await getMasterInstitution();
            const { data: institudtion_data } = institudtion_res;
            setInstitution(institudtion_data);
            if (res?.success === false) {
                toast.error(res?.message || 'Failed to generate report');
                return;
            }

            const rawResponse = res?.data ?? res;
            const responseData = typeof rawResponse === 'object' && rawResponse !== null ? rawResponse : {};

            const extractList = (val: any): any[] => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                if (Array.isArray(val?.$values)) return val.$values;
                if (typeof val === 'object') {
                    if (Array.isArray(val?.data)) return val.data;
                    if (Array.isArray(val?.data?.$values)) return val.data.$values;
                }
                return [];
            };

            const parseMarks = (val: any): number | null => {
                if (val === null || val === undefined || val === '' || val === '-' || val === 'AB' || val === 1000 || val === '1000') {
                    return null;
                }
                const num = Number(val);
                return isNaN(num) ? null : num;
            };

            const extractTotalMax = (obj: any): number | null => {
                if (!obj) return null;
                const val =
                    obj.estmP_TotalMaxMarks ??
                    obj.ESTMP_TotalMaxMarks ??
                    obj.estmp_totalmaxmarks ??
                    obj.totalMaxMarks ??
                    obj.TotalMaxMarks ??
                    obj.totalMax ??
                    obj.TotalMax ??
                    obj.total_max_marks ??
                    obj.totaleyceS_MarksEntryMax ??
                    obj.TOTALEYCES_MarksEntryMax ??
                    obj.totalestM_Marks ??
                    obj.TOTALESTM_Marks ??
                    obj.total_marks ??
                    obj.TOTAL_MARKS ??
                    obj.maxtotal ??
                    obj.MAXTOTAL ??
                    obj.maxTotal ??
                    obj.maxmarks ??
                    obj.maxMarks ??
                    obj.totalMarks ??
                    obj.TotalMarks ??
                    obj.total_sub_max_marks ??
                    null;
                return parseMarks(val);
            };

            const extractTotalObt = (obj: any): number | null => {
                if (!obj) return null;
                const val =
                    obj.estmP_TotalObtMarks ??
                    obj.ESTMP_TotalObtMarks ??
                    obj.estmp_totalobtmarks ??
                    obj.totalObtMarks ??
                    obj.TotalObtMarks ??
                    obj.totalObt ??
                    obj.TotalObt ??
                    obj.total_obt_marks ??
                    obj.obtainedMarks ??
                    obj.ObtainedMarks ??
                    obj.obtainedmarks ??
                    obj.obtainTotal ??
                    obj.obtaintotal ??
                    obj.totalObtainedMarks ??
                    obj.TotalObtainedMarks ??
                    (obj.maxtotal != null ? obj.total : null);
                return parseMarks(val);
            };

            const extractClassHeld = (obj: any): number | null => {
                if (!obj) return null;
                const val =
                    obj.classheld ??
                    obj.classHeld ??
                    obj.asA_ClassHeld ??
                    obj.ASA_ClassHeld ??
                    obj.TotalSchoolDays ??
                    obj.totalSchoolDays ??
                    obj.totalschooldays ??
                    obj.TOTALSCHOOLDAYS ??
                    obj.totalWorkingDays ??
                    obj.TOTALWORKINGDAYS ??
                    obj.workingDays ??
                    obj.WORKINGDAYS ??
                    obj.WorkingDays ??
                    obj.work_attendence ??
                    obj.work_attendance ??
                    obj.total_working_days ??
                    obj.total_workingdays ??
                    obj.class_held ??
                    obj.class_Held ??
                    obj.schoolDays ??
                    obj.SchoolDays ??
                    null;
                return parseMarks(val);
            };

            const extractClassAtt = (obj: any): number | null => {
                if (!obj) return null;
                const val =
                    obj.classatt ??
                    obj.classAtt ??
                    obj.asA_Class_Attended ??
                    obj.ASA_Class_Attended ??
                    obj.present_attendence ??
                    obj.present_attendance ??
                    obj.presentDays ??
                    obj.PRESENTDAYS ??
                    obj.PresentDays ??
                    obj.totalPresentDays ??
                    obj.TOTALPRESENTDAYS ??
                    obj.TotalPresentDays ??
                    obj.present_days ??
                    obj.PRESENT_DAYS ??
                    obj.total_present_days ??
                    obj.total_present ??
                    obj.TotalPresent ??
                    obj.attended ??
                    obj.Attended ??
                    obj.attendance ??
                    obj.Attendance ??
                    obj.total_attendance ??
                    obj.presentattendance ??
                    obj.class_attended ??
                    null;
                return parseMarks(val);
            };

            const extractRollNo = (obj: any): any => {
                if (!obj) return null;
                const val =
                    obj.rollNo ??
                    obj.rollno ??
                    obj.RollNo ??
                    obj.Roll_No ??
                    obj.amsT_RollNo ??
                    obj.AMST_RollNo ??
                    obj.student_rollno ??
                    obj.Student_RollNo ??
                    obj.amsT_Roll_No ??
                    obj.AMST_Roll_No ??
                    obj.roll_no ??
                    obj.Roll_no ??
                    obj.amaY_RollNo ??
                    obj.AMAY_RollNo ??
                    null;
                if (val === null || val === undefined || val === '') return null;
                const n = Number(val);
                return !isNaN(n) ? n : val;
            };

            const extractSubjectMaxMarks = (obj: any): number | null => {
                if (!obj) return null;
                const val =
                    obj.eyceS_MaxMarks ??
                    obj.EYCES_MaxMarks ??
                    obj.eyceS_MarksEntryMax ??
                    obj.EYCES_MarksEntryMax ??
                    obj.estmpS_MaxMarks ??
                    obj.ESTMPS_MaxMarks ??
                    obj.maxMarks ??
                    obj.MaxMarks ??
                    obj.maxmarks ??
                    obj.MAX_MARKS ??
                    obj.max_marks ??
                    obj.totalMarks ??
                    obj.TotalMarks ??
                    obj.marks ??
                    obj.Marks ??
                    obj.empS_MaxMarks ??
                    obj.EMPS_MaxMarks ??
                    obj.emE_ExamMarks ??
                    obj.EME_ExamMarks ??
                    obj.empsgE_ForMaxMarkrs ??
                    obj.EMPSGE_ForMaxMarkrs ??
                    obj.totalestM_Marks ??
                    obj.TOTALESTM_Marks ??
                    obj.totaleyceS_MarksEntryMax ??
                    obj.TOTALEYCES_MarksEntryMax ??
                    null;
                return parseMarks(val);
            };

            const savelistRaw = [
                ...extractList(responseData.savelist),
                ...extractList(responseData.cumulative_reportList),
                ...extractList(responseData.data)
            ];
            const savelist = savelistRaw.length > 0 ? savelistRaw : (Array.isArray(responseData) ? responseData : extractList(responseData));

            const savenonsubjlist = [
                ...extractList(responseData.savenonsubjlist),
                ...extractList(responseData.savenonsubjectlist),
                ...extractList(responseData.nonstudentslt)
            ];

            const studentDetailsList = [
                ...extractList(responseData.studentlist),
                ...extractList(responseData.studlist),
                ...extractList(responseData.studentdetails),
                ...extractList(responseData.getstudentdetails),
                ...extractList(responseData.amstlist),
                ...extractList(responseData.students),
                ...extractList(responseData.student_list)
            ];

            const studentDetailsMap = new Map<number, any>();
            studentDetailsList.forEach((item: any) => {
                const sId = Number(item.amsT_Id ?? item.AMST_Id ?? item.student_id ?? item.amst_id ?? 0);
                if (sId) {
                    studentDetailsMap.set(sId, item);
                }
            });

            const selectedStudentsList = extractList(payload?.studentList || payload?.selectedStudents || []);
            const selectedStudentsMap = new Map<number, any>();
            selectedStudentsList.forEach((st: any) => {
                const sId = Number(st.amsT_Id ?? st.AMST_Id ?? st.student_id ?? 0);
                if (sId) {
                    selectedStudentsMap.set(sId, st);
                }
            });

            // Attendance Map from all potential response arrays
            const attendanceMap = new Map<number, { classheld: number | null; classatt: number | null }>();
            const attendanceList = [
                ...extractList(responseData.getstudentwiseattendancedetails),
                ...extractList(responseData.studentwiseattendancedetails),
                ...extractList(responseData.getStudentWiseAttendanceDetails),
                ...extractList(responseData.attendancedetails),
                ...extractList(responseData.attendance_details),
                ...extractList(responseData.studentAttendanceList),
                ...extractList(responseData.attendancelist),
                ...extractList(responseData.attendanceList),
                ...extractList(responseData.attendance),
                ...extractList(responseData.attlist)
            ];
            attendanceList.forEach((item: any) => {
                const sId = Number(item.amsT_Id ?? item.AMST_Id ?? item.student_id ?? item.amst_id ?? 0);
                if (sId) {
                    const held = extractClassHeld(item);
                    const att = extractClassAtt(item);
                    const prev = attendanceMap.get(sId) || { classheld: null, classatt: null };
                    attendanceMap.set(sId, {
                        classheld: held !== null ? held : prev.classheld,
                        classatt: att !== null ? att : prev.classatt
                    });
                }
            });

            const workAttendanceList = [
                ...extractList(responseData.work_attendence),
                ...extractList(responseData.stud_work_attendence),
                ...extractList(responseData.workAttendance),
                ...extractList(responseData.work_attendance)
            ];
            workAttendanceList.forEach((item: any) => {
                const sId = Number(item.amsT_Id ?? item.AMST_Id ?? item.student_id ?? item.amst_id ?? 0);
                if (sId) {
                    const held = extractClassHeld(item);
                    if (held !== null) {
                        const prev = attendanceMap.get(sId) || { classheld: null, classatt: null };
                        attendanceMap.set(sId, { ...prev, classheld: held });
                    }
                }
            });

            const presentAttendanceList = [
                ...extractList(responseData.present_attendence),
                ...extractList(responseData.stud_present_attendence),
                ...extractList(responseData.presentAttendance),
                ...extractList(responseData.present_attendance)
            ];
            presentAttendanceList.forEach((item: any) => {
                const sId = Number(item.amsT_Id ?? item.AMST_Id ?? item.student_id ?? item.amst_id ?? 0);
                if (sId) {
                    const att = extractClassAtt(item);
                    if (att !== null) {
                        const prev = attendanceMap.get(sId) || { classheld: null, classatt: null };
                        attendanceMap.set(sId, { ...prev, classatt: att });
                    }
                }
            });

            studentDetailsList.forEach((item: any) => {
                const sId = Number(item.amsT_Id ?? item.AMST_Id ?? item.student_id ?? item.amst_id ?? 0);
                if (sId) {
                    const held = extractClassHeld(item);
                    const att = extractClassAtt(item);
                    if (held !== null || att !== null) {
                        const prev = attendanceMap.get(sId) || { classheld: null, classatt: null };
                        attendanceMap.set(sId, {
                            classheld: held !== null ? held : prev.classheld,
                            classatt: att !== null ? att : prev.classatt
                        });
                    }
                }
            });

            const subjlist = [
                ...extractList(responseData.subjlist),
                ...extractList(responseData.clm_list),
                ...extractList(responseData.subjectlist),
                ...extractList(responseData.getsubjlist),
                ...extractList(responseData.sub_list),
                ...extractList(responseData.subjList),
                ...extractList(responseData.studentslt1),
                ...extractList(responseData.master_subject_list)
            ];

            const nonsubjlist = [
                ...extractList(responseData.nonsubjlist),
                ...extractList(responseData.nonsubjectlist),
                ...extractList(responseData.electivesub)
            ];

            const examSubjectWiseDetails = [
                ...extractList(responseData.examsubjectwise_details),
                ...extractList(responseData.examSubjectWiseDetails),
                ...extractList(responseData.examsubjectwiseDetails),
                ...extractList(responseData.subjectwise_details),
                ...extractList(responseData.examsubjectdetails)
            ];

            const findSubjectDetail = (subId: number) => {
                return examSubjectWiseDetails.find(
                    (d: any) => Number(d.ismS_Id ?? d.ISMS_Id ?? d.isms_id ?? d.subjectId ?? 0) === subId
                );
            };

            const masterinst = [
                ...extractList(responseData.configuration),
                ...extractList(responseData.exm_Configuration),
                ...extractList(responseData.masterinst)
            ];

            if ((!Array.isArray(savelist) || savelist.length === 0) && (!Array.isArray(savenonsubjlist) || savenonsubjlist.length === 0)) {
                setReportData([]);
                setSubjects([]);
                setHeaderInfo({});
                toast.error('No records found');
                return;
            }

            // 1. Build Subjects List (Applicable & Non-Applicable)
            const subjMap = new Map<number, ISubject>();

            // If subjlist is provided by backend
            if (subjlist.length > 0) {
                subjlist.forEach((s: any) => {
                    const ismsId = Number(s.ismS_Id ?? s.ISMS_Id ?? s.subjectId ?? 0);
                    if (ismsId) {
                        const det = findSubjectDetail(ismsId);
                        const subjName =
                            s.ismS_SubjectName ??
                            s.ISMS_SubjectName ??
                            s.subjectName ??
                            s.subjectname ??
                            det?.ismS_SubjectName ??
                            det?.ISMS_SubjectName ??
                            `Subject ${ismsId}`;
                        const maxMarks = extractSubjectMaxMarks(s) ?? extractSubjectMaxMarks(det) ?? null;
                        subjMap.set(ismsId, {
                            ismS_Id: ismsId,
                            ismS_SubjectName: subjName,
                            eyceS_AplResultFlg: s.eyceS_AplResultFlg ?? s.EYCES_AplResultFlg ?? true,
                            type: (det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg) ? 'Grade' : 'Marks',
                            eyceS_MarksDisplayFlg: det?.eyceS_MarksDisplayFlg ?? s.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? true,
                            eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? s.EYCES_SubjectOrder ?? det?.eyceS_SubjectOrder ?? 999,
                            estmpS_MaxMarks: maxMarks != null ? parseMarks(maxMarks) : null
                        });
                    }
                });
            }

            // If nonsubjlist is provided by backend
            if (nonsubjlist.length > 0) {
                nonsubjlist.forEach((s: any) => {
                    const ismsId = Number(s.ismS_Id ?? s.ISMS_Id ?? s.subjectId ?? 0);
                    if (ismsId) {
                        const det = findSubjectDetail(ismsId);
                        const subjName =
                            s.ismS_SubjectName ??
                            s.ISMS_SubjectName ??
                            s.subjectName ??
                            s.subjectname ??
                            det?.ismS_SubjectName ??
                            det?.ISMS_SubjectName ??
                            `Subject ${ismsId}`;
                        const maxMarks = extractSubjectMaxMarks(s) ?? extractSubjectMaxMarks(det) ?? null;
                        subjMap.set(ismsId, {
                            ismS_Id: ismsId,
                            ismS_SubjectName: subjName,
                            eyceS_AplResultFlg: false,
                            type: (det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg) ? 'Grade' : 'Marks',
                            eyceS_MarksDisplayFlg: det?.eyceS_MarksDisplayFlg ?? s.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: det?.eyceS_GradeDisplayFlg ?? s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? true,
                            eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? s.EYCES_SubjectOrder ?? det?.eyceS_SubjectOrder ?? 999,
                            estmpS_MaxMarks: maxMarks != null ? parseMarks(maxMarks) : null
                        });
                    }
                });
            }

            // Fallback subject discovery from student records
            const combinedList = [...savelist, ...savenonsubjlist];
            combinedList.forEach((item: any) => {
                const sList = extractList(item.subjectsList || item.sub_list || item.subjects || item.subject_list);
                const listToIterate = sList.length > 0 ? sList : (item.ismS_Id || item.ISMS_Id ? [item] : []);
                listToIterate.forEach((s: any) => {
                    const ismsId = Number(s.ismS_Id ?? s.ISMS_Id ?? s.subjectId ?? 0);
                    if (ismsId) {
                        const det = findSubjectDetail(ismsId);
                        const existing = subjMap.get(ismsId);
                        const subjName =
                            s.ismS_SubjectName ??
                            s.ISMS_SubjectName ??
                            s.subjectName ??
                            s.subjectname ??
                            det?.ismS_SubjectName ??
                            det?.ISMS_SubjectName ??
                            existing?.ismS_SubjectName ??
                            `Subject ${ismsId}`;
                        const maxMarks =
                            extractSubjectMaxMarks(s) ??
                            extractSubjectMaxMarks(det) ??
                            existing?.estmpS_MaxMarks ??
                            null;
                        const isApplicable =
                            s.eyceS_AplResultFlg ??
                            s.EYCES_AplResultFlg ??
                            existing?.eyceS_AplResultFlg ??
                            (savenonsubjlist.some((x: any) => Number(x.ismS_Id ?? x.ISMS_Id) === ismsId) ? false : true);

                        if (!existing) {
                            subjMap.set(ismsId, {
                                ismS_Id: ismsId,
                                ismS_SubjectName: subjName,
                                eyceS_AplResultFlg: isApplicable,
                                type: (s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? det?.eyceS_GradeDisplayFlg) ? 'Grade' : 'Marks',
                                eyceS_MarksDisplayFlg: s.eyceS_MarksDisplayFlg ?? s.EYCES_MarksDisplayFlg ?? det?.eyceS_MarksDisplayFlg ?? true,
                                eyceS_GradeDisplayFlg: s.eyceS_GradeDisplayFlg ?? s.EYCES_GradeDisplayFlg ?? det?.eyceS_GradeDisplayFlg ?? true,
                                eyceS_SubjectOrder: s.eyceS_SubjectOrder ?? s.EYCES_SubjectOrder ?? det?.eyceS_SubjectOrder ?? 999,
                                estmpS_MaxMarks: maxMarks != null ? parseMarks(maxMarks) : null
                            });
                        } else {
                            if ((!existing.estmpS_MaxMarks || existing.estmpS_MaxMarks === 0) && maxMarks !== null && maxMarks > 0) {
                                existing.estmpS_MaxMarks = maxMarks;
                            }
                            if (!existing.ismS_SubjectName && subjName) {
                                existing.ismS_SubjectName = subjName;
                            }
                        }
                    }
                });
            });

            const subjectsList: ISubject[] = Array.from(subjMap.values()).sort(
                (a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999)
            );

            // 2. Group Students and Map Subject Marks in exact column order (Matching AngularJS grouping)
            const studentMap = new Map<number, any>();

            // Process savelist
            savelist.forEach((row: any) => {
                const stuId = Number(row.amsT_Id ?? row.AMST_Id ?? row.student_id ?? 0);
                if (!stuId) return;

                if (!studentMap.has(stuId)) {
                    const fullName =
                        [
                            row.amsT_FirstName ?? row.AMST_FirstName,
                            row.amsT_MiddleName ?? row.AMST_MiddleName,
                            row.amsT_LastName ?? row.AMST_LastName
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .trim() ||
                        row.studentName ||
                        row.AMST_StudentName ||
                        row.studentname ||
                        row.amsT_StudentName ||
                        'Unknown';

                    const rawRoll =
                        extractRollNo(row) ??
                        extractRollNo(selectedStudentsMap.get(stuId)) ??
                        extractRollNo(studentDetailsMap.get(stuId)) ??
                        null;

                    const rawHeld = extractClassHeld(row) ?? attendanceMap.get(stuId)?.classheld ?? null;
                    const rawAtt = extractClassAtt(row) ?? attendanceMap.get(stuId)?.classatt ?? null;

                    studentMap.set(stuId, {
                        student_id: stuId,
                        amsT_FirstName: fullName,
                        amsT_AdmNo: row.amsT_AdmNo ?? row.AMST_AdmNo ?? row.amsT_Admno ?? row.admNo ?? null,
                        amsT_RegistrationNo: row.amsT_RegistrationNo ?? row.AMST_RegistrationNo ?? row.registrationNo ?? null,
                        amaY_RollNo: rawRoll,
                        classheld: rawHeld,
                        classatt: rawAtt,
                        estmP_TotalMaxMarks: extractTotalMax(row),
                        estmP_TotalObtMarks: extractTotalObt(row),
                        estmP_Percentage: parseMarks(row.estmP_Percentage ?? row.ESTMP_Percentage ?? row.percentage),
                        estmP_TotalGrade: row.estmP_TotalGrade ?? row.ESTMP_TotalGrade ?? null,
                        estmP_SectionRank: row.estmP_SectionRank ?? row.ESTMP_SectionRank ?? null,
                        estmP_ClassRank: row.estmP_ClassRank ?? row.ESTMP_ClassRank ?? null,
                        estmP_Result: row.estmP_Result ?? row.ESTMP_Result ?? 'Pass',
                        raw_subs: new Map<number, any>()
                    });
                }

                const sItem = studentMap.get(stuId);

                // Update sItem total marks from row if previously null or 0
                const rowMax = extractTotalMax(row);
                if (rowMax !== null && rowMax > 0 && (!sItem.estmP_TotalMaxMarks || sItem.estmP_TotalMaxMarks === 0)) {
                    sItem.estmP_TotalMaxMarks = rowMax;
                }
                const rowObt = extractTotalObt(row);
                if (rowObt !== null && (!sItem.estmP_TotalObtMarks || sItem.estmP_TotalObtMarks === 0)) {
                    sItem.estmP_TotalObtMarks = rowObt;
                }

                // Update attendance if not previously found
                const rHeld = extractClassHeld(row);
                if (rHeld !== null && (sItem.classheld === null || sItem.classheld === undefined)) {
                    sItem.classheld = rHeld;
                }
                const rAtt = extractClassAtt(row);
                if (rAtt !== null && (sItem.classatt === null || sItem.classatt === undefined || sItem.classatt === 0)) {
                    sItem.classatt = rAtt;
                }

                // Update roll no if not previously found or if was 1
                const rRoll = extractRollNo(row);
                if (rRoll !== null && (sItem.amaY_RollNo === null || sItem.amaY_RollNo === undefined || sItem.amaY_RollNo === 1)) {
                    if (rRoll !== 1) sItem.amaY_RollNo = rRoll;
                }

                const sList = extractList(row.subjectsList || row.sub_list || row.subjects || row.subject_list);
                const listToProcess = sList.length > 0 ? sList : (row.ismS_Id || row.ISMS_Id ? [row] : []);

                listToProcess.forEach((sub: any) => {
                    const subId = Number(sub.ismS_Id ?? sub.ISMS_Id ?? 0);
                    if (subId) {
                        const obt =
                            sub.estM_Marks_new ??
                            sub.estM_Marks ??
                            sub.ESTM_Marks ??
                            sub.estmsS_Marks ??
                            sub.ESTMSS_Marks ??
                            sub.estmS_Marks ??
                            sub.ESTMS_Marks ??
                            sub.hema_estmpS_ObtainedMarks ??
                            sub.estmpS_ObtainedMarks ??
                            sub.ESTMPS_ObtainedMarks ??
                            sub.obtainedMarks ??
                            sub.ObtainedMarks ??
                            sub.obtainedmarks ??
                            sub.marks ??
                            sub.Marks ??
                            null;
                        const finalObt = (obt === 1000 || obt === '1000' || obt === '' || obt === '-') ? null : obt;

                        const grd =
                            sub.estM_Grade_new ??
                            sub.estM_Grade ??
                            sub.ESTM_Grade ??
                            sub.estmsS_Grade ??
                            sub.ESTMSS_Grade ??
                            sub.estmS_Grade ??
                            sub.ESTMS_Grade ??
                            sub.hema_estmpS_ObtainedGrade ??
                            sub.estmpS_ObtainedGrade ??
                            sub.ESTMPS_ObtainedGrade ??
                            sub.obtainedGrade ??
                            sub.ObtainedGrade ??
                            sub.grade ??
                            sub.Grade ??
                            null;
                        const finalGrd = (grd === 1000 || grd === '1000' || grd === '' || grd === '-') ? null : grd;

                        const det = findSubjectDetail(subId);
                        const maxM =
                            extractSubjectMaxMarks(sub) ??
                            subjMap.get(subId)?.estmpS_MaxMarks ??
                            extractSubjectMaxMarks(det) ??
                            null;

                        if (maxM !== null && maxM > 0) {
                            const sm = subjMap.get(subId);
                            if (sm && (!sm.estmpS_MaxMarks || sm.estmpS_MaxMarks === 0)) {
                                sm.estmpS_MaxMarks = maxM;
                            }
                        }

                        const existingSub = sItem.raw_subs.get(subId);
                        sItem.raw_subs.set(subId, {
                            ismS_Id: subId,
                            estmpS_MaxMarks: maxM !== null ? parseMarks(maxM) : (existingSub?.estmpS_MaxMarks ?? null),
                            estmpS_ObtainedMarks: finalObt !== null ? finalObt : (existingSub?.estmpS_ObtainedMarks ?? null),
                            estmpS_ObtainedGrade: finalGrd !== null ? finalGrd : (existingSub?.estmpS_ObtainedGrade ?? null),
                            estmpS_PassFailFlg: sub.estmpS_PassFailFlg ?? sub.ESTMPS_PassFailFlg ?? existingSub?.estmpS_PassFailFlg ?? null,
                            eyceS_MarksDisplayFlg: sub.eyceS_MarksDisplayFlg ?? sub.EYCES_MarksDisplayFlg ?? existingSub?.eyceS_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: sub.eyceS_GradeDisplayFlg ?? sub.EYCES_GradeDisplayFlg ?? existingSub?.eyceS_GradeDisplayFlg ?? true,
                            empatY_PaperTypeName: sub.empatY_PaperTypeName ?? sub.EMPATY_PaperTypeName ?? existingSub?.empatY_PaperTypeName ?? '',
                            empatY_Color: sub.empatY_Color ?? sub.EMPATY_Color ?? existingSub?.empatY_Color ?? ''
                        });
                    }
                });
            });

            // Process savenonsubjlist
            savenonsubjlist.forEach((row: any) => {
                const stuId = Number(row.amsT_Id ?? row.AMST_Id ?? row.student_id ?? 0);
                if (!stuId) return;

                if (!studentMap.has(stuId)) {
                    const fullName =
                        [
                            row.amsT_FirstName ?? row.AMST_FirstName,
                            row.amsT_MiddleName ?? row.AMST_MiddleName,
                            row.amsT_LastName ?? row.AMST_LastName
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .trim() ||
                        row.studentName ||
                        'Unknown';

                    const rawRoll =
                        extractRollNo(row) ??
                        extractRollNo(selectedStudentsMap.get(stuId)) ??
                        extractRollNo(studentDetailsMap.get(stuId)) ??
                        null;

                    const rawHeld = extractClassHeld(row) ?? attendanceMap.get(stuId)?.classheld ?? null;
                    const rawAtt = extractClassAtt(row) ?? attendanceMap.get(stuId)?.classatt ?? null;

                    studentMap.set(stuId, {
                        student_id: stuId,
                        amsT_FirstName: fullName,
                        amsT_AdmNo: row.amsT_AdmNo ?? row.AMST_AdmNo ?? null,
                        amsT_RegistrationNo: row.amsT_RegistrationNo ?? row.AMST_RegistrationNo ?? null,
                        amaY_RollNo: rawRoll,
                        classheld: rawHeld,
                        classatt: rawAtt,
                        estmP_TotalMaxMarks: extractTotalMax(row),
                        estmP_TotalObtMarks: extractTotalObt(row),
                        estmP_Percentage: parseMarks(row.estmP_Percentage ?? row.ESTMP_Percentage ?? row.percentage),
                        estmP_TotalGrade: row.estmP_TotalGrade ?? null,
                        estmP_SectionRank: row.estmP_SectionRank ?? null,
                        estmP_ClassRank: row.estmP_ClassRank ?? null,
                        estmP_Result: row.estmP_Result ?? 'Pass',
                        raw_subs: new Map<number, any>()
                    });
                }

                const sItem = studentMap.get(stuId);

                const rowMax = extractTotalMax(row);
                if (rowMax !== null && rowMax > 0 && (!sItem.estmP_TotalMaxMarks || sItem.estmP_TotalMaxMarks === 0)) {
                    sItem.estmP_TotalMaxMarks = rowMax;
                }
                const rowObt = extractTotalObt(row);
                if (rowObt !== null && (!sItem.estmP_TotalObtMarks || sItem.estmP_TotalObtMarks === 0)) {
                    sItem.estmP_TotalObtMarks = rowObt;
                }

                const rHeld = extractClassHeld(row);
                if (rHeld !== null && (sItem.classheld === null || sItem.classheld === undefined)) {
                    sItem.classheld = rHeld;
                }
                const rAtt = extractClassAtt(row);
                if (rAtt !== null && (sItem.classatt === null || sItem.classatt === undefined || sItem.classatt === 0)) {
                    sItem.classatt = rAtt;
                }

                const rRoll = extractRollNo(row);
                if (rRoll !== null && (sItem.amaY_RollNo === null || sItem.amaY_RollNo === undefined || sItem.amaY_RollNo === 1)) {
                    if (rRoll !== 1) sItem.amaY_RollNo = rRoll;
                }

                const sList = extractList(row.subjectsList || row.sub_list_e || row.sub_list || row.subjects);
                const listToProcess = sList.length > 0 ? sList : (row.ismS_Id || row.ISMS_Id ? [row] : []);

                listToProcess.forEach((sub: any) => {
                    const subId = Number(sub.ismS_Id ?? sub.ISMS_Id ?? 0);
                    if (subId) {
                        const obt =
                            sub.estM_Marks_new ??
                            sub.estM_Marks ??
                            sub.ESTM_Marks ??
                            sub.estmsS_Marks ??
                            sub.ESTMSS_Marks ??
                            sub.estmS_Marks ??
                            sub.ESTMS_Marks ??
                            sub.hema_estmpS_ObtainedMarks ??
                            sub.estmpS_ObtainedMarks ??
                            sub.ESTMPS_ObtainedMarks ??
                            sub.obtainedMarks ??
                            sub.ObtainedMarks ??
                            sub.obtainedmarks ??
                            sub.marks ??
                            sub.Marks ??
                            null;
                        const finalObt = (obt === 1000 || obt === '1000' || obt === '' || obt === '-') ? null : obt;

                        const grd =
                            sub.estM_Grade_new ??
                            sub.estM_Grade ??
                            sub.ESTM_Grade ??
                            sub.estmsS_Grade ??
                            sub.ESTMSS_Grade ??
                            sub.estmS_Grade ??
                            sub.ESTMS_Grade ??
                            sub.hema_estmpS_ObtainedGrade ??
                            sub.estmpS_ObtainedGrade ??
                            sub.ESTMPS_ObtainedGrade ??
                            sub.obtainedGrade ??
                            sub.ObtainedGrade ??
                            sub.grade ??
                            sub.Grade ??
                            null;
                        const finalGrd = (grd === 1000 || grd === '1000' || grd === '' || grd === '-') ? null : grd;

                        const det = findSubjectDetail(subId);
                        const maxM =
                            extractSubjectMaxMarks(sub) ??
                            subjMap.get(subId)?.estmpS_MaxMarks ??
                            extractSubjectMaxMarks(det) ??
                            null;

                        if (maxM !== null && maxM > 0) {
                            const sm = subjMap.get(subId);
                            if (sm && (!sm.estmpS_MaxMarks || sm.estmpS_MaxMarks === 0)) {
                                sm.estmpS_MaxMarks = maxM;
                            }
                        }

                        const existingSub = sItem.raw_subs.get(subId);
                        sItem.raw_subs.set(subId, {
                            ismS_Id: subId,
                            estmpS_MaxMarks: maxM !== null ? parseMarks(maxM) : (existingSub?.estmpS_MaxMarks ?? null),
                            estmpS_ObtainedMarks: finalObt !== null ? finalObt : (existingSub?.estmpS_ObtainedMarks ?? null),
                            estmpS_ObtainedGrade: finalGrd !== null ? finalGrd : (existingSub?.estmpS_ObtainedGrade ?? null),
                            estmpS_PassFailFlg: sub.estmpS_PassFailFlg ?? sub.ESTMPS_PassFailFlg ?? existingSub?.estmpS_PassFailFlg ?? null,
                            eyceS_MarksDisplayFlg: sub.eyceS_MarksDisplayFlg ?? existingSub?.eyceS_MarksDisplayFlg ?? true,
                            eyceS_GradeDisplayFlg: sub.eyceS_GradeDisplayFlg ?? existingSub?.eyceS_GradeDisplayFlg ?? true,
                            empatY_PaperTypeName: sub.empatY_PaperTypeName ?? existingSub?.empatY_PaperTypeName ?? '',
                            empatY_Color: sub.empatY_Color ?? existingSub?.empatY_Color ?? ''
                        });
                    }
                });
            });

            // Class-wide calculation for total max marks across all reliable signals
            let classWiseMaxMarks: number | null = null;

            // 1. Check if any student already has total max marks
            studentMap.forEach((st: any) => {
                if (!classWiseMaxMarks && st.estmP_TotalMaxMarks && Number(st.estmP_TotalMaxMarks) > 0) {
                    classWiseMaxMarks = Number(st.estmP_TotalMaxMarks);
                }
            });

            // 2. Check if any student has percentage and obtained marks: TotalMax = (Obtained / Percentage) * 100
            if (!classWiseMaxMarks) {
                studentMap.forEach((st: any) => {
                    if (!classWiseMaxMarks && st.estmP_Percentage && Number(st.estmP_Percentage) > 0) {
                        const obt = Number(st.estmP_TotalObtMarks);
                        const pct = Number(st.estmP_Percentage);
                        if (obt > 0 && pct > 0) {
                            classWiseMaxMarks = Math.round((obt / pct) * 100);
                        }
                    }
                });
            }

            // 3. Check overall response / config / masterinst / savelist[0]
            if (!classWiseMaxMarks) {
                const fallbackMax =
                    extractTotalMax(responseData) ??
                    extractTotalMax(masterinst[0]) ??
                    extractTotalMax(savelist[0]) ??
                    null;
                if (fallbackMax !== null && fallbackMax > 0) {
                    classWiseMaxMarks = fallbackMax;
                }
            }

            // 4. Sum up max marks of applicable subjects if available
            const applicableSubjectsList = Array.from(subjMap.values()).filter((s) => s.eyceS_AplResultFlg !== false);
            if (!classWiseMaxMarks) {
                let sumSubj = 0;
                let countWithMax = 0;
                applicableSubjectsList.forEach((sub) => {
                    const m = Number(sub.estmpS_MaxMarks);
                    if (!isNaN(m) && m > 0) {
                        sumSubj += m;
                        countWithMax++;
                    }
                });
                if (sumSubj > 0 && countWithMax === applicableSubjectsList.length) {
                    classWiseMaxMarks = sumSubj;
                }
            }

            // 5. Exam master marks: EME_ExamMarks / emE_ExamMarks
            if (!classWiseMaxMarks) {
                const examMarks = parseMarks(
                    responseData.emE_ExamMarks ??
                    responseData.EME_ExamMarks ??
                    responseData.examMarks ??
                    responseData.ExamMarks ??
                    savelist[0]?.emE_ExamMarks ??
                    savelist[0]?.EME_ExamMarks ??
                    savelist[0]?.emE_TotalMarks ??
                    savelist[0]?.EME_TotalMarks ??
                    null
                );
                if (examMarks && examMarks > 0) {
                    if (applicableSubjectsList.length > 1 && examMarks <= 100) {
                        classWiseMaxMarks = examMarks * applicableSubjectsList.length;
                    } else {
                        classWiseMaxMarks = examMarks;
                    }
                }
            }

            // 6. Max obtained estimation if DB has no setup
            if (!classWiseMaxMarks && applicableSubjectsList.length > 0) {
                let maxSingleSubjectObt = 0;
                studentMap.forEach((st: any) => {
                    st.raw_subs?.forEach((sub: any) => {
                        if (subjMap.get(sub.ismS_Id)?.eyceS_AplResultFlg !== false) {
                            const o = Number(sub.estmpS_ObtainedMarks);
                            if (!isNaN(o) && o > maxSingleSubjectObt) {
                                maxSingleSubjectObt = o;
                            }
                        }
                    });
                });
                if (maxSingleSubjectObt > 0) {
                    const subjectBase = maxSingleSubjectObt <= 25 ? 25 : maxSingleSubjectObt <= 50 ? 50 : 100;
                    classWiseMaxMarks = subjectBase * applicableSubjectsList.length;
                }
            }

            // Distribute per-subject max marks if subjects were missing it
            if (classWiseMaxMarks && applicableSubjectsList.length > 0) {
                const perSubMax = Math.round(classWiseMaxMarks / applicableSubjectsList.length);
                applicableSubjectsList.forEach((s) => {
                    if (!s.estmpS_MaxMarks || s.estmpS_MaxMarks === 0) {
                        s.estmpS_MaxMarks = perSubMax;
                    }
                });
            }

            // Post-process studentMap with studentDetailsMap, selectedStudentsMap & attendanceMap
            studentMap.forEach((sItem: any, stuId: number) => {
                // Attendance merge
                const attObj = attendanceMap.get(stuId);
                if (attObj) {
                    if (sItem.classheld === null || sItem.classheld === undefined) {
                        sItem.classheld = attObj.classheld;
                    }
                    if (sItem.classatt === null || sItem.classatt === undefined || sItem.classatt === 0) {
                        if (attObj.classatt !== null && attObj.classatt !== undefined) {
                            sItem.classatt = attObj.classatt;
                        }
                    }
                }

                // Roll No merge
                const fromDetails = studentDetailsMap.get(stuId);
                const fromSel = selectedStudentsMap.get(stuId);
                const betterRoll = extractRollNo(fromDetails) ?? extractRollNo(fromSel);
                if (betterRoll !== null && (sItem.amaY_RollNo === null || sItem.amaY_RollNo === undefined || sItem.amaY_RollNo === 1)) {
                    if (betterRoll !== 1) {
                        sItem.amaY_RollNo = betterRoll;
                    }
                }
            });

            // Ensure roll numbers are not all duplicate 1s (common IVRM default when roll numbers not generated)
            const validRolls = Array.from(studentMap.values())
                .map((s: any) => Number(s.amaY_RollNo))
                .filter((r) => !isNaN(r) && r > 0);
            const allAreOne = validRolls.length > 1 && validRolls.every((r) => r === 1);
            const hasDuplicateOrMissingRolls =
                validRolls.length !== studentMap.size ||
                new Set(validRolls).size !== studentMap.size ||
                allAreOne;

            if (hasDuplicateOrMissingRolls) {
                let resolvedDistinct = false;
                Array.from(studentMap.values()).forEach((s: any) => {
                    const fromSel = selectedStudentsMap.get(s.student_id);
                    const fromDet = studentDetailsMap.get(s.student_id);
                    const r = extractRollNo(fromSel) ?? extractRollNo(fromDet);
                    if (r !== null && r !== 1 && r !== '1') {
                        s.amaY_RollNo = r;
                        resolvedDistinct = true;
                    }
                });

                if (!resolvedDistinct && studentMap.size > 1) {
                    let seq = 1;
                    studentMap.forEach((s: any) => {
                        s.amaY_RollNo = seq++;
                    });
                }
            }

            // Convert to ICumulativeReport[] with dynamic total marks calculation
            const formatted: ICumulativeReport[] = Array.from(studentMap.values()).map((s: any) => {
                const rawSubsList = Array.from(s.raw_subs.values());

                // Calculate total max marks and total obtained marks from subject marks if missing or 0
                let calcMax = 0;
                let calcObt = 0;
                let hasValidObtMarks = false;
                let hasValidMaxMarks = false;

                rawSubsList.forEach((sub: any) => {
                    const isApplicable = subjMap.get(sub.ismS_Id)?.eyceS_AplResultFlg !== false;
                    if (isApplicable) {
                        const subMax = parseMarks(sub.estmpS_MaxMarks) ?? parseMarks(subjMap.get(sub.ismS_Id)?.estmpS_MaxMarks);
                        if (subMax !== null && subMax > 0) {
                            calcMax += subMax;
                            hasValidMaxMarks = true;
                        }
                        if (sub.estmpS_PassFailFlg !== 'AB') {
                            const subObt = parseMarks(sub.estmpS_ObtainedMarks);
                            if (subObt !== null) {
                                calcObt += subObt;
                                hasValidObtMarks = true;
                            }
                        }
                    }
                });

                // Determine final total max marks
                let finalTotalMax: number | string | null = s.estmP_TotalMaxMarks;
                if ((finalTotalMax === null || finalTotalMax === undefined || Number(finalTotalMax) === 0) && hasValidMaxMarks && calcMax > 0) {
                    finalTotalMax = calcMax;
                }

                if ((finalTotalMax === null || finalTotalMax === undefined || Number(finalTotalMax) === 0) && classWiseMaxMarks) {
                    finalTotalMax = classWiseMaxMarks;
                }

                // If still missing or 0, check overall response max marks or first row max
                if (finalTotalMax === null || finalTotalMax === undefined || Number(finalTotalMax) === 0) {
                    const fallbackMax =
                        extractTotalMax(responseData) ??
                        extractTotalMax(masterinst[0]) ??
                        extractTotalMax(savelist[0]) ??
                        null;
                    if (fallbackMax !== null && fallbackMax > 0) {
                        finalTotalMax = fallbackMax;
                    }
                }

                // Determine final total obtained marks
                let finalTotalObt: number | string | null = s.estmP_TotalObtMarks;
                if ((finalTotalObt === null || finalTotalObt === undefined || Number(finalTotalObt) === 0) && hasValidObtMarks) {
                    finalTotalObt = calcObt;
                }

                // Percentage calculation
                let percentage = s.estmP_Percentage;
                if (
                    (percentage === null || percentage === undefined || Number(percentage) === 0) &&
                    finalTotalMax &&
                    Number(finalTotalMax) > 0 &&
                    finalTotalObt !== null &&
                    finalTotalObt !== undefined
                ) {
                    percentage = Number(((Number(finalTotalObt) / Number(finalTotalMax)) * 100).toFixed(2));
                }

                let finalHeld = s.classheld;
                let finalAtt = s.classatt;
                // If neither held nor attended has a non-zero count, sanitize to null so '-' displays instead of '0'
                if (
                    (finalHeld === null || finalHeld === undefined || Number(finalHeld) === 0) &&
                    (finalAtt === null || finalAtt === undefined || Number(finalAtt) === 0)
                ) {
                    finalHeld = null;
                    finalAtt = null;
                } else if (finalHeld === null && (finalAtt === 0 || finalAtt === '0')) {
                    finalAtt = null;
                }

                return {
                    amsT_FirstName: s.amsT_FirstName,
                    amaY_RollNo: s.amaY_RollNo,
                    amsT_AdmNo: s.amsT_AdmNo,
                    amsT_RegistrationNo: s.amsT_RegistrationNo,
                    sub_list: rawSubsList,
                    estmP_TotalMaxMarks: finalTotalMax,
                    estmP_TotalObtMarks: finalTotalObt,
                    estmP_Percentage: percentage,
                    estmP_TotalGrade: s.estmP_TotalGrade,
                    estmP_Result: s.estmP_Result,
                    estmP_ClassRank: s.estmP_ClassRank,
                    estmP_SectionRank: s.estmP_SectionRank,
                    classheld: finalHeld,
                    classatt: finalAtt
                };
            });

            const first = { ...savelist[0], ...institudtion_data };
            const instNameFromPromise =
                Array.isArray(responseData.instname) && responseData.instname.length > 0
                    ? responseData.instname[0].mI_Name
                    : institudtion_data?.mI_Name;

            const header: Partial<IReportHeader> = {
                mI_Name: instNameFromPromise || institudtion_data?.mI_Name,
                yr: first?.asmaY_Year ?? '',
                cla: first?.asmcL_ClassName ?? '',
                sec: first?.asmC_SectionName ?? '',
                exmmid: first?.emE_ExamName ?? ''
            };

            const cfg = Array.isArray(masterinst) && masterinst.length > 0 ? masterinst[0] : {};

            setColumnFlags({
                admno: cfg.exmConfig_AdmnoColumnDisplay ?? true,
                regno: cfg.exmConfig_RegnoColumnDisplay ?? false,
                rollno: cfg.exmConfig_RollnoColumnDisplay ?? true,
                classrank: payload.classrank === true || payload.classrank === '1',
                sectionrank: payload.sectionrank === true || payload.sectionrank === '1',
                attendancedispaly: payload.attendancedispaly === true || payload.attendancedispaly === '1',
                applicable: payload.applicableFlag === '1' || payload.applicableFlag === true || payload.applicableFlag === undefined,
                nonapplicable: payload.nonApplicableFlag === '1' || payload.nonApplicableFlag === true,
                readmit: payload.Percentage_Flag === true || payload.Percentage_Flag === '1',
                grdaeDisply: payload.Grade_Flag === true || payload.Grade_Flag === '1',
                marksdisplay: payload.Marks_Flag === true || payload.Marks_Flag === '1',
                gradecolm: payload.OverallGrade_Flag === true || payload.OverallGrade_Flag === '1',
                status: payload.Status_Flag === true || payload.Status_Flag === '1'
            });

            setSubjects(subjectsList);
            setReportData(formatted);
            setIsReportVisible(true);
            setHeaderInfo(header);
            toast.success('Report generated successfully');
        } catch (e: any) {
            console.error('Report error:', e);
            toast.error(e?.message || 'Error generating report');
        }
    };

    useEffect(() => {
        if (isReportVisible && printRef.current) {
            printRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isReportVisible]);

    const handlePrint = () => window.print();

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <CollapsibleSection title='Cumulative Report' defaultOpen>
                <CumulativeReportForm onSuccess={handleReportSuccess} apiSearchParams={searchParams} />
            </CollapsibleSection>

            {isReportVisible && (
                <CollapsibleSection title='Grid View' defaultOpen>
                    <div ref={printRef}>
                        {/* Print View */}
                        <CumulativeReportPrintView
                            reportData={reportData}
                            institution={institution || ({} as any)}
                            subjects={subjects}
                            headerInfo={headerInfo}
                            fontSize='medium'
                            columnFlags={columnFlags}
                        />

                        {/* Screen View */}
                        <CumulativeReportGridView
                            reportData={reportData}
                            institution={institution}
                            subjects={subjects}
                            headerInfo={headerInfo}
                            columnFlags={columnFlags}
                            onPrint={handlePrint}
                        />

                        <div className='mt-6 flex justify-end print:hidden'>
                            <CumulativeReportExcel
                                reportData={reportData}
                                subjects={subjects}
                                headerInfo={headerInfo}
                                columnFlags={columnFlags}
                            />
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

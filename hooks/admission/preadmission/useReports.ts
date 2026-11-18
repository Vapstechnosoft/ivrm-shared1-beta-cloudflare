import { ADMISSION_QUERY_KEYS, PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getDobCertificateDetails,
    getDobCertificateLoadData,
    getDobCertificateStudentList
} from '@/server/admission/preadmission/reports/DOBcertificate';
import {
    getAttendance100Class,
    getAttendance100InitialDetails,
    getAttendance100Report,
    getAttendance100Section,
    sendShortageAlert
} from '@/server/admission/preadmission/reports/attendance_report_100';
import {
    generateQRCodeCertificate,
    getAttendanceAbsentInitialDetails,
    getAttendanceAbsentSmsReport,
    getAttendanceReport,
    getCharacterCertficateReport,
    getMonthEndReport,
    getPreAdmissionEmailSmsReport,
    getPreAdmissionMonthEndReport,
    getPreAdmissionRegistrationReport,
    getStudentAttendanceReport,
    getStudentTcReport,
    getStudyCertficateReport,
    getclasswiseStudentDetails,
    sendAttendanceAbsentEmail,
    sendAttendanceAbsentNotice,
    sendAttendanceAbsentOTP,
    sendAttendanceAbsentSms,
    verifyAttendanceAbsentOTP
} from '@/server/admission/preadmission/reports/report';
import {
    getScheduleList,
    getScheduleReportDetails,
    getScheduleReportInitialDetails,
    sendScheduleMail
} from '@/server/admission/preadmission/reports/schedule_report';
import { getStudentBirthdayReportDetails } from '@/server/admission/preadmission/reports/student_birthday_report';
import { addOrUpdateStudentCountReport, getParentDashboardDetails } from '@/server/admission/preadmission/reports/student_count_report';
import {
    type ElectiveItem,
    GetClassTeacherReport,
    GetDateOfBirth,
    GetStudentYearlyAttendance,
    getAdmissionRegister,
    getPreadmissionClassDropdown1,
    getStudentSearch,
    getTotalStrengthReport,
    getadmissionStudentsDropdown
} from '@/server/admission/preadmission/reports/student_yearly_attendance';
import {
    getStudyCertificateAcademicYearChange,
    getStudyCertificateConductDetails,
    getStudyCertificateDetails,
    getStudyCertificateLoadData,
    getStudyCertificateQR,
    getStudyCertificateSearchFilter,
    getStudyCertificateSearchFilterSRKVS,
    getStudyCertificateStudentList
} from '@/server/admission/preadmission/reports/study_certificate';
import type { ApiSearchparams } from '@/types';
import type {
    IScheduleListResponse,
    IScheduleReportDetailsResponse,
    IScheduleReportInitialDetailsResponse
} from '@/types/admission/preadmission/reports';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStudentCountReport = (filterPayload?: any, searchParams?: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT, filterPayload ?? {}, searchParams ?? {}],
            queryFn: async () =>
                addOrUpdateStudentCountReport(
                    filterPayload || {
                        report_type: 1,
                        type: 'between',
                        from_date: new Date().toISOString(),
                        to_date: new Date().toISOString(),
                        asmay_id: 0,
                        asmcl_id: 0
                    },
                    searchParams
                ),
            staleTime: 0,
            enabled: enabled
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STUDENT_COUNT_REPORT]
            });
        }
    };
};

export const useParentDashboard = (asmay_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD, asmay_id],
            queryFn: async () => getParentDashboardDetails(asmay_id),
            staleTime: 0,
            enabled: !!asmay_id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.PARENTS_DASHBOARD]
            });
        }
    };
};
export const useStudentTcReport = (data: any, searchParams: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDENT_TC_REPORT, data, searchParams],
            queryFn: async () => getStudentTcReport(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_TC_REPORT]
            });
        }
    };
};
export const useMonthEndReport = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.MONTH_END_REPORT, data],
            queryFn: async () => getMonthEndReport(data),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.MONTH_END_REPORT]
            });
        }
    };
};
export const usePreAdmissionMonthEndReport = (data: any, searchParams: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_MONTH_END_REPORT, data, searchParams],
            queryFn: async () => getPreAdmissionMonthEndReport(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_MONTH_END_REPORT]
            });
        }
    };
};
export const usePreAdmissionRegistrationReport = (
    academicIdParam: number,
    fromDateParam: string | null,
    toDateParam: string | null,
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT,
                academicIdParam,
                fromDateParam,
                toDateParam,
                searchParams ?? {}
            ],
            queryFn: async () =>
                getPreAdmissionRegistrationReport(
                    {
                        academicYearId: academicIdParam,
                        fromDate: fromDateParam,
                        toDate: toDateParam
                    },
                    searchParams
                ),
            staleTime: 0,
            refetchOnWindowFocus: false
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT]
            })
    };
};
export const usePreAdmissionEmailSmsReport = (
    academicIdParam: number,
    fromDateParam: string | null,
    toDateParam: string | null,
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT,
                academicIdParam,
                fromDateParam,
                toDateParam,
                searchParams ?? {}
            ],
            queryFn: async () =>
                getPreAdmissionEmailSmsReport(
                    {
                        academicYearId: academicIdParam,
                        fromDate: fromDateParam,
                        toDate: toDateParam
                    },
                    searchParams
                ),
            staleTime: 0,
            refetchOnWindowFocus: false
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.PRE_ADMISSION_REGISTRATION_REPORT]
            })
    };
};
export const useStudentYearlyAttendance = (
    ASMAY_Id: number,
    ASMCL_Id: number,
    ASMS_Id: number | undefined,
    searchParams?: ApiSearchparams,
    enabled = true
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_STUDENT_LISTS, ASMAY_Id, ASMCL_Id, ASMS_Id, searchParams ?? {}],
            queryFn: async () => GetStudentYearlyAttendance(ASMAY_Id, ASMCL_Id, ASMS_Id ?? 0, searchParams),
            staleTime: 0,
            enabled: enabled && !!ASMAY_Id && ASMS_Id !== undefined && !!ASMCL_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_STUDENT_LISTS]
            });
        }
    };
};

export const useClassTeacherReport = (ASMAY_Id: number, flag: number, amcId?: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_CLASS_TEACHER_REPORT, ASMAY_Id, flag, amcId, searchParams ?? {}],
            queryFn: async () => GetClassTeacherReport(ASMAY_Id, flag, amcId, searchParams),
            staleTime: 0,
            enabled: !!ASMAY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_CLASS_TEACHER_REPORT]
            });
        }
    };
};

export const useTotalStrengthReport = (
    asmay_Id: number,
    asmcL_Id: number,
    amC_Id: number,
    statusFlag: string,
    amsT_SOL: string,
    withtc: string,
    withdeactive: string,
    electivearray: ElectiveItem[]
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT,
                asmay_Id,
                asmcL_Id,
                amC_Id,
                statusFlag,
                amsT_SOL,
                withtc,
                withdeactive,
                electivearray
            ],
            queryFn: () =>
                getTotalStrengthReport(asmay_Id, asmcL_Id, amC_Id, statusFlag, amsT_SOL, withtc, withdeactive, electivearray, {
                    page_size: 100000
                }),
            enabled: asmay_Id > 0 && statusFlag !== '' && amsT_SOL !== '' && withtc !== '' && withdeactive !== '',
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT]
            });
        }
    };
};

export const useStudentSearch = (
    stuStatus: string,
    field: string,
    Operator: string,
    value: string,
    condition: string,
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDENT_SEARCH, stuStatus, field, Operator, value, condition, searchParams ?? {}],
            queryFn: async () => getStudentSearch(stuStatus, field, Operator, value, condition, searchParams),
            staleTime: 0,
            enabled: !!stuStatus && !!field && !!Operator && !!value && !!condition
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_SEARCH]
            });
        }
    };
};
export const useStudyCertificateReport = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, data],
            queryFn: async () => getStudyCertficateReport(data),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT]
            });
        }
    };
};
export const useCharacterCertificateReport = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.CHARACTER_CERTIFICATE_REPORT, data],
            queryFn: async () => getCharacterCertficateReport(data),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.CHARACTER_CERTIFICATE_REPORT]
            });
        }
    };
};
export const useGenerateQRCodeCertificate = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.GENERATE_QR_CODE_CERTIFICATE, data],
            queryFn: async () => generateQRCodeCertificate(data),
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.GENERATE_QR_CODE_CERTIFICATE]
            });
        }
    };
};
export const useAdmissionRegister = (ASMAY_Id: number, AttendanceType: number, payload?: any, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_REGISTER, ASMAY_Id, AttendanceType, payload, searchParams ?? {}],
            queryFn: async () => getAdmissionRegister(ASMAY_Id, AttendanceType, payload, searchParams),
            staleTime: 0,
            enabled: !!ASMAY_Id && !!AttendanceType && !!payload
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_REGISTER]
            });
        }
    };
};
export const ClasswiseStudentDetails = (
    asmaY_Id: number,
    studentScope: number,
    fmcC_Id: number,

    payload?: any,
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.CLASS_WISE_STUDENT_REPORT, asmaY_Id, fmcC_Id, studentScope, payload, searchParams ?? {}],
            queryFn: async () => getclasswiseStudentDetails(asmaY_Id, fmcC_Id, studentScope, payload, searchParams),
            staleTime: 0,
            enabled: !!payload
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.CLASS_WISE_STUDENT_REPORT]
            });
        }
    };
};

export const useadmissionStudentsDropdown = (ASMAY_Id?: number, ASMCL_Id?: number, ASMS_Id?: number, studentStatus?: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.ADMISSION_STUDENTS_DROPDOWN,
                ASMAY_Id ?? ({} as number),
                ASMCL_Id ?? ({} as number),
                ASMS_Id ?? ({} as number),
                studentStatus ?? ''
            ],
            queryFn: async () => {
                if (!ASMAY_Id || Number(ASMAY_Id) <= 0) {
                    return { data: [] } as any;
                }
                return await getadmissionStudentsDropdown(Number(ASMAY_Id), Number(ASMCL_Id), Number(ASMS_Id), studentStatus ?? 'S');
            },
            staleTime: 0,
            enabled: Boolean(ASMAY_Id && Number(ASMAY_Id) > 0 && ASMCL_Id && Number(ASMCL_Id) > 0 && ASMS_Id && Number(ASMS_Id) > 0)
        }),
        refetchAll: (id?: number) => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_STUDENTS_DROPDOWN, id ?? {}]
            });
        }
    };
};
export const useAttendanceAbsentSmsReport = (
    asmaY_Id: number,
    from_date: string,
    frequency: string,
    amc_id = 0,
    att_type = 'D',
    searchParams?: ApiSearchparams
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_ABSENT_REPORT, asmaY_Id, from_date, frequency, amc_id, att_type, searchParams ?? {}],
            queryFn: async () => getAttendanceAbsentSmsReport(asmaY_Id, from_date, frequency, amc_id, att_type, searchParams),
            staleTime: 0,
            enabled: !!asmaY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_ABSENT_REPORT]
            });
        }
    };
};

export const useAttendanceAbsentInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_ABSENT_REPORT, 'initial-details'],
        queryFn: async () => getAttendanceAbsentInitialDetails(),
        staleTime: Number.POSITIVE_INFINITY
    });
};

export const useAttendanceAbsentCommunication = () => {
    const sendSmsMutation = useMutation({
        mutationFn: sendAttendanceAbsentSms
    });

    const sendEmailMutation = useMutation({
        mutationFn: sendAttendanceAbsentEmail
    });

    const sendNoticeMutation = useMutation({
        mutationFn: sendAttendanceAbsentNotice
    });

    const sendOtpMutation = useMutation({
        mutationFn: sendAttendanceAbsentOTP
    });

    const verifyOtpMutation = useMutation({
        mutationFn: verifyAttendanceAbsentOTP
    });

    return {
        sendSms: sendSmsMutation,
        sendEmail: sendEmailMutation,
        sendNotice: sendNoticeMutation,
        sendOtp: sendOtpMutation,
        verifyOtp: verifyOtpMutation
    };
};
export const useAttendanceReport = (asmaY_Id: number, from_date: string, frequency: string, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT, asmaY_Id, from_date, frequency, searchParams ?? {}],
            queryFn: async () => getAttendanceReport(asmaY_Id, from_date, frequency, searchParams),
            staleTime: 0,
            enabled: !!asmaY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT]
            });
        }
    };
};
export const useStudentAttendanceReport = (
    asmaY_Id: number,
    classId: number,
    SectionId: number,
    studentId: number | undefined,
    monthId: number | undefined,
    monthDateWise: number | undefined,
    fromDate: Date | null | undefined,
    toDate: Date | null | undefined,
    dailyDate: Date | null | undefined,
    selectionMode: number,
    studentStatus: number,
    searchParams?: ApiSearchparams,
    enabled = true
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                ADMISSION_QUERY_KEYS.STUDENT_ATTENDANCE_REPORT,
                asmaY_Id,
                classId,
                SectionId,
                studentId,
                monthId,
                monthDateWise,
                fromDate,
                toDate,
                dailyDate,
                selectionMode,
                studentStatus,
                searchParams ?? {}
            ],
            queryFn: async () =>
                getStudentAttendanceReport(
                    asmaY_Id,
                    classId,
                    SectionId,
                    studentId,
                    monthId,
                    monthDateWise,
                    fromDate,
                    toDate,
                    dailyDate,
                    selectionMode,
                    studentStatus,
                    searchParams
                ),
            staleTime: 0,
            enabled: enabled && !!asmaY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_ATTENDANCE_REPORT]
            });
        }
    };
};

export const useDateOfBirth = (
    ASMAY_Id: number,
    ASMCL_Id: number,
    ASMS_Id: number,
    AMST_Id: number,
    AMC_Id: number,
    searchParams?: ApiSearchparams,
    enabled = true
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT, ASMAY_Id, ASMCL_Id, ASMS_Id, AMST_Id, AMC_Id, searchParams ?? {}],
            queryFn: async () => GetDateOfBirth(ASMAY_Id, ASMCL_Id, ASMS_Id, AMST_Id, AMC_Id, searchParams),
            staleTime: 0,
            enabled: enabled && !!ASMAY_Id && !!ASMS_Id && ASMCL_Id !== undefined
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT]
            });
        }
    };
};

export const usePreadmissionClassDropdown1 = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_CLASS_DROPDOWN1],
            queryFn: async () => getPreadmissionClassDropdown1(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_CLASS_DROPDOWN1]
            });
        }
    };
};

export const useStudyCertificateLoadData = (enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-load'],
            queryFn: async () => getStudyCertificateLoadData(),
            staleTime: 0,
            enabled: enabled
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-load']
            });
        }
    };
};

export const useStudyCertificateStudentList = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-student-list', data],
            queryFn: async () => getStudyCertificateStudentList(data),
            staleTime: 0,
            enabled: enabled && !!data.ASMAY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-student-list']
            });
        }
    };
};

export const useStudyCertificateDetails = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-details', data],
            queryFn: async () => getStudyCertificateDetails(data),
            staleTime: 0,
            enabled: enabled && !!data.ASMAY_Id && !!data.AMST_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-details']
            });
        }
    };
};

export const useStudyCertificateDetailsMutation = () => {
    return useMutation({
        mutationFn: getStudyCertificateDetails
    });
};

export const useStudyCertificateAcademicYearChange = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-academic-year-change', data],
            queryFn: async () => getStudyCertificateAcademicYearChange(data),
            staleTime: 0,
            enabled: enabled && !!data.ASMAY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-academic-year-change']
            });
        }
    };
};

export const useStudyCertificateConductDetails = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-conduct-details', data],
            queryFn: async () => getStudyCertificateConductDetails(data),
            staleTime: 0,
            enabled: enabled && !!data.ASMAY_Id && !!data.AMST_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-conduct-details']
            });
        }
    };
};

export const useStudyCertificateConductDetailsMutation = () => {
    return useMutation({
        mutationFn: getStudyCertificateConductDetails
    });
};

export const useStudyCertificateSearchFilterSRKVS = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-search-filter-srkvs', data],
            queryFn: async () => getStudyCertificateSearchFilterSRKVS(data),
            staleTime: 0,
            enabled: enabled && !!data.ASMAY_Id && !!data.ASMCL_Id && !!data.searchfilter
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-search-filter-srkvs']
            });
        }
    };
};

export const useStudyCertificateSearchFilter = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-search-filter', data],
            queryFn: async () => getStudyCertificateSearchFilter(data),
            staleTime: 0,
            enabled: enabled && !!data.ASMAY_Id && (data.allorindid === 'A' || !!data.ASMCL_Id) && !!data.searchfilter
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-search-filter']
            });
        }
    };
};

export const useStudyCertificateSearchFilterMutation = () => {
    return useMutation({
        mutationFn: getStudyCertificateSearchFilter
    });
};

export const useStudyCertificateQR = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-qr', data],
            queryFn: async () => getStudyCertificateQR(data),
            staleTime: 0,
            enabled: enabled
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDY_CERTIFICATE_REPORT, 'study-certificate-qr']
            });
        }
    };
};
export const useStudyCertificateQRMutation = () => {
    return useMutation({
        mutationFn: getStudyCertificateQR
    });
};

export const useStudentBirthdayReportDetails = (data: any, searchParams?: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT, 'details', data, searchParams ?? {}],
            queryFn: async () => getStudentBirthdayReportDetails(data, searchParams),
            staleTime: 0,
            enabled: enabled && !!data
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT, 'details']
            });
        }
    };
};

export const useAttendance100InitialDetails = (data: any, enabled = true) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT, 'initial-details-100', data],
        queryFn: async () => getAttendance100InitialDetails(data),
        staleTime: 0,
        enabled: enabled && !!data
    });
};

export const useAttendance100Class = (data: any, enabled = true) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT, 'class-100', data],
        queryFn: async () => getAttendance100Class(data),
        staleTime: 0,
        enabled: enabled && !!data?.ASMAY_Id
    });
};

export const useAttendance100Section = (data: any, enabled = true) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT, 'section-100', data],
        queryFn: async () => getAttendance100Section(data),
        staleTime: 0,
        enabled: enabled && !!data?.ASMAY_Id && !!data?.ASMCL_Id
    });
};

export const useAttendance100Report = (data: any, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT, 'details-100', data],
            queryFn: async () => getAttendance100Report(data),
            staleTime: 0,
            enabled: enabled && !!data
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ATTENDANCE_REPORT, 'details-100']
            });
        }
    };
};

export const useAttendance100ShortageAlert = () => {
    return useMutation({
        mutationFn: async (asmaY_Id: number) => sendShortageAlert(asmaY_Id)
    });
};

export const useDobCertificateLoadData = (pageIdOrEnabled: number | boolean = true, enabledArg = true) => {
    // Backward compatible:
    // - old usage: useDobCertificateLoadData(pageId, enabled)
    // - new usage: useDobCertificateLoadData(enabled)
    const enabled = typeof pageIdOrEnabled === 'boolean' ? pageIdOrEnabled : enabledArg;
    const pageId = typeof pageIdOrEnabled === 'number' ? pageIdOrEnabled : 1;
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT, 'load-data', pageId],
        queryFn: async () => {
            const res = await getDobCertificateLoadData();
            return res ?? ({ success: false, message: 'No response', data: null } as any);
        },
        staleTime: 0,
        enabled: enabled
    });
};

export const useDobCertificateStudentList = (data: any, enabled = true) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT, 'student-list', data],
        queryFn: async () => {
            const res = await getDobCertificateStudentList(data);
            return res ?? ({ success: false, message: 'No response', data: null } as any);
        },
        staleTime: 0,
        enabled: enabled && !!data.ASMAY_Id
    });
};

export const useDobCertificateDetails = (data: any, enabled = true) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.DATE_OF_BIRTH_REPORT, 'student-details', data],
        queryFn: async () => {
            const res = await getDobCertificateDetails(data);
            return res ?? ({ success: false, message: 'No response', data: null } as any);
        },
        staleTime: 0,
        enabled: enabled && !!data.ASMAY_Id && !!data.ASMCL_Id && !!data.ASMC_Id && data.AMST_Id !== undefined && data.AMST_Id !== null
    });
};

export const useDobCertificateDetailsMutation = () => {
    return useMutation({
        mutationFn: getDobCertificateDetails
    });
};

export const useScheduleReportInitialDetails = (enabled = true) => {
    return useQuery<IScheduleReportInitialDetailsResponse>({
        queryKey: [PREADMISSION_QUERY_KEYS.SCHEDULE_REPORT, 'initial-details'],
        queryFn: async () => {
            const res = await getScheduleReportInitialDetails();
            return res.data as IScheduleReportInitialDetailsResponse;
        },
        staleTime: 0,
        enabled: enabled
    });
};

export const useScheduleList = (data: any, enabled = true) => {
    return useQuery<IScheduleListResponse>({
        queryKey: [PREADMISSION_QUERY_KEYS.SCHEDULE_LIST, data],
        queryFn: async () => {
            const res = await getScheduleList(data);
            return res.data as IScheduleListResponse;
        },
        staleTime: 0,
        enabled: enabled && !!data.oralwrittenscheduleflag
    });
};

export const useScheduleReport = (data: any, searchParams?: ApiSearchparams, enabled = true) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery<IScheduleReportDetailsResponse>({
            queryKey: [PREADMISSION_QUERY_KEYS.SCHEDULE_REPORT, 'details', data, searchParams ?? {}],
            queryFn: async () => {
                const res = await getScheduleReportDetails(data);
                return res.data as IScheduleReportDetailsResponse;
            },
            staleTime: 0,
            enabled: enabled && !!data,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.SCHEDULE_REPORT]
            });
        }
    };
};

export const useSendScheduleMail = () => {
    return useMutation({
        mutationFn: sendScheduleMail
    });
};

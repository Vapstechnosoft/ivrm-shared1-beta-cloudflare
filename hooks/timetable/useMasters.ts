import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getBifurcationConstraintsDetails,
    getSectioDropdownBifurcationConstraints,
    getStaffDropdownBifurcationConstraints,
    getSubjectDropdownBifurcationConstraints
} from '@/server/timetable/constraints/bifurcationconstraints';
import { getConsecutiveConstraintsDetails } from '@/server/timetable/constraints/consecutive';
import { getBreakTimeSettingsDetails } from '@/server/timetable/masters/breaktimesettings';
import {
    getCategoryClassMappingDetails,
    getTimeTableAcademicYearDetails,
    getTimeTableCategoryDropDownDetails,
    getuseTimeTableClassDropdownDataDetails
} from '@/server/timetable/masters/categoryclassmapping';
import { getMasterCategoryDetails } from '@/server/timetable/masters/masterCategory';
import {
    getMasterBuilding,
    getMasterBuildingDetails,
    getMasterBuildingclasssectionDetails,
    getMasterClass,
    getMasterSection
} from '@/server/timetable/masters/masterbuilding';
import { getMasterDayDetails } from '@/server/timetable/masters/masterday';
import {
    getAcademicYearDropDropDownMasterDayClasswise,
    getCategoryDropDownMasterDayClasswise,
    getClassDropDownMasterDayClasswise,
    getDayDropDownMasterDayClasswise,
    getMasterDayClassWiseDetails
} from '@/server/timetable/masters/masterdayclasswise';
import { CategorydropDownData, getMasterPeriodDetails } from '@/server/timetable/masters/masterperiod';
import { getAllPeriodDetails, getPeriodAllocationmasterPeriodGrid } from '@/server/timetable/masters/periodallocation';
import {
    EditPeriodDistribution,
    getAcademicYearPeriodDistrubution,
    getCategoryPeriodDistrubution,
    getClassPeriodDistrubution,
    getPeriodDistributionDetails,
    getPeriodDistributionEditDetails,
    getPeriodDistributionViewData,
    getPeriodDropdown,
    getSectionPeriodDistrubution,
    getStaffPeriodDistrubution,
    getSubjectPeriodDistrubution
} from '@/server/timetable/masters/perioddistribution';
import { getAllPeriodTimeSettings } from '@/server/timetable/masters/periodtimesetting';
import { getStaffAbbreviationDetails, getStaffDropDown } from '@/server/timetable/masters/staffabbreviation';
import { getSubjectAbbreviationDetails, getsubjectDropDown } from '@/server/timetable/masters/subjectabbreviation';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterDay = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_DAY, searchParams ?? {}],
            queryFn: async () => getMasterDayDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_DAY]
            });
        }
    };
};

export const useMasterBuilding = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING, searchParams ?? {}],
            queryFn: async () => getMasterBuildingDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING]
            });
        }
    };
};

export const useStaffAbbreviation = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_ABBREVIATION, searchParams ?? {}],
            queryFn: async () => getStaffAbbreviationDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_ABBREVIATION]
            });
        }
    };
};

export const useSSubjectAbbreviation = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_ABBREVIATION, searchParams ?? {}],
            queryFn: async () => getSubjectAbbreviationDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_ABBREVIATION]
            });
        }
    };
};

export const useStaffDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getStaffDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN]
            });
        }
    };
};

export const useSubjectDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getsubjectDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN]
            });
        }
    };
};
export const useTimeTableMasterCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY, searchParams ?? {}],
            queryFn: async () => getMasterCategoryDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY]
            });
        }
    };
};

export const useTimeTableCategoryClassMapping = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY_CLASS_MAPPING, searchParams ?? {}],
            queryFn: async () => getCategoryClassMappingDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TIMETABLE_CATEGORY_CLASS_MAPPING]
            });
        }
    };
};

export const useTimeTableAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_ACADEMICYEAR, searchParams ?? {}],
            queryFn: async () => getTimeTableAcademicYearDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_ACADEMICYEAR]
            });
        }
    };
};

export const useTimeTableCategoryDropDownData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CATEGORY_DROPDOWNDATA_TT, searchParams ?? {}],
            queryFn: async () => getTimeTableCategoryDropDownDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CATEGORY_DROPDOWNDATA_TT]
            });
        }
    };
};

export const useTimeTableClassDropdownData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN, searchParams ?? {}],
            queryFn: async () => getuseTimeTableClassDropdownDataDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN]
            });
        }
    };
};

export const usePeriodAllocation = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_ALLOCATION, searchParams ?? {}],
            queryFn: async () => getAllPeriodDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_ALLOCATION]
            });
        }
    };
};

// export const useBreakTimeSettings = (searchParams?: ApiSearchparams) => {
//     const queryClient = useQueryClient();

//     return {
//         ...useQuery({
//             queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BREAK_TIME_SETTINGS, searchParams ?? {}],
//             queryFn: async () => getBreakTimeSettingsDetails(searchParams),
//             staleTime: 0
//         }),

//         refetchAll: () => {
//             return queryClient.invalidateQueries({
//                 queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BREAK_TIME_SETTINGS]
//             });
//         }
//     };
// };

export const useMasterPeriodDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DETAILSDATA, searchParams ?? {}],
            queryFn: async () => getMasterPeriodDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DETAILSDATA]
            });
        }
    };
};

export const useBreakTimeSettingDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_BREAKTIME_STTINGS, searchParams ?? {}],
            queryFn: async () => getBreakTimeSettingsDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_BREAKTIME_STTINGS]
            });
        }
    };
};

export const usePeriodDistributionDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIOD_DISTRIBUTIONDETAILS, searchParams ?? {}],
            queryFn: async () => getPeriodDistributionDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIOD_DISTRIBUTIONDETAILS]
            });
        }
    };
};

export const useMasterDayClasswiseDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_MASTER_DAYCLASSWISE_DETAILS, searchParams ?? {}],
            queryFn: async () => getMasterDayClassWiseDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_MASTER_DAYCLASSWISE_DETAILS]
            });
        }
    };
};

export const usePeriodTimeSettingDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIODTIME_SETTINGSDATA, searchParams ?? {}],
            queryFn: async () => getAllPeriodTimeSettings(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIODTIME_SETTINGSDATA]
            });
        }
    };
};

export const useAcademicYearDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getAcademicYearDropDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

export const useCategtoryDropDownMasterDayClasswise = (options?: { enabled?: boolean }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE],
            queryFn: async () => getCategoryDropDownMasterDayClasswise(),
            staleTime: 0,
            enabled: options?.enabled
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

export const useClassDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getClassDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

export const useDayDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.DAYS_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getDayDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.DAYS_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

export const useCategoryDropDownMasterPeriod = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERPERIOD, searchParams ?? {}],
            queryFn: async () => CategorydropDownData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERPERIOD]
            });
        }
    };
};
export const usePeriodDistributionViewData = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIOD_DISTRIBUTION_VIEW, id],
        queryFn: async () => {
            if (!id) return null;
            return getPeriodDistributionViewData(id);
        },
        enabled: enabled && !!id,
        staleTime: 0
    });
};

export const usePeriodDistributionEditDetails = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIOD_DISTRIBUTION_EDIT, id],
        queryFn: async () => {
            if (!id) return null;
            return getPeriodDistributionEditDetails(id);
        },
        enabled: enabled && !!id,
        staleTime: 0
    });
};

export const useEditPeriodDistribution = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.TT_PERIOD_DISTRIBUTION_EDIT, 'facade', id],
        queryFn: async () => {
            if (!id) return null;
            return EditPeriodDistribution(id);
        },
        enabled: enabled && !!id,
        staleTime: 0
    });
};

//academic Year
export const useAcademicYearPeriodDistrubution = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_ACADEMIC_YEAR, searchParams ?? {}],
            queryFn: async () => getAcademicYearPeriodDistrubution(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_ACADEMIC_YEAR]
            });
        }
    };
};

//category
export const useCategtoryPeriodDistrubution = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_CATEGORY, searchParams ?? {}],
            queryFn: async () => getCategoryPeriodDistrubution(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_CATEGORY]
            });
        }
    };
};

//staff

export const useStaffPeriodDistrubution = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_STAFF, searchParams ?? {}],
            queryFn: async () => getStaffPeriodDistrubution(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_STAFF]
            });
        }
    };
};

//subject

export const useSubjectPeriodDistrubution = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_SUBJECT, searchParams ?? {}],
            queryFn: async () => getSubjectPeriodDistrubution(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_SUBJECT]
            });
        }
    };
};

//section
export const useSectionPeriodDistrubution = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_SECTION, searchParams ?? {}],
            queryFn: async () => getSectionPeriodDistrubution(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_SECTION]
            });
        }
    };
};

//class
export const useClassPeriodDistrubution = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_CLASS, searchParams ?? {}],
            queryFn: async () => getClassPeriodDistrubution(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DISTRUBUTION_CLASS]
            });
        }
    };
};

export const useMasterBuildingClasssection = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING_CLASSSECTION, searchParams ?? {}],
            queryFn: async () => getMasterBuildingclasssectionDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING_CLASSSECTION]
            });
        }
    };
};

export const useMasterBuildingDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING_DROP_DOWN],
            queryFn: async () => getMasterBuilding(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BUILDING_DROP_DOWN]
            });
        }
    };
};

export const useMasterClassDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CLASS_DROP_DOWN],
            queryFn: async () => getMasterClass(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CLASS_DROP_DOWN]
            });
        }
    };
};

export const useMasterSectionDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SECTION_DROP_DOWN],
            queryFn: async () => getMasterSection(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SECTION_DROP_DOWN]
            });
        }
    };
};

export const usePeriodDropdown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getPeriodDropdown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_DROPDOWN]
            });
        }
    };
};

export const useBifurcationConstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BIFURCATION_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getBifurcationConstraintsDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useStaffDropdownBifurcationConstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN_BIFURCATION_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getStaffDropdownBifurcationConstraints(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN_BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useSectionDropdownBifurcationConstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SECTION_DROPDOWN_BIFURCATION_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getSectioDropdownBifurcationConstraints(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SECTION_DROPDOWN_BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useSubjectDropdownBifurcationConstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN_BIFURCATION_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getSubjectDropdownBifurcationConstraints(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN_BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useConsecutiveConstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CONSECUTIVE_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getConsecutiveConstraintsDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CONSECUTIVE_CONSTRAINTS]
            });
        }
    };
};

export const getPeriodAllocationmasterPeriodGridData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_ALLOCATION_MASTERPERIOD, searchParams ?? {}],
            queryFn: async () => getPeriodAllocationmasterPeriodGrid(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_PERIOD_ALLOCATION_MASTERPERIOD]
            });
        }
    };
};

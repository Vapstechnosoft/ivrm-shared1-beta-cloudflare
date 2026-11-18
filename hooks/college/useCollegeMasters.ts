import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    deactivateCollegeCasteCategory,
    deleteCollegeCasteCategory,
    getCollegeCasteCategoryById,
    getInitialData,
    saveCollegeCasteCategory
} from '@/server/college/CollegeAdmission/Masters/college-caste-category';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCollegeCasteCategory = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY],
            queryFn: async () => getInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY]
            });
        }
    };
};

export const useCollegeCasteCategoryById = (id: number | null) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY, id],
        queryFn: async () => {
            if (id === null) return null;
            return getCollegeCasteCategoryById(id);
        },
        enabled: id !== null,
        staleTime: 0
    });
};

export const useSaveCollegeCasteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveCollegeCasteCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY]
            });
        }
    });
};

export const useDeactivateCollegeCasteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateCollegeCasteCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY]
            });
        }
    });
};

export const useDeleteCollegeCasteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => deleteCollegeCasteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY]
            });
        }
    });
};

import {
    deleteCollegeMasterCaste,
    getCollegeMasterCasteById,
    getCollegeMasterCasteInitialData,
    saveCollegeMasterCaste
} from '@/server/college/CollegeAdmission/Masters/college-master-caste';

export const useCollegeMasterCaste = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE],
            queryFn: async () => getCollegeMasterCasteInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE]
            });
        }
    };
};

export const useCollegeMasterCasteById = (id: number | null) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE, id],
        queryFn: async () => {
            if (id === null) return null;
            return getCollegeMasterCasteById(id);
        },
        enabled: id !== null,
        staleTime: 0
    });
};

export const useSaveCollegeMasterCaste = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveCollegeMasterCaste(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE]
            });
        }
    });
};

export const useDeleteCollegeMasterCaste = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => deleteCollegeMasterCaste(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE]
            });
        }
    });
};

import {
    deactivateCourseCategoryMap,
    getCourseCategoryMapInitialData,
    saveCourseCategoryMap
} from '@/server/college/CollegeAdmission/Masters/clg-master-course-category-map';

export const useClgMasterCourseCategoryMap = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_CATEGORY_MAP],
            queryFn: async () => getCourseCategoryMapInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_CATEGORY_MAP]
            });
        }
    };
};

export const useSaveClgMasterCourseCategoryMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveCourseCategoryMap(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_CATEGORY_MAP]
            });
        }
    });
};

export const useDeactivateClgMasterCourseCategoryMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (amcocmId: number) => deactivateCourseCategoryMap(amcocmId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_CATEGORY_MAP]
            });
        }
    });
};

import {
    deactivateCourseBranchMap,
    deactivateSemesterCourseBranchMap,
    editCourseBranchMap,
    getCourseBranchMapInitialData,
    getCourseBranchMapModalDetails,
    saveCourseBranchMap
} from '@/server/college/CollegeAdmission/Masters/clg-master-course-branch-map';

export const useClgMasterCourseBranchMap = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP],
            queryFn: async () => getCourseBranchMapInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP]
            });
        }
    };
};

export const useSaveClgMasterCourseBranchMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveCourseBranchMap(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP]
            });
        }
    });
};

export const useDeactivateClgMasterCourseBranchMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateCourseBranchMap(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP]
            });
        }
    });
};

export const useDeactivateSemesterCourseBranchMap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateSemesterCourseBranchMap(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP]
            });
        }
    });
};

export const useEditClgMasterCourseBranchMap = (amcobmId: number | null) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP, 'edit', amcobmId],
        queryFn: async () => {
            if (!amcobmId) return null;
            return editCourseBranchMap(amcobmId);
        },
        enabled: !!amcobmId && amcobmId > 0,
        staleTime: 0
    });
};

export const useClgMasterCourseBranchMapModalDetails = (amcobmId: number | null) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE_BRANCH_MAP, 'modal', amcobmId],
        queryFn: async () => {
            if (!amcobmId) return null;
            return getCourseBranchMapModalDetails(amcobmId);
        },
        enabled: !!amcobmId && amcobmId > 0,
        staleTime: 0
    });
};

import {
    deactivateClgMasterBatch,
    editClgMasterBatch,
    getClgMasterBatchInitialData,
    saveClgMasterBatch
} from '@/server/college/CollegeAdmission/Masters/clg-master-batch';

export const useClgMasterBatch = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_BATCH],
            queryFn: async () => getClgMasterBatchInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BATCH]
            });
        }
    };
};

export const useSaveClgMasterBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveClgMasterBatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BATCH]
            });
        }
    });
};

export const useEditClgMasterBatch = (acmbId: number | null) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.MASTER_BATCH, 'edit', acmbId],
        queryFn: async () => editClgMasterBatch(acmbId!),
        enabled: acmbId !== null && acmbId > 0,
        staleTime: 0
    });
};

export const useDeactivateClgMasterBatch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (acmbId: number) => deactivateClgMasterBatch(acmbId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BATCH]
            });
        }
    });
};

import {
    deactivateClgMasterBranch,
    editClgMasterBranch,
    getClgMasterBranchInitialData,
    saveClgMasterBranch,
    saveClgMasterBranchOrder
} from '@/server/college/CollegeAdmission/Masters/clg-master-branch';

export const useClgMasterBranch = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_BRANCH],
            queryFn: async () => getClgMasterBranchInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BRANCH]
            });
        }
    };
};

export const useSaveClgMasterBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveClgMasterBranch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BRANCH]
            });
        }
    });
};

export const useEditClgMasterBranch = (ambId: number | null) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.MASTER_BRANCH, 'edit', ambId],
        queryFn: async () => editClgMasterBranch(ambId!),
        enabled: ambId !== null && ambId > 0,
        staleTime: 0
    });
};

export const useDeactivateClgMasterBranch = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateClgMasterBranch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BRANCH]
            });
        }
    });
};

export const useSaveClgMasterBranchOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveClgMasterBranchOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_BRANCH]
            });
        }
    });
};

import {
    deactivateClgMasterCategory,
    getClgMasterCategoryInitialData,
    saveClgMasterCategory
} from '@/server/college/CollegeAdmission/Masters/clg-master-category';

export const useClgMasterCategory = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_CATEGORY],
            queryFn: async () => getClgMasterCategoryInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CATEGORY]
            });
        }
    };
};

export const useSaveClgMasterCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveClgMasterCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CATEGORY]
            });
        }
    });
};

export const useDeactivateClgMasterCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateClgMasterCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_CATEGORY]
            });
        }
    });
};

import {
    deactivateMasterCourse,
    editMasterCourse,
    getMasterCourseInitialData,
    saveMasterCourse,
    saveMasterCourseOrder
} from '@/server/college/CollegeAdmission/Masters/master-course';

export const useMasterCourse = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE],
            queryFn: async () => getMasterCourseInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE]
            });
        }
    };
};

export const useSaveMasterCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveMasterCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });
};

export const useEditMasterCourse = () => {
    return useMutation({
        mutationFn: async (data: any) => editMasterCourse(data)
    });
};

export const useDeactivateMasterCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateMasterCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });
};

export const useSaveMasterCourseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveMasterCourseOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COURSE]
            });
        }
    });
};

import {
    editMasterQuota,
    editMasterQuotaCategory,
    getClgMasterQuotaInitialData,
    saveMasterQuota,
    saveMasterQuotaCategory,
    saveMasterQuotaCategoryMapping,
    toggleMasterQuota,
    toggleMasterQuotaCategory,
    toggleMasterQuotaCategoryMapping
} from '@/server/college/CollegeAdmission/Masters/clg-master-quota';

export const useClgMasterQuota = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA],
            queryFn: async () => getClgMasterQuotaInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    };
};

export const useSaveMasterQuota = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveMasterQuota(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    });
};

export const useEditMasterQuota = () => {
    return useMutation({
        mutationFn: async (data: any) => editMasterQuota(data)
    });
};

export const useToggleMasterQuota = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => toggleMasterQuota(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    });
};

export const useSaveMasterQuotaCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveMasterQuotaCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    });
};

export const useEditMasterQuotaCategory = () => {
    return useMutation({
        mutationFn: async (data: any) => editMasterQuotaCategory(data)
    });
};

export const useToggleMasterQuotaCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => toggleMasterQuotaCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    });
};

export const useSaveMasterQuotaCategoryMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveMasterQuotaCategoryMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    });
};

export const useToggleMasterQuotaCategoryMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => toggleMasterQuotaCategoryMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_QUOTA]
            });
        }
    });
};

import {
    getCombinations,
    getSchemeNames,
    getSchemeTypes,
    saveCombination,
    saveSchemeName,
    saveSchemeType,
    toggleCombination,
    toggleSchemeName,
    toggleSchemeType
} from '@/server/college/CollegeAdmission/Masters/clg-scheme-type';

export const useClgSchemeTypes = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_TYPE],
            queryFn: async () => getSchemeTypes(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_TYPE]
            });
        }
    };
};

export const useSaveSchemeType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveSchemeType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_TYPE]
            });
        }
    });
};

export const useToggleSchemeType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => toggleSchemeType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_TYPE]
            });
        }
    });
};

export const useClgSchemeNames = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_NAME],
            queryFn: async () => getSchemeNames(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_NAME]
            });
        }
    };
};

export const useSaveSchemeName = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveSchemeName(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_NAME]
            });
        }
    });
};

export const useToggleSchemeName = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => toggleSchemeName(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SCHEME_NAME]
            });
        }
    });
};

export const useClgCombinations = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_COMBINATION],
            queryFn: async () => getCombinations(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COMBINATION]
            });
        }
    };
};

export const useSaveCombination = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveCombination(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COMBINATION]
            });
        }
    });
};

export const useToggleCombination = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => toggleCombination(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_COMBINATION]
            });
        }
    });
};

import {
    editSection,
    getSections,
    saveSection,
    saveSectionOrder,
    toggleSection
} from '@/server/college/CollegeAdmission/Masters/clg-master-section';

export const useClgMasterSections = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_SECTION],
            queryFn: async () => getSections(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SECTION]
            });
        }
    };
};

export const useSaveMasterSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveSection(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SECTION]
            });
        }
    });
};

export const useEditMasterSection = () => {
    return useMutation({
        mutationFn: async (id: number) => editSection(id)
    });
};

export const useToggleMasterSection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => toggleSection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SECTION]
            });
        }
    });
};

export const useSaveMasterSectionOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveSectionOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SECTION]
            });
        }
    });
};

import {
    editSemester,
    getSemesters,
    saveSemester,
    saveSemesterOrder,
    toggleSemester
} from '@/server/college/CollegeAdmission/Masters/clg-master-semester';

export const useClgMasterSemesters = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.MASTER_SEMESTER],
            queryFn: async () => getSemesters(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SEMESTER]
            });
        }
    };
};

export const useSaveMasterSemester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveSemester(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SEMESTER]
            });
        }
    });
};

export const useEditMasterSemester = () => {
    return useMutation({
        mutationFn: async (id: number) => editSemester(id)
    });
};

export const useToggleMasterSemester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => toggleSemester(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SEMESTER]
            });
        }
    });
};

export const useSaveMasterSemesterOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveSemesterOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.MASTER_SEMESTER]
            });
        }
    });
};

import {
    deactivateBranchChange,
    getBranchChangeBranches,
    getBranchChangeCourses,
    getBranchChangeInitialData,
    getBranchChangeSemesters,
    getBranchChangeStudents,
    saveBranchChange
} from '@/server/college/CollegeAdmission/Masters/clg-branch-change';

export const useBranchChange = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.BRANCH_CHANGE],
            queryFn: async () => getBranchChangeInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.BRANCH_CHANGE]
            });
        }
    };
};

export const useGetBranchChangeCourses = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => getBranchChangeCourses(data)
    });
};

export const useGetBranchChangeBranches = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number }) => getBranchChangeBranches(data)
    });
};

export const useGetBranchChangeSemesters = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => getBranchChangeSemesters(data)
    });
};

export const useGetBranchChangeStudents = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id_Old: number;
        }) => getBranchChangeStudents(data)
    });
};

export const useSaveBranchChange = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveBranchChange(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.BRANCH_CHANGE]
            });
        }
    });
};

export const useDeactivateBranchChange = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => deactivateBranchChange(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.BRANCH_CHANGE]
            });
        }
    });
};

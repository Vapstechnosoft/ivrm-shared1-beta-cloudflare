'use client';

import { RECRUITMENT_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCandidateDropDownDataByInstitution,
    getInstitutionByLogin,
    getMasterJobByIdData,
    getMasterGridData as getMasterJobGridData,
    saveOrUpdateJob,
    type saveOrUpdateJobPayload,
    toggleJobStatusData
} from '@/server/hrms/recruitment/masters/masterJob';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    getMasterLocation,
    getMasterLocationGridData,
    saveOrUpdateLocation,
    type saveOrUpdateLocationPayload,
    toggleLocationStatusData
} from '@/server/hrms/recruitment/masters/masterLocation';
import {
    getMasterPositionGridData,
    saveOrUpdatePosition,
    type saveOrUpdatePositionPayload,
    togglePositionStatusData
} from '@/server/hrms/recruitment/masters/masterPosition';
import {
    getMasterPositionTypeGridData,
    saveOrUpdatePositionType,
    type saveOrUpdatePositionTypePayload,
    togglePositionTypeStatusData
} from '@/server/hrms/recruitment/masters/masterPositionsTypes';
import {
    getMasterPriorityGridData,
    saveOrUpdatePriority,
    type saveOrUpdatePriorityPayload,
    togglePriorityStatusData
} from '@/server/hrms/recruitment/masters/masterPriority';

// ---------------------- Login Based Instittution Hook -----------------

export function useGetInstitutionByLogin() {
    return useQuery({
        queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_INSTITUTION_BY_LOGIN],
        queryFn: async () => getInstitutionByLogin(),
        staleTime: 0
    });
}

// ---------------------- Login Based Institution Candidate Dropdown Hook -----------------

export function useGetCandidateDropDown(enabled = true) {
    return useQuery({
        queryKey: [RECRUITMENT_QUERY_KEYS.CANDIDATE_DROPDOWN],
        queryFn: async () => getCandidateDropDownDataByInstitution(),
        staleTime: 0,
        enabled: enabled
    });
}

// -------------------------- Master Job HOOKS --------------------------
export function useGetMasterJobGrid() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID],
            queryFn: async () => getMasterJobGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID]
            });
        }
    };
}

export function useSaveOrUpdateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdateJobPayload) => saveOrUpdateJob(payload),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID]
            });
        }
    });
}

export function useGetMasterLocationDropDown() {
    return useQuery({
        queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID],
        queryFn: async () => getMasterLocation(),
        staleTime: 0
    });
}

export function useGetMasterJobByJobId(jobId: number) {
    return useQuery({
        queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_BY_JOBID, jobId],
        queryFn: async () => getMasterJobByIdData(jobId),
        staleTime: 0
    });
}

export function useToggleJobStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobId: number) => toggleJobStatusData(jobId),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_JOB_GRID]
            });
        }
    });
}

// -------------------------- Master Location HOOKS --------------------------

export function useGetMasterLocationGrid(mi_id: number) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID, mi_id],
            queryFn: async () => getMasterLocationGridData(mi_id),
            staleTime: 0,
            enabled: !!mi_id && mi_id !== 0,
            placeholderData: keepPreviousData
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID, mi_id]
            });
        }
    };
}

export function useSaveOrUpdateLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdateLocationPayload) => saveOrUpdateLocation(payload),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID]
            });
        }
    });
}

export function useToggleLocationStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrmlO_Id: number) => toggleLocationStatusData(hrmlO_Id),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_LOCATION_GRID]
            });
        }
    });
}

// -------------------------- Master Position HOOKS --------------------------

export function useGetMasterPositionGrid(mi_id: number) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_GRID, mi_id],
            queryFn: async () => getMasterPositionGridData(mi_id),
            staleTime: 0,
            enabled: !!mi_id && mi_id !== 0,
            placeholderData: keepPreviousData
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_GRID, mi_id]
            });
        }
    };
}

export function useSaveOrUpdatePosition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdatePositionPayload) => saveOrUpdatePosition(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_GRID]
            });
        }
    });
}

export function useTogglePositionStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrmp_Id: number) => togglePositionStatusData(hrmp_Id),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_GRID]
            });
        }
    });
}

// -------------------------- Master Position Type HOOKS --------------------------

export function useGetMasterPositionTypeGrid(mi_id: number) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_TYPE_GRID, mi_id],
            queryFn: async () => getMasterPositionTypeGridData(mi_id),
            staleTime: 0,
            enabled: !!mi_id && mi_id !== 0,
            placeholderData: keepPreviousData
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_TYPE_GRID, mi_id]
            });
        }
    };
}

export function useSaveOrUpdatePositionType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdatePositionTypePayload) => saveOrUpdatePositionType(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_TYPE_GRID]
            });
        }
    });
}

export function useTogglePositionTypeStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrmpT_Id: number) => togglePositionTypeStatusData(hrmpT_Id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_POSITION_TYPE_GRID]
            });
        }
    });
}

// -------------------------- Master Master Priority HOOKS --------------------------

export function useGetMasterPriorityGrid() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_PRIORITY_GRID],
            queryFn: async () => getMasterPriorityGridData(),
            staleTime: 0,
            placeholderData: keepPreviousData
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_PRIORITY_GRID]
            });
        }
    };
}

export function useSaveOrUpdatePriority() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: saveOrUpdatePriorityPayload) => saveOrUpdatePriority(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_PRIORITY_GRID]
            });
        }
    });
}

export function useTogglePriorityStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrmpr_Id: number) => togglePriorityStatusData(hrmpr_Id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.MASTER_PRIORITY_GRID]
            });
        }
    });
}

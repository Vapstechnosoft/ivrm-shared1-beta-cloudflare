'use client';

import { RECRUITMENT_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCadidateGridData,
    getCandidateDetails,
    saveOrUpdateCandidate,
    toggleCandidateStatus
} from '@/server/hrms/recruitment/transactions/addCadidate';
import { getCandidatesAndInterviewers } from '@/server/hrms/recruitment/transactions/addCandidateInterview';
import {
    getCandidateInterviewByIdVMS,
    getCandidateInterviewListVMS,
    saveOrUpdateCandidateInterviewVMS,
    toggleCandidateInterviewStatusVMS
} from '@/server/hrms/recruitment/transactions/candidateInterviewList';
import {
    type InterviewSchedule,
    getCandidateInterviewList,
    getInterviewFeedbackGridData,
    saveInterviewerFeedback
} from '@/server/hrms/recruitment/transactions/interviewFeedback';
import { getBasicDataJobListVMS, saveOrUpdateJobListVMS } from '@/server/hrms/recruitment/transactions/jobListVMS';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ---------------- Add Candidate Hooks ----------------

export function useGetCandidateGridData() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST],
            queryFn: async () => getCadidateGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST]
            });
        }
    };
}

export function useGetCandidateDetails(hrcd_Id: number) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST, hrcd_Id],
            queryFn: async () => getCandidateDetails(hrcd_Id),
            enabled: !!hrcd_Id && hrcd_Id !== 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST, hrcd_Id]
            });
        }
    };
}

export function useSaveOrUpdateCandidate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveOrUpdateCandidate(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Candidate saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST]
                });
            } else {
                toast.error(response.message || 'Failed to save candidate');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving candidate');
        }
    });
}

export function useToggleCandidateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (hrcd_Id: number) => toggleCandidateStatus(hrcd_Id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Status toggled successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_LIST]
                });
            } else {
                toast.error(response.message || 'Failed to toggle status');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while toggling status');
        }
    });
}

// ---------------- Add Candidate Interview Hooks ----------------

export function useGetCandidateAndInterviewers() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_INTERVIEW_LIST],
            queryFn: async () => getCandidatesAndInterviewers(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_INTERVIEW_LIST]
            });
        }
    };
}

// ---------------- Add Candidate Interview Feedback Hooks ----------------

export function useGetInterviewerFeedbackGridData() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_INTERVIEW_FEEDBACK_LIST],
            queryFn: async () => getInterviewFeedbackGridData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_INTERVIEW_FEEDBACK_LIST]
            });
        }
    };
}

export function useSaveInterviewerFeedback() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: InterviewSchedule) => saveInterviewerFeedback(data),
        onSuccess: (response) => {
            if (response.success) {
                // toast.success(response.message || 'Feedback saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_INTERVIEW_FEEDBACK_LIST]
                });
            } else {
                toast.error(response.message || 'Failed to save feedback');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving feedback');
        }
    });
}

// ---------------- Candidate Interview List Hooks ----------------

export function useGetCandidateInterviewList() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_INTERVIEW_LIST],
            queryFn: async () => getCandidateInterviewList(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_CANDIDATE_INTERVIEW_LIST]
            });
        }
    };
}

// ---------------- Candidate Interview List VMS Hooks ----------------

export function useGetCandidateInterviewListVMS() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: ['TRANSACTION_CANDIDATE_INTERVIEW_LIST_VMS'],
            queryFn: async () => getCandidateInterviewListVMS(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['TRANSACTION_CANDIDATE_INTERVIEW_LIST_VMS']
            });
        }
    };
}

export function useGetCandidateInterviewByIdVMS() {
    return useMutation({
        mutationFn: async (hrcisC_Id: number) => getCandidateInterviewByIdVMS(hrcisC_Id),
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while fetching details');
        }
    });
}

export function useToggleCandidateInterviewStatusVMS() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (hrcisC_Id: number) => toggleCandidateInterviewStatusVMS(hrcisC_Id),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Status toggled successfully');
                queryClient.invalidateQueries({
                    queryKey: ['TRANSACTION_CANDIDATE_INTERVIEW_LIST_VMS']
                });
            } else {
                toast.error(response.message || 'Failed to toggle status');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while toggling status');
        }
    });
}

export function useSaveOrUpdateCandidateInterviewVMS() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => saveOrUpdateCandidateInterviewVMS(payload),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Candidate interview saved successfully');
                queryClient.invalidateQueries({
                    queryKey: ['TRANSACTION_CANDIDATE_INTERVIEW_LIST_VMS']
                });
            } else {
                toast.error(response.message || 'Failed to save candidate interview');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving');
        }
    });
}

// ---------------- JobListVMS Hooks ----------------

export function useGetBasicDataJobListVMS() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_JOB_LIST_VMS],
            queryFn: async () => getBasicDataJobListVMS(),
            staleTime: 1000 * 60 * 5
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_JOB_LIST_VMS]
            });
        }
    };
}

export function useSaveOrUpdateJobListVMS() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveOrUpdateJobListVMS(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Job posting saved successfully');
                queryClient.invalidateQueries({
                    queryKey: [RECRUITMENT_QUERY_KEYS.TRANSACTION_JOB_LIST_VMS]
                });
            } else {
                toast.error(response.message || 'Failed to save job posting');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving job posting');
        }
    });
}

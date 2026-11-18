import {
    getSVPClassByYear,
    getSVPClassWiseInitialData,
    getSVPClassWiseReportDetails,
    getSVPSectionByClass
} from '@/server/admission/preadmission/reports/svp_class_wise_student_details';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSVPClassWiseInitialData = () => {
    return useQuery({
        queryKey: ['svp-class-wise-initial-data'],
        queryFn: () => getSVPClassWiseInitialData()
    });
};

export const useSVPClassByYear = () => {
    return useMutation({
        mutationFn: (ASMAY_Id: number) => getSVPClassByYear(ASMAY_Id)
    });
};

export const useSVPSectionByClass = () => {
    return useMutation({
        mutationFn: (data: { asmaY_Id: number; classlsttwo: any[] }) => getSVPSectionByClass(data)
    });
};

export const useSVPClassWiseReportDetails = () => {
    return useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            classlsttwo: any[];
            sectionlistarray: any[];
            TempararyArrayheadList: any[];
            flag: string;
            AMC_Id: number;
            Concession_Id?: string;
        }) => getSVPClassWiseReportDetails(data)
    });
};

import {
    getMobileAppDownloadLoadData,
    getMobileAppDownloadReport
} from '@/server/admission/preadmission/reports/mobile_app_download_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useMobileAppDownloadLoadData = () => {
    return useQuery({
        queryKey: ['mobileAppDownloadLoadData'],
        queryFn: async () => {
            const response = await getMobileAppDownloadLoadData();
            return response;
        }
    });
};

export const useMobileAppDownloadReportDetails = () => {
    return useMutation({
        mutationFn: async (params: {
            fromdate: string;
            todate: string;
            ASMAY_Id: number;
            Active: number;
            DeActive: number;
            Left: number;
            optionflag: string;
        }) => {
            const response = await getMobileAppDownloadReport(params);
            return response;
        }
    });
};

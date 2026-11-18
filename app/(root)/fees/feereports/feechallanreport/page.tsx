"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/extension/field";

import { useAcademicYearDropdown } from "@/hooks/fees/useMasters";
import {
  useFeeChallanReport,
  useFeeClassListDefaulterreport,
  useFeeSectionListDefaulterreport,
} from "@/hooks/fees/useReports";
import { feeChallanReportSchema } from "@/schemas/fees/reports";
import type { IFeeChallanReportItem } from "@/types/fees/reports/reports";
import { toast } from "sonner";
import {
  exportToExcel,
  printTable,
} from "./_components/print-and-export-excel";

type FormFields = z.infer<typeof feeChallanReportSchema>;

const Checkbox = ({
  checked,
  indeterminate,
  onCheckedChange,
  ...props
}: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <BaseCheckbox
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    />
  );
};

interface IChallanRow extends IFeeChallanReportItem {
  admNo?: string;
}

const today = new Date().toISOString().split("T")[0];

export default function FeeChallanReportPage() {
  // Dropdowns data
  const { data: academicYearData } = useAcademicYearDropdown();
  const { data: classListResponse } = useFeeClassListDefaulterreport();
  const { data: sectionListResponse } = useFeeSectionListDefaulterreport();

  const academicYears = academicYearData?.data || [];
  const classList = classListResponse?.data || [];
  const sectionList = sectionListResponse?.data || [];

  // Dynamic Report Data state (sample data removed)
  const [reportData, setReportData] = useState<IChallanRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { mutateAsync: generateReport, isPending: isSubmitting } =
    useFeeChallanReport();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(feeChallanReportSchema),
    defaultValues: {
      ASMAY_Id: 0,
      ASMCL_Id: 0,
      ASMS_Id: 0,
      fromDate: today,
      toDate: today,
      receiptsGenerated: false,
    },
  });

const ASMAY_Id= watch('ASMAY_Id');
const ASMCL_Id= watch("ASMCL_Id")
const ASMS_Id= watch("ASMS_Id");
const fromDate=watch("fromDate");
const toDate=watch("toDate");
const receiptsGenerated= watch("receiptsGenerated");
  // Auto-select initial dropdown defaults when available
  useEffect(() => {
    if (academicYears.length > 0) {
      const activeYr =
        academicYears.find((y: any) => y.asmaY_Year === "2025-2026") ||
        academicYears[0];
      if (activeYr) {
        setValue("ASMAY_Id", Number(activeYr.asmaY_Id));
      }
    }
  }, [academicYears, setValue]);

  useEffect(() => {
    if (classList.length > 0) {
      const defaultClass = classList[0];
      if (defaultClass) {
        setValue("ASMCL_Id", Number(defaultClass.asmcL_Id));
      }
    }
  }, [classList, setValue]);

  useEffect(() => {
    if (sectionList.length > 0) {
      const defaultSection = sectionList[0];
      if (defaultSection) {
        setValue("ASMS_Id", Number(defaultSection.asmS_Id));
      }
    }
  }, [sectionList, setValue]);

  // Checkbox toggles for Table Grid
  const toggleAllStudents = () => {
    if (selectedIds.length === reportData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reportData.map((_, index) => index));
    }
  };

  const toggleRow = (index: number) => {
    if (selectedIds.includes(index)) {
      setSelectedIds(selectedIds.filter((id) => id !== index));
    } else {
      setSelectedIds([...selectedIds, index]);
    }
  };

  // Dynamic Form Submit (Calls API: FeeChallanReportFacade/getreport)
const onSubmit = async (values: FormFields) => {
  try {
    const payload = {
      asmayidpss: ASMAY_Id,
      asmcL_Id: ASMCL_Id,
      asmS_Id: ASMS_Id,
      fromdate: fromDate,
      todate: toDate,
      typeofrpt: receiptsGenerated === true ? "1" : "0",
    };

    const res = await generateReport(payload);
    setHasSearched(true);
    setSelectedIds([]);

    // ✅ Correct access path
    const rawList = res?.data?.reportdatelist || [];

    if (Array.isArray(rawList) && rawList.length > 0) {
      const mapped: IChallanRow[] = rawList.map((item, index) => ({
        slNo: index + 1,
        name: item.name || "-",           
        asmcl_classname: item.asmcl_classname || "-",
        asmc_sectionname: item.asmc_sectionname || "-",
        fyp_receipt_no: item.fyp_receipt_no ?? "-",
        fyp_bank_or_cash: item.fyp_bank_or_cash || "-",
        fyp_tot_amount: item.fyp_tot_amount ?? 0,
        amay_rollno:item.amay_rollno??"",
        fyp_challanno:item.fyp_challanno
      }));

      setReportData(mapped);
      toast.success("Report generated successfully!");
    } else {
      setReportData([]);
      toast.info("No records found for the selected criteria.");
    }
  } catch (err: any) {
    console.error("Error fetching Fee Challan Report:", err);
    toast.error(err?.message || "Failed to fetch report");
    setReportData([]);
    setHasSearched(true);
  }
};

  const handleCancel = () => {
    reset({
      ASMAY_Id: 0,
      ASMCL_Id: 0,
      ASMS_Id: 0,
      fromDate: today,
      toDate: today,
      receiptsGenerated: false,
    });
    setReportData([]);
    setHasSearched(false);
    setSelectedIds([]);
    toast.info("Form reset");
  };

  // Export & Print handlers
  const handleExportExcel = () => {
    const selectedData =
      selectedIds.length > 0
        ? reportData.filter((_, idx) => selectedIds.includes(idx))
        : reportData;
    if (selectedData.length === 0) {
      toast.warning("No data available to export");
      return;
    }
    if (selectedIds.length === 0) {
      toast.warning("Please select At least one record to submit!!");
      return;
    }
    exportToExcel(selectedData, "Fee_Challan_Report");
    toast.success("Excel export started!");
  };

  const handlePrint = () => {
    printTable("fee-challan-table", "Fee Challan Report");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="mx-auto max-w-7xl px-4">
          <Card className="border-0 shadow-xl">
            <div className="p-8">
              <div className="space-y-8">
                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Academic Year */}
                  <div className="flex items-center gap-4">
                    <Label className="w-36 text-right font-medium">
                      Academic Year <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex-1">
                      <Controller
                        name="ASMAY_Id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => field.onChange(Number(val))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="--Select Academic Year--" />
                            </SelectTrigger>
                            <SelectContent>
                              {academicYears.map((item: any) => (
                                <SelectItem
                                  key={item.asmaY_Id}
                                  value={String(item.asmaY_Id)}
                                >
                                  {item.asmaY_Year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.ASMAY_Id && (
                        <FormError>{errors.ASMAY_Id.message}</FormError>
                      )}
                    </div>
                  </div>

                  {/* Class */}
                  <div className="flex items-center gap-4">
                    <Label className="w-36 text-right font-medium">
                      Class <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex-1">
                      <Controller
                        name="ASMCL_Id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => field.onChange(Number(val))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="--Select Class--" />
                            </SelectTrigger>
                            <SelectContent>
                              {classList.map((item: any) => (
                                <SelectItem
                                  key={item.asmcL_Id}
                                  value={String(item.asmcL_Id)}
                                >
                                  {item.asmcL_ClassName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.ASMCL_Id && (
                        <FormError>{errors.ASMCL_Id.message}</FormError>
                      )}
                    </div>
                  </div>

                  {/* Section */}
                  <div className="flex items-center gap-4">
                    <Label className="w-36 text-right font-medium">
                      Section <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex-1">
                      <Controller
                        name="ASMS_Id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(val) => field.onChange(Number(val))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="--Select Section--" />
                            </SelectTrigger>
                            <SelectContent>
                              {sectionList?.map((item: any) => (
                                <SelectItem
                                  key={item.asmS_Id}
                                  value={String(item.asmS_Id)}
                                >
                                  {item.asmC_SectionName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.ASMS_Id && (
                        <FormError>{errors.ASMS_Id.message}</FormError>
                      )}
                    </div>
                  </div>

                  {/* From Date & To Date */}
                  <div className="flex items-center gap-4">
                    <Label className="w-36 text-right font-medium">
                      From Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex-1 flex gap-2">
                      <Controller
                        name="fromDate"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="date"
                            className="w-full"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        name="toDate"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="date"
                            className="w-full"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Receipts Generated Checkbox */}
                <div className="flex items-center gap-3 pl-40">
                  <Controller
                    name="receiptsGenerated"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="receiptsGenerated"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="receiptsGenerated"
                    className="cursor-pointer font-medium text-base"
                  >
                    Receipts Generated for Challans
                  </Label>
                </div>

                {/* Buttons Row */}
                <div className="flex justify-end gap-4 border-t pt-8">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8"
                    onClick={handleCancel}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12"
                  >
                    {isSubmitting ? "Generating..." : "Report"}
                  </Button>
                </div>

                {/* DYNAMIC REPORT GRID RESULTS SECTION */}
                {hasSearched && (
                  <CollapsibleSection defaultOpen={true}>
                    <div className="rounded-lg border bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b bg-gray-50 px-8 py-4">
                        <h2 className="whitespace-nowrap font-bold text-2xl text-primary">
                          Fee Challan Report
                        </h2>
                        {reportData.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 px-4 text-xs font-semibold bg-[#f25022] hover:bg-[#d84018] text-white rounded-full"
                              onClick={handleExportExcel}
                            >
                              Export Excel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 px-4 text-xs font-semibold rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={handlePrint}
                            >
                              Export PDF
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="overflow-x-auto px-8 pb-8 pt-4">
                        {reportData.length > 0 ? (
                          <table
                            id="fee-challan-table"
                            className="w-full border-collapse border border-gray-300 text-sm"
                          >
                            <thead className="bg-primary text-white">
                              <tr>
                                <th className="p-2 text-center border border-gray-300">
                                  <Checkbox
                                    checked={
                                      selectedIds.length ===
                                        reportData.length &&
                                      reportData.length > 0
                                    }
                                    indeterminate={
                                      selectedIds.length > 0 &&
                                      selectedIds.length < reportData.length
                                    }
                                    onCheckedChange={toggleAllStudents}
                                  />
                                </th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Sl No
                                </th>
                               
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Student Name
                                </th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Class
                                </th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Section
                                </th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Roll No.
                                </th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Challan No
                                </th>
                                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.map((row, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }
                                >
                                  <td className="p-2 text-center border border-gray-300">
                                    <Checkbox
                                      checked={selectedIds.includes(index)}
                                      onCheckedChange={() => toggleRow(index)}
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-2 text-center">
                                    {index + 1}
                                  </td>
                                  
                                  <td className="border border-gray-300 px-2 py-2 text-center font-medium">
                                    {row.name}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-2 text-center">
                                    {row.asmcl_classname}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-2 text-center">
                                    {row.asmc_sectionname}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-2 text-center">
                                    {row.amay_rollno}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-2 text-center">
                                    {row.fyp_challanno}
                                  </td>
                                  <td className="border border-gray-300 px-2 py-2 text-center font-semibold">
                                    ₹{row.fyp_tot_amount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="py-8 text-center text-slate-500 font-medium">
                            No fee challan records found for the selected
                            criteria.
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CheckSquare, Square, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { searchStudentName } from "@/server/fees/trasactions/fee_student_transaction";
import { hutchingsBankChallanSchema } from "@/schemas/fees/reports";
import type {
  IHutchingsBankChallanStudent,
  IHutchingsBankChallanTerm,
} from "@/types/fees/reports/hutchings_bank_challan";
import { InputText } from "@/components/ui/extension/input-text";
import { useFeeTermDropDownDataForReports } from "@/hooks/fees/useReports";

type FormValues = z.infer<typeof hutchingsBankChallanSchema>;

interface BankChallanFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
  onReset: () => void;
}

export function BankChallanForm({
  onSubmit,
  isSubmitting,
  onReset,
}: BankChallanFormProps) {
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Dynamic Students State (Empty by default, loaded ONLY when user types search query)
  const [students, setStudents] = useState<IHutchingsBankChallanStudent[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<IHutchingsBankChallanStudent | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Dynamic Academic Years API Hook
  const { data: academicYearData } = useAcademicYearDropdown();
  const academicYears = academicYearData?.data || [];
const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDropDownDataForReports();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(hutchingsBankChallanSchema),
    defaultValues: {
      ASMAY_Id: 0,
      AMST_Id: 0,
    },
  });

  const selectedAsmayId = watch("ASMAY_Id");
  const selectedTerms = watch("termIds") || [];

  // Auto-set default Academic Year when academicYears loads

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

  // Fetch students dynamically ONLY when user types search filter text
  useEffect(() => {
    if (!studentSearchQuery || !studentSearchQuery.trim()) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const payload = {
          asmaY_Id: selectedAsmayId,
          filterinitialdata: "NameAdmno",
          searchfilter: studentSearchQuery.trim(),
          asmcL_ID: 0,
          asmS_Id: 0,
          amsT_SOL: "S",
        };

        console.log("student details payload", JSON.stringify(payload));
        const studentsArray = await searchStudentName(payload);
        const rawList = studentsArray?.feeStudentSearch || [];
        const studentsData = JSON.parse(JSON.stringify(rawList));

        if (Array.isArray(studentsData) && studentsData.length > 0) {
          const mapped: IHutchingsBankChallanStudent[] = studentsData.map(
            (s: any) => ({
              amst_Id: s.amst_Id,
              amsT_StudentName: s.amsT_StudentName || "",
            }),
          );
          setStudents(mapped);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery, selectedAsmayId]);

const handleToggleAllTerms = () => {
  if (selectedTerms.length === feetermData?.data?.length) {
    setValue("termIds", [], { shouldValidate: true });
  } else {
    setValue(
      "termIds",
      feetermData?.data?.map((t: any) => t.fmT_Id) ?? [],
      { shouldValidate: true },
    );
  }
};

  const handleToggleTerm = (fmtId: number) => {
    if (selectedTerms.includes(fmtId)) {
      setValue(
        "termIds",
        selectedTerms.filter((id) => id !== fmtId),
        { shouldValidate: true },
      );
    } else {
      setValue("termIds", [...selectedTerms, fmtId], { shouldValidate: true });
    }
  };

  const handleCancelForm = () => {
    reset({
      ASMAY_Id: 0,
      AMST_Id: 0,
      termIds: [],
    });
    setStudentSearchQuery("");
    setStudents([]);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
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

          {/* Search Student */}
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap font-semibold">
              Student Name
              <span className="ml-1 text-red-500">*</span>
            </Label>

            <div className="relative w-64">
              <InputText
                id="studentSearchInput"
                type="text"
                placeholder="Search student..."
                disabled={!selectedAsmayId}
                value={studentSearchQuery}
                onChange={(e) => {
                  setStudentSearchQuery(e.target.value);
                  setSelectedStudent(null);
                }}
                className="flex rounded-md border border-gray-300 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="off"
              />

              {studentSearchQuery.trim() !== "" && !selectedStudent && (
                <>
                  <ul className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow-md">
                    {loadingStudents ? (
                      <li className="px-3 py-2 text-gray-500">Loading...</li>
                    ) : students.length === 0 ? (
                      <li className="px-3 py-2 text-gray-500">
                        No students found
                      </li>
                    ) : (
                      students.map((student) => (
                        <li
                          key={student.amst_Id}
                          onClick={() => {
                            setSelectedStudent(student);
                            setStudentSearchQuery(student.amsT_StudentName);
                          }}
                          className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                        >
                          {student.amsT_StudentName}
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Select Terms Multi-select Box */}
        <div className="flex items-start gap-4">
          <Label className="w-36 text-right font-medium pt-2">
            Select Terms <span className="text-red-500">*</span>
          </Label>
          <div className="flex-1">
            <div className="border border-slate-300 rounded-lg p-3 bg-white max-h-52 overflow-y-auto space-y-2">
              {/* Select All */}
              <div
                onClick={handleToggleAllTerms}
                className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-100 cursor-pointer text-sm font-semibold border-b border-slate-200 text-slate-900 select-none"
              >
                {selectedTerms.length === feetermData?.data?.length ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>Select All Terms</span>
              </div>

              {/* Term items */}
              {feetermData?.data?.map((term) => {
                const isChecked = selectedTerms.includes(term.fmT_Id);
                return (
                  <div
                    key={term.fmT_Id}
                    onClick={() => handleToggleTerm(term.fmT_Id)}
                    className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-slate-50 cursor-pointer text-sm text-slate-700 select-none"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                    <span>{term.fmT_Name}</span>
                  </div>
                );
              })}
            </div>
            {errors.termIds && <FormError>{errors.termIds.message}</FormError>}
          </div>
        </div>

        {/* Buttons Row Matching Design */}
        <div className="flex justify-center md:justify-end gap-4 border-t pt-8">
          <Button
            size="lg"
            variant="outline"
            className="px-10 rounded-full border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            onClick={handleCancelForm}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-12 size-lg rounded-full bg-[#f24e1e] hover:bg-[#d84018] text-white font-medium shadow-md transition-all"
          >
            {isSubmitting ? "Downloading..." : "DOWNLOAD CHALLAN"}
          </Button>
        </div>
      </div>
    </form>
  );
}

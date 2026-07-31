"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value: string; // ISO date string, e.g. "2026-02-08", or ""
  onChange: (isoDate: string) => void;
  placeholder?: string;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Pick a date",
}: DatePickerFieldProps) {
  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "MM/dd/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onChange(format(date, "yyyy-MM-dd"))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

"use client";

import type { ChangeEvent, InputHTMLAttributes } from "react";
import DatePicker from "react-datepicker";
import { fr, enUS } from "date-fns/locale";
import { useLocale } from "@/features/settings/LocaleProvider";
import "react-datepicker/dist/react-datepicker.css";

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) ? date : null;
}

/** Calendar dates stay local: converting a selection to UTC can change its day. */
export default function DateInput({
  value,
  onChange,
  min,
  max,
  id,
  name,
  className,
  required,
  disabled,
  placeholder,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const { language } = useLocale();
  return (
    <DatePicker
      id={id}
      name={name}
      selected={parseDate(value)}
      onChange={(date) => {
        const next = date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          : "";
        onChange?.({
          target: { value: next, name, id },
          currentTarget: { value: next, name, id },
        } as ChangeEvent<HTMLInputElement>);
      }}
      minDate={parseDate(min) ?? undefined}
      maxDate={parseDate(max) ?? undefined}
      locale={language === "fr" ? fr : enUS}
      dateFormat={language === "fr" ? "dd/MM/yyyy" : "MM/dd/yyyy"}
      className={className}
      customInput={<input {...props} />}
      required={required}
      disabled={disabled}
      placeholderText={
        placeholder ??
        (language === "fr" ? "Choisir une date" : "Choose a date")
      }
      ariaLabelledBy={props["aria-labelledby"]}
      ariaDescribedBy={props["aria-describedby"]}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      autoComplete="off"
      strictParsing
      isClearable={!required && !disabled}
      popperPlacement="bottom-start"
      popperProps={{ strategy: "fixed" }}
      popperClassName="budgetzen-datepicker"
    />
  );
}

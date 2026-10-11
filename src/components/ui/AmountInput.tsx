"use client";
import { useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ChangeEvent } from "react";
import { useLocale } from "@/features/settings/LocaleProvider";
import { formatAmountInput, normalizeAmountInput } from "@/shared/ui/amount-input";

export default function AmountInput({ value, onChange, min, max, step, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  void type;
  const { locale } = useLocale();
  const [draft, setDraft] = useState(String(value ?? ""));
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const matches = String(value ?? "") === draft || (draft !== "" && Number(value) === Number(draft));
  const display = formatAmountInput(matches ? draft : String(value ?? ""), locale);
  useLayoutEffect(() => {
    if (caret.current !== null && ref.current) {
      let remaining = caret.current;
      let position = 0;
      while (position < display.length && remaining > 0) {
        if (!/\s/.test(display[position])) remaining--;
        position++;
      }
      ref.current.setSelectionRange(position, position);
      caret.current = null;
    }
  }, [display, draft]);
  return <input {...props} ref={ref} type="text" inputMode="decimal" value={display} onChange={(event) => {
    const text = event.target.value;
    const raw = normalizeAmountInput(text);
    if (!/^-?\d*(\.\d*)?$/.test(raw)) return;
    caret.current = text.slice(0, event.target.selectionStart ?? text.length).replace(/\s/g, "").length;
    setDraft(raw);
    const number = raw === "" ? NaN : Number(raw);
    const invalid = raw !== "" && (!Number.isFinite(number) || (min !== undefined && number < Number(min)) || (max !== undefined && number > Number(max)) || (step === "0.01" && (raw.split(".")[1]?.length ?? 0) > 2));
    event.target.setCustomValidity(invalid ? (locale.startsWith("fr") ? "Montant invalide." : "Invalid amount.") : "");
    onChange?.({ ...event, target: { ...event.target, value: raw, valueAsNumber: number }, currentTarget: event.currentTarget } as ChangeEvent<HTMLInputElement>);
  }} />;
}

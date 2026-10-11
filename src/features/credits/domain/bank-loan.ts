export interface BankLoan {
  rateType: "fixed" | "variable" | "revolving";
  annualRate: number;
  termMonths: number;
  firstPaymentDate: string;
  insuranceMonthly: number;
  fees: number;
  creditLimit?: number;
  reference?: string;
}
export function validateBankLoan(
  bank: BankLoan,
  principal: number,
  start: string,
) {
  if (
    !["fixed", "variable", "revolving"].includes(bank.rateType) ||
    !Number.isFinite(bank.annualRate) ||
    bank.annualRate < 0 ||
    bank.annualRate > 100 ||
    !Number.isInteger(bank.termMonths) ||
    bank.termMonths < 1 ||
    bank.termMonths > 600
  )
    throw new Error("Conditions bancaires invalides.");
  for (const value of [principal, bank.insuranceMonthly, bank.fees])
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      !Number.isSafeInteger(Math.round(value * 100)) ||
      value !== Number(value.toFixed(2))
    )
      throw new Error("Montant bancaire invalide.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(bank.firstPaymentDate) ||
    !Number.isFinite(Date.parse(bank.firstPaymentDate)) ||
    new Date(bank.firstPaymentDate).toISOString().slice(0, 10) !==
      bank.firstPaymentDate ||
    bank.firstPaymentDate < start
  )
    throw new Error("Première échéance invalide.");
  if (
    bank.rateType === "revolving" &&
    (!Number.isFinite(bank.creditLimit) ||
      bank.creditLimit! <= 0 ||
      bank.creditLimit !== Number(bank.creditLimit!.toFixed(2)))
  )
    throw new Error("Le capital utilisé dépasse le plafond.");
  if ((bank.reference?.length ?? 0) > 100)
    throw new Error("Référence trop longue.");
}
export function bankProjection(principal: number, bank: BankLoan) {
  validateBankLoan(bank, principal, "0000-01-01");
  const rate = bank.annualRate / 1200;
  let balance = Math.round(principal * 100);
  const nominal =
    rate === 0
      ? balance / bank.termMonths
      : (balance * rate) / -Math.expm1(-bank.termMonths * Math.log1p(rate));
  const payment = Math.round(nominal);
  const insurance = Math.round(bank.insuranceMonthly * 100);
  const origin = new Date(`${bank.firstPaymentDate}T12:00:00Z`);
  const schedule = [];
  for (let index = 0; index < bank.termMonths && balance > 0; index++) {
    const interest = Math.round(balance * rate);
    const capital =
      index === bank.termMonths - 1
        ? balance
        : Math.min(balance, Math.max(0, payment - interest));
    balance -= capital;
    const date = new Date(
      Date.UTC(origin.getUTCFullYear(), origin.getUTCMonth() + index, 1),
    );
    const lastDay = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    ).getUTCDate();
    date.setUTCDate(Math.min(origin.getUTCDate(), lastDay));
    schedule.push({
      number: index + 1,
      date: date.toISOString().slice(0, 10),
      capital: capital / 100,
      interest: interest / 100,
      insurance: insurance / 100,
      amount: (capital + interest + insurance) / 100,
      remaining: balance / 100,
    });
  }
  const totalMinor = schedule.reduce(
    (sum, row) => sum + Math.round(row.amount * 100),
    Math.round(bank.fees * 100),
  );
  if (!Number.isSafeInteger(totalMinor))
    throw new Error("Montant total trop élevé.");
  return {
    monthlyPayment: (payment + insurance) / 100,
    totalCost: (totalMinor - Math.round(principal * 100)) / 100,
    totalRepayable: totalMinor / 100,
    schedule,
  };
}

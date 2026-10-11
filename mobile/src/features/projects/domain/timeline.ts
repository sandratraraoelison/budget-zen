export function projectTimeline(
  project: { startDate?: string; targetDate?: string | null; status: string },
  today: string,
) {
  const day = (value: string) => Date.parse(`${value}T00:00:00Z`) / 86400000;
  const current = day(today);
  const startDays = project.startDate
    ? day(project.startDate) - current
    : undefined;
  const targetDays = project.targetDate
    ? day(project.targetDate) - current
    : undefined;
  const phase =
    project.status !== "en-cours"
      ? "completed"
      : startDays !== undefined && startDays > 0
        ? "planned"
        : "active";
  return { phase, startDays, targetDays };
}

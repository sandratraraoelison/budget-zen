export function savingsPlan(
  goal: { target: number; current: number; deadline: string },
  today: string,
) {
  const remainingMinor = Math.max(
    0,
    Math.round(goal.target * 100) - Math.round(goal.current * 100),
  );
  const days = Math.round(
    (Date.parse(`${goal.deadline}T00:00:00Z`) -
      Date.parse(`${today}T00:00:00Z`)) /
      86400000,
  );
  return {
    remaining: remainingMinor / 100,
    progress: Math.min(100, Math.max(0, (goal.current / goal.target) * 100)),
    days,
    achieved: remainingMinor === 0,
    monthly:
      days > 0
        ? Math.ceil(remainingMinor / Math.max(1, Math.ceil(days / 30))) / 100
        : undefined,
  };
}

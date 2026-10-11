import { test } from "node:test";
import assert from "node:assert/strict";
import { projectTimeline } from "./timeline";
test("project timelines distinguish future starts, target day and past targets", () => {
  const project = {
    status: "en-cours",
    startDate: "2026-11-01",
    targetDate: "2026-12-15",
  };
  assert.equal(projectTimeline(project, "2026-10-11").phase, "planned");
  assert.equal(projectTimeline(project, "2026-10-11").targetDays, 65);
  assert.equal(projectTimeline(project, "2026-12-15").targetDays, 0);
  assert.equal(projectTimeline(project, "2026-12-16").targetDays, -1);
  assert.equal(
    projectTimeline({ ...project, status: "achevée" }, "2026-12-16").phase,
    "completed",
  );
  assert.equal(
    projectTimeline({ status: "en-cours" }, "2026-12-16").targetDays,
    undefined,
  );
});

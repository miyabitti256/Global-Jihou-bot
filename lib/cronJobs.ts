import type { ScheduledMessage } from "@prisma/client";
import { cronJobs, setCronJobs } from "..";

export async function updateJobs(scheduledId: string, newSchedule: ScheduledMessage) {
  const cronJob = cronJobs.get(scheduledId);
  if (cronJob) {
    cronJob.stop();
  }
  setCronJobs(newSchedule);
}

export function deleteJob(scheduleId: string) {
  const job = cronJobs.get(scheduleId);
  if (job) {
    job.stop();
    cronJobs.delete(scheduleId);
  }
}
import { ITask } from '../models/Task';

const ESCALATION_TIMES = {
  LOW_TO_MEDIUM: 5 * 60 * 1000, // 5 minutes in milliseconds
  LOW_TO_HIGH: (5 + 20) * 60 * 1000, // 25 minutes in milliseconds
  MEDIUM_TO_HIGH: 10 * 60 * 1000, // 10 minutes in milliseconds
};

export const shouldEscalatePriority = (task: ITask): 'low' | 'medium' | 'high' => {
  const createdTime = new Date(task.createdAt).getTime();
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - createdTime;

  // If task is already high priority, keep it high
  if (task.priority === 'high') {
    return 'high';
  }

  // If task was created as low priority
  if (task.priority === 'low') {
    if (timeDifference >= ESCALATION_TIMES.LOW_TO_HIGH) {
      return 'high';
    } else if (timeDifference >= ESCALATION_TIMES.LOW_TO_MEDIUM) {
      return 'medium';
    }
  }

  // If task was created as medium priority
  if (task.priority === 'medium' && timeDifference >= ESCALATION_TIMES.MEDIUM_TO_HIGH) {
    return 'high';
  }

  // If no escalation needed, return current priority
  return task.priority;
}; 
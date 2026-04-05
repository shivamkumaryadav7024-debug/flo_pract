/**
 * Mock API that simulates network delay and occasional failures.
 * - 1.5s simulated network delay
 * - 20% random failure rate
 */

export const moveTaskApi = (taskId, fromColumn, toColumn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldFail = Math.random() < 0.2;
      if (shouldFail) {
        reject(new Error("Server error: Failed to move task. Please try again."));
      } else {
        resolve({ taskId, fromColumn, toColumn, success: true });
      }
    }, 1500);
  });
};
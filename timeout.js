/**
 * @stability 4 - locked
 * 
 * Uses the native `setTimeout` function to wait for a given number of milliseconds.
 */
export const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

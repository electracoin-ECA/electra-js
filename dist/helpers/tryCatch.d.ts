/**
 * Helper to one-line try / catch statements
 */
export default function <T>(callback: () => T): [undefined, T] | [Error, undefined];

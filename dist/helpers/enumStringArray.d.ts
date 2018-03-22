/**
 * Helper to create a K:V from an array of strings.
 */
export default function <T extends string>(strings: T[]): {
    [K in T]: K;
};

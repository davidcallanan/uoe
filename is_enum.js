/**
 * Checks if an object is a uoe-enum instance.
 * 
 * See `enum`.
 */
export const is_enum = (obj) => typeof obj?.sym === "string";

export const isEnum = is_enum;

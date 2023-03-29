/**
 * Checks if an object is a uoe-enum.
 */
export const is_enm = (obj) => typeof obj?.sym === "string";

export const isEnm = is_enm;

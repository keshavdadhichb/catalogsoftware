/**
 * Class name merge utility - combines clsx with tailwind-merge style
 * Ported from fit-check project
 */
import clsx from 'clsx';

/**
 * Merge class names conditionally
 * @param {...string|object|array} inputs - Class names to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
    return clsx(inputs);
}

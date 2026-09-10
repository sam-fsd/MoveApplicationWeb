import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge cannot tell a custom font size from a text colour: given
 * `text-white text-label-md` it assumes both are colours and keeps only the
 * last one, silently dropping the colour. Registering the project's font-size
 * scale (from tailwind.config.ts) fixes the whole class of bug.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "headline-xl",
            "headline-xl-mobile",
            "headline-lg",
            "headline-lg-mobile",
            "headline-md",
            "headline-sm",
            "price-hero",
            "price-listing",
            "body-lg",
            "body-md",
            "body-sm",
            "label-md",
            "label-sm",
            "caption",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

"use client";

import { useEffect, useRef } from "react";
import { recordListingView } from "./actions";

/**
 * Records one view per mount, from the client, so bots and prefetches that
 * never render do not inflate the number the owner sees on screen 19.
 */
export function ViewCounter({ listingId }: { listingId: string }) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    void recordListingView(listingId);
  }, [listingId]);

  return null;
}

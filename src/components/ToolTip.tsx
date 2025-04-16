import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

type TooltipPortalProps = {
  content: string;
  targetRef: HTMLElement | undefined | null;
};

export default function TooltipPortal({
  content,
  targetRef,
}: TooltipPortalProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (targetRef) {
      const rect = targetRef.getBoundingClientRect();
      const tooltipWidth = 120;

      setCoords({
        top: rect.top + window.scrollY + rect.height,
        left: rect.right + window.scrollX + tooltipWidth / 2,
      });
    }
  }, [targetRef]);

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        backgroundColor: "black",
        color: "white",
        padding: "6px 10px",
        borderRadius: "6px",
        whiteSpace: "nowrap",
        zIndex: 9999,
      }}
      className="tooltiptext"
    >
      {content}
    </div>,
    document.body
  );
}

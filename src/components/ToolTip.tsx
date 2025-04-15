import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

type TooltipPortalProps = {
  content: string;
  targetRef: React.RefObject<HTMLElement>|null;
};

export default function TooltipPortal ({ content, targetRef }:TooltipPortalProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 40, // show above
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [targetRef]);

  return createPortal(
    <div
      ref={tooltipRef}
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        transform: "translateX(100%)",
        backgroundColor: "black",
        color: "white",
        padding: "6px 10px",
        borderRadius: "6px",
        whiteSpace: "nowrap",
        zIndex: 9999,
      }}
    >
      {content}
    </div>,
    document.body
  );
};

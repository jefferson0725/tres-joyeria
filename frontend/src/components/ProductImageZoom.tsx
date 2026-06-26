import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ProductImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function ProductImageZoom({
  src,
  alt,
  className,
  children,
}: ProductImageZoomProps) {
  const [canHover, setCanHover] = useState(false);

  // Desktop hover magnifier
  const [hoverZoom, setHoverZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  // Mobile pinch-to-zoom + pan
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // Mirror live transform state for use inside native touch listeners
  const stateRef = useRef({ scale: 1, tx: 0, ty: 0 });
  useEffect(() => {
    stateRef.current = { scale, tx, ty };
  }, [scale, tx, ty]);

  const gesture = useRef({
    mode: "" as "" | "pinch" | "pan",
    startDist: 0,
    startScale: 1,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  // Reset everything when the displayed image changes (switching photo/size)
  useEffect(() => {
    setHoverZoom(false);
    setOrigin("50% 50%");
    setScale(1);
    setTx(0);
    setTy(0);
  }, [src]);

  // Touch pinch/pan handlers (attached natively so we can preventDefault)
  useEffect(() => {
    if (canHover) return;
    const el = containerRef.current;
    if (!el) return;

    const distOf = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        gesture.current.mode = "pinch";
        gesture.current.startDist = distOf(e.touches);
        gesture.current.startScale = stateRef.current.scale;
        e.preventDefault();
      } else if (e.touches.length === 1 && stateRef.current.scale > 1) {
        gesture.current.mode = "pan";
        gesture.current.lastX = e.touches[0].clientX;
        gesture.current.lastY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        gesture.current.mode = "";
      }
    };

    const onMove = (e: TouchEvent) => {
      if (gesture.current.mode === "pinch" && e.touches.length === 2) {
        const ratio = distOf(e.touches) / gesture.current.startDist;
        const next = clamp(gesture.current.startScale * ratio, MIN_SCALE, MAX_SCALE);
        const rect = el.getBoundingClientRect();
        const maxX = (rect.width * (next - 1)) / 2;
        const maxY = (rect.height * (next - 1)) / 2;
        setScale(next);
        setTx((v) => clamp(v, -maxX, maxX));
        setTy((v) => clamp(v, -maxY, maxY));
        e.preventDefault();
      } else if (gesture.current.mode === "pan" && e.touches.length === 1) {
        const nx = e.touches[0].clientX;
        const ny = e.touches[0].clientY;
        const rect = el.getBoundingClientRect();
        const maxX = (rect.width * (stateRef.current.scale - 1)) / 2;
        const maxY = (rect.height * (stateRef.current.scale - 1)) / 2;
        setTx((v) => clamp(v + (nx - gesture.current.lastX), -maxX, maxX));
        setTy((v) => clamp(v + (ny - gesture.current.lastY), -maxY, maxY));
        gesture.current.lastX = nx;
        gesture.current.lastY = ny;
        e.preventDefault();
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        gesture.current.mode = "";
        if (stateRef.current.scale <= 1.02) {
          setScale(1);
          setTx(0);
          setTy(0);
        }
      } else if (e.touches.length === 1) {
        // Lifting one finger of a pinch → continue as pan if still zoomed
        gesture.current.mode = stateRef.current.scale > 1 ? "pan" : "";
        gesture.current.lastX = e.touches[0].clientX;
        gesture.current.lastY = e.touches[0].clientY;
      }
    };

    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [canHover]);

  const handleMouseEnter = canHover ? () => setHoverZoom(true) : undefined;
  const handleMouseLeave = canHover ? () => setHoverZoom(false) : undefined;
  const handleMouseMove = canHover
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
        const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
        setOrigin(`${x}% ${y}%`);
      }
    : undefined;

  const imgStyle: React.CSSProperties = canHover
    ? {
        transformOrigin: origin,
        transform: hoverZoom ? "scale(2)" : "scale(1)",
      }
    : {
        transformOrigin: "center center",
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
        transition: scale > 1 ? "none" : "transform 0.25s ease",
      };

  return (
    <div
      ref={containerRef}
      className={cn(
        "aspect-square overflow-hidden bg-muted rounded-sm relative group",
        className
      )}
      style={canHover ? undefined : { touchAction: "pan-y" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          canHover && "transition-transform duration-200 cursor-zoom-in"
        )}
        style={imgStyle}
        draggable={false}
      />
      {children}
    </div>
  );
}

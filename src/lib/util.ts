import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SceneEditorCell } from "../components/canvas/state";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEffectiveDuration(cell: SceneEditorCell) {
  const duration = cell.duration || 0;
  const trimStart = cell.trimStart || 0;
  const trimEnd = cell.trimEnd || 0;
  return Math.max(0.1, duration - trimStart - trimEnd);
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPublicId(imageURL: string) {
  return imageURL.split("/").pop()?.split(".")[0];
}

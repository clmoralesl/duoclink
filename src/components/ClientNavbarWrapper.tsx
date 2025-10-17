"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  const HIDDEN = ["/", "/login", "/register"];
  if (HIDDEN.includes(pathname)) return null;
  return <Navbar />;
}
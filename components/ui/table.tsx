import { cn } from "@/lib/utils";
import React from "react";

/* =========================
   TABLE
========================= */
export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table
        className={cn(
          "w-full text-sm font-sans text-gray-700",
          className
        )}
      >
        {children}
      </table>
    </div>
  );
}

/* =========================
   TABLE HEADER
========================= */
export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
      {children}
    </thead>
  );
}

/* =========================
   TABLE BODY
========================= */
export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

/* =========================
   TABLE ROW
========================= */
export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-t hover:bg-gray-50 transition",
        className
      )}
    >
      {children}
    </tr>
  );
}

/* =========================
   TABLE HEADER CELL
========================= */
export function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 font-medium",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}
    >
      {children}
    </th>
  );
}

/* =========================
   TABLE CELL
========================= */
export function Td({
  children,
  align = "left",
  bold = false,
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  bold?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3",
        align === "center" && "text-center",
        align === "right" && "text-right",
        bold && "font-semibold text-gray-800"
      )}
    >
      {children}
    </td>
  );
}

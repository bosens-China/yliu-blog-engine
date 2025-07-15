"use client";

import Link from "next/link";

interface ColumnPostLinkProps {
  href: string;
  title: string;
}

export default function ColumnPostLink({ href, title }: ColumnPostLinkProps) {
  return (
    <Link
      href={href}
      className="truncate block hover:text-primary"
      onClick={(e) => e.stopPropagation()}
    >
      • {title}
    </Link>
  );
}

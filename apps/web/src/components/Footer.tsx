"use client";

export default function Footer() {
  const footerText = process.env.NEXT_PUBLIC_FOOTER_TEXT;

  if (!footerText) {
    return null;
  }

  return (
    <footer className="bg-background border-t border-border py-4 mt-8 print:hidden">
      <div className="text-center text-sm text-muted-foreground">
        <p>{footerText}</p>
      </div>
    </footer>
  );
}

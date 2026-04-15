import Link from "next/link";

const footerLinks = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy",    href: "/" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 bg-bg-dark">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap">
        <div>
          <p className="font-grotesk font-black text-[17px] uppercase tracking-[0.3px] text-text-primary">
            MAJU Fleet
          </p>
          <p className="text-[11px] tracking-[0.3px] mt-1 text-white/40">
            © 2025 Maju Fleet. All rights reserved.
          </p>
        </div>

        <div className="flex gap-7 flex-wrap justify-center">
          {footerLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[11px] uppercase tracking-[1.2px] text-white/40 hover:text-[#BDF4FF] transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-[1.4px] text-white/25 font-grotesk">
          Navigating the Future
        </p>
      </div>
    </footer>
  );
}

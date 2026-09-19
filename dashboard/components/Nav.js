import Link from "next/link";
import { useRouter } from "next/router";

export default function Nav({ dark = false }) {
  const { pathname } = useRouter();

  return (
    <nav className={`nav${dark ? " nav-dark" : ""}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          HongHyun&apos;s Work Space
        </Link>
        <div className="nav-links">
          <Link href="/minutes" className={pathname === "/minutes" ? "active" : ""}>
            회의록
          </Link>
        </div>
      </div>
    </nav>
  );
}

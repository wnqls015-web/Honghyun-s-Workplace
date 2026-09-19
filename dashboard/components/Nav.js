import Link from "next/link";
import { useRouter } from "next/router";

export default function Nav() {
  const { pathname } = useRouter();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          HongHyun&apos;s Work Space
        </Link>
        <div className="nav-links">
          <Link href="/minutes" className={pathname === "/minutes" ? "active" : ""}>
            회의록
          </Link>
          <Link href="/rp" className={pathname === "/rp" ? "active" : ""}>
            RP
          </Link>
        </div>
      </div>
    </nav>
  );
}

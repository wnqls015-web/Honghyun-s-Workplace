import Link from "next/link";
import { useRouter } from "next/router";

export default function Nav() {
  const { pathname } = useRouter();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-brand">Workplace</span>
        <div className="nav-links">
          <Link href="/" className={pathname === "/" ? "active" : ""}>
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

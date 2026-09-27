import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setRevealed(window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-stage">
      <header className="hero hero-landing">
        <h1 className="hero-title">
          HongHyun&apos;s
          <br />
          Work Space
        </h1>

        <div className={`landing-inline-menu${revealed ? " revealed" : ""}`}>
          <Link href="/minutes" className="landing-menu-link">
            <span className="landing-menu-title">회의록</span>
            <span className="landing-menu-desc">
              자동 생성된 사내 표준 양식 회의록을 확인하고 다운로드합니다.
            </span>
          </Link>
        </div>

        <div className={`scroll-hint${revealed ? " scroll-hint-hidden" : ""}`}>⌄</div>
      </header>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="hero hero-landing">
        <h1 className="hero-title">
          HongHyun&apos;s
          <br />
          Work Space
        </h1>
        <div className="scroll-hint">⌄</div>
      </header>

      <section className="landing-menu">
        <div className="landing-menu-inner">
          <Link href="/minutes" className="landing-menu-link">
            <span className="landing-menu-title">회의록</span>
            <span className="landing-menu-desc">
              자동 생성된 사내 표준 양식 회의록을 확인하고 다운로드합니다.
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

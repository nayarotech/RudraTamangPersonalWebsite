import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="kicker">404</p>
      <h1 className="display mt-5 text-6xl">This page isn&apos;t here.</h1>
      <p className="mt-4 text-lg text-muted">यो पृष्ठ फेला परेन।</p>
      <Link href="/" className="btn btn-primary mt-10">
        Home · गृहपृष्ठ
      </Link>
    </section>
  );
}

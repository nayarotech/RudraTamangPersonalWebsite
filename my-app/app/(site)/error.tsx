"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="kicker">Error</p>
      <h1 className="display mt-5 text-5xl">Something went wrong loading this page.</h1>
      <p className="mt-4 text-lg text-muted">केही गडबड भयो। कृपया फेरि प्रयास गर्नुहोस्।</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-10">
        Try again
      </button>
    </section>
  );
}

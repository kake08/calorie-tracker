// Shown instantly while a page loads the signed-in user's data.
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-label="Loading">
      <div className="h-12 w-40 rounded-xl bg-line" />
      <div className="h-40 rounded-2xl bg-line" />
      <div className="h-32 rounded-2xl bg-line" />
    </div>
  );
}

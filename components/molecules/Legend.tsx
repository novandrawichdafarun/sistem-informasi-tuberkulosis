export default function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-4 w-4 rounded ${className}`} />
      {label}
    </div>
  );
}

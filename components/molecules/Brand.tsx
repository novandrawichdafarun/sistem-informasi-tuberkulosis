import Logo from "../asset/Logo";

export default function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
      <Logo size="md" badge />
      <div className="leading-tight">
        <p className="font-bold text-brand-800">
          NU-TB<span className="text-brand-500">CARE</span>
        </p>
      </div>
    </div>
  );
}

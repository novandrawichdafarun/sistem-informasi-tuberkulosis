export default function SelectField({
  label,
  name,
  options,
  defaultValue,
  required = true,
  inputClass,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultValue?: string | null;
  inputClass: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && "*"}
      </label>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue || ""}
        className={`${inputClass} bg-white`}
      >
        <option value="">-- Pilih --</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

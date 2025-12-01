export default function Input({ label, type, ...rest }) {
  const getAutocomplete = () => {
    if (type === "password") return "current-password";
    if (type === "email") return "email";
    if (label?.toLowerCase().includes("username")) return "username";
    if (label?.toLowerCase().includes("name")) return "name";
    return "off";
  };

  return (
    <div className="flex flex-col mb-3">
      <label className="text-sm font-semibold mb-1">{label}</label>
      <input
        type={type}
        autoComplete={getAutocomplete()}
        {...rest}
        className="border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

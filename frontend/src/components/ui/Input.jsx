export default function Input({ label, type, className = "", ...rest }) {
  const getAutocomplete = () => {
    if (type === "password") return "current-password";
    if (type === "email") return "email";
    if (label?.toLowerCase().includes("username")) return "username";
    if (label?.toLowerCase().includes("name")) return "name";
    return "off";
  };

  const baseClasses = "border px-2 sm:px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base";

  if (label) {
    return (
      <div className="flex flex-col mb-3">
        <label className="text-xs sm:text-sm font-semibold mb-1">{label}</label>
        <input
          type={type}
          autoComplete={getAutocomplete()}
          {...rest}
          className={`${baseClasses} ${className}`}
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      autoComplete={getAutocomplete()}
      {...rest}
      className={`${baseClasses} ${className}`}
    />
  );
}

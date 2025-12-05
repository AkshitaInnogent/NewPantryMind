import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export default function Alert({ 
  type = "info", 
  title, 
  message, 
  onAction,
  actionText = "Try Again",
  className = ""
}) {
  const types = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200", 
      text: "text-green-800",
      icon: <CheckCircle className="w-6 h-6" />,
      button: "bg-green-100 hover:bg-green-200 text-green-800"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800", 
      icon: <XCircle className="w-6 h-6" />,
      button: "bg-red-100 hover:bg-red-200 text-red-800"
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: <AlertCircle className="w-6 h-6" />,
      button: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
    },
    info: {
      bg: "bg-blue-50", 
      border: "border-blue-200",
      text: "text-blue-800",
      icon: <Info className="w-6 h-6" />,
      button: "bg-blue-100 hover:bg-blue-200 text-blue-800"
    }
  };

  const config = types[type];

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-6 mb-8 ${className}`}>
      <div className={`flex items-center gap-3 ${config.text} mb-2`}>
        {config.icon}
        <span className="font-semibold text-lg">{title}</span>
      </div>
      <p className={`${config.text} mb-4`}>{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className={`${config.button} px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
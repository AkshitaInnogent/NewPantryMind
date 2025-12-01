import { useSelector } from "react-redux";

export default function AuthDebug() {
  const auth = useSelector((state) => state.auth);
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>
        <strong>Authenticated:</strong> {auth.isAuthenticated ? "✅" : "❌"}<br/>
        <strong>Token:</strong> {auth.token ? "✅" : "❌"}<br/>
        <strong>User ID:</strong> {auth.user?.id || "❌"}<br/>
        <strong>User Role:</strong> {auth.user?.role || "❌"}<br/>
        <strong>Kitchen ID:</strong> {auth.user?.kitchenId || "❌"}<br/>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer">Full Auth State</summary>
        <pre className="mt-1 text-xs overflow-auto max-h-32">
          {JSON.stringify(auth, null, 2)}
        </pre>
      </details>
    </div>
  );
}
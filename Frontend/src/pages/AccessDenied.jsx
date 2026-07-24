import { Link } from "react-router-dom";

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        You do not have permission to access this page. Please contact your administrator if you believe this is a mistake.
      </p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </Link>
    </div>
  );
}

export default AccessDenied;

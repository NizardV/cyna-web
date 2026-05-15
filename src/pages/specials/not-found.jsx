import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div
            className="h-full flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 font-sans p-8"
        >
            <div
                className="text-center bg-white p-12 md:p-10 rounded-xl shadow-2xl max-w-2xl w-full"
                role="main"
                aria-labelledby="notfound-title"
            >
                <p
                    className="text-7xl md:text-8xl font-bold m-0 text-slate-900 tracking-tight"
                    aria-hidden
                >
                    404
                </p>
                <h1
                    id="notfound-title"
                    className="mt-2 text-2xl font-semibold text-slate-900"
                >
                    Page Not Found
                </h1>
                <p className="mt-3 text-slate-600 text-lg max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved. Check the
                    URL or return to the homepage.
                </p>
                <Link
                    to="/"
                    className="inline-block mt-6 bg-indigo-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Go to homepage"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
}
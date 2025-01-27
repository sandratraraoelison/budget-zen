import Link from "next/link";
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-3xl font-bold text-center mb-6">BudgetZen</h1>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary text-center"
          >
            Accès Démo
          </Link>

          <Link
            href="/login"
            className="block w-full border-2 border-primary text-primary py-2 px-4 rounded hover:bg-blue-50 text-center"
          >
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

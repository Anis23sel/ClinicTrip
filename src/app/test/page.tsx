import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";

export default async function TestPage() {
  const cookieStore = await cookies();

  const supabase = createClient(cookieStore);

  const { data: clinics, error } = await supabase
    .from("clinics")
    .select("*");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Supabase Test</h1>

        <p className="mt-4 text-red-500">
          Error: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Clinics
      </h1>

      {clinics.length === 0 ? (
        <p>No clinics found.</p>
      ) : (
        <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
          {JSON.stringify(clinics, null, 2)}
        </pre>
      )}
    </main>
  );
}
import { login } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const tokens = await login({ username, password });

    const cookieStore = await cookies();

    cookieStore.set("access_token", tokens.access_token, {
      httpOnly: true,
      path: "/",
    });

    cookieStore.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      path: "/",
    });

    redirect("/");
  }

  return (
    <form action={handleLogin} className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        name="username"
        placeholder="Email"
        className="border p-2 w-full"
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
      />

      <button
        type="submit"
        className="bg-black text-white px-4 py-2"
      >
        Login
      </button>
    </form>
  );
}

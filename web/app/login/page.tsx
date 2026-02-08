import { login } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  async function handleLogin(
    _prevState: { error?: string; nonce?: number },
    formData: FormData
  ) {
    "use server";

    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!username || !password) {
      return { error: "Please enter both email and password.", nonce: Date.now() };
    }

    let tokens: Awaited<ReturnType<typeof login>>;
    try {
      tokens = await login({ username, password });
    } catch {
      return { error: "Invalid username or password.", nonce: Date.now() };
    }

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
    <main className="p-10">
      <AppHeader />
      <LoginForm action={handleLogin} />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

type LoginState = {
  error?: string;
  nonce?: number;
};

type LoginFormProps = {
  action: (prevState: LoginState, formData: FormData) => Promise<LoginState>;
};

type Errors = {
  username?: string;
  password?: string;
};

const initialState: LoginState = { nonce: 0 };

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction] = useFormState(action, initialState);
  const [serverError, setServerError] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    setServerError(state.error);
  }, [state.error, state.nonce]);

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    const nextErrors: Errors = {};
    if (!username) nextErrors.username = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";

    if (nextErrors.username || nextErrors.password) {
      e.preventDefault();
      setErrors(nextErrors);
    }
  }

  function clearError(field: keyof Errors) {
    if (!errors[field]) return;
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold">Login</h2>

      {serverError && (
        <p className="text-sm text-red-600">{serverError}</p>
      )}

      <div className="space-y-1">
        <input
          name="username"
          placeholder="Email"
          className={`border p-2 w-full ${
            errors.username || serverError ? "border-red-500" : ""
          }`}
          onChange={() => {
            clearError("username");
            if (serverError) setServerError(undefined);
          }}
        />
        {errors.username && (
          <p className="text-sm text-red-600">{errors.username}</p>
        )}
      </div>

      <div className="space-y-1">
        <input
          name="password"
          type="password"
          placeholder="Password"
          className={`border p-2 w-full ${
            errors.password || serverError ? "border-red-500" : ""
          }`}
          onChange={() => {
            clearError("password");
            if (serverError) setServerError(undefined);
          }}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2">
        Login
      </button>
    </form>
  );
}

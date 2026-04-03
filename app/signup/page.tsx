"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

  // Debounced username check
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUsername = useCallback(
    debounce(async (value: string) => {
      if (!value) { setUsernameStatus("idle"); return; }
      if (!USERNAME_RE.test(value)) { setUsernameStatus("invalid"); return; }

      setUsernameStatus("checking");
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(value)}`);
        if (res.status === 404) {
          setUsernameStatus("available");
        } else if (res.ok) {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("idle");
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkUsername(username);
  }, [username, checkUsername]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!USERNAME_RE.test(username)) {
      setError("사용자명은 영문자, 숫자, 밑줄(_)만 사용 가능하며 3~20자 이내여야 합니다.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("이미 사용 중인 사용자명입니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, display_name: displayName }),
      });

      const json = await res.json() as { error?: string; user?: { username: string } };

      if (!res.ok) {
        setError(json.error ?? "회원가입 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }

      router.push(`/${json.user!.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const usernameHint = (() => {
    if (usernameStatus === "checking") return { text: "확인 중…", color: "text-zinc-400" };
    if (usernameStatus === "available") return { text: "사용 가능한 사용자명입니다.", color: "text-green-600 dark:text-green-400" };
    if (usernameStatus === "taken") return { text: "이미 사용 중인 사용자명입니다.", color: "text-red-500" };
    if (usernameStatus === "invalid") return { text: "영문자, 숫자, 밑줄(_)만 사용 가능 (3~20자).", color: "text-amber-500" };
    return null;
  })();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          연결의 숲 가입
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          나만의 마크다운 숲을 만들어보세요
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              사용자명 <span className="text-zinc-400 font-normal">(영문·숫자·_ / 3~20자)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none">
                yeongyeol.forest/
              </span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full rounded-lg border border-zinc-300 bg-white pl-[9.5rem] pr-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
                placeholder="my_username"
              />
            </div>
            {usernameHint && (
              <p className={`text-xs ${usernameHint.color}`}>{usernameHint.text}</p>
            )}
          </div>

          {/* Display name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="display_name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              표시 이름
            </label>
            <input
              id="display_name"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
              placeholder="홍길동"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
              placeholder="me@example.com"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-700"
              placeholder="최소 6자"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || usernameStatus === "taken" || usernameStatus === "invalid"}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "가입 중…" : "가입하기"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          이미 계정이 있으신가요?{" "}
          <a href="/login" className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200">
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}

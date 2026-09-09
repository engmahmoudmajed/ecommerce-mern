import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import useUserStore from "../stores/useUserStore.js";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useUserStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(email, password);
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400">
            Login to your account
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Join us and get started today
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="rounded-xl border border-gray-700/60 bg-gray-800/90 p-5 shadow-xl backdrop-blur-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                  block w-full rounded-lg border border-gray-600
                  bg-gray-700/80 py-3 pl-10 pr-3
                  text-sm text-white
                  placeholder-gray-400
                  transition
                  focus:border-emerald-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500/30
                "
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>

                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                  block w-full rounded-lg border border-gray-600
                  bg-gray-700/80 py-3 pl-10 pr-3
                  text-sm text-white
                  placeholder-gray-400
                  transition
                  focus:border-emerald-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500/30
                "
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                // disabled={loading}
                className="
              flex w-full items-center justify-center
              rounded-lg bg-emerald-600
              px-4 py-3
              text-sm font-semibold text-white
              shadow-sm
              transition-all duration-200
              hover:bg-emerald-700
              hover:shadow-lg hover:shadow-emerald-900/20
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-500
              focus:ring-offset-2
              focus:ring-offset-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
              >
                {false ? (
                  <>
                    <Loader
                      className="mr-2 h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                    Login to Account
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="
              inline-flex items-center
              font-medium text-emerald-400
              transition-colors
              hover:text-emerald-300
            "
              >
                Sign Up
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default LoginPage;
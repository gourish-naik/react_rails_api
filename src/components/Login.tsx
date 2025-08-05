import { useState } from "react";
import { useLoginUserMutation } from "@/store/api/apiSlice";
import { useDispatch } from "react-redux";
import { setToken } from "@/store/api/authSlice";
import { Link } from "react-router-dom";
import PasswordInput from "./PasswordInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const [err,] = useState({ isError: false, errMsg: "" });
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password }).unwrap();
      dispatch(setToken(response.token));
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
          Password
        </label>
        <PasswordInput password={password} setPassword={setPassword} err={err}/>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 text-white font-semibold rounded-md ${
          isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </form>
  );
}

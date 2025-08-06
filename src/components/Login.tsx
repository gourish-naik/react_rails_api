import { useEffect, useState } from "react";
import { useLoginUserMutation } from "@/store/api/apiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/api/authSlice";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [err, setErr] = useState({ isError: false, errMsg: "" });

  useEffect(() => {
    if (!passwordTouched) return

    const debounce = setTimeout(() => {
      const validationError = validatePassword(password);
      if (validationError) {
        setErr({ isError: true, errMsg: validationError });
        setPassword('')
      } else {
        setErr({ isError: false, errMsg: "" });
      }
    }, 200);

    return () => clearTimeout(debounce);
  }, [password, passwordTouched])


  const validatePassword = (value: string): string | null => {
    if (!value || value.trim().length == 0 || value.length == 0) {
      return "Password can't be empty.";
    } else return null
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginUser({ email, password }).unwrap();
      const { token, refreshToken, msg } = response.data;
      dispatch(setCredentials({ token, email, refreshToken }));
      toast(msg);
      navigate("/");
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const errObj = error as {
          data?: { data?: { error?: { msg?: string } } }
        };
        const targetMsg = errObj?.data?.data?.error?.msg
        setErr({
          isError:true,
          errMsg:`${String(targetMsg)}`
        })
        toast(errObj.data?.data?.error?.msg || "An unexpected error occurred");
      } else {
        toast("An unexpected error occurred");
      }

      console.error("Login failed", error);
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
        <PasswordInput password={password} setPassword={setPassword} err={err} onBlur={() => setPasswordTouched(true)} />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 text-white font-semibold rounded-md ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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

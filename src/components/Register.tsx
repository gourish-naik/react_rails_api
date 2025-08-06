import { useState, useEffect } from "react";
import { useRegisterUserMutation } from "@/store/api/apiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/api/authSlice";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [err, setErr] = useState({ isError: false, errMsg: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!passwordTouched) return;

    const debounce = setTimeout(() => {
      const validationError = validatePassword(password);
      if (validationError) {
        setErr({ isError: true, errMsg: validationError });
      } else {
        setErr({ isError: false, errMsg: "" });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [password, passwordTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword(password);
    if (validationError) {
      setErr({ isError: true, errMsg: validationError });
      return; // prevent submission
    }

    setErr({ isError: false, errMsg: "" });

    try {
      const response = await registerUser({ email, password }).unwrap();
      dispatch(setCredentials({ token: response.data.token, email , refreshToken: response.data.rftoken}));

      const redirectURL = response?.data.redirectURL;
      if (redirectURL) {
        navigate(redirectURL);
      } else {
        navigate("/"); // fallback to home
      }
    } catch (err) {
      console.error("Registration failed", err);
    }
  };


  const validatePassword = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Password can't be empty.";
    if (trimmed.length < 6) return "Password must be at least 6 characters long.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmed)) return "Password must include at least one special character.";
    if (!/\d/.test(trimmed)) return "Password must include at least one number.";
    return null;
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
        className={`w-full py-2 px-4 text-white font-semibold rounded-md ${isLoading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
      >
        {isLoading ? "Registering..." : "Register"}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}

import { useState } from "react";

interface PasswordInputProps {
  password: string;
  setPassword: (val: string) => void;
  err?: {
    isError: boolean;
    errMsg: string;
  };
  onBlur?: () => void; // optional
}

export default function PasswordInput({
  password,
  setPassword,
  err = { isError: false, errMsg: "" },
  onBlur,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { isError, errMsg } = err;

  return (
    <div className="relative">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={onBlur} // only runs if provided
          className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none pr-10 ${isError ? 'border-red-400 focus:outline-red-400' : 'focus:ring-green-500'}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          tabIndex={-1}
        >
          {showPassword ? (
            // Eye open
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            // Eye closed
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.977 9.977 0 012.293-3.95M6.364 6.364A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.977 9.977 0 01-4.187 5.412M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 3l18 18" />
            </svg>
          )}
        </button>
      </div>
      {isError && <span className="text-red-500 text-sm">{errMsg}</span>}
    </div>
  );
}

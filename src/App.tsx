import { RootState } from "@/store/store";
import Login from "./components/Login";
import Todos from "./components/Todos";
import { ToastContainer, toast } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Register from "./components/Register";
import { logout } from '@/store/api/authSlice';
import { useLogOutMutation } from "@/store/api/apiSlice";

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function App() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [logoutUser] = useLogOutMutation();
  const dispatch = useDispatch()
  const email = useSelector((state: RootState) => state.auth.email);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      if (token && email) {
        const resp = await logoutUser({ token, email }).unwrap();
        toast(resp.data.msg);
        dispatch(logout());
        navigate("/login");
      }

    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-8">
        Rails Todo App with RTK Query
      </h1>
      {token &&
        <div className="flex justify-between align-middle ">
          <div className="font-normal text-sm">
            <span className="text-slate-600">UserId: </span><span className="text-blue-400">{email}</span>
          </div>
          <button
            onClick={() => handleLogout()}
            className={`px-4 py-2 rounded bg-red-500 text-white cursor-pointer`}
          >
            Logout
          </button>
        </div>
      }
      <Routes>
        {token ? (
          <Route path="/*" element={<Todos />} />
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;

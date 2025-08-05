import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Login from "./components/Login";
import Todos from "./components/Todos";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Register from "./components/Register";

function App() {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-8">
        Rails Todo App with RTK Query
      </h1>
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

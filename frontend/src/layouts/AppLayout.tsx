import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser.tsx";
import { AUTH_PATH } from "../constants/route-paths.ts";
import UserSidebar from "../components/UserSidebar.tsx";
import "./AppLayout.css";

function AppLayout() {
  const navigate = useNavigate();
  const { signOutUser } = useUser();

  const handleSignOut = () => {
    signOutUser();
    navigate(AUTH_PATH);
  };

  return (
    <div className="app-layout">
      <header className="app-layout-header">
        <h1>Chit-Chat</h1>
        <nav>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </nav>
      </header>

      <div className="app-layout-content">
        <div>
          <UserSidebar />
        </div>

        <main className="app-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "../style/text-utils.css";
import "../style/layout-utils.css";
import { routes, RouteGuard } from "./router";
import { ROOT_PATH, SIGN_IN_PATH, WILDCARD_PATH } from "./constants/route-paths.ts";

export function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirect */}
        <Route 
          path={ROOT_PATH} 
          element={<Navigate to={SIGN_IN_PATH} replace />} 
        />
        
        {/* Dynamic routes from configuration */}
        {routes.map(({ path, element: Element, protected: isProtected, public: isPublic }) => (
          <Route
            key={path}
            path={path}
            element={
              isProtected ? (
                <RouteGuard type="protected">
                  <Element />
                </RouteGuard>
              ) : isPublic ? (
                <RouteGuard type="public">
                  <Element />
                </RouteGuard>
              ) : (
                <Element />
              )
            }
          />
        ))}
        
        {/* Catch all route */}
        <Route 
          path={WILDCARD_PATH} 
          element={<Navigate to={SIGN_IN_PATH} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

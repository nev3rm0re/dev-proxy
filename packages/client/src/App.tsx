import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Settings } from "./components/Settings";
import { BuildHashBadge } from "./components/BuildHashBadge";

export const App = () => {
    return (
        <div className="min-h-screen bg-background">
            <Routes>
                <Route path="/" element={<Layout />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
            <BuildHashBadge />
        </div>
    );
};

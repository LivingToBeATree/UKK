import { Routes, Route, Navigate } from 'react-router-dom';
import { PlaygroundPage } from '@/pages/dev/Playground/PlaygroundPage';
export { ProtectedRoute } from './protectedRoutes';
export { GuestRoute } from './GuestRoute';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dev/sandbox" replace />} />
            <Route path="/dev" element={<Navigate to="/dev/sandbox" replace />} />
            <Route path="/dev/sandbox" element={<PlaygroundPage />} />
            <Route path="/dev/playground" element={<Navigate to="/dev/sandbox" replace />} />
            <Route path="/dev/components" element={<Navigate to="/dev/sandbox" replace />} />
            <Route path="/components" element={<Navigate to="/dev/sandbox" replace />} />
            <Route path="/login" element={<div>Login Page (Coming Up Next)</div>} />
            <Route path="/register" element={<div>Register Page (Coming Up Next)</div>} />
        </Routes>
    );
}

export default AppRoutes;
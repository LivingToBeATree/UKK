import { Routes, Route } from 'react-router-dom';
import { PlaygroundPage } from '@/pages/dev/Playground/PlaygroundPage';
export { ProtectedRoute } from './protectedRoutes';
export { GuestRoute } from './GuestRoute';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PlaygroundPage />} />
            <Route path="/components" element={<PlaygroundPage />} />
            <Route path="/login" element={<div>Login Page (Coming Up Next)</div>} />
            <Route path="/register" element={<div>Register Page (Coming Up Next)</div>} />
        </Routes>
    );
}

export default AppRoutes;
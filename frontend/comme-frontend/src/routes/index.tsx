import { Routes, Route } from 'react-router-dom';
export { ProtectedRoute } from './protectedRoutes';
export { GuestRoute } from './GuestRoute';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/login" element={<div>Login</div>} />
            <Route path="/register" element={<div>Register</div>} />
        </Routes>
    )
}

export default AppRoutes;
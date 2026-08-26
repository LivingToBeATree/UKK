import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className='flex h-screen w-full items-center justify-center bg-background'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent' />
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to='/login' state={{ from: location }} replace />;
};
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { isArtist, isStaff } from '@/types';

export interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
    requireArtist?: boolean;
    requireStaff?: boolean;
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    requireArtist = false,
    requireStaff = false,
    redirectTo = '/login',
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Role-based authorization for Admin / Staff panel
    if (requireStaff && !isStaff(user)) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Artist verification for Artist Studio Dashboard
    if (requireArtist && !isArtist(user)) {
        return <Navigate to="/artist-application/apply" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
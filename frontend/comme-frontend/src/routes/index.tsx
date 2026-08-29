import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protectedRoutes';
import { GuestRoute } from './GuestRoute';

// Layouts
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public
import { LandingPage } from '@/pages/LandingPage';
import { UserProfilePage } from '@/pages/profile/UserProfilePage';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Explore / Social
import { ExplorePage } from '@/pages/explore/ExplorePage';
import { PostDetailPage } from '@/pages/explore/PostDetailPage';
import { CreatePostPage } from '@/pages/explore/CreatePostPage';

// Store / Marketplace
import { StorePage } from '@/pages/store/StorePage';
import { ServiceDetailPage } from '@/pages/store/ServiceDetailPage';
import { ArtistsDirectoryPage } from '@/pages/artists/ArtistsDirectoryPage';
import { ArtistProfilePage } from '@/pages/artists/ArtistProfilePage';

// Commissions
import { OrderCommissionPage } from '@/pages/commissions/OrderCommissionPage';
import { MyCommissionsPage } from '@/pages/commissions/MyCommissionsPage';
import { CommissionDetailPage } from '@/pages/commissions/CommissionDetailPage';

// User Dashboard
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { BookmarksPage } from '@/pages/bookmarks/BookmarksPage';
import { ApplyArtistPage } from '@/pages/artist-application/ApplyArtistPage';
import { ApplicationStatusPage } from '@/pages/artist-application/ApplicationStatusPage';

// Artist Dashboard
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage';
import { ManageServicesPage } from '@/pages/dashboard/ManageServicesPage';
import { CreateServicePage } from '@/pages/dashboard/CreateServicePage';
import { ManagePortfolioPage } from '@/pages/dashboard/ManagePortfolioPage';
import { ManagePostsPage } from '@/pages/dashboard/ManagePostsPage';
import { ArtistCommissionsPage } from '@/pages/dashboard/ArtistCommissionsPage';

// Admin Panel
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { ArtistApplicationsPage } from '@/pages/admin/ArtistApplicationsPage';
import { ReportsPage } from '@/pages/admin/ReportsPage';
import { TicketsPage } from '@/pages/admin/TicketsPage';
import { TicketDetailPage } from '@/pages/admin/TicketDetailPage';
import { ModerationLogPage } from '@/pages/admin/ModerationLogPage';

// Dev (keep sandbox for development)
import { PlaygroundPage } from '@/pages/dev/Playground/PlaygroundPage';

export { ProtectedRoute } from './protectedRoutes';
export { GuestRoute } from './GuestRoute';

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/store/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/artists" element={<ArtistsDirectoryPage />} />
            <Route path="/artists/:id" element={<ArtistProfilePage />} />

            {/* User profiles */}
            <Route path="/@:username" element={<UserProfilePage />} />
            <Route path="/users/:username" element={<UserProfilePage />} />
            <Route path="/profile" element={<UserProfilePage />} />

            {/* Guest only routes */}
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/verify" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Authenticated user routes */}
            <Route element={<ProtectedRoute />}>
                {/* Post actions */}
                <Route path="/posts/create" element={<CreatePostPage />} />

                {/* Commission workflow */}
                <Route path="/store/:serviceId/order" element={<OrderCommissionPage />} />
                <Route path="/commissions" element={<MyCommissionsPage />} />
                <Route path="/commissions/:id" element={<CommissionDetailPage />} />
                <Route path="/orders" element={<Navigate to="/commissions" replace />} />
                <Route path="/orders/:id" element={<Navigate to="/commissions/:id" replace />} />

                {/* User dashboard */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/apply-artist" element={<ApplyArtistPage />} />
                <Route path="/apply-artist/status" element={<ApplicationStatusPage />} />
                <Route path="/artist-application/apply" element={<Navigate to="/apply-artist" replace />} />
                <Route path="/artist-application/status" element={<Navigate to="/apply-artist/status" replace />} />

                {/* Artist studio */}
                <Route element={<ProtectedRoute requireArtist={true} />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHomePage />} />
                        <Route path="services" element={<ManageServicesPage />} />
                        <Route path="services/new" element={<CreateServicePage />} />
                        <Route path="services/:id/edit" element={<CreateServicePage />} />
                        <Route path="portfolio" element={<ManagePortfolioPage />} />
                        <Route path="posts" element={<ManagePostsPage />} />
                        <Route path="commissions" element={<ArtistCommissionsPage />} />
                    </Route>
                    <Route path="/dashboard/artist" element={<Navigate to="/dashboard" replace />} />
                </Route>

                {/* Staff administration */}
                <Route element={<ProtectedRoute requireStaff={true} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="applications" element={<ArtistApplicationsPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="tickets" element={<TicketsPage />} />
                        <Route path="tickets/:id" element={<TicketDetailPage />} />
                        <Route path="moderation-log" element={<ModerationLogPage />} />
                    </Route>
                </Route>
            </Route>

            {/* Development sandbox */}
            {import.meta.env.DEV && (
                <>
                    <Route path="/dev" element={<Navigate to="/dev/sandbox" replace />} />
                    <Route path="/dev/sandbox" element={<PlaygroundPage />} />
                </>
            )}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
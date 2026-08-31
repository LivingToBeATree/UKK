import React, { useState, useContext, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    AuthModalContext,
    type AuthModalConfig,
    type AuthModalIntent,
} from './authModalContextDef';
import { AuthModal } from '@/components/auth/AuthModal';

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<AuthModalConfig>({});

    const openAuthModal = useCallback((newConfig?: AuthModalConfig | AuthModalIntent) => {
        if (typeof newConfig === 'string') {
            setConfig({ intent: newConfig });
        } else if (newConfig) {
            setConfig(newConfig);
        } else {
            setConfig({ intent: 'generic' });
        }
        setIsOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    /**
     * Helper to guard user actions.
     * Returns true if authenticated.
     * If guest, opens the contextual modal and returns false.
     */
    const requireAuth = useCallback(
        (guardConfig?: AuthModalConfig | AuthModalIntent, onAuthorized?: () => void): boolean => {
            if (isAuthenticated) {
                onAuthorized?.();
                return true;
            }
            openAuthModal(guardConfig);
            return false;
        },
        [isAuthenticated, openAuthModal]
    );

    return (
        <AuthModalContext.Provider
            value={{
                isOpen,
                config,
                openAuthModal,
                closeAuthModal,
                requireAuth,
            }}
        >
            {children}
            <AuthModal
                isOpen={isOpen}
                config={config}
                onClose={closeAuthModal}
            />
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
};

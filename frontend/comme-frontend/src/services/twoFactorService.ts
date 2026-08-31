import { api } from './api';
import type { ApiResponse, User } from '@/types';

export interface TwoFactorSetupData {
    secret: string;
    qr_code_url: string;
}

export interface TwoFactorConfirmResponse {
    recovery_codes: string[];
    two_factor_enabled: boolean;
}

export interface TwoFactorRecoveryCodesResponse {
    recovery_codes: string[];
}

export const twoFactorService = {
    // Initialize 2FA setup (returns secret & otpauth URL for QR)
    setup: async () => {
        const res = await api.post<ApiResponse<TwoFactorSetupData>>('/profile/2fa/setup');
        return res.data.data;
    },

    // Confirm initial 6-digit TOTP code
    confirm: async (code: string) => {
        const res = await api.post<ApiResponse<TwoFactorConfirmResponse>>('/profile/2fa/confirm', { code });
        return res.data.data;
    },

    // Retrieve existing recovery backup codes
    getRecoveryCodes: async (password: string) => {
        const res = await api.get<ApiResponse<TwoFactorRecoveryCodesResponse>>('/profile/2fa/recovery-codes', {
            params: { password },
        });
        return res.data.data;
    },

    // Regenerate 8 new recovery codes
    regenerateRecoveryCodes: async (password: string) => {
        const res = await api.post<ApiResponse<TwoFactorRecoveryCodesResponse>>('/profile/2fa/recovery-codes', { password });
        return res.data.data;
    },

    // Disable 2FA
    disable: async (password: string) => {
        const res = await api.delete<ApiResponse<{ message: string }>>('/profile/2fa', {
            data: { password },
        });
        return res.data;
    },

    // Verify 2FA challenge during login
    loginWithTwoFactor: async (payload: { two_factor_token: string; code: string }) => {
        const res = await api.post<ApiResponse<User>>('/login/2fa', payload);
        return res.data.data;
    },
};

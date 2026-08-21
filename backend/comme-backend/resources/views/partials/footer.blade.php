<footer style="border-top: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); padding: 40px 20px; margin-top: 60px;">
    <div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="{{ asset('icons/32x32.png') }}" alt="Comme Icon" style="width: 24px; height: 24px; border-radius: 6px;" />
                <span style="font-weight: 700; font-size: 16px; color: var(--text-primary);">Comme</span>
                <span style="color: var(--text-muted);">—</span>
                <span style="color: var(--text-secondary); font-size: 14px;">Creator & Commission Marketplace API</span>
            </div>

            <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary);">
                <span>Laravel {{ app()->version() }}</span>
                <span>•</span>
                <span>PHP {{ phpversion() }}</span>
                <span>•</span>
                <span>PostgreSQL 16+</span>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 20px; font-size: 12px; color: var(--text-muted);">
            <p>&copy; {{ date('Y') }} Comme Platform. All rights reserved.</p>
            <p>Empowering digital artists and creative commissions.</p>
        </div>
    </div>
</footer>

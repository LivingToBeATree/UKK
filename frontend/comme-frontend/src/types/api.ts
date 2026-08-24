// Standard API Envelope returned by ApiResponseHelper::successResponse
export interface ApiResponse<T = unknown> {
    status_code: number;
    status: 'SUCCESS' | 'ERROR';
    message: string;
    data: T;
    links?: PaginationLinks;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    path: string
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

// Error response returned by ApiExceptionHandler / 422 Validation
export interface ApiErrorResponse {
    status_code: number;
    status: 'ERROR';
    message: string;
    error?: Record<string, string[]>;
}
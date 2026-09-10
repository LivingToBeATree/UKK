<?php

namespace App\Http\Requests\API\V1\Commission;

use Illuminate\Foundation\Http\FormRequest;

class DeliverCommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by Gate in controller
    }

    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string', 'max:5000'],
            'message' => ['nullable', 'string', 'max:5000'],

            'files' => ['nullable', 'array', 'max:10'],
            'files.*' => [
                'file',
                'max:51200', // 50 MB
                'mimes:jpg,jpeg,png,webp,gif,pdf,zip,psd,ai,svg,mp4,mov,avi',
            ],

            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => [
                'file',
                'max:51200',
                'mimes:jpg,jpeg,png,webp,gif,pdf,zip,psd,ai,svg,mp4,mov,avi',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'files.max' => 'You can upload a maximum of 10 deliverable files.',
            'files.*.max' => 'Each file must not exceed 50 MB.',
            'files.*.mimes' => 'Only images (jpg, png, webp, gif), documents (pdf), archives (zip), design files (psd, ai, svg), and videos (mp4, mov, avi) are allowed.',
            'attachments.max' => 'You can upload a maximum of 10 deliverable files.',
            'attachments.*.max' => 'Each file must not exceed 50 MB.',
            'attachments.*.mimes' => 'Only images (jpg, png, webp, gif), documents (pdf), archives (zip), design files (psd, ai, svg), and videos (mp4, mov, avi) are allowed.',
        ];
    }
}

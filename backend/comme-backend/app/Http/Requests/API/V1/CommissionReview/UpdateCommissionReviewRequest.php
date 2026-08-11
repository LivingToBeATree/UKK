<?php

namespace App\Http\Requests\API\V1\CommissionReview;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommissionReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('store', $this->route('review'));
    }

    public function rules(): array
    {
        return [
            'rating' => ['sometimes', 'integer', 'between:1,5'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'comment' => ['sometimes', 'nullable', 'string','max:1000'],
            'recommended' => ['sometimes', 'boolean'],
        ];
    }
}

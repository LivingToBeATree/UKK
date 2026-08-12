<?php

namespace App\Http\Requests\API\V1\CommissionReview;

use App\Enum\CommissionStatus;
use App\Models\CommissionReview;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommissionReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', [CommissionReview::class, $this->route('commission')]);
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string','max:1000'],
            'recommended' => ['sometimes', 'boolean'],

            // artist_reply / artist_replied_at are absent entirely — only
            // the artist sets those, through a separate reply() action.
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $commission = $this->route('commission');

            if ($commission->status !== CommissionStatus::COMPLETED) {
                $validator->errors()->add('rating', 'Only completed commissions can be reviewed.');
            }

            if ($commission->review()->exists()) {
                $validator->errors()->add('rating', 'This commission already has a review.');
            }
        });
    }
}

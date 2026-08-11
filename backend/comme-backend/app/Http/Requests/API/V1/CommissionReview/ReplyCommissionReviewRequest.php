<?php

namespace App\Http\Requests\API\V1\CommissionReview;

use Illuminate\Foundation\Http\FormRequest;

class ReplyCommissionReviewRequest extends FormRequest
{
    /**
     * Checked against CommissionReviewPolicy::artistReply(), a separate
     * ability from update() — only the reviewed commission's artist can
     * reply, never the review's author.
     */
    public function authorize(): bool
    {
        return $this->user()->can('artistReply', $this->route('review'));
    }

    public function rules(): array
    {
        return [
            'artist_reply' => ['required', 'string', 'max:1000']
        ];
    }
}

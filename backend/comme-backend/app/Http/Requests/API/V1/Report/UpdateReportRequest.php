<?php

namespace App\Http\Requests\API\V1\Report;

use App\Enum\ReportStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateReportRequest extends FormRequest
{
    /**
     * Staff-only, per ReportPolicy::update() — reporters cannot edit
     * their own report after submitting it.
     */

    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(ReportStatus::class)],
        ];
    }
}

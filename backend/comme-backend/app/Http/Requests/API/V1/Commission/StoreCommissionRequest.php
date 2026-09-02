<?php

namespace App\Http\Requests\API\V1\Commission;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Commission;
use App\Models\CommissionOption;
use App\Enum\ServiceStatus;

class StoreCommissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Commission::class);
    }

    public function rules(): array
    {
        return [
            // Rule::exists()->where() combines two checks in one rule: the
            // ID must exist in commission_services AND that row's status
            // must be 'open' — a closed/draft/paused service fails validation.
            'commission_service_id' => [
                'required',
                Rule::exists('commission_services', 'id')->where('status', ServiceStatus::OPEN->value)
            ],

            'commission_option_id' => [
                'nullable',
                'exists:commission_options,id',
                // Closures let you validate one field against another —
                // here, confirming the chosen option actually belongs to
                // the chosen service, not some unrelated artist's listing.
                function (string $attribute, mixed $value, \Closure $fail) {
                    if ($value === null) {
                        return;
                    }

                    $option = CommissionOption::find($value);

                    if ($option && (string) $option->commission_service_id !== (string) $this->commission_service_id) {
                        $fail('The selected option does not belong to the selected service.');
                    }
                }
            ],
            'description' => ['required', 'string'],
            'deadline' => ['nullable', 'date', 'after:today'],
            'addon_ids' => ['sometimes', 'nullable', 'array'],
            'addon_ids.*' => ['integer', 'exists:commission_addons,id'],
            // Deliberately no 'total_price', 'status', 'user_id', or
            // 'artist_profile_id' rules here — none of those are ever
            // trusted from client input.
        ];
    }
}
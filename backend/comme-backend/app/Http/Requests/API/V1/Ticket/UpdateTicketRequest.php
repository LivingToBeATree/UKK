<?php

namespace App\Http\Requests\API\V1\Ticket;

use App\Enum\TicketPriority;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('ticket'));
    }

    public function rules(): array
    {
        return [
            'assined_to' => ['sometimes', 'nullable', 'exists:users,id'],
            'priority' => ['sometimes', new Enum(TicketPriority::class)],

            // closed_at is not editable here — see TicketController::close(),
            // a dedicated action, same pattern as Commission's cancel().
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->filled('assigned_to')) {
                return;
            }

            $assignee = User::find($this->assigned_to);

            if ($assignee && ! $assignee->isStaff()) {
                $validator->errors()->add('assigned_to', 'Tickets can only be assigned to staff.');
            }
        });
    }
}

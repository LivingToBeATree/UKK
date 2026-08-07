<?php

namespace App\Enum;

enum CommissionRevisionItemType: string
{
    case DEADLINE = 'deadline';

    case NOTES = 'notes';

    case ADDON = 'addon';

    case PRICE = 'price';

    case OPTION = 'option';
}
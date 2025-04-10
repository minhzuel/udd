<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'size',
        'color',
        'stock',
        'price_adjustment'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
} 
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'category_id',
        'stock',
        'status'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function productOptions()
    {
        return $this->hasMany(ProductOption::class);
    }
} 
@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row gap-8">
        <!-- Product Image -->
        <div class="md:w-1/2">
            <img src="{{ asset('storage/' . $product->image) }}" alt="{{ $product->name }}" class="w-full rounded-lg shadow-lg">
        </div>

        <!-- Product Details -->
        <div class="md:w-1/2">
            <h1 class="text-3xl font-bold mb-4">{{ $product->name }}</h1>
            <p class="text-gray-600 mb-4">{{ $product->description }}</p>
            
            <div class="mb-4">
                <span class="text-2xl font-bold">${{ number_format($product->price, 2) }}</span>
                <span class="text-gray-500 ml-2">USD</span>
            </div>

            <!-- Product Options -->
            <form action="{{ route('cart.add') }}" method="POST" class="mb-6">
                @csrf
                <input type="hidden" name="product_id" value="{{ $product->id }}">
                
                <!-- Size Selection -->
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Size</label>
                    <select name="size" class="w-full border rounded px-3 py-2" required>
                        <option value="">Select Size</option>
                        @foreach($product->productOptions->pluck('size')->unique() as $size)
                            <option value="{{ $size }}">{{ $size }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- Color Selection -->
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Color</label>
                    <select name="color" class="w-full border rounded px-3 py-2" required>
                        <option value="">Select Color</option>
                        @foreach($product->productOptions->pluck('color')->unique() as $color)
                            <option value="{{ $color }}">{{ $color }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- Quantity -->
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Quantity</label>
                    <input type="number" name="quantity" min="1" value="1" class="w-full border rounded px-3 py-2" required>
                </div>

                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                    Add
                </button>
            </form>

            <!-- Category -->
            <div class="text-sm text-gray-500">
                Category: <a href="{{ route('categories.show', $product->category) }}" class="text-blue-600 hover:underline">{{ $product->category->name }}</a>
            </div>
        </div>
    </div>
</div>
@endsection 
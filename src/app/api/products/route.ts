import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: true
        }
      }),
      prisma.product.count(),
    ]);

    // Ensure price is a number
    const formattedItems = items.map(item => ({
      ...item,
      price: item.price ? Number(item.price) : 0
    }));

    return NextResponse.json({
      data: formattedItems,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received product data:', data);

    // Validate required fields
    const requiredFields = ['name', 'price', 'stock_quantity', 'category_id', 'seller_id'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields,
          receivedData: data 
        },
        { status: 400 }
      );
    }

    // Ensure price and stock_quantity are numbers
    const productData = {
      name: String(data.name),
      description: data.description ? String(data.description) : null,
      price: parseFloat(data.price) || 0,
      stock_quantity: parseInt(data.stock_quantity) || 0,
      in_stock: data.in_stock !== undefined ? Boolean(data.in_stock) : true,
      category_id: String(data.category_id),
      seller_id: String(data.seller_id),
      image_url: data.image_url ? String(data.image_url) : null,
    };

    console.log('Creating product with data:', productData);

    const item = await prisma.product.create({
      data: productData,
      include: {
        category: true
      }
    });

    console.log('Successfully created product:', item);
    return NextResponse.json(item, { status: 201, headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && { stack: (error as Error).stack })
      },
      { status: 500, headers: { 'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001', 'Access-Control-Allow-Credentials': 'true' } }
    );
  }
}
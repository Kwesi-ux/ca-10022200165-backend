import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Log the incoming data for debugging
    console.log('Updating product with data:', data);
    
    // Ensure required fields are present
    const requiredFields = ['name', 'price', 'stock_quantity', 'category_id', 'seller_id'];
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields,
          receivedData: data 
        },
        { status: 400 }
      );
    }
    
    const item = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price) || 0,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        in_stock: data.in_stock !== undefined ? Boolean(data.in_stock) : true,
        category_id: data.category_id,
        seller_id: data.seller_id,
        image_url: data.image_url || null,
      },
    });
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
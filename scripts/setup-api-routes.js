const fs = require('fs');
const path = require('path');

const models = [
  'User',
  'Administrator',
  'Customer',
  'Seller',
  'Address',
  'Product',
  'Category',
  'Cart',
  'CartItem',
  'Order',
  'OrderItem',
  'Payment',
  'Refund',
  'TransactionLog',
  'UserActivity',
  'Wishlist',
  'WishlistItem',
  'ProductView'
];

const basePath = path.join(__dirname, '..', 'src', 'app', 'api');

// Create the base API directory if it doesn't exist
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

const routeTemplate = (model) => `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.${model.toLowerCase()}.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.${model.toLowerCase()}.count(),
    ]);

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ${model.toLowerCase()}s' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await prisma.${model.toLowerCase()}.create({
      data,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ${model.toLowerCase()}' },
      { status: 500 }
    );
  }
}`;

const idRouteTemplate = (model) => `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const item = await prisma.${model.toLowerCase()}.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update ${model.toLowerCase()}' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.${model.toLowerCase()}.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete ${model.toLowerCase()}' },
      { status: 500 }
    );
  }
}`;

// Create directories and files for each model
models.forEach(model => {
  const modelPath = path.join(basePath, model.toLowerCase() + 's');
  const idPath = path.join(modelPath, '[id]');
  
  // Create model directory
  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(modelPath, { recursive: true });
  }
  
  // Create [id] directory
  if (!fs.existsSync(idPath)) {
    fs.mkdirSync(idPath, { recursive: true });
  }
  
  // Create route.ts files
  const routeFile = path.join(modelPath, 'route.ts');
  const idRouteFile = path.join(idPath, 'route.ts');
  
  if (!fs.existsSync(routeFile)) {
    fs.writeFileSync(routeFile, routeTemplate(model));
  }
  
  if (!fs.existsSync(idRouteFile)) {
    fs.writeFileSync(idRouteFile, idRouteTemplate(model));
  }
});

console.log('API routes structure created successfully!');

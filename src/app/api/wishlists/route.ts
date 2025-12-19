import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonWithCors } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.wishlist.count(),
    ]);

    return jsonWithCors(request, {
      data: items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to fetch wishlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await prisma.wishlist.create({
      data,
    });
    return jsonWithCors(request, item, { status: 201 });
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to create wishlist' }, { status: 500 });
  }
}
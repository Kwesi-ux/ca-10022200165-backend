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
      prisma.wishlistItem.findMany({
        skip,
        take: limit,
        orderBy: { added_at: 'desc' },
      }),
      prisma.wishlistItem.count(),
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
    return jsonWithCors(request, { error: 'Failed to fetch wishlistitems' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await prisma.wishlistItem.create({
      data,
    });
    return jsonWithCors(request, item, { status: 201 });
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to create wishlistitem' }, { status: 500 });
  }
}
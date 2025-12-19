import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonWithCors } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return jsonWithCors(request, {
      data: users,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const user = await prisma.user.create({
      data,
    });
    return jsonWithCors(request, user, { status: 201 });
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to create user' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonWithCors } from '@/lib/response';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const item = await prisma.wishlistItem.update({
      where: { id: params.id },
      data,
    });
    return jsonWithCors(request, item);
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to update wishlistitem' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.wishlistItem.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return jsonWithCors(_request, { error: 'Failed to delete wishlistitem' }, { status: 500 });
  }
}
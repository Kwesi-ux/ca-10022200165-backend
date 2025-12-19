import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonWithCors } from '@/lib/response';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await request.json();
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return jsonWithCors(request, user);
  } catch (error) {
    return jsonWithCors(request, { error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.user.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return jsonWithCors(_request, { error: 'Failed to delete user' }, { status: 500 });
  }
}

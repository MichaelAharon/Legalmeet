import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Account deletion is unavailable until requests can be scoped to the authenticated user.',
    },
    { status: 501 }
  );
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  const { id } = params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE posts 
       SET view_count = COALESCE(view_count, 0) + 1, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, title, view_count`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update post views' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
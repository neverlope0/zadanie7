import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT p.*, u.name as author_name 
       FROM posts p 
       LEFT JOIN users u ON p.author_id = u.id 
       ORDER BY p.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await client.query('SELECT COUNT(*) FROM posts');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request) {
  const client = await pool.connect();
  try {
    const { title, content, author_id } = await request.json();

    if (!title || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const generateSlug = (text) => 
      text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const slug = generateSlug(title) + '-' + Date.now();

    const result = await client.query(
      `INSERT INTO posts (title, content, author_id, slug) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, content, author_id, slug]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
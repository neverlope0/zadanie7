'use client';
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  const testEndpoints = async () => {
    try {
      setMessage('Тестирование API endpoints...');

      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData);
      console.log('Пользователи:', usersData);

      if (usersData.length > 0) {
        const userRes = await fetch(`/api/users/${usersData[0].id}`);
        const userData = await userRes.json();
        console.log('Один пользователь:', userData);
      }

      const newUserRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Тестовый Пользователь',
          email: `test${Date.now()}@example.com`,
          password: 'test123'
        })
      });
      const newUser = await newUserRes.json();
      console.log('Новый пользователь:', newUser);

      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      setPosts(postsData.data || postsData);
      console.log('Посты:', postsData);

      const newPostRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Тестовый пост',
          content: 'Содержание тестового поста',
          author_id: newUser.id || 1
        })
      });
      const newPost = await newPostRes.json();
      console.log('Новый пост:', newPost);

      if (newPost.id) {
        const viewsRes = await fetch(`/api/posts/${newPost.id}/views`, {
          method: 'PATCH'
        });
        const viewsData = await viewsRes.json();
        console.log('Обновленные просмотры:', viewsData);
      }

      if (newUser.id) {
        const deleteRes = await fetch(`/api/users/${newUser.id}`, {
          method: 'DELETE'
        });
        const deleteData = await deleteRes.json();
        console.log('Удаление:', deleteData);
      }

      setMessage('Все тесты завершены успешно!');

    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Произошла ошибка при тестировании');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Next.js API Routes Demo</h1>
      
      <button 
        onClick={testEndpoints}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Запустить тесты API
      </button>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>Статус:</strong> {message}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>Пользователи</h2>
          <ul>
            {users.map(user => (
              <li key={user.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                <strong>{user.name}</strong><br />
                Email: {user.email}<br />
                ID: {user.id}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Посты</h2>
          <ul>
            {posts.map(post => (
              <li key={post.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                <strong>{post.title}</strong><br />
                {post.content}<br />
                Просмотры: {post.view_count || 0}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
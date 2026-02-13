import { render, screen } from '@testing-library/react'
import { expect } from 'vitest'
import TodoItem from '../TodoItem.jsx'

const baseTodo = {             // ** TodoItem พื้นฐานสำหรับทดสอบ
  id: 1,
  title: 'Sample Todo',
  done: false,
  comments: [{id: 1, message: 'First comment'},
        {id: 2, message: 'Another comment'}
    ]
};

describe('TodoItem', () => {
  it('renders with no comments correctly', () => {
    // เดี๋ยวจะเพิ่มโค้ดตรงนี้
    render(
      <TodoItem todo={baseTodo} />
    );
    expect(screen.getByText('Sample Todo')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Another comment')).toBeInTheDocument();
  });
});
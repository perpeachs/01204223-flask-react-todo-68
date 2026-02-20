import { useState, useEffect } from 'react'
import './App.css'
import TodoItem from './TodoItem.jsx'
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
function TodoList({apiUrl}) {
  const TODOLIST_API_URL = apiUrl;
  const { username, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [todoList, setTodoList] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  useEffect(() => {
  if (accessToken) {
    fetchTodoList();
  }
  if(!accessToken){
    navigate("/login");
  }
  }, [accessToken]);
  async function fetchTodoList() {
    const token = accessToken || localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const response = await fetch(TODOLIST_API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
      console.log("Status:", response.status);
      const text = await response.text();
      console.log("Error:", text);
      return;
    }
      const data = await response.json();
      setTodoList(data);
    } catch (err) {
    console.log(err);
    }
  }

  async function toggleDone(id) {
    const toggle_api_url = `${TODOLIST_API_URL}${id}/toggle/`
    try {
      const response = await fetch(toggle_api_url, {
        method: 'PATCH',
      })
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodoList(todoList.map(todo => todo.id === id ? updatedTodo : todo));
      }
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  }

  async function addNewTodo() {
    try {
      const response = await fetch(TODOLIST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'title': newTitle }),
      });
      if (response.ok) {
        const newTodo = await response.json();
        setTodoList([...todoList, newTodo]);
        setNewTitle("");
      }
    } catch (error) {
      console.error("Error adding new todo:", error);
    }
  }

  async function addNewComment(todoId,newComment) {
    try {
      const url = `${TODOLIST_API_URL}${todoId}/comments/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'message': newComment}),
      });
      if (response.ok) {
        await fetchTodoList();
      }
    } catch (error) {
      console.error("Error adding new comment:", error);
    }
  }

  async function deleteTodo(id) {
    const delete_api_url = `${TODOLIST_API_URL}${id}/`
    try {
      const response = await fetch(delete_api_url, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTodoList(todoList.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  return (
    <>
      <h1>Todo List</h1>
      <ul>
        {todoList.map(todo => (
          <TodoItem 
            key={todo.id}
            todo={todo}
            toggleDone={toggleDone}
            deleteTodo={deleteTodo}
            addNewComment={addNewComment}
          />
        ))}
      </ul>
      New: <input type="text" value={newTitle} onChange={(e) => {setNewTitle(e.target.value)}} />
      <button onClick={() => {addNewTodo()}}>Add</button>
      <br/>
      <a href="/about">About</a>
      &nbsp;|&nbsp;
      <a href="/login">Login</a> 
      <br/>
      {username && (
        <a href="#" onClick={(e) => {e.preventDefault(); logout();}}>Logout</a> 
      )} 
    </>
  )
}

export default TodoList;
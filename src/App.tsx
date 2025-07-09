import React, { useState } from 'react'
import {
  useGetTodosQuery,
  // useGetCompletedTodosQuery,
  // useGetIncompleteTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
  type Todo,
  type TodosQueryParams,
} from './store/api/apiSlice'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import ConfirmationToast from '@/components/ConfirmationToast';
import Modal from '@/components/Modal';

import 'react-toastify/dist/ReactToastify.css';

export interface RestErr {
  data?: {
    error?: string;
  } | string;
}

function App() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  // const [PageCount, setPageCount] = useState< 6 >
  const [newTodo, setNewTodo] = useState({ todo_name: '', description: '', completed: false })
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  // Query parameters based on current filter
  const queryParams: TodosQueryParams = {
    completed: filter === 'all' ? 'all' : filter === 'completed' ? 'true' : 'false',
    page: currentPage,
    order: sortOrder,
  }

  // RTK Query hooks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: todosData, error, isLoading, refetch } = useGetTodosQuery(queryParams)
  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation()
  const [updateTodo, { isLoading: isUpdating }] = useUpdateTodoMutation()
  const [toggleTodo] = useToggleTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()

  //Handel Toast 
  const showConfirmationToast = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // We'll store the toast ID so we can programmatically close it
      let toastId: string | number | null = null;

      const closeAndResolve = (result: boolean) => {
        if (toastId !== null) {
          toast.dismiss(toastId); // Dismiss the toast using its ID
        }
        resolve(result); // Resolve the promise with the user's decision
      };

      // Render the ConfirmationToast component inside the 'toast' utility
      toastId = toast(<ConfirmationToast
        message="Are you sure you want to proceed?"
        onConfirm={() => closeAndResolve(true)} // Resolve with true on confirm
        onCancel={() => closeAndResolve(false)} // Resolve with false on cancel


        // onClose is not directly used here for decision, but can be for other cleanup
        // closeToast is handled by closeAndResolve via toast.dismiss
        closeToast={() => { }} onClose={function (): void {
          closeAndResolve(false)
          throw new Error('No response provided by user!.');
        }} />, {
        autoClose: false,
        closeButton: true,
        draggable: false,
        // Provide a unique toastId if your toast library requires it for dismissal
        // For react-toastify, if you set autoClose to false, the toast remains.
        // You typically get an ID back or use a custom close function as above.
      });
    });
  };


  // toast helper 

  const showToast = (message: string | undefined): void => {
    toast(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  }
  // Handle create todo
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.todo_name.trim() || !newTodo.description.trim()) return

    try {
      await createTodo(newTodo).unwrap()
      showToast(`new  todo created title:${newTodo.todo_name}`)
      setNewTodo({ todo_name: '', description: '', completed: false })
    } catch (err) {
      console.error('Failed to create todo:', err)
    }
  }

  // Handle update todo
  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    const prevDescription = todos.find(t => t.id === editingTodo?.id)?.description
    if (!editingTodo || !editingTodo.todo_name.trim() || !editingTodo.description.trim() || editingTodo.description == prevDescription) {
      setEditingTodo(null)
      showToast('No change in todo description!')
      return
    }

    try {
      await updateTodo({
        id: editingTodo.id,
        todo_name: editingTodo.todo_name,
        description: editingTodo.description,
        completed: false
      }).unwrap()
      showToast(`${editingTodo.todo_name} is Updated.`)
      setEditingTodo(null)
    } catch (err) {
      console.error('Failed to update todo:', err)
    }
  }

  // Handle toggle completion
  const handleToggleTodo = async (todo: Todo) => {
    try {
      await toggleTodo({ id: todo.id, completed: !todo.completed }).unwrap()
      const message = `Todo Status changed to ${todo.completed ? 'undo' : 'completed'}`;
      showToast(message);
    } catch (err) {
      console.error('Failed to toggle todo:', err)
    }
  }



  // Handle delete todo
  const handleDeleteTodo = async (id: number) => {
    const confirmed = await showConfirmationToast();
    if (confirmed) {
      const todoTitle = todos.find(t => t.id === id)?.todo_name
      try {
        await deleteTodo(id).unwrap()
        showToast(`Todo ${todoTitle} is deleted.`);
      } catch (err: unknown) {
        const errData = err as RestErr;
        const message = typeof errData.data === 'object' && 'error' in errData.data ? (errData.data as { error?: string }).error : String(errData.data);
        showToast(message);
        console.error('Failed to delete todo:', err)
      }
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-32">
        <p className="animate-pulse text-blue-600 text-sm font-medium">
          Loading todos...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-40 text-red-600 text-sm font-medium space-y-2">
        <img
          src="https://www.shutterstock.com/image-photo/dangerously-cracked-cable-exposing-electric-wire-1778446907"
          alt="Cracked wire"
          className="w-16 h-16 object-contain"
        />
        <p>Error loading todos!</p>
      </div>
    );


  const todos = todosData?.todos || []
  const pagination = todosData?.pagination

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center mb-8">
        Rails Todo App with RTK Query
      </h1>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`px-4 py-2 rounded ${filter === 'incomplete' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
          >
            Incomplete
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
              }`}
          >
            Completed
          </button>
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-2 rounded border"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Create Todo Form */}
      <form onSubmit={handleCreateTodo} className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Todo</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Todo title..."
            value={newTodo.todo_name}
            onChange={(e) => setNewTodo({ ...newTodo, todo_name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Todo description..."
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            className="w-full p-2 border rounded h-24"
            required
          />
          <button
            type="submit"
            disabled={isCreating}
            className="btn-primary"
          >
            {isCreating ? 'Creating...' : 'Create Todo'}
          </button>
        </div>
      </form>

      {/* Edit Todo Form */}
      <Modal isOpen={!!editingTodo} onClose={() => setEditingTodo(null)}>
        {editingTodo && (
          <form onSubmit={handleUpdateTodo}>
            <h2 className="text-xl font-semibold mb-4">Edit Todo</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editingTodo.todo_name}
                onChange={(e) => setEditingTodo({ ...editingTodo, todo_name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                value={editingTodo.description}
                onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                className="w-full p-2 border rounded h-24"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary"
                >
                  {isUpdating ? 'Updating...' : 'Update Todo'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Todos List */}
      <div className="space-y-4">
        {todos.length > 0 ?
          <div>
            {todos.map((todo) => (
              <div key={todo.id} className={`card ${todo.completed ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.todo_name}
                    </h3>
                    <p className={`text-gray-600 mt-2 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                    <div className="text-sm text-gray-400 mt-2">
                      Created: {new Date(todo.created_at).toLocaleDateString()}
                      {todo.updated_at !== todo.created_at && (
                        <span> • Updated: {new Date(todo.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleTodo(todo)}
                      className={`px-3 py-1 rounded text-sm ${todo.completed
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                    >
                      {todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    {!todo.completed && <button
                      onClick={() => setEditingTodo(todo)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>}
                    {todo.completed && <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>}
                  </div>
                </div>
              </div>
            ))}
          </div> :
          <div className="flex flex-col items-center justify-center h-40 text-red-600 text-sm font-medium space-y-2">
            <p>No Todo's here!</p>
          </div>
        }
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
            disabled={currentPage === pagination.total_pages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 text-center text-gray-600">
        {pagination && (
          <p>
            Showing {todos.length} of {pagination.total_count} todos
          </p>
        )}
      </div>
    </div>
  )
}

export default App
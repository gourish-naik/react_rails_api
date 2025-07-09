import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the Todo type based on your Rails API
export interface Todo {
  id: number;
  todo_name: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// API response types
export interface TodosResponse {
  todos: Todo[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Query parameters
export interface TodosQueryParams {
  completed?: "all" | "true" | "false";
  page?: number;
  order?: "asc" | "desc";
}

// Create/Update Todo payload
export interface CreateTodoPayload {
  todo_name: string;
  description: string;
  completed?: boolean;
}

export interface UpdateTodoPayload extends Partial<CreateTodoPayload> {
  id: number;
}

// Define the API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/api/",
    prepareHeaders: (headers) => {
      // Add any auth headers if needed
      headers.set("Content-Type", "application/json");
      // Example: Add auth token if available
      // const token = (getState() as RootState).auth.token
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`)
      // }
      return headers;
    },
  }),
  tagTypes: ["Todo"],
  endpoints: (builder) => ({
    // Get all todos with optional filters
    getTodos: builder.query<TodosResponse, TodosQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        if (params.completed && params.completed !== "all") {
          searchParams.append("completed", params.completed);
        }
        if (params.page) {
          searchParams.append("page", params.page.toString());
        }
        if (params.order) {
          searchParams.append("order", params.order);
        }

        return `todos${
          searchParams.toString() ? "?" + searchParams.toString() : ""
        }`;
      },
      providesTags: ["Todo"],
    }),

    // Get all todos (shorthand)
    getAllTodos: builder.query<TodosResponse, void>({
      query: () => "todos?completed=all",
      providesTags: ["Todo"],
    }),

    // Get completed todos
    getCompletedTodos: builder.query<
      TodosResponse,
      { page?: number; order?: "asc" | "desc" }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams([["completed", "true"]]);
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.order) searchParams.append("order", params.order);
        return `todos?${searchParams.toString()}`;
      },
      providesTags: ["Todo"],
    }),

    // Get incomplete todos
    getIncompleteTodos: builder.query<
      TodosResponse,
      { page?: number; order?: "asc" | "desc" }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams([["completed", "false"]]);
        if (params.page) searchParams.append("page", params.page.toString());
        if (params.order) searchParams.append("order", params.order);
        return `todos?${searchParams.toString()}`;
      },
      providesTags: ["Todo"],
    }),

    // Get specific todo by ID
    getTodo: builder.query<Todo, number>({
      query: (id) => `todos/${id}`,
      providesTags: (result, error, id) => [{ type: "Todo", id }],
    }),

    // Create new todo
    createTodo: builder.mutation<Todo, CreateTodoPayload>({
      query: (newTodo) => ({
        url: "todos",
        method: "POST",
        body: newTodo,
      }),
      invalidatesTags: ["Todo"],
    }),

    // Update existing todo
    updateTodo: builder.mutation<Todo, UpdateTodoPayload>({
      query: ({ id, ...patch }) => ({
        url: `todos/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Todo", id }],
    }),

    // Toggle todo completion status
    toggleTodo: builder.mutation<Todo, { id: number; completed: boolean }>({
      query: ({ id, completed }) => ({
        url: `todos/${id}`,
        method: "PATCH",
        body: { completed },
      }),
      invalidatesTags: ["Todo"],
    }),

    // Delete todo (if your API supports it)
    deleteTodo: builder.mutation<void, number>({
      query: (id) => ({
        url: `todos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todo"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetTodosQuery,
  useGetAllTodosQuery,
  useGetCompletedTodosQuery,
  useGetIncompleteTodosQuery,
  useGetTodoQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
} = apiSlice;

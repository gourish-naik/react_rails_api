import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryAuth from "./baseQuery";
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
  data: {
    todos: Todo[];
    error: Error,
    sorting_order: 'asc' | 'desc';
    pagination?: {
      current_page: number;
      total_pages: number;
      total_count: number;
    };
  };
}

//error interface
export interface Error {
  error:{
    msg:string,
  }
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
  baseQuery: baseQueryAuth,
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
      providesTags: (_result, _error, id) => [{ type: "Todo", id }],
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
      invalidatesTags: (_result, _error, { id }) => [{ type: "Todo", id }],
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

    loginUser: builder.mutation<
      {
        data: {
          token: string;
          error: Error;
          msg: string;
          refreshToken: string;
          status: number;
        };
      },
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: "login", // adjust this to match your Rails endpoint
        method: "POST",
        body: {
          username: email,
          password,
        },
      }),
    }),

    registerUser: builder.mutation<
      {
        data: {
          token: string;
          rftoken: string;
          redirectURL: string;
          msg: string;
          status: number;
          error:Error,
          user: {
            id: string | number;
            username: string;
          };
        };
      },
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: "users", // adjust as needed
        method: "POST",
        body: {
          username: email,
          password,
        },
      }),
    }),

    logOut: builder.mutation<
      { data: { msg: string } },
      { token: string; email: string }
    >({
      query: ({ email, token }) => ({
        url: "logout",
        method: "POST",
        body: {
          username: email,
          token,
        },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLogOutMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
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

// src/app/baseQueryWithReauth.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { RootState } from "@/store/store"; // adjust path as needed

const baseQuery = fetchBaseQuery({
  //   baseUrl: "http://192.168.0.155:3001/api/",
  baseUrl: "http://localhost:3001/api/",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      return result; // No refresh token available
    }

    const refreshResult = await baseQuery(
      {
        url: "refresh", // your Rails endpoint
        method: "POST",
        body: { refresh_token: refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const newAccessToken = (refreshResult.data as { token: string }).token;

      // Dispatch action to update token
      api.dispatch({ type: "auth/setAccessToken", payload: newAccessToken });

      // Retry original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, force logout
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export default baseQueryAuth;

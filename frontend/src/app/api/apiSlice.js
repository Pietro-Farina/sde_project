import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:3000",
    credentials: 'include', // always send http cookies
})

const baseQueryWithRefresh = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const refreshResult = await baseQuery(
            { url: "/api/v1/auth/refresh", method: "POST" },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQuery,
    tagTypes: ['Booking', 'Course', 'Reservation', 'Auth'],
    endpoints: (builder) => ({}),
});
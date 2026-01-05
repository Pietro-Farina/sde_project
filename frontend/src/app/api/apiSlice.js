import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = 'http://localhost:3000/api';
const baseQueryNoReauth = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include', // always send http cookie
    prepareHeaders: (headers, { getState }) => {
        // const token = getState().auth.token

        // if (token) {
        //     headers.set("authorization", `Bearer ${token}`)
        // }
        return headers
    }
})

export const apiSlice = createApi({
    baseQuery: baseQueryNoReauth,
    tagTypes: ['Booking', 'Course', 'Reservation'],
    endpoints: (builder) => ({}),
});
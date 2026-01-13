import { apiSlice } from '../../app/api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        checkMe: builder.query({
            query: () => ({
                url: '/api/auth/me',
                method: 'GET',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (response) => {
                console.log("ME response:", response);
                return response;
            },
            providesTags: (result, error, arg) => [{ type: 'Auth', id: 'ME' }],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/api/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'Auth', id: 'ME' }],
        }),
        test: builder.mutation({
            query: () => ({
                url: '/__test/check-cookie',
                method: 'GET',
            }),
            transformResponse: (response) => {
                console.log("ME response:", response.json);
                return response;
            },
        }),
    }),
});

export const { useCheckMeQuery, useLogoutMutation, useTestMutation } = authApiSlice;
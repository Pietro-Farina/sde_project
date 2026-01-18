import { apiSlice } from '../../app/api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        checkMe: builder.query({
            query: () => ({
                url: '/api/v1/auth/me',
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
                url: '/api/v1/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    setTimeout(() => {
                        dispatch(apiSlice.util.resetApiState())
                    }, 1000)
                } catch (err) {
                    console.log(err?.error?.data?.message)
                }
            },
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
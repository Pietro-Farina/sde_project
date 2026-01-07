import {
    createSelector,
    createEntityAdapter,
} from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';

const bookingsAdapter = createEntityAdapter({});

const initialState = bookingsAdapter.getInitialState();

export const bookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBookings: builder.query({
            query: () => ({
                url: '/bookings',
                method: 'GET',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (responseData) => {
                console.log(responseData.data.data)
                const loadedBookings = responseData.data.data.map((booking) => {
                    booking.id = booking._id;
                    return booking;
                });
                return bookingsAdapter.setAll(initialState, loadedBookings);
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Booking', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Booking', id })),
                    ];
                } else return [{ type: 'Booking', id: 'LIST' }];
            }
        }),
        startBookingProcess: builder.mutation({
            query: (bookingData) => ({
                url: '/bookings/start',
                method: 'POST',
                body: bookingData,
                validateStatus: (response, result) => {
                    return response.status === 201 && !result.isError
                },
            }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
            transformResponse: (responseData) => {
                return responseData.data;
            },
            providesTags: (result, error, arg) => {
                return [{ type: 'Reservation', id: result?.id }]
            }
        }),
        getActiveReservation: builder.query({
            query: (id) => ({
                url: `/reservations/${id}`,
                method: 'GET',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            // keepUnusedDataFor: 5,
            transformResponse: responseData => {
                console.log(responseData)
                const loadedcourse = { ...responseData.data.data, id: responseData.data.data._id };
                delete loadedcourse._id;
                return loadedcourse;
            },
            providesTags: (result, error, arg) => {
                return [{ type: 'Course', id: result?.id }]
            }
        }),
    }),
});

export const {
    useGetBookingsQuery,
    useStartBookingProcessMutation,
    useGetActiveReservationQuery,
} = bookingsApiSlice;
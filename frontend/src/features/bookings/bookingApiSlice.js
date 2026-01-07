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
            query: (reservationData) => ({
                url: `/bookings/reservations/pending`,
                method: 'POST',
                body: reservationData,
                validateStatus: (response, result) => {
                    return (response.status === 200 && !result.isError) || response.status === 404;
                },
            }),
            // keepUnusedDataFor: 5,
            transformResponse: responseData => {
                console.log(responseData)
                const activeReservation = { ...responseData.data, id: responseData.data._id };
                delete activeReservation._id;
                return activeReservation;
            },
            providesTags: (result, error, arg) => {
                return [{ type: 'Reservation', id: result?.id }]
            }
        }),
        cancelActiveReservation: builder.mutation({
            query: (id) => ({
                url: `/bookings/reservations/${id}/cancel`,
                method: 'PATCH',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            invalidatesTags: [{ type: 'Reservation', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetBookingsQuery,
    useStartBookingProcessMutation,
    useGetActiveReservationQuery,
    useCancelActiveReservationMutation,
} = bookingsApiSlice;
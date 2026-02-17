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
                url: '/api/v1/bookings',
                method: 'GET',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (responseData) => {
                console.log(responseData.data)
                const loadedBookings = responseData.data.bookings
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
                url: '/api/v1/bookings/start',
                method: 'POST',
                body: bookingData,
                validateStatus: (response, result) => {
                    return response.status === 201 && !result.isError
                },
            }),
            invalidatesTags: (result, error, arg) => {
                // Always invalidate bookings list and reservations to refetch active reservation
                // This is important because the booking might fail but still create a reservation
                return [
                    { type: 'Booking', id: 'LIST' },
                    { type: 'Reservation', id: 'LIST' }
                ];
            },
            transformResponse: (responseData) => {
                console.log("FROM apiSlice: ", responseData.data)
                return responseData.data;
            },
            providesTags: (result, error, arg) => {
                return [{ type: 'Reservation', id: result?.reservationId }]
            }
        }),
        confirmBooking: builder.mutation({
            query: (confirmationData) => ({
                url: '/api/v1/bookings/confirm',
                method: 'POST',
                body: confirmationData,
                validateStatus: (response, result) => {
                    return response.status === 201 && !result.isError
                },
            }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }, { type: 'Reservation', id: 'LIST' }, { type: 'Course', id: 'LIST' }],
            transformResponse: (responseData) => {
                console.log("FROM apiSlice: ", responseData.data)
                return responseData.data;
            },
        }),
        getActiveReservation: builder.query({
            query: (reservationData) => ({
                url: `/api/v1/bookings/reservations/pending`,
                method: 'POST',
                body: reservationData,
                validateStatus: (response, result) => {
                    // Accept 200 (found) and 404 (no active reservation) as valid responses
                    return (response.status === 200 && !result?.isError) || response.status === 404;
                },
            }),
            // keepUnusedDataFor: 5,
            transformResponse: (responseData, meta) => {
                console.log("Active reservation response:", responseData, "Status:", meta?.response?.status);
                // Handle 404 - no active reservation
                if (meta?.response?.status === 404 || !responseData?.data) {
                    return null;
                }
                const activeReservation = responseData.data.reservation;
                return activeReservation;
            },
            providesTags: (result, error, arg) => {
                // Provide both specific ID and LIST tags so mutations can invalidate properly
                return result?.id 
                    ? [{ type: 'Reservation', id: result.id }, { type: 'Reservation', id: 'LIST' }]
                    : [{ type: 'Reservation', id: 'LIST' }];
            }
        }),
        cancelActiveReservation: builder.mutation({
            query: (id) => ({
                url: `/api/v1/bookings/reservations/${id}/cancel`,
                method: 'PATCH',
                validateStatus: (response) => {
                    // 204 has no content, so don't check result
                    return response.status === 204;
                },
            }),
            invalidatesTags: (result, error, arg) => {
                // arg is the reservation ID passed to the mutation
                console.log("Invalidating tags for reservation ID:", arg);
                return [
                    { type: 'Reservation', id: 'LIST' },
                    { type: 'Reservation', id: arg }
                ];
            },
        }),
    }),
});

export const {
    useGetBookingsQuery,
    useStartBookingProcessMutation,
    useConfirmBookingMutation,
    useGetActiveReservationQuery,
    useCancelActiveReservationMutation,
} = bookingsApiSlice;
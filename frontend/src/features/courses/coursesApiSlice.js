import {
    createSelector,
    createEntityAdapter,
} from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';

const coursesAdapter = createEntityAdapter({});

const initialState = coursesAdapter.getInitialState();

export const coursesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCourses: builder.query({
            query: () => ({
                url: '/api/courses',
                method: 'GET',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (responseData) => {
                console.log(responseData)
                const loadedCourses = responseData.data.map((course) => {
                    course.id = course._id;
                    return course;
                });
                return coursesAdapter.setAll(initialState, loadedCourses);
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Course', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Course', id })),
                    ];
                } else return [{ type: 'Course', id: 'LIST' }];
            }
        }),
        getCourseById: builder.query({
            query: (id) => ({
                url: `/api/courses/${id}`,
                method: 'GET',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            // keepUnusedDataFor: 5,
            transformResponse: responseData => {
                console.log(responseData)
                const optionsList = responseData.data.priceOptions.map((option) => option.numberSlots);
                const loadedcourse = { ...responseData.data, id: responseData.data._id, priceOptionsList: optionsList };
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
    useGetCoursesQuery,
    useGetCourseByIdQuery,
} = coursesApiSlice;
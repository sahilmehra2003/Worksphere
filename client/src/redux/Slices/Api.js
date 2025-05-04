import {createApi,fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const api=createApi({
    
    baseQuery:fetchBaseQuery({baseUrl:"http://localhost:4000"}),
    reducerPath:"adminApi",
    tagTypes:["Super Admin"],
    endpoints:(build)=>({
        getUser:build.query({
            query:(id)=>`general/user/${id}`,
            providesTags:["Super Admin"]
        })
    })
})
// console.log(process.env.REACT_APP_BASE_URL)
export const {useGetUserQuery}=api;
import { configureStore } from '@reduxjs/toolkit'
import ThemeReducer from './Slices/ThemeSlice'
import { setupListeners } from '@reduxjs/toolkit/query'
import {api} from "./Slices/Api"


export const store=configureStore({
    reducer:{
        theme:ThemeReducer,
        [api.reducerPath]:api.reducer,
    },
    middleware:(getDefault)=>getDefault().concat(api.middleware)
})
setupListeners(store.dispatch);
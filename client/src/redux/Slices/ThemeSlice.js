import { createSlice } from "@reduxjs/toolkit";


const initialState={
    userId:"63701cc1f03239b7f700000e",
    mode:"dark"
};

export const ThemeSlice=createSlice({
    name:"theme",
    initialState,
    reducers:{
        // function to toggle btw light and dark mode
        setMode:(state)=>{
            state.mode=state.mode==='light'?"dark":"light"
        }
    }
})

export const {setMode}=ThemeSlice.actions;

export default ThemeSlice.reducer;
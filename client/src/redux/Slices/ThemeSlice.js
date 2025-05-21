import { createSlice } from "@reduxjs/toolkit";


const getInitialMode = () => {
    try {
        const persistedMode = localStorage.getItem("worksphereThemeMode");
        if (persistedMode) {
            return persistedMode === "dark" ? "dark" : "light"; // Validate persisted value
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
             return "dark";
        }
    } catch (error) {
        console.warn("Could not access localStorage for theme mode:", error);
    }
    return "light";
};



const initialState={
   mode:getInitialMode(),
};

export const themeSlice=createSlice({
    name:"theme",
    initialState,
    reducers:{
        // function to toggle btw light and dark mode
        setMode:(state)=>{
            state.mode = state.mode === 'light' ? "dark" : "light"
            try {
                localStorage.setItem("worksphereThemeMode", state.mode);
            } catch (error) {
                console.warn("Could not save theme mode to localStorage:", error);
            }
        },
        //  to explicitly set the mode from user settings
        setSpecificMode: (state, action) => {
            state.mode = action.payload === "dark" ? "dark" : "light";
            localStorage.setItem("worksphereThemeMode", state.mode);
        }

    }
})

export const {
    setMode, setSpecificMode
} = themeSlice.actions;

export default themeSlice.reducer;
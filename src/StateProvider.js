import React,{createContext,useContext,useReducer} from 'react';
//preparing the data layer
export const StateContext = createContext();
export const StateProvider = ({reducer,initialState,children}) =>(
    <StateContext.Provider value={useReducer(reducer,initialState)}>
        {children}
    </StateContext.Provider>
);
//pull information from data layer
export const useStateValue = () => useContext(StateContext);
import db from './firebase'
export const initialState={
    user:null,
}
export const actionTypes={
    SET_USER:"SET_USER",
}
const reducer=(state,action)=>{
    console.log(action);
    switch(action.type){
        case actionTypes.SET_USER:
            db.collection('users').doc(action.user.uid).set({
                name:action.user.displayName,
                email:action.user.email,
                photo:action.user.photoURL,
            })//push the user information to the firestore database.
            return{
                ...state,
                user:action.user,
            };
        default:
            return state;
    }
};
export default reducer;
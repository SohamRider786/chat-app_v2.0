import React from 'react'
import './Login.css'
import {Button} from '@material-ui/core'
import {auth,provider} from './firebase'
import {useStateValue } from './StateProvider'
import { actionTypes } from './reducer'
function Login() {
    const [{user},dispatch]=useStateValue();
    const signIn = () => {
        auth
        .signInWithPopup(provider)
        .then((result) => (dispatch({
            type:actionTypes.SET_USER,
            user:result.user,
        })))
        .catch(error=>alert(error.message));
    }
  return (
    <div className='login'>
    <div className='login__container'>
        <img src='https://www.svgrepo.com/show/149837/whatsapp.svg' alt=''/>
        <div className='login__text'>
            <h1>Sign in to ChatApp</h1>
        </div>
        <Button onClick={signIn}>Sign In with Google</Button>
    </div>
    </div>
  )
}

export default Login
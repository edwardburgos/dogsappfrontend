import s from './VerifyEmail.module.css';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { setLocalStorage, getUserInfo, showMessage } from '../../extras/globalFunctions';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';
import axios from '../../axiosInterceptor';
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { IonIcon } from '@ionic/react';
import realAxios from 'axios';
import Loading from '../Loading/Loading';

export default function VerifyEmail({ token, reason, expires }) {

    // Variables
    const history = useHistory();
    const dispatch = useDispatch();

    const [newPassword, setNewPassword] = useState('')
    const [errNewPassword, setErrNewPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [userInfo, setUserInfo] = useState({})

    // This hook is executed every time the page is reloaded
    useEffect(() => {
        const cancelToken = axios.CancelToken;
        const source = cancelToken.source();
        async function checkLog() {
            const user = await getUserInfo(source.token);
            if (user !== "Unmounted") {
                dispatch(setUser(user));
            }
        }
        checkLog();
        return () => source.cancel("Unmounted");
    }, [dispatch])

    // Hooks
    useEffect(() => {
        async function loginUser() {
            if (token && expires) {
                try {
                    if (['verifyEmail', 'deleteAccountEmail', 'resetPassword', 'definePassword'].includes(reason)) {
                        let user = {}
                        try {
                            let infoReq = await realAxios.get(`${process.env.REACT_APP_BACKEND}/users/info`, { headers: { Authorization: token } })
                            user = infoReq.data.user
                        } catch (e) {
                            user = {};
                        }
                        if (Object.keys(user).length) {
                            if (reason === 'deleteAccountEmail') {
                                await realAxios.delete(`${process.env.REACT_APP_BACKEND}/users`, { headers: { Authorization: token } })
                                showMessage(`${user.fullname} your account was deleted`)
                                return history.push('/home')
                            } else if (reason === 'verifyEmail') {
                                const verificationState = await realAxios.put(`${process.env.REACT_APP_BACKEND}/users/verifyUser`, { email: user.email })
                                verificationState.data === 'Already verified' ? showMessage(`${user.fullname} your account is already verified`) : showMessage(`${user.fullname} your account was verified`)
                                if (!localStorage.getItem("token") && !localStorage.getItem("expiration")) {
                                    setLocalStorage({ token, expiresIn: expires });
                                    showMessage(`${user.fullname} you are logged in`)
                                }
                                return history.push('/home')
                            } else if (['resetPassword', 'definePassword'].includes(reason)) {
                                setUserInfo(user)
                            }
                        }
                    } else {
                        if (!localStorage.getItem("token") && !localStorage.getItem("expiration")) {
                            setLocalStorage({ token, expiresIn: expires });
                            const user = await getUserInfo()
                            showMessage(`${user.fullname} you are logged in`)
                            return history.push('/home')
                        } else {
                            const user = await getUserInfo()
                            if (Object.keys(user).length) {
                                showMessage('Sorry, another user is logged in')
                                return history.push('/home')
                            }
                        }

                    }
                } catch (e) {
                    showMessage('Sorry, an error ocurred')
                }

            }
        }
        loginUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // This function allows us to handle the changes in the form
    function handleChange(e) {
        const value = e.target.value;
        if (!value) {
            setErrNewPassword('This field is required');
        } else {
            value.length < 21 ?
                /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(value) ?
                    !/\s/.test(value) ?
                        setErrNewPassword('')
                        :
                        setErrNewPassword("The password can't contain white spaces")
                    :
                    setErrNewPassword('The password should have between 8 and 20 characters combining lowercase and uppercase letters, numbers and symbols')
                :
                setErrNewPassword("The password can't have more than 20 characters")
        }
        return setNewPassword(value)
    }

    async function changePassword(e) {
        e.preventDefault()
        try {
            const login = await axios.post(`/users/changePasswordWithEmail`, {
                email: userInfo.email,
                newPassword,
            })
            if (!localStorage.getItem("token") && !localStorage.getItem("expiration")) {
                showMessage(`${login.data.user} your password was updated successfully`);
                setLocalStorage(login.data);
                showMessage(`${login.data.user} your login was successful`);
                history.push('/home');
            } else {
                showMessage(`${login.data.user} your password was updated successfully`);
                history.push('/home');
            }
        } catch (e) {
            if (e.response.status === 404 && e.response.data.includes('There is no user with the id')) return showMessage(e.response.data);
            if (e.response.status === 409 && e.response.data === "Provide a password different from your current password") return setErrNewPassword(e.response.data)
            if (e.response.status === 500 && e.response.data.msg === "Password could not be updated") return showMessage(e.response.data.msg);
            showMessage('Sorry, an error ocurred')
        }
    }

    // This function allows us to change the password specifically when the user was registered with Google and do not have one
    async function definePassword(e) {
        e.preventDefault()
        try {
            const login = await axios.post(`/users/definePasswordWithEmail`, {
                emailORusername: userInfo.email,
                password: newPassword,
            })
            if (!localStorage.getItem("token") && !localStorage.getItem("expiration")) {
                showMessage(`${login.data.user} your password was defined successfully`);
                setLocalStorage(login.data);
                showMessage(`${login.data.user} your login was successful`);
                history.push('/home');
            } else {
                showMessage(`${login.data.user} your password was defined successfully`);
                history.push('/home');
            }
        } catch (e) {
            if (e.response.status === 500 && e.response.data.msg === 'Password could not be defined') return showMessage(e.response.data.msg);
            if (e.response.status === 404 && e.response.data.msg === 'There is no user registered with this email') return showMessage(e.response.data.msg)
            showMessage('Sorry, an error occurred');
        }
    }

    return (
        <div className={s.container}>
            {
                ['resetPassword', 'definePassword'].includes(reason) ?
                    <>
                        <form onSubmit={reason === 'resetPassword' ? changePassword : definePassword} className={s.form}>
                            <div className={errNewPassword ? '' : 'mb-3'}>
                                <label className={s.label} htmlFor="passNewValue">{reason === 'resetPassword' ? 'New password' : 'Password'}</label>
                                <div className={s.test}>
                                    <input id="passNewValue" value={newPassword} name='passNewValue' type={showNewPassword ? 'text' : 'password'} onChange={handleChange} className={`form-control ${s.inputPassword} ${errNewPassword ? s.errorInput : ''}`} />
                                    <IonIcon icon={showNewPassword ? eyeOutline : eyeOffOutline} className={s.iconDumb} onClick={() => showNewPassword ? setShowNewPassword(false) : setShowNewPassword(true)}></IonIcon>
                                </div>
                            </div>
                            {errNewPassword ? <small className={s.error}>{errNewPassword}</small> : null}
                            <input type="submit" value="Confirm password" disabled={!newPassword || errNewPassword} className={`w-100 btn btn-primary`} />
                        </form>
                    </>
                    :
                    <Loading />
            }
        </div>
    );
}


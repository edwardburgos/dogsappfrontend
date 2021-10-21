import s from './NotFound.module.css';
import logo from '../../img/notFound.svg';
import React, { useEffect } from 'react';
import axios from '../../axiosInterceptor';
import { getUserInfo } from '../../extras/globalFunctions';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';


export default function NotFound() {

    // Variables
    const dispatch = useDispatch();

    // Hooks

    // This hook allow us to load the logued user
    useEffect(() => {
        const cancelToken = axios.CancelToken;
        const source = cancelToken.source();
        async function updateUser() {
            const user = await getUserInfo(source.token);
            if (user !== "Unmounted") {
                dispatch(setUser(user))
            }
        }
        updateUser();
        return () => source.cancel("Unmounted");
    }, [dispatch])

    return (
        <div className={s.container}>
            <div className={s.content}>
                <div className={s.image}>
                    <img className={s.logo} src={logo} alt='logo'></img>
                </div>
                <h1 className={s.title}>Sorry, this page does not exist</h1>
            </div>
        </div>
    );
}


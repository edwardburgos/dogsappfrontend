import { useEffect, useState } from 'react';
import logo from '../../img/logo.png';
import { Link, useHistory } from 'react-router-dom'
import axios from '../../axiosInterceptor';
import s from './Login.module.css';
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { IonIcon } from '@ionic/react';
import googleLogo from '../../img/googleLogo.png';
import { app, googleAuthProvider } from '../../extras/firebase.js';
import { Modal } from 'react-bootstrap'
import { countries } from '../../extras/countries';
import loading from '../../img/loadingGif.gif';
import { setLocalStorage, getCountry, getUserInfo, showMessage } from '../../extras/globalFunctions';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';
import Loading from '../Loading/Loading';

export default function Login() {
    // Own states
    const [emailUsername, setEmailUsername] = useState('');
    const [errEmailUsername, setErrEmailUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errPassword, setErrPassword] = useState('');
    const [wrongCredentials, setWrongCredentials] = useState('');
    const [errGlobal, setErrGlobal] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [country, setCountry] = useState('');
    const [buttonState, setButtonState] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [googleProfile, setGoogleProfile] = useState({});
    const [username, setUsername] = useState('');
    const [errUsername, setErrUsername] = useState('');
    const [modalButtonState, setModalButtonState] = useState(true);
    const [onlyPassword, setOnlyPassword] = useState(false);
    const [showVerify, setShowVerify] = useState(false)
    const [showLoginWithoutPassword, setShowLoginWithoutPassword] = useState(false)
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [firstOptionLoading, setFirstOptionLoading] = useState(false)
    const [secondOptionLoading, setSecondOptionLoading] = useState(false)
    const [sendingNewVerification, setSendingNewVerification] = useState(false)
    const [sendingPasswordEmail, setSendingPasswordEmail] = useState(false)
    const [showDefinePassword, setShowDefinePassword] = useState(false)

    // Variables
    const history = useHistory();
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

    // This hook set the country of the user
    useEffect(() => {
        const cancelToken = axios.CancelToken;
        const source = cancelToken.source();
        async function getUserCountry() {
            const response = await getCountry(source.token);
            setCountry(response);
        }
        getUserCountry();
        return () => source.cancel("Unmounted");
    }, [])


    // This hook manage the button state
    useEffect(() => {
        if (errEmailUsername || errPassword || !emailUsername || !password) return setButtonState(true);
        setWrongCredentials(false);
        setButtonState(false);
    }, [errEmailUsername, errPassword, emailUsername, password])


    // This hook manage the modal button state
    useEffect(() => {
        if (errUsername || !username || country === "Select a country") return setModalButtonState(true);
        setModalButtonState(false);
    }, [errUsername, username, country])

    // This hook update the states buttonState, password, errPassword and wrongCredentials when the form / onlyPassword value change
    useEffect(() => {
        setModalButtonState(false);
        setPassword('');
        setErrPassword('');
        setWrongCredentials('');
    }, [onlyPassword])

    // Functions

    // This function makes the form dynamic
    function handleChange(e) {
        const value = e.target.value;
        switch (e.target.name) {
            case 'emailUsernameValue':
                !value ? setErrEmailUsername('This field is required') : setErrEmailUsername('');
                return setEmailUsername(value)
            case 'passValue':
                if (!value) {
                    setErrPassword('This field is required')
                } else {
                    if (onlyPassword) {
                        value.length < 21 ?
                            /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(value) ?
                                !/\s/.test(value) ?
                                    setErrPassword('')
                                    :
                                    setErrPassword("The password can't contain white spaces")
                                :
                                setErrPassword('The password should have between 8 and 20 characters combining lowercase and uppercase letters, numbers and symbols')
                            :
                            setErrPassword("The password can't have more than 20 characters")
                    } else {
                        setErrPassword('');
                    }
                }
                return setPassword(value)
            case 'usernameValue':
                !value ? setErrUsername('This field is required') : (value.length < 31 ? (/\s/.test(value) ? setErrUsername("The username can't contain white spaces") : (/^[a-z0-9._]+$/g.test(value) ? setErrUsername('') : setErrUsername("The username only can contains lowercase letters, numbers, points and subscripts"))) : setErrUsername("The username can't have more than 30 characters"))
                return setUsername(value)
            case 'countryValue':
                return setCountry(value)
            default:
                break;
        }
    }

    // This function allows us to login with Google
    async function loginConGoogle() {
        try {
            const googleLogin = await app.auth().signInWithPopup(googleAuthProvider);
            app.auth().signOut();
            if (Object.keys(googleLogin.additionalUserInfo.profile).length) {
                const email = googleLogin.additionalUserInfo.profile.email;
                const availableEmail = await axios.get(`/users/availableEmail/${email}`);
                if (availableEmail.data) {
                    setGoogleProfile(googleLogin.additionalUserInfo.profile);
                    setShowModal(true);
                } else {
                    const logged = await axios.post(`/users/login`, {
                        emailORusername: email,
                        password: '',
                        type: 'Google'
                    });
                    setLocalStorage(logged.data);
                    showMessage(`${logged.data.user} your login was successful`);
                    history.push('/home');
                }
            } else { dispatch(setUser({})); showMessage('Sorry, an error occurred'); }
        } catch (e) {
            console.log(e)
            if (e.code !== "auth/popup-closed-by-user") {
                dispatch(setUser({})); 
                showMessage('Sorry, an error occurred');
            }
            
        }
    }

    // This function allows us to register and login with Google
    async function handleModalSubmit(e) {
        e.preventDefault();
        if (Object.keys(googleProfile).length) {
            try {
                let { name, given_name, family_name, picture, email } = googleProfile;
                const registered = await axios.post(`/users/register`, {
                    fullname: name,
                    name: given_name,
                    lastname: family_name,
                    profilepic: picture ? picture : 'https://firebasestorage.googleapis.com/v0/b/dogsapp-f043d.appspot.com/o/defaultProfilePic.jpg?alt=media&token=cfd199e8-c010-45ab-972b-c967c55f3461',
                    username,
                    country,
                    email: email,
                    password: 'google',
                    type: 'Google'
                });
                showMessage(`${registered.data.user} your registration was successful`);
                const logged = await axios.post(`/users/login`, {
                    emailORusername: email,
                    password: '',
                    type: 'Google'
                });
                setLocalStorage(logged.data);
                setShowModal(false);
                showMessage(`${logged.data.user} your login was successful`);
                history.push('/home');
            } catch (e) {
                dispatch(setUser({}));
                if (e.response.status === 409 && e.response.data.msg === "There is already a user with this username") return setErrUsername(e.response.data.msg)
                showMessage('Sorry, an error occurred');
            }
        } else {
            dispatch(setUser({})); showMessage('Sorry, an error occurred');
        }
    }

    // This function allows us to login natively
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const login = await axios.post(`/users/login`, {
                emailORusername: emailUsername,
                password,
                type: 'Native'
            })
            setLocalStorage(login.data);
            showMessage(`${login.data.user} your login was successful`);
            history.push('/home');
        } catch (e) {
            dispatch(setUser({}));
            setButtonState(true);
            if (e.response.status === 403 && e.response.data.msg === 'Your account is not verified yet') return setErrGlobal(e.response.data.msg)
            if (e.response.status === 403 && e.response.data.msg.includes('Google')) { setOnlyPassword(true); return setErrGlobal(e.response.data.msg) }
            if (e.response.status === 403 && e.response.data.msg === 'Incorrect password') return setErrPassword(e.response.data.msg);
            if (e.response.status === 404 && e.response.data.msg.includes('There is no user registered with this')) return setErrEmailUsername(e.response.data.msg)
            setErrGlobal('Sorry, an error occurred');
        }
    }

    // This function allows us to send another verification link
    async function newVerificationLink() {
        setSendingNewVerification(true)
        try {
            await axios.post('/users/newVerificationEmail', { emailUsername });
            setShowVerify(true)
        } catch (e) {
            console.log(e)
            //   if (e.response.data.msg) return setErrGlobal(e.response.data.msg)
            setErrGlobal('Sorry, an error occurred');
        }
        setSendingNewVerification(false)
    }

    // This function allows us to send a email to login without password
    async function emailToLoginWithoutPassword() {
        setFirstOptionLoading(true)
        try {
            await axios.post('/users/loginWithoutPassword', { emailUsername })
            setShowLoginWithoutPassword(true)
        } catch (e) {
            console.log(e)
            setErrGlobal('Sorry, an error occurred');
        }
        setFirstOptionLoading(false)
    }

    // This function allows us to send a email to reset password
    async function emailToResetPassword() {
        setSecondOptionLoading(true)
        try {
            await axios.post('/users/resetPassword', { emailUsername })
            setShowResetPassword(true)
        } catch (e) {
            console.log(e)
            setErrGlobal('Sorry, an error occurred');
        }
        setSecondOptionLoading(false)
    }

    async function definePassword() {
        setSendingPasswordEmail(true)
        try {
            await axios.post('/users/definePassword', { emailUsername })
            setShowDefinePassword(true)
        } catch (e) {
            console.log(e)
            setErrGlobal('Sorry, an error occurred');
        }
        setSendingPasswordEmail(false)
    }

    return (
        <>
            <div className={s.container}>
                {country ?
                    <div className={s.content}>
                        <div className={s.image}>
                            <img className={s.logo} src={logo} alt='logo' width="100%"></img>
                        </div>
                        <div className={s.form}>
                            <h1 className={s.title}>Log in</h1>

                            <div className={s.errorGlobalContainer}>
                                {errGlobal ?
                                    <div className={s.errorGlobal}>
                                        {!sendingNewVerification ?
                                            <>
                                                <span>{errGlobal}</span>
                                                {errGlobal === 'Your account is not verified yet' ? <><span>, please check your email to do it or click </span><a className={`${s.enlaceErr} bold`} onClick={() => newVerificationLink()}>here</a><span> to get another verification link</span></> : null}
                                            </>
                                            :
                                            <img className={s.loadingInButton} src={loading} alt='loadingGif'></img>
                                        }
                                    </div>
                                    : null}
                            </div>
                            {
                                onlyPassword ?
                                    null
                                    :
                                    <>
                                        <form onSubmit={handleSubmit}>
                                            <div className={errEmailUsername ? '' : 'mb-3'}>
                                                <label className={s.label} htmlFor="emailUsernameValue">Email or username</label>
                                                <input id="emailUsernameValue" value={emailUsername} name='emailUsernameValue' onChange={handleChange} className={`form-control ${s.input} ${errEmailUsername ? s.errorInput : ''}`} />
                                            </div>
                                            {errEmailUsername ? <small className={s.error}>{errEmailUsername}</small> : null}

                                            <div className={errPassword ? '' : 'mb-3'}>
                                                <label className={s.label} htmlFor="passValue">Password</label>
                                                <div className={s.test}>
                                                    <input id="passValue" value={password} name='passValue' type={showPassword ? 'text' : 'password'} onChange={handleChange} className={`form-control ${s.inputPassword} ${errPassword ? s.errorInput : ''}`} />
                                                    <IonIcon icon={showPassword ? eyeOutline : eyeOffOutline} className={s.iconDumb} onClick={() => showPassword ? setShowPassword(false) : setShowPassword(true)}></IonIcon>
                                                </div>
                                            </div>
                                            {errPassword ? <small className={s.error}>{errPassword}</small> : null}

                                            <input type="submit" value="Log in" disabled={buttonState} className={`w-100 btn btn-primary mb-3`} />
                                        </form>
                                        {
                                            errPassword === 'Incorrect password' ?
                                                <>
                                                    <div className={s.errAlternatives}>
                                                        {
                                                            !firstOptionLoading ?
                                                                <button className={`${s.errAlternative} btn btn-primary`} onClick={() => emailToLoginWithoutPassword()}>Login without password</button>
                                                                :
                                                                <div className={`${s.loadingButton} ${s.errAlternative} btn btn-primary disabled`}>
                                                                    <img className={s.loadingInButton} src={loading} alt='loadingGif'></img>
                                                                </div>
                                                        }
                                                        {
                                                            !secondOptionLoading ?
                                                                <button className={`${s.errAlternative} btn btn-primary`} onClick={() => emailToResetPassword()}>Reset password</button>
                                                                :
                                                                <div className={`${s.loadingButton} ${s.errAlternative} btn btn-primary disabled`}>
                                                                    <img className={s.loadingInButton} src={loading} alt='loadingGif'></img>
                                                                </div>
                                                        }
                                                    </div>
                                                </> : null
                                        }
                                    </>


                            }
                            {
                                onlyPassword ?
                                    <>
                                        {
                                            sendingPasswordEmail ?
                                                <div className={`${s.loadingButton} ${s.loginOtherEmail} w-100 btn disabled`}>
                                                    <img className={s.loadingInButton} src={loading} alt='loadingGif'></img>
                                                </div>
                                                :
                                                <div className={`w-100 btn ${s.loginOtherEmail}`} onClick={() => { definePassword() }}>
                                                    <span>Define a password</span>
                                                </div>
                                        }
                                        <div className={`w-100 btn ${s.loginOtherEmail}`} onClick={() => { setEmailUsername(''); setErrEmailUsername(''); setErrGlobal(''); setOnlyPassword(false); }}>
                                            <span>Log in with other email</span>
                                        </div>
                                    </>
                                    :
                                    <div className={s.division}>
                                        <span>Or</span>
                                    </div>

                            }

                            <div className={`w-100 btn ${s.loginButton}`} onClick={loginConGoogle}>
                                <img src={googleLogo} className={s.loginLogo} alt='Google Logo'></img>
                                <span>Log in with Google</span>
                            </div>

                            <p className={s.marginBottom0}>
                                Don't have an account?
                                <Link className={s.registroLink} to="/signup">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                    :
                    <Loading />
                }
            </div>

            <Modal
                show={showModal}
                backdrop="static"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Complete this form
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleModalSubmit}>
                        <div className={errUsername ? '' : 'mb-3'}>
                            <label className={s.label} htmlFor="usernameValue">Username</label>
                            <input id="usernameValue" value={username} name='usernameValue' onChange={handleChange} className={`form-control ${s.input} ${errUsername ? s.errorInput : ''}`} />
                        </div>
                        {errUsername ? <small className={s.error}>{errUsername}</small> : null}

                        <div className='mb-3'>
                            <label className={s.label} htmlFor="countryValue">Country</label>
                            <select id="countryValue" name='countryValue' value={country} onChange={handleChange} className={`form-control ${s.input}`}>
                                {country === "Select a country" ? <option key="Select a country" value="Select a country">Select a country</option> : null}
                                {countries.map(c => {
                                    return <option key={c.code} value={c.name}>{c.name}</option>
                                })}
                            </select>
                        </div>

                        <input type="submit" value="Log in" disabled={modalButtonState} className={`w-100 btn btn-primary`} />
                    </form>
                </Modal.Body>
            </Modal>

            <Modal
                show={showVerify}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                keyboard={false}
                onHide={() => { setShowVerify(false); history.push('/home'); }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Check your email
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='mb-0'>Please, check your email because we have sent you another link to verify your email address</p>
                </Modal.Body>
            </Modal>

            <Modal
                show={showLoginWithoutPassword}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                keyboard={false}
                onHide={() => { setShowLoginWithoutPassword(false); history.push('/home'); }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Check your email
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='mb-0'>Please, check your email because we have sent you a link to login without password</p>
                </Modal.Body>
            </Modal>

            <Modal
                show={showResetPassword}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                keyboard={false}
                onHide={() => { setShowResetPassword(false); history.push('/home'); }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Check your email
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='mb-0'>Please, check your email because we have sent you a link to reset your password</p>
                </Modal.Body>
            </Modal>

            <Modal
                show={showDefinePassword}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                keyboard={false}
                onHide={() => { setShowDefinePassword(false); history.push('/home'); }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Check your email
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='mb-0'>Please, check your email because we have sent you a link to define a password</p>
                </Modal.Body>
            </Modal>
        </>
    )
}
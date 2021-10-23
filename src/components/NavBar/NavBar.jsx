import s from './NavBar.module.css';
import { NavLink, useHistory } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';
import logo from '../../img/logo.png';
import { useState } from 'react';
import { Navbar, Nav, Dropdown, Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';
import axios from '../../axiosInterceptor';
import { getUserInfo, showMessage, logout, setLocalStorage} from '../../extras/globalFunctions';
import jwtDecode from 'jwt-decode';
import { countries } from '../../extras/countries';



export default function NavBar() {
  // Redux states
  const user = useSelector(state => state.user)

  // Own States 
  const [navExpanded, setNavExpanded] = useState(false);
  const [googleProfile, setGoogleProfile] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalButtonState, setModalButtonState] = useState(true);
  const [country, setCountry] = useState('');
  const [username, setUsername] = useState('');
  const [errUsername, setErrUsername] = useState('');

  // Variables
  const dispatch = useDispatch();
  const history = useHistory();

  // This hook manage the modal button state
  useEffect(() => {
    if (errUsername || !username || country === "Select a country") return setModalButtonState(true);
    setModalButtonState(false);
  }, [errUsername, username, country])

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

  // This function makes the form dynamic
  function handleChange(e) {
    const value = e.target.value;
    switch (e.target.name) {
      case 'usernameValue':
        !value ? setErrUsername('This field is required') : (value.length < 31 ? (/\s/.test(value) ? setErrUsername("The username can't contain white spaces") : (/^[a-z0-9._]+$/g.test(value) ? setErrUsername('') : setErrUsername("The username only can contains lowercase letters, numbers, points and subscripts"))) : setErrUsername("The username can't have more than 30 characters"))
        return setUsername(value)
      case 'countryValue':
        return setCountry(value)
      default:
        break;
    }
  }

  async function onOneTapSignedIn(response) {
    var decoded = jwtDecode(response.credential);
    try {
      if (Object.keys(decoded).length) {
        const email = decoded.email;
        const availableEmail = await axios.get(`/users/availableEmail/${email}`);
        if (availableEmail.data) {
          setGoogleProfile(decoded);
          setShowModal(true);
        } else {
          const logged = await axios.post(`/users/login`, {
            emailORusername: email,
            password: '',
            type: 'Google'
          });
          setLocalStorage(logged.data);
          showMessage(`${logged.data.user} your login was successful`);
          const user = await getUserInfo();
          dispatch(setUser(user))
          history.push('/home')
        }
      } else { dispatch(setUser({})); history.push('/home'); showMessage('Sorry, an error occurred'); }
    } catch (e) {
      showMessage('Sorry, an error occurred');
    }
  }

  function showOneTap() {
    if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_CLIENT_ID,
          ux_mode: 'redirect', // This allows us to work in incognite mode
          callback: onOneTapSignedIn
        })
        window.google.accounts.id.prompt(notification => {
          //console.log('on prompt notification', notification)
        })
    } else {
      document.getElementById('googleOneTap').addEventListener('load', () => {
        // Patiently waiting to do the thing 
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_CLIENT_ID,
            ux_mode: 'redirect', // This allows us to work in incognite mode
            callback: onOneTapSignedIn
          })
          window.google.accounts.id.prompt(notification => {
            //console.log('on prompt notification', notification)
          })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  const ref = useRef(null);

  // This hook allows us to close the navbar when clicked outside of it while this one is expanded 
  useEffect(() => {
    function handleClickOutside(event) {
      // If the ref exists and the click target (detected by the listener) if not inside of it, close the navbar
      if (ref.current && !ref.current.contains(event.target)) {
        setNavExpanded(false)
      }
    }
    // If the navbar is open set a click detector that will execute the function handleClickOutside, if not remove that detector
    if (navExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [ref, navExpanded]);

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
        const user = await getUserInfo();
        dispatch(setUser(user))
        history.push('/home')
        showMessage(`${logged.data.user} your login was successful`);
      } catch (e) {
        dispatch(setUser({}));
        history.push('/home')
        if (e.response.status === 409 && e.response.data.msg === "There is already a user with this username") return setErrUsername(e.response.data.msg)
        showMessage('Sorry, an error occurred');
      }
    } else {
      dispatch(setUser({})); history.push('/home'); return showMessage('Sorry, an error occurred');
    }
  }

  return (
    <>
      <Navbar expand="lg" className={s.navbar} id="navBar" expanded={navExpanded} fixed="top" ref={ref}>
        <Navbar.Brand as={NavLink} to="/home" onClick={() => setNavExpanded(false)} className={s.brand}>
          <img src={logo} className={s.logo} alt="Cute dog"></img>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => navExpanded ? setNavExpanded(false) : setNavExpanded(true)} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" >
            <Nav.Link as={NavLink} to="/registerDog" className={s.enlace} activeClassName={s.enlaceActivo} onClick={() => setNavExpanded(false)}>Register your dog</Nav.Link>
            <Nav.Link as={NavLink} to="/community" className={s.enlace} activeClassName={s.enlaceActivo} onClick={() => setNavExpanded(false)}>Community</Nav.Link>
            <Nav.Link as={NavLink} to="/communityDogs" className={s.enlace} activeClassName={s.enlaceActivo} onClick={() => setNavExpanded(false)}>Community dogs</Nav.Link>
          </Nav>
          {
            user ?
              Object.keys(user).length ?
                <Dropdown align={{ lg: 'end' }}>
                  <Dropdown.Toggle variant="light" id="dropdown-basic" className={s.titleDropdown}>
                    <img className={s.profilePic} src={user.profilepic} alt='User profile'></img>
                    <span>{user.fullname}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={NavLink} to={`/${user.username}`} onClick={() => { setNavExpanded(false); }}>My profile</Dropdown.Item>
                    <Dropdown.Item onClick={() => { dispatch(setUser({})); setNavExpanded(false); logout(); showMessage(`Logged out successfully`); showOneTap(); }}>Log out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                :
                <>
                  <Nav.Link as={NavLink} to="/signup" className={s.enlaceSignup} activeClassName={s.enlaceActivo} onClick={() => setNavExpanded(false)}>Sign up</Nav.Link>
                  <Nav.Link as={NavLink} to="/login" className={s.enlaceLogin} activeClassName={s.enlaceActivo} onClick={() => setNavExpanded(false)}>Log in</Nav.Link>
                </>
              :
              <Nav.Link as={NavLink} to="/create" className={s.enlaceSignup} onClick={() => setNavExpanded(false)}>Cargando</Nav.Link>
          }
        </Navbar.Collapse>
      </Navbar>

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
    </>
  );
}

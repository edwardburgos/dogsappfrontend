import s from './NavBar.module.css';
import { NavLink } from 'react-router-dom';
import React,  { useEffect, useRef } from 'react';
import logo from '../../img/logo.png';
import { useState } from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';
import axios from '../../axiosInterceptor';
import { getUserInfo, showMessage, logout } from '../../extras/globalFunctions';

export default function NavBar() {
  // Redux states
  const user = useSelector(state => state.user)

  // Own States 
  const [navExpanded, setNavExpanded] = useState(false);

  // Variables
  const dispatch = useDispatch();

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

  

  return (
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
            //   {/* // <Navbar.Text className={s.signedInfo}>
            // //   <a href="#login">{user.name}</a>
            // // </Navbar.Text> */}
            <Dropdown align={{ lg: 'end' }}>
              <Dropdown.Toggle variant="light" id="dropdown-basic" className={s.titleDropdown}>
                <img className={s.profilePic} src={user.profilepic} alt='User profile'></img>
                <span>{user.fullname}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu> 
              {/* className={s.enlaceSignup} activeClassName={s.enlaceActivo} */}
                <Dropdown.Item as={NavLink} to={`/${user.username}`} onClick={() => { setNavExpanded(false);}}>My profile</Dropdown.Item>
                <Dropdown.Item onClick={() => { setNavExpanded(false); logout(); dispatch(setUser({})); showMessage(`Logged out successfully`);}}>Log out</Dropdown.Item>
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
  );
}

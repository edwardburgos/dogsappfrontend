import s from './App.module.css';
import axios from './axiosInterceptor';
import { Route, Redirect, Switch, useLocation, useHistory } from 'react-router-dom';
import { getUserInfo, setLocalStorage, showMessage } from './extras/globalFunctions';
import { useEffect, useState } from 'react';
import { setUser } from './actions';
import { useDispatch, useSelector } from 'react-redux';
import Home from './components/Home/Home';
import Detail from './components/Detail/Detail';
import NavBar from './components/NavBar/NavBar';
import Login from './components/Login/Login';
import Profile from './components/Profile/Profile';
import Signup from './components/Signup/Signup';
import RegisterPet from './components/RegisterPet/RegisterPet';
import EditPet from './components/EditPet/EditPet';
import User from './components/User/User';
import Pet from './components/Pet/Pet';
import VerifyEmail from './components/VerifyEmail/VerifyEmail';
import Loading from './components/Loading/Loading';
import Community from './components/Community/Community';
import CommunityDogs from './components/CommunityDogs/CommunityDogs';
import jwtDecode from 'jwt-decode';
import { Modal } from 'react-bootstrap'
import { countries } from './extras/countries';

function App() {
  // Redux states

  const user = useSelector(state => state.user)

  const [googleProfile, setGoogleProfile] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalButtonState, setModalButtonState] = useState(true);
  const [country, setCountry] = useState('');
  const [username, setUsername] = useState('');
  const [errUsername, setErrUsername] = useState('');

  // This hook manage the modal button state
  useEffect(() => {
    if (errUsername || !username || country === "Select a country") return setModalButtonState(true);
    setModalButtonState(false);
  }, [errUsername, username, country])

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

  // Variables
  const dispatch = useDispatch();
  let query = new URLSearchParams(useLocation().search);
  const history = useHistory();

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

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function cargaInicial() {
      const user = await getUserInfo(source.token);
      if (user !== "Unmounted") {
        dispatch(setUser(user));
        history.push('/home')
      }
      document.getElementById('googleOneTap').addEventListener('load', () => {
        // Patiently waiting to do the thing 
        if (!Object.keys(user).length && window.google) {

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
  cargaInicial();
  return () => source.cancel("Unmounted");
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dispatch])

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
    {
      user ?
        <div>
          <NavBar />
          <div className={s.padding}>
            <Switch>
              <Route path="/home" component={Home} />
              <Route path="/detail/:id" render={({ match }) => <Detail id={match.params.id} />} />
              <Route path="/registerDog" component={RegisterPet} />
              <Route path="/editDog/:id" render={({ match }) => Object.keys(user).length && user.pets.includes(parseInt(match.params.id)) ? <EditPet id={match.params.id} /> : <Redirect to="/home" />}></Route>
              <Route path="/dog/:id" render={({ match }) => <Pet id={match.params.id} />} />
              <Route path="/profile">{Object.keys(user).length ? <Profile /> : <Redirect to="/login" />}</Route>
              <Route path="/login">{Object.keys(user).length ? <Redirect to="/profile" /> : <Login />}</Route>
              <Route path="/signup" >{Object.keys(user).length ? <Redirect to="/profile" /> : <Signup />}</Route>
              <Route path="/community" component={Community} />
              <Route path="/communityDogs" component={CommunityDogs} />
              <Route path="/auto/:reason/:token" render={({ match }) => <VerifyEmail reason={match.params.reason} token={match.params.token} expires={query.get("expires")} />} />
              <Route path="/:username" render={({ match }) => <User username={match.params.username} />} />
            </Switch>
          </div>
        </div>
        :
        <div className={s.container}>
          <Loading />
        </div>
    }

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

export default App;

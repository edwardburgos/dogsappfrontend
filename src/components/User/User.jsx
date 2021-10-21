import s from './User.module.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import loading from '../../img/loadingGif.gif';
import { countries } from '../../extras/countries';
import axios from '../../axiosInterceptor';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setUser, setPublicUser } from '../../actions';
import { uploadImage, uploadConfirmedImage } from '../../extras/firebase';
import { getUserInfo, showMessage, validURL } from '../../extras/globalFunctions';
import Post from '../Post/Post';
import Card from '../Card/Card';
import emptyVector from '../../img/empty.svg';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import NotFound from '../NotFound/NotFound';
import Loading from '../Loading/Loading';

export default function User({ username }) {
  // Redux states
  const publicUser = useSelector(state => state.publicUser)
  const user = useSelector(state => state.user)


  // Own states
  const [errGlobal, setErrGlobal] = useState('');
  const [images, setImages] = useState({})

  // Variables
  const dispatch = useDispatch();
  // Hooks

  // This hook allows us to load the user info and show it in the component
  useEffect(() => {
    let flags = {};
    require.context('../../img/svg', false, /\.(svg)$/).keys().forEach((item, index) => { flags[item.replace('./', '')] = require.context('../../img/svg', false, /\.(svg)$/)(item); });
    setImages(flags);
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function updateUser() {
      const user = await getUserInfo(source.token);
      if (user !== "Unmounted") {
        dispatch(setUser(user))
      }
    }
    updateUser();
    return () => {
      dispatch(setPublicUser({}))
      source.cancel("Unmounted");
    }
  }, [dispatch])

  // This hook allows us to get the information of the user especified through the username parameter
  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function updateUser() {
      try {
        const publicUser = await axios.get(`/users/${username}`, { cancelToken: source.token })
        dispatch(setPublicUser(publicUser.data))
      } catch (e) {
        if (e.message !== "Unmounted") {
          setErrGlobal(e.response.data)
        }
      }
    }
    updateUser();
    return () => source.cancel("Unmounted");
  }, [dispatch, username])

  return (

    <div className={s.container}>
      {!errGlobal ?
        Object.keys(publicUser).length && Object.keys(images).length ?
          <div className={s.content}>
            <div className={`${s.header} ${user.username === username ? 'mb-3' : ''}`}>
              <div className={s.photoContainer}>
                <img className={s.profilePic} src={publicUser.profilepic} alt='User profile'></img>
              </div>
              <div className={s.information}>
                <h1 className={s.title}>{publicUser.username}</h1>
                {user.username === username ? <Link to="/profile" className={`btn btn-primary ${s.editButton}`}>Edit my profile</Link> : null}
                <p className='mb-0'>{publicUser.fullname}</p>
                <div className={s.countryContainer}>
                  <img className={s.countryFlag} src={images[`${countries.filter(e => e.name === publicUser.country)[0].code.toLowerCase()}.svg`].default} alt='Country flag'></img>
                  <p className='mb-0'>{publicUser.country}</p>
                </div>
              </div>
            </div>
            {
              user.username === username ?
                <div className={s.registerPetButton}>
                  <Link to="/registerDog" className='btn btn-primary'>Register your dog</Link>
                </div>
                :
                null
            }
            <>
              {
                publicUser.pets.length ?
                  <>
                    {/* <div className={publicUser.dogs.length ? s.specimens : s.onlyColumn}> */}
                    <h2 className={s.petsTitle}>Dogs</h2>
                    <div className={s.postsContainer}>
                      {
                        publicUser.pets.map((e, i) => <Post origin='publicProfile' key={i} id={e.id} name={e.name} img={e.photo} likesCount={e.likesCount} owner={publicUser} likes={e.likes} dog={e.dog}></Post>)
                      }
                    </div>
                    {/* </div> */}
                  </>
                  :
                  <>
                    <div className={s.emptyVectorContainer}>
                      <img className={s.emptyVector} src={emptyVector} alt='Empty vector'></img>
                    </div>
                    <p className={s.noPets}>No dogs published yet</p>
                  </>
              }
            </>
          </div>
          :
          <Loading />
        :
        <NotFound></NotFound>
      }
    </div>
  );
}

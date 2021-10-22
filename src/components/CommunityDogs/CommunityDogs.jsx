import s from './CommunityDogs.module.css';
import React, { useEffect, useState } from 'react';
import axios from '../../axiosInterceptor';
import Loading from '../Loading/Loading';
import Post from '../Post/Post';
import { useDispatch, useSelector } from 'react-redux';
import { setCommunityDogs, setUser } from '../../actions';
import { getUserInfo } from '../../extras/globalFunctions';

export default function Community() {
  // Own states
  const [errGlobal, setErrGlobal] = useState('');
  const communityDogs = useSelector(state => state.communityDogs);

  // Variables
  const dispatch = useDispatch();

  // Hooks

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

  // This hook allows us to get the community
  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function getCommunity() {
      try {
        const pets = await axios.get(`/pets/communityAll`, { cancelToken: source.token })
        dispatch(setCommunityDogs(pets.data))
      } catch (e) {
        if (e.message !== "Unmounted") {
          setErrGlobal(e.response.data)
        }
      }
    }
    getCommunity();
    return () => source.cancel("Unmounted");
  }, [dispatch])

  return (
    <div className={s.container}>
      {
        errGlobal ?
          <div className={s.contentCenter}>
            <p className={s.errorGlobal}>{errGlobal}</p>
          </div>
          :
          communityDogs.length ?
            <>
              <h1 className='text-center'>Community dogs</h1>
              <div className={s.content}>
                <div className={s.cardsContainer}>
                  {communityDogs.map((e, i) => <Post key={i} origin="communityDogs" id={e.id} name={e.name} img={e.photo} likesCount={e.likesCount} owner={e.user} likes={e.likes} dog={e.dog} />)}
                </div>
              </div>
            </>
            :
            <Loading />
      }
    </div>
  );
}
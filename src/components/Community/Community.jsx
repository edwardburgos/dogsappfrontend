import s from './Community.module.css';
import React, { useEffect, useState } from 'react';
import axios from '../../axiosInterceptor';
import Loading from '../Loading/Loading';
import CommunityMember from '../CommunityMember/CommunityMember';
import { countries } from '../../extras/countries';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';
import { getUserInfo } from '../../extras/globalFunctions';
import emptyVector from '../../img/empty.svg';

export default function Community() {

  // Own states
  const [errGlobal, setErrGlobal] = useState('');
  const [users, setUsers] = useState([])
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
    let flags = {};
    require.context('../../img/svg', false, /\.(svg)$/).keys().forEach((item, index) => { flags[item.replace('./', '')] = require.context('../../img/svg', false, /\.(svg)$/)(item); });
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function getCommunity() {
      try {
        const users = await axios.get(`/users/communityAll`, { cancelToken: source.token })
        users.data.length ? setUsers(users.data.map(e => { return { ...e, flag: flags[`${countries.filter(country => country.name === e.country)[0].code.toLowerCase()}.svg`].default } })) : setUsers(null)
      } catch (e) {
        if (e.message !== "Unmounted") {
          setErrGlobal(e.response.data)
        }
      }
    }
    getCommunity();
    return () => source.cancel("Unmounted");
  }, [])

  return (
    <div className={s.container}>
      {
        errGlobal ?
          <div className={s.contentCenter}>
            <p className={s.errorGlobal}>{errGlobal}</p>
          </div>
          :
          users ?
            users.length ?
              <>
                <h1>Community</h1>
                <div className={s.content}>
                  <div className={s.cardsContainer}>
                    {users.map((e, i) => <CommunityMember key={i} fullname={e.fullname} profilepic={e.profilepic} username={e.username} country={e.country} flag={e.flag} />)}
                  </div>
                </div>
              </>
              :
              <Loading />
            :
            <div className={s.emptyVectorContainer}>
              <img className={s.emptyVector} src={emptyVector} alt='Empty vector'></img>
              <p className={s.noCommunityMembers}>No community members found</p>
            </div>
      }
    </div>
  );
}
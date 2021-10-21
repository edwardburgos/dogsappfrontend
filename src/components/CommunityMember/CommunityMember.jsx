import s from './CommunityMember.module.css';
import React from 'react';
import { Link } from 'react-router-dom';

export default function CommunityMember({ fullname, profilepic, username, country, flag }) {

  return (
    <Link to={`/${username}`} className={`${s.card} linkRR`}>
      <div className={s.infoContainer}>
        <div className={s.imageContainer}>
          <img className={s.image} src={profilepic} alt={username} />
        </div>
        <div className={s.dataContainer}>
          <p className='mb-0 text-center'>{fullname}</p>
          <p className='mb-0 text-center'>{username}</p>
          <div className={s.countryInfo}>
            <img className={s.flag} src={flag} alt={`${country} flag`} />
            <p className='mb-0'>{country}</p>
          </div>

        </div>
      </div>

    </Link>
  );
}


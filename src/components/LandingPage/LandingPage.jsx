import s from './LandingPage.module.css';
import { Link } from 'react-router-dom';
import React from 'react';

export default function LandingPage() {
  return (
    <div className={s.container}>
      <div className={s.content}>
        <h1 className={s.title}>WELCOME</h1>
        <p className={s.description}>Get ready to learn more about dog breeds</p>
        <Link to="/home"><button className='btn btn-primary w-100'>Start</button></Link>
      </div>
    </div>
  );
}


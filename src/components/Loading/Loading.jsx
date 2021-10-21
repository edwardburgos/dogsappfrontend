import s from './Loading.module.css';
import React from 'react';
import loading from '../../img/loadingGif.gif';

export default function Loading() {
    return (
        <div className={s.contentCenter}>
            <img className={s.loading} src={loading} alt='loadingGif'></img>
        </div>
    );
}


import s from './MainError.module.css';
import React from 'react';

export default function MainError({ mainErr }) {
    return (
        <div className={s.contentCenter}>
            <div className={s.errorGlobalContainer}>
                <p className={`${s.errorMain} mb-0`}>{mainErr}</p>
            </div>
        </div>
    );
}

import s from './Card.module.css';
import React from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom'

export default function Card({ name, img, temperament, id, origin }) {
  // Variables
  const history = useHistory();

  return (
    <Link to={`/detail/${id}`} className={`${origin === "publicProfile" ? s.cardPublicProfile : ''} ${s.card} linkRR`}>
      <p className={s.title}>{name}</p>
      <img className={`${temperament ? 'mb-3' : ''} ${s.image}`} src={img} alt={name} />
      {temperament ?
        <div className={s.temperaments}>
          <span className={s.label}>Temperaments:</span>
          <div className={s.temperamentsContainer}>
            {temperament.split(', ').map((e, i) =>
              <div key={i} className={s.test}>
                <div className={s.temperament}>{e}</div>
              </div>
            )}
          </div>
        </div>
        :
        null
      }
    </Link>
  );
}


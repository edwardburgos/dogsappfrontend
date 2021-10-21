import React, { useEffect } from 'react';
import s from './PaginationComponent.module.css';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { changePage, setLoading } from '../../actions';
import { Pagination } from 'react-bootstrap';
import { setClickedNumber } from '../../actions';
import { playBackCircleOutline, caretBackCircleOutline, caretForwardCircleOutline, playForwardCircleOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

export default function PaginationComponent(props) {
  // Redux states
  const finalResultRedux = useSelector(state => state.finalResult);
  const currentClickedNumber = useSelector(state => state.clickedNumber);

  // Own states
  const [page, setPage] = useState({
    totalPages: null,
    pageData: null,
  })

  // Variables
  const dispatch = useDispatch();

  // Hooks

  // This hook defines the available pages
  useEffect(() => {
    let paginatedDataObject = {};
    let chunkArray = [];

    for (let index = 0; index < finalResultRedux.length; index += 8) {
      let end = index + 8
      let newChunk = finalResultRedux.slice(index, end);
      chunkArray.push(newChunk);
    }

    chunkArray.forEach((chunk, i) => {
      paginatedDataObject[i + 1] = chunk;
    });

    setPage({
      totalPages: (finalResultRedux.length > 0) ? Math.ceil(finalResultRedux.length / 8) : 0,
      pageData: paginatedDataObject,
    });

    dispatch(setClickedNumber(1));
    dispatch(changePage(paginatedDataObject[1]));
  }, [finalResultRedux, dispatch])

  // This hook change the page 
  useEffect(() => {
    if (page.pageData) {
      dispatch(setLoading(true))
      dispatch(changePage(page.pageData[currentClickedNumber]));
    }
  }, [currentClickedNumber, page.pageData, dispatch])

  // Functions

  // This function load the pagination items
  function pageNumberRender() {
    let pages = [];
    for (let i = 1; i < page.totalPages + 1; i++) {
      pages.push(
        <Pagination.Item className={s.item} onClick={(e) => dispatch(setClickedNumber(parseInt(e.target.innerText)))} key={i + 50}>
          {i}
        </Pagination.Item>
      );
    }
    let currentPage = (<Pagination.Item active activeLabel="" className={s.activo} onClick={(e) => dispatch(setClickedNumber(parseInt(e.target.innerText)))}
      key={currentClickedNumber}>{currentClickedNumber}</Pagination.Item>)

    let pointsStart = <Pagination.Item className={s.item} key='pointsStart'> ... </Pagination.Item>
    let pointsEnd = <Pagination.Item className={s.item} key='pointsEnd'> ... </Pagination.Item>
    return [pages[currentClickedNumber - 5] ? pointsStart : null, pages[currentClickedNumber - 4], pages[currentClickedNumber - 3], pages[currentClickedNumber - 2], currentPage, pages[currentClickedNumber],
    pages[currentClickedNumber + 1], pages[currentClickedNumber + 2], pages[currentClickedNumber + 3] ? pointsEnd : null];
  };

  // This function move us to the next page
  function moveOnePageForward() {
    dispatch(setClickedNumber(
      currentClickedNumber + 1 > page.totalPages
        ? page.totalPages
        : currentClickedNumber + 1
    ));
  };

  return (
    <Pagination className={s.pagination}>
      {currentClickedNumber > 1 ?
        <>
          <Pagination.Item className={s.item} onClick={() => dispatch(setClickedNumber(1))} key='first'>
            <IonIcon icon={playBackCircleOutline} className={s.iconBack}></IonIcon>
          </Pagination.Item>
          <Pagination.Item className={s.item} onClick={() => dispatch(setClickedNumber(currentClickedNumber - 1 < 1 ? 1 : currentClickedNumber - 1))} key='prev'>
            <IonIcon icon={caretBackCircleOutline} className={s.iconBack}></IonIcon>
          </Pagination.Item>
        </>
        :
        null
      }
      <>{pageNumberRender()}</>
      <>
        {currentClickedNumber !== page.totalPages ?
          <>
            <Pagination.Item className={s.item} onClick={() => moveOnePageForward()} key='next'>
              <IonIcon icon={caretForwardCircleOutline} className={s.iconBack}></IonIcon>
            </Pagination.Item>
            <Pagination.Item className={s.item} onClick={() => dispatch(setClickedNumber(page.totalPages))} key='last'>
              <IonIcon icon={playForwardCircleOutline} className={s.iconBack}></IonIcon>
            </Pagination.Item>
          </>
          :
          null
        }
      </>
    </Pagination>
  )
}

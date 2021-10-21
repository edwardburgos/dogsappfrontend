import s from './Home.module.css';
import React, { useEffect, useState } from 'react';
import axios from '../../axiosInterceptor';
import Card from '../Card/Card';
import * as actionsCreators from '../../actions';
import { useDispatch, useSelector } from 'react-redux';
import PaginationComponent from '../PaginationComponent/PaginationComponent';
import loading from '../../img/loadingGif.gif';
import { getDogs, getTemperaments, getUserInfo } from '../../extras/globalFunctions';
import emptyVector from '../../img/empty.svg';
import Loading from '../Loading/Loading';
import { closeCircleOutline, searchOutline, optionsOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { Modal, Form } from 'react-bootstrap';

export default function Home() {
  // Redux states
  const finalResultRedux = useSelector(state => state.finalResult);
  const actualPageRedux = useSelector(state => state.actualPage);
  const loadingRedux = useSelector(state => state.loading);

  // Own States
  const [temperaments, setTemperaments] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [temperament, setTemperament] = useState('');
  const [errorGlobal, setErrorGlobal] = useState('')
  const [dogs, setDogs] = useState([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedTemperaments, setSelectedTemperaments] = useState([])
  const [searchTermModal, setSearchTermModal] = useState('')
  const [filterTemperaments, setFilterTemperaments] = useState([])
  // Variables
  const dispatch = useDispatch();

  // Hooks

  useEffect(() => {
    console.log(selectedTemperaments)
  }, [selectedTemperaments])




  // This hooks allows us to stop loading when the results of the page are ready 
  useEffect(() => {
    dispatch(actionsCreators.setLoading(false))
  }, [actualPageRedux])

  // This hook load the dogs and the temperaments for the filter
  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function requesting() {
      const dogs = await getDogs(source.token);
      const temperaments = await getTemperaments(source.token);
      if (temperaments !== "Unmounted" && dogs !== "Unmounted") {
        if (dogs.length && temperaments.length) {
          setDogs(dogs)
          dispatch(actionsCreators.modifyFinalResult(dogs));
          setTemperaments(temperaments);
          setFilterTemperaments(temperaments)
        } else { setErrorGlobal('Sorry, an error ocurred'); }
      }
    }
    requesting();
    return () => source.cancel("Unmounted");
  }, [dispatch])

  // This hook allow us to load the logued user
  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function updateUser() {
      const user = await getUserInfo(source.token);
      if (user !== "Unmounted") {
        dispatch(actionsCreators.setUser(user))
      }
    }
    updateUser();
    return () => source.cancel("Unmounted");
  }, [dispatch])

  // Functions 

  // This function allows us to filter the results
  function filter(e, currentTemperaments) {
    if (dogs.length < 9) return setError('Wait a moment please');
    let componentValue = e.target.value;
    let componentId = e.target.id;
    let finalResult = [];
    let query = searchTerm;
    let action = ''
    if (componentValue && (componentValue.toLowerCase() === componentId && !currentTemperaments.includes(componentValue))) action = 'add'
    if (componentValue && (componentValue.toLowerCase() === componentId && currentTemperaments.includes(componentValue) || `id${componentValue.toLowerCase()}` === componentId && currentTemperaments.includes(componentValue))) action = 'delete'
    if (!currentTemperaments) currentTemperaments = selectedTemperaments
    if (componentId === 'searchTerm') { setSearchTerm(componentValue); query = componentValue }
    if (componentId === 'deleteSearch') { setSearchTerm(''); query = '' }
    finalResult = dogs.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    if (!action && currentTemperaments.length) finalResult = finalResult.filter(e => e.temperament ? currentTemperaments.length === currentTemperaments.filter(temperament => e.temperament.includes(temperament)).length : false)
    if (action === 'add') finalResult = finalResult.filter(e => e.temperament ? currentTemperaments.length + 1 === [...currentTemperaments, componentValue].filter(temperament => e.temperament.includes(temperament)).length : false)
    if (action === 'delete' && currentTemperaments.length !== 1) finalResult = finalResult.filter(e => e.temperament ? currentTemperaments.length - 1 === currentTemperaments.filter(e => e !== componentValue).filter(temperament => e.temperament.includes(temperament)).length : false)




    // if (componentId === 'searchTerm') { setSearchTerm(componentValue); finalResult = base.filter((e) => e.name.toLowerCase().includes(componentValue.toLowerCase()))}} else { if (searchTerm) { finalResult = dogs.filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase())) } else { finalResult = dogs } }
    // if (componentId === 'deleteSearch') { if (searchTerm) { finalResult = dogs; setSearchTerm(''); } else { return } }
    // if (currentTemperaments) console.log(currentTemperaments, componentValue, currentTemperaments.includes(componentValue), 'INCLUIDO')
    // if (componentValue && (componentValue.toLowerCase() === componentId && !currentTemperaments.includes(componentValue))) {
    //   finalResult = finalResult.filter(e => e.temperament ? currentTemperaments.length + 1 === [...currentTemperaments, componentValue].filter(temperament => e.temperament.includes(temperament)).length : false)
    // } else if (componentValue && (componentValue.toLowerCase() === componentId && currentTemperaments.includes(componentValue) || `id${componentValue.toLowerCase()}` === componentId && currentTemperaments.includes(componentValue))) {
    //   finalResult = finalResult.filter(e => e.temperament ? currentTemperaments.length - 1 === currentTemperaments.filter(e => e !== componentValue).filter(temperament => e.temperament.includes(temperament)).length : false)
    //   console.log('AHORA', finalResult)
    // }
    if (!finalResult.length) setError('Not results found')
    dispatch(actionsCreators.modifyFinalResult(finalResult))
  }

  return (
    <>
      <div className={s.container}>
        {
          errorGlobal ?
            <div className={s.contentCenter}>
              <p className={s.errorGlobal}>{errorGlobal}</p>
            </div>
            :
            dogs.length && temperaments.length ?
              <>
                <div className={s.header}>
                  <h1 className={s.title}>Dog breeds</h1>
                  <div className={`${s.searchContainer} ${selectedTemperaments.length ? '' : 'mb-3'}`}>
                    <div className={s.test}>
                      <Form.Control id="searchTerm" autoComplete="off" value={searchTerm} onChange={e => filter(e)} className={s.searchInput} placeholder='Search a dog breed' />
                      <IonIcon icon={searchTerm ? closeCircleOutline : searchOutline} className={s.iconDumb} id="deleteSearch" onClick={e => filter(e)}></IonIcon>
                    </div>
                    <IonIcon icon={optionsOutline} className={s.filterIcon} onClick={() => setShowFilterModal(true)}></IonIcon>
                  </div>
                  <div className={selectedTemperaments.length ? s.temperaments : s.invisible}>
                    {selectedTemperaments.map(e =>
                      <div key={e} className={s.temperamentContainer}>
                        <span className={s.temperament}>{e}</span>
                        <IonIcon icon={closeCircleOutline} className={s.iconDumb} onClick={event => { setSelectedTemperaments([...new Set(selectedTemperaments.filter(element => element !== e))]); filter({ target: { value: e, id: `id${e.toLowerCase()}` } }, selectedTemperaments); }}></IonIcon> 
                        {/* The previous invocation of filter function requires the current selectedTemperaments (at the time of its execution) as second parameter */}
                      </div>
                    )}
                  </div>

                  {/* <div className={s.marginTop}>
                  <input className={s.searchInput}


                </div> */}
                  {/* <div className={s.marginTop}>
                  <select onChange={e => filter(e)} id="temperament" value={temperament} className={s.selectInput}>
                    <option key='default' value='default'>Select a temperament</option>
                    {temperaments.map((e, i) => <option key={i} value={e}>{e}</option>)}
                  </select>
                  <button className={s.button} id="deleteTemperamentFilter" onClick={e => { filter(e) }}>Delete filter</button>
                </div> */}
                </div>
                <div className={s.content}>
                  {finalResultRedux.length ?
                    <>
                      <div className={s.loadingContainer}>
                        {
                          !loadingRedux ?
                            <div className={s.cardsContainer}>
                              {
                                actualPageRedux.map((e, i) => <Card name={e.name} img={e.image} key={i} temperament={e.temperament} id={e.id}></Card>)
                              }
                            </div>
                            :
                            <Loading />
                        }
                      </div>
                      <div className='w-100'><PaginationComponent /></div>
                    </>
                    :
                    <>
                      <div className={s.emptyVectorContainer}>
                        <img className={s.emptyVector} src={emptyVector} alt='Empty vector'></img>
                        <p className={s.noDogs}>{error}</p>
                      </div>
                    </>
                  }
                </div>
              </>
              :
              <Loading />
        }
      </div>

      <Modal
        show={showFilterModal}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        keyboard={false}
        onHide={() => { setShowFilterModal(false); setSearchTermModal(''); setFilterTemperaments(temperaments) }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Select temperaments to filter
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={s.searchModalContainer}>
            <div className={s.testModal}>
              <Form.Control id="searchTermModal" autoComplete="off" value={searchTermModal} onChange={event => { setFilterTemperaments(temperaments.filter(e => e.toLowerCase().includes(event.target.value.toLowerCase()))); setSearchTermModal(event.target.value) }} className={s.searchInput} placeholder='Search a temperament' />
              <IonIcon icon={searchTermModal ? closeCircleOutline : searchOutline} className={s.iconDumb} id="deleteSearchModal" onClick={() => { setFilterTemperaments(temperaments); setSearchTermModal('') }}></IonIcon>
            </div>
          </div>
          <div>
            {
              filterTemperaments.length ?
                filterTemperaments.map((e, i) =>
                  <Form.Check
                    type='checkbox'
                    key={e.toLowerCase()}
                    id={e.toLowerCase()}
                    value={e}
                    checked={selectedTemperaments.includes(e) ? true : false}
                    label={e}
                    onChange={(event) => { selectedTemperaments.includes(e) ? setSelectedTemperaments([...new Set(selectedTemperaments.filter(element => element !== e))]) : setSelectedTemperaments([...new Set([...selectedTemperaments, e])]); filter(event, selectedTemperaments); }}
                    name="temperaments"
                  />)
                :
                <p className='text-center mb-0'>No temperaments found</p>
            }
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
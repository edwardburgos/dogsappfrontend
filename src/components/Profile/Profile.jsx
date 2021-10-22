import s from './Profile.module.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import loading from '../../img/loadingGif.gif';
import { countries } from '../../extras/countries';
import axios from '../../axiosInterceptor';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setUser } from '../../actions';
import { uploadImage, uploadConfirmedImage } from '../../extras/firebase';
import { getUserInfo, showMessage, validURL, logout } from '../../extras/globalFunctions';
import { Link } from 'react-router-dom';
import { deleteImage } from '../../extras/firebase';
import { Modal, Button } from 'react-bootstrap';
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { IonIcon } from '@ionic/react';

export default function Profile() {
  // Redux states
  const user = useSelector(state => state.user);

  // Own states
  const [errGlobal, setErrGlobal] = useState('');
  const [name, setName] = useState('');
  const [errName, setErrName] = useState('');
  const [lastname, setLastname] = useState('');
  const [errLastname, setErrLastname] = useState('');
  const [username, setUsername] = useState('');
  const [errUsername, setErrUsername] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [buttonState, setButtonState] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [photo, setPhoto] = useState('')
  const [errPhoto, setErrPhoto] = useState('')
  const [changedPhoto, setChangedPhoto] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [errDeletePassword, setErrDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [errCurrentPassword, setErrCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [errNewPassword, setErrNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [sendingDeletionEmail, setSendingDeletionEmail] = useState(false)
  const [showDefinePassword, setShowDefinePassword] = useState(false)

  // Variables
  const dispatch = useDispatch();

  // Hooks

  // This hook allows us to load the user info and show it in the component
  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    async function updateUser() {
      const user = await getUserInfo(source.token);
      if (user !== "Unmounted") {
        dispatch(setUser(user))
        if (Object.keys(user).length) {
          setPhoto(user.profilepic)
          setName(user.name)
          setLastname(user.lastname)
          setUsername(user.username)
          setCountry(user.country)
          setEmail(user.email)
        }
      }
    }
    updateUser();
    return () => {
      source.cancel("Unmounted");
      axios.delete(`/users/notUsed/${user.username}`)

    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  // This hook allows us to update the user information showed in the component when the first one change
  useEffect(() => {
    if (Object.keys(user).length) {
      setPhoto(user.profilepic)
      setName(user.name)
      setLastname(user.lastname)
      setUsername(user.username)
      setCountry(user.country)
      setEmail(user.email)
    }
  }, [user])

  // This hook allows us to handle the form submit button status
  useEffect(() => {
    if ((name !== user.name || lastname !== user.lastname || username !== user.username || country !== user.country) && !errName && !errLastname && !errUsername) return setButtonState(false)
    setButtonState(true)
  }, [name, lastname, username, country, errName, errLastname, errUsername, user])

  // Functions

  // This function allows us to handle the changes in the form
  function handleChange(e) {
    const value = e.target.value;
    switch (e.target.name) {
      case 'nameValue':
        !value ? setErrName('This field is required') : setErrName('')
        return setName(value)
      case 'lastnameValue':
        !value ? setErrLastname('This field is required') : setErrLastname('')
        return setLastname(value)
      case 'usernameValue':
        !value ? setErrUsername('This field is required') : (value.length < 31 ? (/\s/.test(value) ? setErrUsername("The username can't contain white spaces") : (/^[a-z0-9._]+$/g.test(value) ? setErrUsername('') : setErrUsername("The username only can contains lowercase letters, numbers, points and subscripts"))) : setErrUsername("The username can't have more than 30 characters"))
        return setUsername(value)
      case 'countryValue':
        return setCountry(value)
      case 'passDeleteValue':
        !value ? setErrDeletePassword('This field is required') : setErrDeletePassword('')
        return setDeletePassword(value)
      case 'passCurrentValue':
        !value ? setErrCurrentPassword('This field is required') : setErrCurrentPassword('')
        return setCurrentPassword(value)
      case 'passNewValue':
        if (!value) {
          setErrNewPassword('This field is required');
        } else {
          value.length < 21 ?
            /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(value) ?
              !/\s/.test(value) ?
                setErrNewPassword('')
                :
                setErrNewPassword("The password can't contain white spaces")
              :
              setErrNewPassword('The password should have between 8 and 20 characters combining lowercase and uppercase letters, numbers and symbols')
            :
            setErrNewPassword("The password can't have more than 20 characters")
        }
        return setNewPassword(value)
      default:
        break;
    }
  }

  // This function allows us to handle the submit of the form 
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const update = await axios.put('/users/updateUserInfo', { name, lastname, username, country });
      showMessage(update.data)
      setButtonState(true)
      const user = await getUserInfo();
      dispatch(setUser(user))
    } catch (e) {
      if (e.response.status === 409 && e.response.data === "There is already a user with this username") return setErrUsername(e.response.data)
      if (e.response.status === 500 && e.response.data === "Sorry, your information could not be updated") return setErrGlobal(e.response.data)
      if (e.response.status === 404 && e.response.data === "User not found") return setErrGlobal(e.response.data)
      setErrGlobal('Sorry, an error ocurred')
    }
  }

  // This function allows us to upload a test photo for the user profile picture
  async function changePhoto(e) {
    setUploading(true)
    if (e.target.files[0]) {
      const urlPhoto = await uploadImage(user.username, e.target.files[0])
      if (validURL(urlPhoto)) {
        setImageFile(e.target.files[0]);
        setPhoto(urlPhoto);
        setChangedPhoto(true);
      } else {
        setErrPhoto(urlPhoto)
      }
    }
    setUploading(false);
  }

  // This function allows us to update the user profile picture
  async function setNewProfilePic() {
    try {
      setGuardando(true)
      const urlPhoto = await uploadConfirmedImage(user.username, imageFile)
      if (validURL(urlPhoto)) {
        const upload = await axios.put('/users/changePhoto', { profilePic: urlPhoto })
        setErrPhoto('')
        setGuardando(false)
        showMessage(upload.data);
        setChangedPhoto(false)
        const user = await getUserInfo();
        dispatch(setUser(user))
      } else { setUploading(false); setErrPhoto(urlPhoto) }
    } catch (e) {
      setUploading(false)
      if (e.response.status === 500 && e.response.data === "Sorry, your profile picture could not be updated") return setErrPhoto(e.response.data)
      if (e.response.status === 404 && e.response.data === "User not found") return setErrPhoto(e.response.data)
      setErrPhoto('Sorry, an error ocurred')
    }
  }

  async function handleConfirmationSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.delete('/users/', { data: { password: deletePassword } })
      logout();
      setShowConfirmation(false);
      dispatch(setUser({}));
      setDeletePassword('');
      setErrDeletePassword('');
      showMessage(response.data);
      // history.push('/deleteReason')
    } catch (e) {
      if (e.response.status === 401 && e.response.data === 'Incorrect password') return setErrDeletePassword(e.response.data);
      setShowConfirmation(false);
      setDeletePassword('');
      setErrDeletePassword('');
      if (e.response.status === 404 && e.response.data.includes('There is no user with the id')) showMessage(e.response.data)
      showMessage('Sorry, an error ocurred')
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      const changed = await axios.post('/users/changeCurrentPassword', { newPassword, currentPassword });
      if (changed.data) {
        setCurrentPassword('');
        setErrCurrentPassword('');
        setShowCurrentPassword(false);
        setNewPassword('');
        setErrNewPassword('');
        setShowNewPassword(false);
        setShowChangePassword(false);
        showMessage('Your password was updated successfully')
      }
    } catch (e) {
      if (e.response.status === 404 && e.response.data.includes('There is no user with the id')) return showMessage(e.response.data);
      if (e.response.status === 401 && e.response.data === "Incorrect password") return setErrCurrentPassword(e.response.data)
      if (e.response.status === 409 && e.response.data === "Provide a password different from your current password") return setErrNewPassword(e.response.data)
      showMessage('Sorry, an error ocurred')
    }
  }

  async function sendEmailConfirmation() {
    setSendingDeletionEmail(true)
    try {
      await axios.post('/users/deleteAccountEmail', { emailUsername: user.email })
    } catch (e) {
      setErrGlobal('Sorry, an error occurred');
    }
    setSendingDeletionEmail(false)
  }

  async function definePassword(e) {
    e.preventDefault()
    try {
      await axios.post(`/users/definePasswordWithEmail`, {
        emailORusername: user.email,
        password: newPassword,
      })
      setNewPassword('');
      setErrNewPassword('');
      setShowNewPassword(false);
      setShowDefinePassword(false);
      showMessage('Your password was updated successfully')
    } catch (e) {
      if (e.response.status === 500 && e.response.data.msg === 'Password could not be defined') return showMessage(e.response.data.msg);
      if (e.response.status === 404 && e.response.data.msg === 'There is no user registered with this email') return showMessage(e.response.data.msg)
      showMessage('Sorry, an error occurred');
    }
  }

  return (
    <>
      <div className={s.container}>
        <div className={s.content}>
          <h1 className={s.title}>Edit profile</h1>
          <Link to={`/${user.username}`} className={`btn btn-primary ${s.goProfileButton}`}>Go to my profile</Link>
          <div className={s.columns}>
            <div className={s.imageContainer}>

              <div className={s.profilePictureEditor}>
                <label className={s.labelProfile} htmlFor="nameValue">Profile picture</label>
                <div className={`${s.containerProfileImage} mb-3`}>
                  {
                    uploading ?
                      <div className={s.uploadingContainer}>
                        <img className={s.uploadingGif} src={loading} alt='User profile'></img>
                      </div>
                      :
                      <img className={s.profilePic} src={photo} alt='User profile'></img>
                  }
                </div>
                {errPhoto ? <div className='w-100 text-center mb-3'><small className={s.errorPhoto}>{errPhoto}</small></div> : null}
                {
                  !changedPhoto ?
                    <div className={`w-100 btn btn-primary ${uploading ? 'disabled' : ''}`} onClick={() => document.getElementById('inputFile').click()}>
                      <span>Upload new profile picture</span>
                      <input id="inputFile" type="file" className={s.fileInput} onChange={changePhoto} accept="image/png, image/gif, image/jpeg, image/jpg" />
                    </div>
                    :
                    <>
                      {
                        guardando ?
                          <div className={`${s.loadingButton} w-100 btn btn-primary disabled`}>
                            <img className={s.loadingInButton} src={loading} alt='loadingGif'></img>
                          </div>
                          :
                          <div className={s.changePhotoButtons}>
                            <div className={`btn btn-secondary mb-3 ${s.option} ${uploading ? 'disabled' : ''}`} onClick={() => { document.getElementById('inputFileExtra').click() }}>
                              <span>Upload another profile picture</span>
                              <input id="inputFileExtra" type="file" className={s.fileInput} onChange={changePhoto} accept="image/png, image/gif, image/jpeg, image/jpg" />
                            </div>

                            <button className={`btn btn-secondary mb-3 ${s.option}`} disabled={uploading} onClick={async () => { dispatch(setUser(await getUserInfo())); setImageFile(null); setUploading(false); setErrPhoto(''); setChangedPhoto(false); setPhoto(user.profilepic); deleteImage('cancelUser', user.username); }}>Cancel changes</button>

                            <button className={`w-100 btn btn-primary`} disabled={uploading} onClick={() => { setNewProfilePic() }}>Save changes</button>
                          </div>
                      }

                    </>
                }
              </div>

              <div className={`w-100 ${s.emailInfo}`}>
                <label className={s.label} htmlFor="emailValue">Email</label>
                <p className={`form-control mb-0`}>{email}</p>
              </div>

              <div className={s.bottomContent}>
                <button className={`w-100 btn btn-primary mb-3`} onClick={() => { user.type === 'Google' ? setShowDefinePassword(true) : setShowChangePassword(true) }}>{user.type === 'Google' ? 'Define password' : 'Change password'}</button>
                {
                  !sendingDeletionEmail ?
                    <button className={`w-100 btn btn-danger`} onClick={() => setShowDelete(true)}>Delete account</button>
                    :
                    <div className={`${s.loadingButton} w-100 btn btn-danger disabled`}>
                      <img className={s.loadingInButton} src={loading} alt='loadingGif'></img>
                    </div>
                }
              </div>

            </div>
            <div className={s.formContainer}>

              <div className={s.errorGlobalContainer}>
                {errGlobal ? <p className={s.errorGlobal}>{errGlobal}</p> : null}
              </div>

              <form onSubmit={handleSubmit} className={s.infoForm}>
                <div className={errName ? '' : 'mb-3'}>
                  <label className={s.label} htmlFor="nameValue">Name</label>
                  <input id="nameValue" value={name} name='nameValue' onChange={handleChange} className={`form-control ${s.input} ${errName ? s.errorInput : ''}`} />
                </div>
                {errName ? <small className={s.error}>{errName}</small> : null}

                <div className={errLastname ? '' : 'mb-3'}>
                  <label className={s.label} htmlFor="lastnameValue">Last Name</label>
                  <input id="lastnameValue" value={lastname} name='lastnameValue' onChange={handleChange} className={`form-control ${s.input} ${errLastname ? s.errorInput : ''}`} />
                </div>
                {errLastname ? <small className={s.error}>{errLastname}</small> : null}

                <div className={errUsername ? '' : 'mb-3'}>
                  <label className={s.label} htmlFor="usernameValue">Username</label>
                  <input id="usernameValue" value={username} name='usernameValue' onChange={handleChange} className={`form-control ${s.input} ${errUsername ? s.errorInput : ''}`} />
                </div>
                {errUsername ? <small className={s.error}>{errUsername}</small> : null}

                <div className='mb-3'>
                  <label className={s.label} htmlFor="countryValue">Country</label>
                  <select id="countryValue" name='countryValue' value={country} onChange={handleChange} className={`form-control ${s.input}`}>
                    {countries.map(c => {
                      return <option key={c.code} value={c.name}>{c.name}</option>
                    })}
                  </select>
                </div>

                <input type="submit" value="Save changes" disabled={buttonState} className={`w-100 btn btn-primary mb-3`} />
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={showDelete}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
        keyboard={false}
        onHide={() => setShowDelete(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your account?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={async () => { setShowDelete(false); if (user.type === 'Google') { await sendEmailConfirmation(); setShowEmailSent(true); } else { setShowConfirmation(true); } }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showConfirmation}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        keyboard={false}
        onHide={() => { setErrDeletePassword(''); setDeletePassword(''); setShowConfirmation(false); }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Password confirmation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleConfirmationSubmit}>
            <div className={errDeletePassword ? '' : 'mb-3'}>
              <label className={s.label} htmlFor="passDeleteValue">Password</label>
              <div className={s.test}>
                <input id="passDeleteValue" value={deletePassword} name='passDeleteValue' type={showDeletePassword ? 'text' : 'password'} onChange={handleChange} className={`form-control ${s.inputPassword} ${errDeletePassword ? s.errorInput : ''}`} />
                <IonIcon icon={showDeletePassword ? eyeOutline : eyeOffOutline} className={s.iconDumb} onClick={() => showDeletePassword ? setShowDeletePassword(false) : setShowDeletePassword(true)}></IonIcon>
              </div>
            </div>
            {errDeletePassword ? <small className={s.error}>{errDeletePassword}</small> : null}

            <input type="submit" value="Confirm password" disabled={!deletePassword || errDeletePassword} className={`w-100 btn btn-primary`} />
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showEmailSent}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        keyboard={false}
        onHide={() => setShowEmailSent(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Check your email
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={s.message}>Please, check your email because we have sent you a link to delete your account</p>
        </Modal.Body>
      </Modal>

      <Modal
        show={showChangePassword}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        keyboard={false}
        onHide={() => { setCurrentPassword(''); setErrCurrentPassword(''); setShowCurrentPassword(false); setNewPassword(''); setErrNewPassword(''); setShowNewPassword(false); setShowChangePassword(false); }}
      >

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Confirm your current password and indicate a new one
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={changePassword}>
            <div className={errCurrentPassword ? '' : 'mb-3'}>
              <label className={s.label} htmlFor="passCurrentValue">Current password</label>
              <div className={s.test}>
                <input id="passCurrentValue" value={currentPassword} name='passCurrentValue' type={showCurrentPassword ? 'text' : 'password'} onChange={handleChange} className={`form-control ${s.inputPassword} ${errCurrentPassword ? s.errorInput : ''}`} />
                <IonIcon icon={showCurrentPassword ? eyeOutline : eyeOffOutline} className={s.iconDumb} onClick={() => showCurrentPassword ? setShowCurrentPassword(false) : setShowCurrentPassword(true)}></IonIcon>
              </div>
            </div>
            {errCurrentPassword ? <small className={s.error}>{errCurrentPassword}</small> : null}

            <div className={errNewPassword ? '' : 'mb-3'}>
              <label className={s.label} htmlFor="passNewValue">New password</label>
              <div className={s.test}>
                <input id="passNewValue" value={newPassword} name='passNewValue' type={showNewPassword ? 'text' : 'password'} onChange={handleChange} className={`form-control ${s.inputPassword} ${errNewPassword ? s.errorInput : ''}`} />
                <IonIcon icon={showNewPassword ? eyeOutline : eyeOffOutline} className={s.iconDumb} onClick={() => showNewPassword ? setShowNewPassword(false) : setShowNewPassword(true)}></IonIcon>
              </div>
            </div>
            {errNewPassword ? <small className={s.error}>{errNewPassword}</small> : null}

            <input type="submit" value="Confirm password" disabled={!newPassword || errNewPassword || !currentPassword || errCurrentPassword} className={`w-100 btn btn-primary`} />
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDefinePassword}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        keyboard={false}
        onHide={() => { setCurrentPassword(''); setErrCurrentPassword(''); setShowCurrentPassword(false); setNewPassword(''); setErrNewPassword(''); setShowNewPassword(false); setShowDefinePassword(false); }}
      >

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Indicate a password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={definePassword}>
            <div className={errNewPassword ? '' : 'mb-3'}>
              <label className={s.label} htmlFor="passNewValue">Password</label>
              <div className={s.test}>
                <input id="passNewValue" value={newPassword} name='passNewValue' type={showNewPassword ? 'text' : 'password'} onChange={handleChange} className={`form-control ${s.inputPassword} ${errNewPassword ? s.errorInput : ''}`} />
                <IonIcon icon={showNewPassword ? eyeOutline : eyeOffOutline} className={s.iconDumb} onClick={() => showNewPassword ? setShowNewPassword(false) : setShowNewPassword(true)}></IonIcon>
              </div>
            </div>
            {errNewPassword ? <small className={s.error}>{errNewPassword}</small> : null}

            <input type="submit" value="Confirm password" disabled={!newPassword || errNewPassword} className={`w-100 btn btn-primary`} />
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
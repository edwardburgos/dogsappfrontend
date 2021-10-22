import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';

export const app = firebase.apps.length === 0 ?
    firebase.initializeApp({
        apiKey: process.env.REACT_APP_API_KEY,
        authDomain: process.env.REACT_APP_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_PROJECT_ID,
        storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_APP_ID,
        measurementId: process.env.REACT_APP_MEASUREMENT_ID
    })
    :
    firebase;

export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export async function uploadImage(username, imageAsFile) {
    try {
        await app.storage().ref(`/testsProfilePictures/${username}ProfilePic`).put(imageAsFile)
        const url = await app.storage().ref('testsProfilePictures').child(`${username}ProfilePic`).getDownloadURL()
        return url
    } catch (e) {
        return 'Sorry, we could not upload your new profile picture'
    }
}

export async function uploadConfirmedImage(username, imageAsFile) {
    try {
        await app.storage().ref(`/profilePictures/${username}ProfilePic`).put(imageAsFile)
        const url = await app.storage().ref('profilePictures').child(`${username}ProfilePic`).getDownloadURL()
        return url
    } catch (e) {
        return 'Sorry, we could not save your new profile picture'
    }
}

export async function uploadPetImage(pet, imageAsFile) {
    try {
        await app.storage().ref(`/testsPetsPictures/${pet}`).put(imageAsFile)
        const url = await app.storage().ref('testsPetsPictures').child(`${pet}`).getDownloadURL()
        return url
    } catch (e) {
        return 'Sorry, we could not upload your dog picture'
    }
}

export async function uploadConfirmedPetImage(pet, imageAsFile) {
    try {
        await app.storage().ref(`/petsPictures/${pet}`).put(imageAsFile)
        const url = await app.storage().ref('petsPictures').child(`${pet}`).getDownloadURL()
        return url
    } catch (e) {
        return 'Sorry, we could not save your dog picture'
    }
}

export async function deleteImage(origin, fileName) {
    try {
        if (origin === 'cancelUser') await app.storage().ref('testsProfilePictures').child(`${fileName}ProfilePic`).delete();
        if (origin === 'cancelPet') await app.storage().ref('testsPetsPictures').child(fileName).delete();
    } catch (e) {
        return 'Sorry, we could not delete the image';
    }
}
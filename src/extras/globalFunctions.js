import axios from '../axiosInterceptor';
import * as moment from 'moment';
import { toast } from 'react-toastify';

toast.configure();

export function showMessage(data) {
    toast(data, { position: toast.POSITION.BOTTOM_LEFT, pauseOnFocusLoss: false })
}

export async function getTemperaments(cancelToken) {
    try {
        const temperaments = await axios.get('/temperaments', { cancelToken })
        return temperaments.data
    } catch (e) {
        if (e.message === "Unmounted") return "Unmounted";
        return [];
    }
}

export async function getDogs(cancelToken) {
    try {
        const dogs = await axios.get(`/dogs/all`, { cancelToken });
        return dogs.data
    } catch (e) {
        if (e.message === "Unmounted") return "Unmounted";
        return [];
    }
}

export async function getDogsNames(cancelToken) {
    try {
        const dogs = await axios.get('/dogs', {cancelToken});
        return dogs.data
    } catch (e) {
        if (e.message === "Unmounted") return "Unmounted";
        return [];
    }
}

export async function getUserInfo(cancelToken) {
    try {
        if (!localStorage.getItem("token") && !localStorage.getItem("expiration")) return {}
        let infoReq = cancelToken ? await axios.get('/users/info', { cancelToken }) : await axios.get('/users/info')
        return infoReq.data.user
    } catch (e) {
        if (e.message === "Unmounted") return "Unmounted";
        logout(); return {};
    }
}

export function setLocalStorage(responseObj) {
    // Adds the expiration time defined on the JWT to the current moment
    //const expiresAt = moment().add(Number.parseInt(responseObj.expiresIn), 'seconds');
    localStorage.setItem('token', responseObj.token);
    localStorage.setItem("expiration", JSON.stringify(responseObj.expiresIn * 1000));
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
}

export function isLoggedIn() {
    // if (!Object.keys(await getUserInfo()).length) { logout(); return false; }
    // return true


    // getUserInfo().then(response => {
    //     if (!Object.keys(response).length) { logout(); return false; }
    //     return true
    // })


    return moment().isBefore(getExpiration(), "second");
}



export async function getCountry(cancelToken) {
    try {
        const response = await axios.get('https://geolocation-db.com/json/', { cancelToken });
        return response.data.country_name;
    } catch (e) {
        if (e.message !== "Unmounted") return 'Select a country';
    }
}

export function isLoggedOut() {
    return !this.isLoggedIn();
}

export function getExpiration() {
    const expiration = localStorage.getItem("expiration");
    if (expiration) {
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    } else {
        return moment();
    }
}

export function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}
const axios = require('axios');
const { isLoggedIn } = require('./extras/globalFunctions');




const customAxios = axios.default.create({
    baseURL: `http://localhost:3001`,
    //timeout: 10000, 
    //headers: { 'api-key': 'eyJz-CI6Ikp-4pWY-lhdCI6' }
});


// customAxios.interceptors.request.use(req => {
//     const token = localStorage.getItem("token")
//     return token ? req.headers.Authorization = token : req

// });

const requestHandler = request => {
    if (request.url.slice(0, 4) === 'http') return request
    // Token will be dynamic so we can use any app-specific way to always   
    // fetch the new token before making the call
    if (isLoggedIn()) {
        const token = localStorage.getItem("token")
        request.headers.Authorization = token;
    }
    return request;
};

// const responseHandler = response => {
//     if (response.status === 401) {
//         window.location = '/login';
//     }

//     return response;
// };

// const errorHandler = error => {
//     return Promise.reject(error);
// };

// Step-3: Configure/make use of request & response interceptors from Axios
// Note: You can create one method say configureInterceptors, add below in that,
// export and call it in an init function of the application/page.
customAxios.interceptors.request.use(
    (request) => requestHandler(request)
);

customAxios.CancelToken = axios.default.CancelToken
// customAxios.interceptors.response.use(
//     (response) => responseHandler(response),
//     (error) => errorHandler(error)
//  );


// Step-4: Export the newly created Axios instance to be used in different locations.
export default customAxios;
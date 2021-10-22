const initialState = {
  actualPage: [],
  finalResult: [],
  clickedNumber: 1,
  user: {},
  publicUser: {},
  dog: {},
  petBreed: '',
  loading: false,
  communityDogs: []
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case 'MODIFY_FINAL_RESULT':
      return {
        ...state,
        finalResult: action.finalResult
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.user
      }
    case 'CHANGE_PAGE':
      return {
        ...state,
        actualPage: action.actualPage
      }
    case 'SET_CLICKED_NUMBER':
      return {
        ...state,
        clickedNumber: action.clickedNumber
      }
    case 'SET_PUBLIC_USER':
      return {
        ...state,
        publicUser: action.publicUser
      }
    case 'SET_CURRENT_DOG':
      return {
        ...state,
        dog: action.dog
      }
    case 'SET_COMMUNITY_DOGS':
      return {
        ...state,
        communityDogs: action.communityDogs
      }
    case 'SET_PET_BREED':
      return {
        ...state,
        petBreed: action.petBreed
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading
      }
    default:
      return { ...state }
  }
}
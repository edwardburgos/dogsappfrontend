export function modifyFinalResult(finalResult) {
    return {
        type: 'MODIFY_FINAL_RESULT',
        finalResult
    }
}

export function setUser(user) {
    return {
        type: 'SET_USER',
        user
    }
}

export function changePage(actualPage) {
    return {
        type: 'CHANGE_PAGE',
        actualPage
    }
}

export function setClickedNumber(clickedNumber) {
    return {
        type: 'SET_CLICKED_NUMBER',
        clickedNumber
    }
}

export function setPublicUser(publicUser) {
    return {
        type: 'SET_PUBLIC_USER',
        publicUser
    }
}

export function setCurrentDog(dog) {
    return {
        type: 'SET_CURRENT_DOG',
        dog
    }
}

export function setCommunityDogs(communityDogs) {
    return {
        type: 'SET_COMMUNITY_DOGS',
        communityDogs
    }
}

export function setPetBreed(petBreed) {
    return {
        type: 'SET_PET_BREED',
        petBreed
    }
}

export function setLoading(loading) {
    return {
        type: 'SET_LOADING',
        loading
    }
}
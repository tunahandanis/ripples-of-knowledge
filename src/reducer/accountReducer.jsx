const initialState = {
  account: null,
  isLoading: false,
  isAppDisabled: true,
  metamaskNotFound: false,
}

export const AccountActionTypes = {
  SET_ACCOUNT: "SET_ACCOUNT",
  SET_ISLOADING: "SET_ISLOADING",
  SET_ACCOUNT_FAILURE: "SET_ACCOUNT_FAILURE",
  SET_DISABLE_APP: "SET_DISABLE_APP",
  SET_OPENSEA_LINK: "SET_OPENSEA_LINK",
  SET_METAMASK_NOT_FOUND: "SET_METAMASK_NOT_FOUND",
}

const reducer = (state, action) => {
  switch (action.type) {
    case AccountActionTypes.SET_ACCOUNT:
      return {
        ...state,
        account: action.payload,
      }
    case AccountActionTypes.SET_ACCOUNT_FAILURE:
      return {
        ...state,
        account: null,
      }
    case AccountActionTypes.SET_ISLOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case AccountActionTypes.SET_DISABLE_APP:
      return {
        ...state,
        isAppDisabled: action.payload,
      }
    case AccountActionTypes.SET_METAMASK_NOT_FOUND:
      return {
        ...state,
        metamaskNotFound: action.payload,
      }

    default:
      return state
  }
}

export { initialState, reducer }

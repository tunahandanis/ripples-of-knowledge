const initialState = {
  isLoading: false,
  wallet: null,
  client: {},
  account: null,
}

export const AccountActionTypes = {
  SET_ACCOUNT: "SET_ACCOUNT",
  SET_IS_ACCOUNT_LOADING: "SET_IS_ACCOUNT_LOADING",
  SET_ACCOUNT_NFTS: "SET_ACCOUNT_NFTS",
  SET_WALLET: "SET_WALLET",
  SET_CLIENT: "SET_CLIENT",
  UPDATE_NFTS: "UPDATE_NFTS",
  UPDATE_BALANCE: "UPDATE_BALANCE",
}

const reducer = (state, action) => {
  switch (action.type) {
    case AccountActionTypes.SET_ACCOUNT:
      return {
        ...state,
        account: action.payload,
      }
    case AccountActionTypes.SET_IS_ACCOUNT_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case AccountActionTypes.SET_ACCOUNT_NFTS:
      return {
        ...state,
        nfts: action.payload,
      }
    case AccountActionTypes.SET_WALLET:
      return {
        ...state,
        wallet: action.payload,
      }
    case AccountActionTypes.SET_CLIENT:
      return {
        ...state,
        client: action.payload,
      }
    case AccountActionTypes.UPDATE_NFTS:
      return {
        ...state,
        account: {
          ...state.account,
          nfts: action.payload.newNfts,
        },
      }
    case AccountActionTypes.UPDATE_BALANCE:
      return {
        ...state,
        account: {
          ...state.account,
          balance: action.payload.newBalance,
        },
      }
    default:
      return state
  }
}

export { initialState, reducer }

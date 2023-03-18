import { notification } from "antd"
import { ethers } from "ethers"
import React, { createContext, useContext, useReducer } from "react"

import {
  AccountActionTypes,
  initialState,
  reducer,
} from "../reducer/accountReducer"

const arcticChainId = `0x229`

const AccountContext = createContext()

const AccountContextProvider = (props) => {
  const [accountState, accountDispatch] = useReducer(reducer, initialState)

  const connectWallet = async (dispatch) => {
    dispatch({ type: AccountActionTypes.SET_ISLOADING, payload: true })
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask!")
        dispatch({ type: AccountActionTypes.SET_ISLOADING, payload: false })
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      const payload = {
        address: accounts[0],
      }

      console.log(payload)

      dispatch({ type: AccountActionTypes.SET_ACCOUNT, payload })
      dispatch({ type: AccountActionTypes.SET_ISLOADING, payload: false })
    } catch (e) {
      console.log(e)
      notification.error({
        message: "Wallet connection Error",
        description: e.message,
        duration: 20,
      })
      dispatch({ type: AccountActionTypes.SET_ACCOUNT_FAILURE })
      dispatch({ type: AccountActionTypes.SET_ISLOADING, payload: false })
    }
  }

  const checkIfWalletIsConnected = async (dispatch) => {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Make sure you have metamask!")

      dispatch({
        type: AccountActionTypes.SET_METAMASK_NOT_FOUND,
        payload: true,
      })

      return
    } else {
      dispatch({
        type: AccountActionTypes.SET_METAMASK_NOT_FOUND,
        payload: false,
      })

      const provider = new ethers.providers.Web3Provider(ethereum, "any")
      provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          console.log(oldNetwork)
          window.location.reload()
        }
      })
      ethereum.on("accountsChanged", async () => {
        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (!accounts.length) {
          dispatch({ type: AccountActionTypes.SET_ACCOUNT, payload: null })
        }
        console.log("accountsChanged")
      })
    }

    const chainId = await ethereum.request({ method: "eth_chainId" })
    console.log("Connected to chain " + chainId)

    if (chainId !== arcticChainId) {
      dispatch({ type: AccountActionTypes.SET_DISABLE_APP, payload: true })
      dispatch({ type: AccountActionTypes.SET_ACCOUNT, payload: null })
      return
    } else {
      dispatch({ type: AccountActionTypes.SET_DISABLE_APP, payload: false })
      const accounts = await ethereum.request({ method: "eth_accounts" })

      if (accounts.length !== 0) {
        const account = accounts[0]

        const payload = {
          address: account,
        }
        dispatch({ type: AccountActionTypes.SET_ACCOUNT, payload })
      } else {
        console.log("No authorized account found")
      }
    }
  }

  const changeNetwork = async () => {
    try {
      const { ethereum } = window
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: arcticChainId }],
      })
    } catch (e) {
      console.error(e)
      notification.error({
        message: "Change Network Error",
        description: e.message,
      })
    }
  }

  return (
    <AccountContext.Provider
      value={{
        accountState,
        accountDispatch,
        changeNetwork,
        connectWallet,
        checkIfWalletIsConnected,
      }}
    >
      {props.children}
    </AccountContext.Provider>
  )
}

const useAccountContext = () => useContext(AccountContext)

export { AccountContextProvider, useAccountContext }

/* eslint-disable no-undef */

import axios from "axios"
import { pinataUrlPrefix } from "./constants"

const JWT = `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`

export const uploadJSONToIPFS = async (JSONBody) => {
  const data = JSON.stringify(JSONBody)
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`

  const config = {
    method: "post",
    url,
    headers: {
      "Content-Type": "application/json",
      Authorization: JWT,
    },
    data: data,
  }

  return axios(config)
    .then(function (response) {
      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
      }
    })
    .catch(function (error) {
      console.log(error)
      return {
        success: false,
        message: error.message,
      }
    })
}

export const getNFTMetadata = async (ipfsHash) => {
  try {
    const res = await fetch(`${pinataUrlPrefix}${ipfsHash}`)
    const json = res.json()
    return json
  } catch (error) {
    console.log(error)
  }
}

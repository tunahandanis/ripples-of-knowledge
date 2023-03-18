import { Spin, Table } from "antd"
import { useEffect, useState } from "react"
import { getBooksTableColumns } from "@/utils/helpers"
import { ethers } from "ethers"
import BookNFT from "../../../artifacts/contracts/BookNFT.sol/BookNFT.json"
import { bookNftContractAddress } from "@/utils/constants"

import { getNFTMetadata } from "@/utils/pinata"

const Explore = () => {
  const [books, setBooks] = useState()

  const fetchBooks = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const contract = new ethers.Contract(
      bookNftContractAddress,
      BookNFT.abi,
      provider
    )

    try {
      const bookURIs = await contract.getAllBookURIs()
      console.log(bookURIs)
      const promises = bookURIs.map((uri) => {
        const promise = getNFTMetadata(uri)
        return promise
      })

      const books = await Promise.all(promises)

      setBooks(books)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  if (!books) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="explore">
      <div>
        <Table
          size="small"
          dataSource={Object.values(books)}
          columns={Object.values(getBooksTableColumns(false))}
          rowKey={(record) => record?._id}
          pagination={false}
        />
      </div>
    </div>
  )
}

export default Explore

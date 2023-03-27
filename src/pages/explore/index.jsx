import { Spin, Table } from "antd"
import { useEffect, useState } from "react"
import { getBooksTableColumns } from "@/utils/helpers"

import { getNFTMetadata } from "@/utils/pinata"

const Explore = () => {
  const [books, setBooks] = useState()

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/getBooks")

      const json = await res.json()
      const bookURIs = json.map((book) => book.ipfsHash)

      const promises = bookURIs.map((uri) => {
        const promise = getNFTMetadata(uri)
        return promise
      })

      const response = await Promise.all(promises)
      const books = response.map((book, index) => {
        return { ...book, ipfsHash: bookURIs[index] }
      })

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

import { Spin, Table } from "antd"
import { useEffect, useState } from "react"
import { getBooksTableColumns } from "@/utils/helpers"

import { getNFTMetadata } from "@/utils/pinata"

const Explore = () => {
  const [books, setBooks] = useState()

  const fetchBooks = async () => {
    try {
      const booksRes = await fetch("/api/getBooks")

      const json = await booksRes.json()
      const bookURIs = json.map((book) => book.ipfsHash)

      const promises = bookURIs.map((uri) => {
        const promise = getNFTMetadata(uri)
        return promise
      })

      const response = await Promise.all(promises)
      const books = response.map((book, index) => {
        return { ...book, ipfsHash: bookURIs[index] }
      })

      const reviewsRes = await fetch("/api/getReviews")
      const reviewJson = await reviewsRes.json()

      const mappedReviews = reviewJson.map((review) => {
        return {
          book: review.bookId,
          rating:
            review.reviews.reduce((prev, next) => prev + next, 0) /
            review.reviews.length,
          reviewCount: review.reviews.length,
        }
      })

      const booksWithReviews = books.map((book) => {
        const review = mappedReviews.find(
          (review) => review.book === book.bookId
        )

        if (review) {
          return {
            ...book,
            rating: review.rating,
            reviewCount: review.reviewCount,
          }
        }

        return book
      })

      setBooks(booksWithReviews)
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

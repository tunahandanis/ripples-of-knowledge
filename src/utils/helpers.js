import { message } from "antd"
import Link from "next/link"
import CopyToClipboard from "react-copy-to-clipboard"
import { formatAccount } from "./common"

export const getBooksTableColumns = (isAuthor) => {
  const columns = {
    Name: {
      title: () => <strong>Name</strong>,
      key: "name",
      dataIndex: "bookName",
    },
    Price: {
      title: () => <strong>Price</strong>,
      key: "price",
      dataIndex: "premiumPrice",
      render: (price) => `${price} XRP`,
    },
    Chapters: {
      title: () => <strong>Chapters</strong>,
      key: "chapters",
      dataIndex: "",
      render: (row) => row?.chapters?.length ?? "-",
    },
    Author: {
      title: () => <strong>Author</strong>,
      key: "author",
      dataIndex: "authorWalletAddress",
      render: (add) => (
        <CopyToClipboard
          text={add}
          onCopy={() => {
            message.open({
              type: "info",
              content: "Copied to clipboard",
            })
          }}
        >
          <span style={{ color: "#40a9ff", cursor: "pointer" }}>
            {formatAccount(add)}
          </span>
        </CopyToClipboard>
      ),
    },

    Reviews: {
      title: () => <strong>Reviews</strong>,
      key: "reviews",
      dataIndex: "reviewers",
      render: (reviews) => reviews.length,
      sorter: {
        compare: (a, b) => a.reviews?.length - b.reviews?.length,
        multiple: 2,
      },
    },
    Rating: {
      title: () => <strong>Rating</strong>,
      key: "rating",
      dataIndex: "rating",

      render: (rating) => (rating === 0 ? "-" : rating),
      sorter: {
        compare: (a, b) => a.rating - b.rating,
        multiple: 1,
      },
    },
    Link: {
      title: () => <strong>Go To Book</strong>,
      key: "book",
      dataIndex: "",
      render: (row) => (
        <Link
          href={{
            pathname: `/${isAuthor ? "my-book" : "book"}/[bookInfo]`,
            query: {
              bookInfo: `${row?.authorWalletAddress},${row?.bookName}`,
            },
          }}
        >
          Book
        </Link>
      ),
    },
  }

  const newColumns = { ...columns }
  return newColumns
}

/* href={`/${isAuthor ? "my-books" : "book"}/${
  row?.authorWalletAddress
}-${row?.bookName}`} */

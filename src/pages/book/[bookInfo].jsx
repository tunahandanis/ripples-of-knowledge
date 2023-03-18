import { useAccountContext } from "@/context/accountContext"
import { Button, Collapse, notification, Spin, Tooltip, Rate } from "antd"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CheckOutlined, LockOutlined } from "@ant-design/icons"
import { ethers } from "ethers"
import BookAccessNFT from "../../../artifacts/contracts/BookAccessNFT.sol/BookAccessNFT.json"
import {
  bookAccessNftContractAddress,
  bookNftContractAddress,
} from "@/utils/constants"
import { getNFTMetadata, uploadJSONToIPFS } from "@/utils/pinata"
import BookNFT from "../../../artifacts/contracts/BookNFT.sol/BookNFT.json"

const Book = () => {
  const router = useRouter()
  const [book, setBook] = useState()
  const [authorBooks, setAuthorBooks] = useState()
  const [authorBookURIs, setAuthorBookURIs] = useState()
  const [hasAccess, setHasAccess] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const { accountState, checkIfWalletIsConnected, accountDispatch } =
    useAccountContext()

  const buyAccess = async () => {
    const params = {
      nonce: "0x00",
      to: book.authorWalletAddress,
      from: accountState.account.address,
      value: ethers.utils.parseUnits(book.premiumPrice, 18).toString(),
      gasPrice: ethers.utils.parseUnits("2.0", "gwei").toHexString(),
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    setIsBuying(true)

    try {
      const res = await signer.sendTransaction(params)

      const btn = (
        <a
          href={"https://arctic.epirus.io/transactions/" + res.hash}
          target="_blank"
          rel="noreferrer"
        >
          <span style={{ color: "#40a9ff", cursor: "pointer" }}>
            {res.hash.slice(0, 30) + "..."}
          </span>
        </a>
      )
      notification.open({
        message: `Payment got through`,
        description: "Click to view on Epirus",
        btn,
        placement: "bottomRight",

        duration: 5,
        icon: <CheckOutlined style={{ color: "#108ee9" }} />,
      })
      await mintAccessNFT()

      await getAccessedBooksByAddress()
    } catch (error) {
      console.error(error)
      setIsBuying(false)
    }
  }

  const getAccessedBooksByAddress = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const contract = new ethers.Contract(
      bookAccessNftContractAddress,
      BookAccessNFT.abi,
      provider
    )

    try {
      const identifiers = await contract.getAccessedBooks(
        accountState.account.address
      )

      const bookIdentifier = `${
        book.authorWalletAddress
      }&${book.bookName.trim()}`

      setHasAccess(identifiers.includes(bookIdentifier))
      setIsBuying(false)
    } catch (error) {
      console.error(error)
      setIsBuying(false)
    }
  }

  const mintAccessNFT = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract(
        bookAccessNftContractAddress,
        BookAccessNFT.abi,
        signer
      )

      const bookIdentifier = `${
        book.authorWalletAddress
      }&${book.bookName.trim()}`

      const transaction = await contract.mintAccessNFT(
        accountState.account.address,
        bookIdentifier
      )

      try {
        const res = await transaction.wait()

        const btn = (
          <a
            href={
              "https://arctic.epirus.io/transactions/" + res.transactionHash
            }
            target="_blank"
            rel="noreferrer"
          >
            <span style={{ color: "#40a9ff", cursor: "pointer" }}>
              {res.transactionHash.slice(0, 30) + "..."}
            </span>
          </a>
        )
        notification.open({
          message: `You just minted the access NFT!`,
          description: "Click to view transaction on Epirus",
          btn,
          placement: "bottomRight",

          duration: 5,
          icon: <CheckOutlined style={{ color: "#108ee9" }} />,
        })

        getAccessedBooksByAddress()
      } catch (error) {
        console.error(error)
        setIsBuying(false)
      }
    }
  }

  useEffect(() => {
    const bookInfo = router.query.bookInfo
    const splitInfo = bookInfo.split(",")
    const author = splitInfo[0]
    const bookName = splitInfo[1]

    fetchBook({ author, bookName })
  }, [])

  const fetchBook = async ({ author, bookName }) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const contract = new ethers.Contract(
      bookNftContractAddress,
      BookNFT.abi,
      provider
    )

    try {
      const bookURIs = await contract.getAuthorBookURIs(author)

      const promises = []

      for (let uri of bookURIs) {
        promises.push(getNFTMetadata(uri))
      }

      const books = await Promise.all(promises)
      const book = books.find((book) => book.bookName === bookName)

      setAuthorBookURIs(bookURIs)
      setAuthorBooks(books)
      setBook(book)
    } catch (error) {
      console.error(error)
    }
  }

  const giveReview = async (rating) => {
    checkIfWalletIsConnected(accountDispatch)
    setIsReviewing(true)

    const bookInfo = router.query.bookInfo
    const splitInfo = bookInfo.split(",")
    const author = splitInfo[0]
    const bookName = splitInfo[1]

    const bookIndex = authorBooks.findIndex(
      (book) => book.bookName === bookName
    )
    const oldBookURI = authorBookURIs[bookIndex]

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      bookNftContractAddress,
      BookNFT.abi,
      signer
    )

    const newNumberOfReviewers = book.reviewers.length + 1

    const updatedBookData = {
      ...book,
      rating: (book.rating + rating) / newNumberOfReviewers,
      reviewers: book.reviewers.includes(accountState?.account?.address)
        ? book.reviewers
        : [...book.reviewers, accountState.account.address],
    }

    if (!updatedBookData) {
      return
    }

    try {
      const pinataResponse = await uploadJSONToIPFS(updatedBookData)
      const transaction = await contract.updateBookURI(
        author,
        oldBookURI,
        pinataResponse.ipfsHash
      )
      const res = await transaction.wait()

      const btn = (
        <a
          href={"https://arctic.epirus.io/transactions/" + res.transactionHash}
          target="_blank"
          rel="noreferrer"
        >
          <span style={{ color: "#40a9ff", cursor: "pointer" }}>
            {res.transactionHash.slice(0, 30) + "..."}
          </span>
        </a>
      )
      notification.open({
        message: `You added a new review!`,
        description: "Click to view transaction on Epirus",
        btn,
        placement: "bottomRight",

        duration: 5,
        icon: <CheckOutlined style={{ color: "#108ee9" }} />,
      })

      setTimeout(() => {
        fetchBook({ author, bookName })
      }, 1000)
    } catch (e) {
      console.error(e)
    }

    setIsReviewing(false)
  }

  useEffect(() => {
    if (book) {
      getAccessedBooksByAddress()
    }
  }, [book])

  if (!book) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
      </div>
    )
  }

  const renderReviewSection = () =>
    isReviewing ? (
      <div className="spin-wrapper">
        <Spin size="large" />
      </div>
    ) : (
      <div className="my-book__rate">
        <Rate onChange={giveReview} />
      </div>
    )

  const isReaderTheAuthor =
    book.authorWalletAddress === accountState?.account?.address

  const notEnoughFunds =
    parseInt(book.premiumPrice) >= parseInt(accountState?.account?.balance)

  const alreadyReviewed = book.reviewers.includes(
    accountState?.account?.address
  )

  return (
    <div className="my-book">
      <h2 className="my-book__title">{book.bookName}</h2>
      <div className="my-book__header">
        {!hasAccess && !isReaderTheAuthor && (
          <div className="my-book__buy">
            <Tooltip title={notEnoughFunds && "Not Enough Funds"}>
              <Button
                disabled={notEnoughFunds}
                onClick={buyAccess}
                loading={isBuying}
                size="large"
                type="primary"
              >
                Buy
              </Button>
            </Tooltip>
            <h4>{`${book.premiumPrice} ICZ`}</h4>
          </div>
        )}
        {!isReaderTheAuthor &&
          !alreadyReviewed &&
          hasAccess &&
          renderReviewSection()}
      </div>
      {book.chapters?.length ? (
        <Collapse expandIcon={() => <LockOutlined />}>
          {book.chapters.map((chapter, index) => (
            <Collapse.Panel
              showArrow={index > 2 && !hasAccess && !isReaderTheAuthor}
              disabled={index > 2 && !hasAccess && !isReaderTheAuthor}
              header={`Chapter ${index + 1} - ${chapter.chapterName}`}
              key={index}
            >
              <p>{chapter.content}</p>
            </Collapse.Panel>
          ))}
        </Collapse>
      ) : (
        <div className="my-book__no-chapters">
          <h3>No Chapters Written</h3>
        </div>
      )}
    </div>
  )
}

export default Book

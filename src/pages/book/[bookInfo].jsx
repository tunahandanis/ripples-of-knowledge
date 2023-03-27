import {
  updateBalance,
  updateNFTs,
  useAccountContext,
} from "@/context/accountContext"
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

// eslint-disable-next-line no-undef
const xrpl = require("xrpl")

const Book = () => {
  const router = useRouter()
  const [book, setBook] = useState()
  const [hasAccess, setHasAccess] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const { accountState, accountDispatch } = useAccountContext()

  const getAccessedBooksByAddress = async () => {
    const nftURIs = accountState?.account?.nfts?.map((nft) =>
      xrpl.convertHexToString(nft.URI)
    )

    if (!nftURIs) {
      return
    }

    try {
      const promises = nftURIs.map((uri) => {
        const promise = getNFTMetadata(uri)
        return promise
      })

      const nfts = await Promise.all(promises)
      const accessNft = nfts.find((nft) => nft.isAccessNft)

      console.log(nfts)

      setHasAccess(accessNft.accessData.includes(book.bookId))
    } catch (error) {
      console.error(error)
    }
  }

  const makePayment = async () => {
    setIsBuying(true)

    try {
      const paymentBlob = await accountState.client?.autofill({
        TransactionType: "Payment",
        Account: accountState?.account?.address,
        Amount: xrpl.xrpToDrops(book.premiumPrice.toString()),
        Destination: book.authorWalletAddress,
      })

      const signed = await accountState.wallet?.sign(paymentBlob)
      const tx = await accountState.client?.submitAndWait(signed.tx_blob)

      const btn = (
        <a
          href={"https://blockexplorer.one/xrp/testnet/tx/" + tx.result.hash}
          target="_blank"
          rel="noreferrer"
        >
          <span style={{ color: "#40a9ff", cursor: "pointer" }}>
            {tx.result.hash.slice(0, 30) + "..."}
          </span>
        </a>
      )
      notification.open({
        message: `Payment got through!`,
        description: "Click to view on explorer:",
        btn,
        placement: "bottomRight",

        duration: 5,
        icon: <CheckOutlined style={{ color: "#108ee9" }} />,
      })

      await mintAccessNFT()
    } catch (error) {
      console.error(error)
    }
  }

  const mintAccessNFT = async () => {
    const nftURIs = accountState?.account?.nfts.map((nft) =>
      xrpl.convertHexToString(nft.URI)
    )

    let burnTransactionBlob
    let accessNft

    if (nftURIs.length) {
      const promises = []

      for (let uri of nftURIs) {
        promises.push(getNFTMetadata(uri))
      }

      const nfts = await Promise.all(promises)
      accessNft = nfts.find((nft) => nft.isAccessNft)

      const nftIndex = nfts.findIndex((nft) => nft?.isAccessNft)
      const tokenId = accountState?.account?.nfts[nftIndex].NFTokenID

      burnTransactionBlob = {
        TransactionType: "NFTokenBurn",
        Account: accountState?.account?.address,
        NFTokenID: tokenId,
      }
    }

    try {
      let updatedBookData

      if (accessNft) {
        updatedBookData = {
          ...accessNft,
          accessData: [...accessNft.accessData, book.bookId],
        }
      } else {
        updatedBookData = { accessData: [book.bookId], isAccessNft: true }
      }

      if (accessNft) {
        await accountState.wallet?.sign(burnTransactionBlob)

        await accountState.client.submitAndWait(burnTransactionBlob, {
          wallet: accountState?.wallet,
        })
      }

      const pinataResponse = await uploadJSONToIPFS(updatedBookData)
      const mintTransactionBlob = {
        TransactionType: "NFTokenMint",
        Account: accountState.wallet?.classicAddress,
        URI: xrpl.convertStringToHex(pinataResponse.ipfsHash),
        Flags: 8,
        TransferFee: 0,
        NFTokenTaxon: 0,
      }

      await accountState.wallet?.sign(mintTransactionBlob)
      const tx = await accountState.client.submitAndWait(mintTransactionBlob, {
        wallet: accountState?.wallet,
      })

      const btn = (
        <a
          href={"https://blockexplorer.one/xrp/testnet/tx/" + tx.result.hash}
          target="_blank"
          rel="noreferrer"
        >
          <span style={{ color: "#40a9ff", cursor: "pointer" }}>
            {tx.result.hash.slice(0, 30) + "..."}
          </span>
        </a>
      )
      notification.open({
        message: `You just minted the access NFT!`,
        description: "Click to view on explorer:",
        btn,
        placement: "bottomRight",

        duration: 5,
        icon: <CheckOutlined style={{ color: "#108ee9" }} />,
      })

      await updateNFTs(accountDispatch, accountState.account.address)
      await updateBalance(accountDispatch, accountState.account.address)
      setIsBuying(false)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const hash = router.query.bookInfo

    fetchBook(hash)
  }, [])

  const fetchBook = async (hash) => {
    try {
      const book = await getNFTMetadata(hash)

      setBook(book)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (book) {
      getAccessedBooksByAddress()
    }
  }, [book, accountState?.account?.nfts])

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
        <Rate /* onChange={giveReview}  */ />
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
                onClick={makePayment}
                loading={isBuying}
                size="large"
                type="primary"
              >
                Buy
              </Button>
            </Tooltip>
            <h4>{`${book.premiumPrice} XRP`}</h4>
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

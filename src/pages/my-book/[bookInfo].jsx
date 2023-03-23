import {
  updateBalance,
  updateNFTs,
  useAccountContext,
} from "@/context/accountContext"
import { getNFTMetadata, uploadJSONToIPFS } from "@/utils/pinata"
import { Button, Collapse, Input, Modal, notification, Spin } from "antd"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CheckOutlined } from "@ant-design/icons"

// eslint-disable-next-line no-undef
const xrpl = require("xrpl")

const MyBook = () => {
  const router = useRouter()
  const [book, setBook] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false)
  const [chapterNameInput, setChapterNameInput] = useState("")
  const [contentInput, setContentInput] = useState("")

  const { accountDispatch, accountState } = useAccountContext()

  const hideModal = () => {
    setIsNewChapterModalOpen(false)
  }

  const showModal = () => {
    setIsNewChapterModalOpen(true)
  }

  useEffect(() => {
    const bookName = router.query.bookInfo.split(",")[1]

    fetchBook(bookName)
  }, [accountState?.account?.nfts])

  const fetchBook = async (bookName) => {
    try {
      const bookURIs = accountState?.account?.nfts.map((nft) =>
        xrpl.convertHexToString(nft.URI)
      )

      const promises = []

      for (let uri of bookURIs) {
        promises.push(getNFTMetadata(uri))
      }

      const books = await Promise.all(promises)
      const book = books.find((book) => book.bookName === bookName)

      setBook(book)
    } catch (error) {
      console.error(error)
    }
  }

  const insertChapter = async () => {
    setIsLoading(true)

    const bookURIs = accountState?.account?.nfts.map((nft) =>
      xrpl.convertHexToString(nft.URI)
    )

    const promises = []

    for (let uri of bookURIs) {
      promises.push(getNFTMetadata(uri))
    }

    const bookInfo = router.query.bookInfo
    const splitInfo = bookInfo.split(",")
    const bookName = splitInfo[1]

    const books = await Promise.all(promises)
    const bookIndex = books.findIndex((book) => book.bookName === bookName)
    const tokenId = accountState?.account?.nfts[bookIndex].NFTokenID

    const newChapter = {
      chapterName: chapterNameInput,
      content: contentInput,
    }

    const burnTransactionBlob = {
      TransactionType: "NFTokenBurn",
      Account: accountState?.account?.address,
      NFTokenID: tokenId,
    }

    const updatedBookData = {
      ...book,
      chapters: [...book.chapters, newChapter],
    }

    if (!updatedBookData) {
      return
    }

    try {
      await accountState.wallet?.sign(burnTransactionBlob)

      await accountState.client.submitAndWait(burnTransactionBlob, {
        wallet: accountState?.wallet,
      })

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
        message: `Your NFT has been minted`,
        description: "Click to view on explorer:",
        btn,
        placement: "bottomRight",

        duration: 5,
        icon: <CheckOutlined style={{ color: "#108ee9" }} />,
      })

      await updateNFTs(accountDispatch, accountState.account.address)
      await updateBalance(accountDispatch, accountState.account.address)
    } catch (e) {
      console.error(e)
    }

    setIsLoading(false)
    setChapterNameInput("")
    setContentInput("")
    setIsNewChapterModalOpen(false)
  }

  if (!book) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="my-book">
      <h2 className="my-book__title">{book.bookName}</h2>

      <Button
        type="primary"
        onClick={showModal}
        className="my-book_new-chapter"
      >
        New Chapter
      </Button>
      {book.chapters?.length ? (
        <Collapse className="my-book__collapse">
          {book.chapters.map((chapter, index) => (
            <Collapse.Panel
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
      <Modal
        title="Write a new chapter"
        open={isNewChapterModalOpen}
        onOk={hideModal}
        onCancel={hideModal}
        footer={[
          <Button
            key="create"
            loading={isLoading}
            onClick={() => {
              if (
                chapterNameInput.trim() !== "" &&
                contentInput.trim() !== ""
              ) {
                insertChapter()
              }
            }}
          >
            Save
          </Button>,
        ]}
      >
        <Input
          placeholder="Chapter name"
          onChange={(e) => setChapterNameInput(e.target.value)}
          value={chapterNameInput}
        />
        <Input.TextArea
          placeholder="Chapter content"
          onChange={(e) => setContentInput(e.target.value)}
          value={contentInput}
          className="mt-1"
        />
      </Modal>
    </div>
  )
}

export default MyBook

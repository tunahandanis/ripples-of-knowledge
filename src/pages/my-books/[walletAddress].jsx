import {
  useAccountContext,
  updateBalance,
  updateNFTs,
} from "@/context/accountContext"
import { Button, Input, Modal, notification, Spin, Table } from "antd"
import { useEffect, useState } from "react"
import { getBooksTableColumns } from "@/utils/helpers"

import { uploadJSONToIPFS, getNFTMetadata } from "@/utils/pinata"
import { CheckOutlined } from "@ant-design/icons"

// eslint-disable-next-line no-undef
const xrpl = require("xrpl")

const User = () => {
  const [books, setBooks] = useState()
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false)
  const [bookNameInput, setBookNameInput] = useState("")
  const [priceInput, setPriceInput] = useState("")
  const [isMinting, setIsMinting] = useState(false)

  const { accountState, accountDispatch } = useAccountContext()

  const hideModal = () => {
    setIsNewBookModalOpen(false)
  }

  const showModal = () => {
    setIsNewBookModalOpen(true)
  }

  const mintBookNft = async () => {
    setIsMinting(true)

    const newBook = {
      bookName: bookNameInput,
      authorWalletAddress: accountState?.account?.address,
      premiumPrice: priceInput,
      chapters: [],
      reviewers: [],
      rating: 0,
    }

    try {
      const pinataResponse = await uploadJSONToIPFS(newBook)

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

      updateNFTs(accountDispatch, accountState.account.address)
      updateBalance(accountDispatch, accountState.account.address)
    } catch (error) {
      console.error(error)
    }
    handleMintDone()
  }

  const handleMintDone = () => {
    hideModal()
    setBookNameInput("")
    setIsNewBookModalOpen(false)
    setPriceInput("")
    setIsMinting(false)
  }

  const fetchBooks = async () => {
    try {
      const bookURIs = accountState?.account?.nfts?.map((nft) =>
        xrpl.convertHexToString(nft.URI)
      )

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
    if (accountState?.account?.nfts) {
      fetchBooks()
    }
  }, [])

  if (!books) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="profile">
      <Button
        onClick={showModal}
        className="profile__new-button"
        type="primary"
        disabled={!accountState.account}
      >
        Write a new book!
      </Button>
      <div className="profile__table">
        <Table
          size="small"
          dataSource={Object.values(books)}
          columns={Object.values(getBooksTableColumns(true))}
          rowKey={(record) => record?._id}
          pagination={false}
        />
      </div>
      <Modal
        title="Create a new book"
        open={isNewBookModalOpen}
        onOk={() => {
          hideModal()
          setBookNameInput("")
          setPriceInput("")
        }}
        onCancel={() => {
          hideModal()
          setBookNameInput("")
          setPriceInput("")
        }}
        footer={[
          <Button
            key="create"
            onClick={() => {
              if (bookNameInput.trim() !== "" && priceInput.trim() !== "") {
                mintBookNft()
              }
            }}
            loading={isMinting}
          >
            Create
          </Button>,
        ]}
      >
        <Input
          placeholder="Book name"
          onChange={(e) => setBookNameInput(e.target.value)}
          value={bookNameInput}
          size="middle"
        />
        <Input
          placeholder="Price for unlocking chapters in ICZ"
          onChange={(e) => {
            if (Number(e.target.value)) {
              setPriceInput(e.target.value)
            }
          }}
          value={priceInput}
          className="mt-1"
          size="middle"
          type="number"
          step="0.1"
        />
      </Modal>
    </div>
  )
}

export default User

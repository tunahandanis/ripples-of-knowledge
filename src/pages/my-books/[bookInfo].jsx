import { useAccountContext } from "@/context/accountContext"
import { getNFTMetadata, uploadJSONToIPFS } from "@/utils/pinata"
import { Button, Collapse, Input, Modal, notification, Spin } from "antd"
import { ethers } from "ethers"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import BookNFT from "../../../artifacts/contracts/BookNFT.sol/BookNFT.json"
import { bookNftContractAddress } from "@/utils/constants"
import { CheckOutlined } from "@ant-design/icons"

const MyBook = () => {
  const router = useRouter()
  const [book, setBook] = useState()
  const [authorBooks, setAuthorBooks] = useState()
  const [authorBookURIs, setAuthorBookURIs] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false)
  const [chapterNameInput, setChapterNameInput] = useState("")
  const [contentInput, setContentInput] = useState("")

  const { checkIfWalletIsConnected, accountDispatch } = useAccountContext()

  const hideModal = () => {
    setIsNewChapterModalOpen(false)
  }

  const showModal = () => {
    setIsNewChapterModalOpen(true)
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

  const insertChapter = async () => {
    checkIfWalletIsConnected(accountDispatch)
    setIsLoading(true)

    const bookInfo = router.query.bookInfo
    const splitInfo = bookInfo.split(",")
    const author = splitInfo[0]
    const bookName = splitInfo[1]

    const bookIndex = authorBooks.findIndex(
      (book) => book.bookName === bookName
    )
    const oldBookURI = authorBookURIs[bookIndex]

    const newChapter = {
      chapterName: chapterNameInput,
      content: contentInput,
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      bookNftContractAddress,
      BookNFT.abi,
      signer
    )

    const updatedBookData = {
      ...book,
      chapters: [...book.chapters, newChapter],
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
        message: `You just added a new chapter!!`,
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

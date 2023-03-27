import { Typography } from "antd"
import Link from "next/link"
import { useAccountContext } from "@/context/accountContext"

const Home = () => {
  const { Title } = Typography

  const { accountState } = useAccountContext()

  return (
    <>
      <div className="hero">
        <img
          src="/assets/hero-image.jpeg"
          alt="hero image"
          className="hero__image"
          loading="lazy"
        />
        <div className="hero__text">
          <Title className="hero__title">
            Read, write and support thrilling books
          </Title>
          <p className="hero__para">
            Ripples of Knowledge is a decentralized novel-protocol that lets
            people read, write and support books
          </p>
          <div className="hero__button-container">
            <Link href="/explore">
              <button
                className={`hero__button hero__button-explore ${
                  !accountState?.account && "hero__button-disabled"
                }`}
                disabled={!accountState.account}
              >
                Explore
              </button>
            </Link>
            <Link href={`/my-books/${accountState?.account?.address}`}>
              <button
                className={`hero__button hero__button-write ${
                  !accountState?.account && "hero__button-disabled"
                }`}
                disabled={!accountState.account}
              >
                Write
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home

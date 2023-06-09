import Link from "next/link"
import { Button, Divider, Dropdown, Menu, Modal, PageHeader, Space } from "antd"
import { useAccountContext, connectWallet } from "../../context/accountContext"
import TextArea from "antd/lib/input/TextArea"
import { useState } from "react"
import styles from "./Nav.module.scss"
import { UserOutlined } from "@ant-design/icons"
import Head from "next/head"

const Nav = () => {
  const { accountState, accountDispatch } = useAccountContext()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [seed, setSeed] = useState()

  console.log(accountState)

  const generateWallet = () => {
    connectWallet(accountDispatch).then(() => hideModal())
  }

  const importWallet = () => {
    if (seed) {
      connectWallet(accountDispatch, seed).then(() => hideModal())
    }
  }

  const showModal = () => setIsModalVisible(true)

  const hideModal = () => setIsModalVisible(false)

  return (
    <div className={styles.header}>
      <Head>
        <title>Ripples of Knowledge | Decentralized Novel Platform</title>
        <meta name="description" content="Iconic Novels Landing Page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageHeader
        ghost={false}
        avatar={{
          src: "/assets/logo.png",
        }}
        title={
          <Link href="/" className={styles.heading}>
            Ripples of Knowledge
          </Link>
        }
        extra={
          <>
            <ul className={styles.headerList}>
              {accountState?.account?.address && (
                <Link href="/explore">
                  <li>
                    <Space className={styles.navChild}>Explore</Space>
                  </li>
                </Link>
              )}

              <li>
                {accountState?.account?.address ? (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Link href={`/user/${accountState.account.address}`}>
                          <Menu.Item>Profile</Menu.Item>
                        </Link>
                        <Link
                          href={`/my-books/${accountState.account.address}`}
                        >
                          <Menu.Item>My Books</Menu.Item>
                        </Link>
                      </Menu>
                    }
                    placement="bottom"
                    arrow
                  >
                    <UserOutlined className={styles.userLogo} />
                  </Dropdown>
                ) : (
                  <Button
                    onClick={showModal}
                    className={styles.connectWallet}
                    loading={accountState?.isLoading}
                  >
                    Connect Wallet
                  </Button>
                )}
              </li>
            </ul>
          </>
        }
      />
      <Modal
        title="Generate a new wallet or recover from seed"
        visible={isModalVisible}
        onOk={hideModal}
        onCancel={hideModal}
        footer={null}
      >
        <TextArea
          rows={4}
          placeholder="Wallet seed/secret"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
        <div className={styles.modalButtonContainer}>
          <Button
            loading={accountState?.isLoading}
            type="primary"
            onClick={importWallet}
            className={styles.importWalletButton}
          >
            Import Wallet
          </Button>
        </div>
        <Divider plain>or</Divider>
        <div className={styles.modalButtonContainer}>
          <Button
            loading={accountState?.isLoading}
            type="primary"
            onClick={generateWallet}
            className={styles.generateWalletButton}
          >
            Generate New Wallet
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Nav

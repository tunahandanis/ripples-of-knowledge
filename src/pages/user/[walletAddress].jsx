import { useRouter } from "next/router"
import { message, Result, Button } from "antd"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Link from "next/link"
import { useAccountContext } from "@/context/accountContext"
import styles from "./Profile.module.scss"

const Profile = () => {
  const { accountState } = useAccountContext()

  const router = useRouter()

  const { account } = accountState

  console.log(account)

  // This checks if the user is authorized
  const NotAuthorized = (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button type="primary">
          <Link href="/">Back Home</Link>
        </Button>
      }
    />
  )

  if (router.query.walletAddress !== accountState.account?.address)
    return NotAuthorized

  return (
    <div className={styles.profile}>
      <div className={styles.profileCard}>
        <div className={styles.profileInfoField}>
          Wallet Address:{" "}
          <CopyToClipboard
            text={account?.address}
            onCopy={() => {
              message.open({
                type: "info",
                content: "Copied to clipboard",
              })
            }}
          >
            <span style={{ color: "#40a9ff", cursor: "pointer" }}>
              {account?.address}
            </span>
          </CopyToClipboard>
        </div>
        <div className={styles.profileInfoField}>
          Balance: <span>{account?.balance} XRP</span>
        </div>

        <div className={styles.profileInfoField}>
          Public Key:{" "}
          <CopyToClipboard
            //@ts-ignore
            text={account?.publicKey}
            onCopy={() => {
              message.open({
                type: "info",
                content: "Copied to clipboard",
              })
            }}
          >
            <span style={{ color: "#40a9ff", cursor: "pointer" }}>
              {account?.publicKey?.slice(0, 30) + "..."}
            </span>
          </CopyToClipboard>
        </div>
        <div className={styles.profileInfoField}>
          Private Key:{" "}
          <CopyToClipboard
            //@ts-ignore
            text={account?.privateKey}
            onCopy={() => {
              message.open({
                type: "info",
                content: "Copied to clipboard",
              })
            }}
          >
            <span style={{ color: "#40a9ff", cursor: "pointer" }}>
              {account?.privateKey?.slice(0, 30) + "..."}
            </span>
          </CopyToClipboard>
        </div>
        <div className={styles.profileInfoField}>
          Seed:{" "}
          <CopyToClipboard
            //@ts-ignore
            text={account?.secret}
            onCopy={() => {
              message.open({
                type: "info",
                content: "Copied to clipboard",
              })
            }}
          >
            <span style={{ color: "#40a9ff", cursor: "pointer" }}>
              {account?.secret}
            </span>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  )
}

export default Profile

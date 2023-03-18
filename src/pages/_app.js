import "@/styles/style.scss"
import Nav from "@/components/Nav"
import { AccountContextProvider } from "@/context/accountContext"

export default function App({ Component, pageProps }) {
  return (
    <AccountContextProvider>
      <Nav />
      <Component {...pageProps} />
    </AccountContextProvider>
  )
}

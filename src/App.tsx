import Axios from 'axios'
import isElectron from 'is-electron'
import React, { Fragment } from 'react'

import { FullPageSpinner } from './components/Spinner'
import { DefaultTitleBar } from './components/TitleBar'
import { Login, UserRegistration } from './pages'
import FloatingChat from './pages/Chat/FloatingChat'
import Routes from './Routes'

import Profile from './models/Profile'

import config from './config'

if (isElectron()) {
  // tslint:disable-next-line: no-var-requires
  require('./config/notification.css')
}
declare global {
  interface Window {
    require: any
    remote: any
  }
}

interface State {
  height: number
  isReady: boolean
  isServerConnected: boolean
  showSignup: boolean
  isAuthenticated: boolean
  secondTimer: number
}

class App extends React.Component<{}, State> {
  private intervalTimer: number = 0
  private timeoutTimer: number = 0

  constructor(props) {
    super(props)
    this.state = {
      height: 680,
      isReady: false,
      isServerConnected: false,
      showSignup: false,
      isAuthenticated: true,
      secondTimer: 5,
    }
    this.connect = this.connect.bind(this)
    this.activateTimer = this.activateTimer.bind(this)
    this.renderContent = this.renderContent.bind(this)
  }

  public async componentDidMount() {
    await this.connect()

    setTimeout(() => {
      this.setState({ height: window.innerHeight })
    }, 1000)
  }

  public render() {
    const { height } = this.state
    return (
      <Fragment>
        {isElectron() ? (
          <>
            <DefaultTitleBar />
            <div style={{ overflowY: 'auto', height: `${height - 46}px` }}>
              {this.renderContent()}
            </div>
          </>
        ) : (
          this.renderContent()
        )}
      </Fragment>
    )
  }

  private renderContent() {
    const { isAuthenticated, showSignup, isReady, isServerConnected } = this.state
    if (!isReady) {
      return <FullPageSpinner message="Please wait..." />
    } else if (isReady && !isServerConnected) {
      return (
        <div className="full-vh uk-flex uk-flex-middle uk-flex-center uk-flex-column">
          <img
            className="uk-margin-large"
            width="150"
            height="150"
            src="./images/Logo/Blue/SVG/Djali-Blue-Unique.svg"
          />
          <h4 className="uk-text-danger">We could not connect to your server.</h4>
          <h4 className="uk-text-danger">Please make sure that the Djali Server is running. </h4>
          <p className="uk-margin-large-top">Retrying in {this.state.secondTimer}s...</p>
        </div>
      )
    } else if (showSignup) {
      return <UserRegistration />
    } else if (!isAuthenticated) {
      return <Login />
    }

    return (
      <>
        <Routes />
        <FloatingChat />
      </>
    )
  }

  private async connect() {
    this.setState({ isReady: false, isServerConnected: false })
    window.clearInterval(this.intervalTimer)

    try {
      await Profile.retrieve()
      const authRequest = await Axios.get(`${config.djaliHost}/authenticate`)
      this.setState({
        isReady: true,
        isServerConnected: true,
        isAuthenticated: document.cookie !== '' || !authRequest.data.authentication,
      })
    } catch (error) {
      if (error.response) {
        if (error.response.status === 500) {
          this.setState({ isServerConnected: false, isReady: true })
          this.activateTimer()
          return
        }
        /**
         * Connection to server is successful but profile is not found.
         * Possibly a new Djali instance, so show registration page.
         */
        window.clearInterval(this.intervalTimer)
        this.setState({
          isServerConnected: true,
          showSignup: error.response.status === 404,
        })
      } else {
        this.activateTimer()
      }
      this.setState({ isReady: true })
    }
  }

  private activateTimer() {
    this.intervalTimer = window.setInterval(() => {
      let timer = this.state.secondTimer
      if (timer <= 1) {
        timer = 5
      } else {
        timer -= 1
      }
      this.setState({
        secondTimer: timer,
      })
    }, 1000)

    this.timeoutTimer = window.setTimeout(async () => {
      await this.connect()
    }, 5000)
  }
}

export default App

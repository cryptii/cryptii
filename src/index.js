
import App from './App'
import Browser from './Browser'

// apply browser class name
if (window) {
  Browser.applyClassName()
}

// run app
const app = new App()
app.run()

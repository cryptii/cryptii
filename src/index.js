
import 'babel-polyfill'
import browser from 'detect-browser/browser'

import App from './App'

if (browser) {
  // add browser class to html tag, makes browser sass mixin work
  const $html = document.querySelector('html')
  $html.classList.add(`browser--${browser.name}-${browser.version}`)
}

// run app
const app = new App()
app.run()

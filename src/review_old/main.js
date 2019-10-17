/* eslint-env browser */

import 'core-js/stable'
import 'regenerator-runtime/runtime'

import 'modules/rxjs'
import React from 'react'
import { render } from 'react-dom'
import * as Sentry from '@sentry/browser'
import configBrowser from 'configBrowser'
import Root from './Root'

// Initialize Sentry
Sentry.init({
  dsn: configBrowser.get('sentry.clientDsn'),
  environment: configBrowser.get('sentry.environment'),
  release: configBrowser.get('releaseVersion'),
})

const renderRoot = () => {
  render(<Root />, document.querySelector('#root'))
}

renderRoot()

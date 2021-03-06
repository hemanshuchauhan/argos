import path from 'path'
import convict from 'convict'
import dotenv from 'dotenv'

dotenv.config()

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  googleAnalytics: {
    doc: 'The tracking id',
    default: 'UA-89989315-2',
  },
  api: {
    subdomain: {
      format: String,
      default: 'api.dev',
      env: 'API_SUBDOMAIN',
    },
  },
  www: {
    subdomain: {
      format: String,
      default: 'www.dev',
      env: 'WWW_SUBDOMAIN',
    },
  },
  server: {
    port: {
      doc: 'The server port number',
      format: 'port',
      default: 4001,
      env: 'PORT',
    },
    logFormat: {
      doc: 'The morgan log format to use',
      format: ['dev', 'combined', 'common', 'short', 'tiny', ''],
      default: 'dev',
    },
    url: {
      doc: 'The user public url',
      format: String,
      default: 'http://www.dev.argos-ci.com:4002',
      env: 'SERVER_URL',
    },
    sessionSecret: {
      doc: 'This is the secret used to sign the session ID cookie.',
      format: String,
      default: 'keyboard cat',
      env: 'SERVER_SESSION_SECRET',
    },
    secure: {
      doc: 'Specify if the server is using https or not.',
      format: Boolean,
      default: false,
    },
  },
  client: {
    port: {
      doc: 'The client port number',
      format: 'port',
      default: 4002,
    },
  },
  amqp: {
    url: {
      doc: 'RabbitMQ url',
      format: String,
      default: 'amqp://localhost',
      env: 'CLOUDAMQP_URL',
    },
  },
  s3: {
    screenshotsBucket: {
      doc: 'Bucket containing screenshots',
      format: String,
      default: 'argos-screenshots-dev',
      env: 'AWS_SCREENSHOTS_BUCKET',
    },
  },
  github: {
    clientId: {
      doc: 'Client ID',
      format: String,
      default: 'c4636449f2df59e6010d',
      env: 'GITHUB_CLIENT_ID',
    },
    clientSecret: {
      doc: 'Client Secret',
      format: String,
      default: '1781c9a3e1d57fdcfdf9c29c02abf7d37e1c0427',
      env: 'GITHUB_CLIENT_SECRET',
    },
    applicationUrl: {
      format: String,
      default:
        'https://github.com/settings/connections/applications/8460535e1d4c40dfdf05',
      env: 'GITHUB_APPLICATION_URL',
    },
  },
  redis: {
    url: {
      doc: 'Redis url',
      format: String,
      default: 'redis://localhost:6379/1',
      env: 'REDIS_URL',
    },
  },
  releaseVersion: {
    doc: 'Sentry release version',
    format: String,
    default: 'dev',
    env: 'HEROKU_SLUG_COMMIT',
  },
  sentry: {
    environment: {
      doc: 'Sentry environment',
      format: String,
      default: 'development',
      env: 'NODE_ENV',
    },
    clientDsn: {
      doc: 'Sentry client DSN',
      format: String,
      default: 'https://f1690f74cc6e432e922f32da3eb051c9@sentry.io/133417',
      env: 'SENTRY_CLIENT_DSN',
    },
    serverDsn: {
      doc: 'Sentry server DSN',
      format: String,
      default:
        'https://261cb80891cb480fa452f7e18c0e57c0:dc050bb97a4d4692aa3e957c5c89d393@sentry.io/133418',
      env: 'SENTRY_SERVER_DSN',
    },
  },
})

const env = config.get('env')
config.loadFile(path.join(__dirname, `../config/${env}.json`))
config.validate()

export default config

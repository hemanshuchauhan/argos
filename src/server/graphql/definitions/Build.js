import gql from 'graphql-tag'
import Build from 'server/models/Build'
import Repository from 'server/models/Repository'
import ScreenshotDiff from 'server/models/ScreenshotDiff'
import { pushBuildNotification } from 'modules/build/notifications'
import { VALIDATION_STATUSES } from 'server/constants'
import APIError from '../APIError'

export const typeDefs = gql`
  enum BuildStatus {
    pending
    progress
    complete
    failure
    success
    error
    aborted
  }

  type Build {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    "The screenshot diffs between the base screenshot bucket of the compare screenshot bucket"
    screenshotDiffs: [ScreenshotDiff!]!
    "The screenshot bucket ID of the baselineBranch"
    baseScreenshotBucketId: ID
    "The screenshot bucket of the baselineBranch"
    baseScreenshotBucket: ScreenshotBucket
    "The screenshot bucket ID of the build commit"
    compareScreenshotBucketId: ID!
    "The screenshot bucket of the build commit"
    compareScreenshotBucket: ScreenshotBucket!
    "The repository associated to the build"
    repository: Repository!
    "Continuous number. It is incremented after each build"
    number: Int!
    "The status of the job associated to the build"
    status: BuildStatus!
  }

  type BuildResult {
    pageInfo: PageInfo!
    edges: [Build!]!
  }

  extend type Query {
    "Get a build"
    build(id: ID!): Build
  }

  extend type Mutation {
    "Change the validationStatus on a build"
    setValidationStatus(
      buildId: ID!
      validationStatus: ValidationStatus!
    ): ValidationStatus!
  }
`

export const resolvers = {
  Build: {
    async screenshotDiffs(build) {
      return build
        .$relatedQuery('screenshotDiffs')
        .leftJoin(
          'screenshots',
          'screenshots.id',
          'screenshot_diffs.baseScreenshotId',
        )
        .orderBy('score', 'desc')
        .orderBy('screenshots.name', 'asc')
    },
    async compareScreenshotBucket(build) {
      return build.$relatedQuery('compareScreenshotBucket')
    },
    async baseScreenshotBucket(build) {
      return build.$relatedQuery('baseScreenshotBucket')
    },
    async repository(build) {
      return build.$relatedQuery('repository')
    },
    async status(build) {
      return build.getStatus({ useValidation: true })
    },
  },
  Query: {
    async build(rootObj, args, context) {
      const build = await Build.query()
        .findById(args.id)
        .eager('repository')

      if (!build) return null

      const repositoryAccessible = await Repository.checkReadPermission(
        build.repository,
        context.user,
      )

      if (!repositoryAccessible) return null

      return build
    },
  },
  Mutation: {
    async setValidationStatus(source, args, context) {
      if (!context.user) {
        throw new APIError('Invalid user identification')
      }

      const { buildId, validationStatus } = args
      const user = await Build.getUsers(buildId).findById(context.user.id)

      if (!user) {
        throw new APIError('Invalid user authorization')
      }

      await ScreenshotDiff.query()
        .where({ buildId })
        .patch({ validationStatus })

      // That might be better suited into a $afterUpdate hook.
      if (validationStatus === VALIDATION_STATUSES.accepted) {
        await pushBuildNotification({
          buildId,
          type: 'diff-accepted',
        })
      } else if (validationStatus === VALIDATION_STATUSES.rejected) {
        await pushBuildNotification({
          buildId,
          type: 'diff-rejected',
        })
      }

      return validationStatus
    },
  },
}

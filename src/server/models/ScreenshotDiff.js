import { ValidationError } from 'objection'
import BaseModel, { mergeSchemas } from 'server/models/BaseModel'
import jobModelSchema from 'server/models/schemas/jobModelSchema'
import { VALIDATION_STATUSES } from 'server/constants'

export default class ScreenshotDiff extends BaseModel {
  static tableName = 'screenshot_diffs'

  static jsonSchema = mergeSchemas(BaseModel.jsonSchema, jobModelSchema, {
    required: [
      'buildId',
      'baseScreenshotId',
      'compareScreenshotId',
      'validationStatus',
    ],
    properties: {
      buildId: { type: 'string' },
      baseScreenshotId: { type: ['string', null] },
      compareScreenshotId: { type: 'string' },
      s3Id: { type: ['string', null] },
      score: {
        type: 'number',
        minimum: 0,
        maximum: 1,
      },
      validationStatus: {
        type: 'string',
        enum: [
          VALIDATION_STATUSES.unknown,
          VALIDATION_STATUSES.accepted,
          VALIDATION_STATUSES.rejected,
        ],
      },
    },
  })

  static relationMappings = {
    build: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Build',
      join: {
        from: 'screenshot_diffs.buildId',
        to: 'builds.id',
      },
    },
    baseScreenshot: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Screenshot',
      join: {
        from: 'screenshot_diffs.baseScreenshotId',
        to: 'screenshots.id',
      },
    },
    compareScreenshot: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Screenshot',
      join: {
        from: 'screenshot_diffs.compareScreenshotId',
        to: 'screenshots.id',
      },
    },
  }

  $parseDatabaseJson(json) {
    const newJson = super.$parseDatabaseJson(json)

    if (typeof newJson.score === 'string') {
      newJson.score = Number(newJson.score)
    }

    return newJson
  }

  // eslint-disable-next-line class-methods-use-this
  $afterValidate(json) {
    if (
      json.baseScreenshotId &&
      json.baseScreenshotId === json.compareScreenshotId
    ) {
      throw new ValidationError({
        type: ValidationError.Type.ModelValidation,
        message: 'The base screenshot should be different to the compare one.',
      })
    }
  }
}

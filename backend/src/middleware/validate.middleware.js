import ApiError from '../utils/ApiError.js';

/**
 * Validates request body/query/params against a Zod schema
 * @param {ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ApiError(400, 'Validation failed', errors));
    }
    req[source] = result.data;
    next();
  };
};

export default validate;

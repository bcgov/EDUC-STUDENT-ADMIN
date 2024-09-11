const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    }, {
      stripUnknown: false
    });
    next();
  } catch (e) {
    return res.status(400).send(e.message);
  }
};

module.exports = validate;

const sendResponse = (res, data) => {
  const statusCode = data.statusCode || 200;
  return res.status(statusCode).send({
    success: data.success ?? true,
    message: data.message || null,
    data: data.data !== undefined ? data.data : data.result,
  });
};

module.exports = sendResponse;

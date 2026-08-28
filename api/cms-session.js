const { isAuthenticated, json } = require('../lib/cms');

module.exports = (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' });
  return json(res, 200, { authenticated: isAuthenticated(req) });
};

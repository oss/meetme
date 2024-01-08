const { valid_netid, getinfo_from_netid } = require('../util/LDAP_utils');
const express = require('express');
const router = express.Router();

//dev endpoint only
router.get('/ldap/:netid', async function (req, res) {
  const netid = req.params.netid;
  let x = await valid_netid(netid);
  let y = await getinfo_from_netid(netid);

  res.json({
    Status: 'ok',
    is_valid: x,
    user_data: y,
  });

  console.log('x: ' + x);
  console.log('y: ' + y);
});

module.exports = router;

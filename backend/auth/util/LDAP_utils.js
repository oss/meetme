const LDAP = require('ldapjs');
const User_schema = require('../../user/user_schema');

async function valid_netid(netid) {
  if (!(/^[a-zA-Z0-9]+$/.test(netid)))return false;
  if ((await User_schema.findOne({ _id: netid })) !== null) return true;
  return (await getinfo_from_netid(netid)) !== null;
}

async function getinfo_from_netid(netid) {
  return new Promise((resolve, reject) => {
    const opts = {
      filter: `(uid=${netid})`,
      attributes: ['uid', 'sn', 'givenName'],
      scope: 'sub',
    };

    const client = LDAP.createClient({
      url: 'ldap://openldap:1389',
    });

    let data = null;

    client.bind(
      'cn=admin,dc=example,dc=org',
      'adminpassword',
      async function (err) {
        client.search('dc=example,dc=org', opts, (err, res) => {
          if (err) {
            console.log(JSON.stringify(err));
            return reject(err);
          }
          res.on('searchEntry', (entry) => {
            const attribute_obj = {};
            entry.attributes.forEach((entry) => {
              attribute_obj[entry.type] = entry.values[0];
            });
            return resolve(attribute_obj);
          });
          res.on('end', (result) => {
            client.unbind();
            return resolve(null);
          });
        });
      }
    );
  });
}

module.exports = { valid_netid, getinfo_from_netid };

/*
conn=1000 op=0 BIND dn="cn=admin,dc=example,dc=org" method=128
conn=1000 op=0 BIND dn="cn=admin,dc=example,dc=org" method=128
conn=1000 op=0 BIND dn="cn=admin,dc=example,dc=org" mech=SIMPLE bind_ssf=0 ssf=0
conn=1000 op=0 RESULT tag=97 err=0 qtime=0.003531 etime=0.091855 text=
conn=1000 op=1 SRCH base="dc=example,dc=org" scope=2 deref=0 filter="(uid=user1)"
conn=1000 op=1 SEARCH RESULT tag=101 err=0 qtime=0.001249 etime=0.020108 nentries=0 text=

conn=1001 op=0 BIND dn="cn=admin,dc=example,dc=org" method=128
conn=1001 op=0 BIND dn="cn=admin,dc=example,dc=org" mech=SIMPLE bind_ssf=0 ssf=0
conn=1001 op=0 RESULT tag=97 err=0 qtime=0.000409 etime=0.007689 text=
conn=1001 op=1 SRCH base="dc=example,dc=org" scope=2 deref=0 filter="(uid=netid1)"
conn=1001 op=1 SEARCH RESULT tag=101 err=0 qtime=0.000065 etime=0.024480 nentries=1 text=
*/

/*
entry: {"messageId":2,"protocolOp":100,"type":"SearchResultEntry","objectName":"cn=netid3,ou=users,dc=example,dc=org","attributes":[{"type":"sn","values":["Last3"]},{"type":"givenName","values":["First3"]},{"type":"uid","values":["netid3"]}],"controls":[]}
*/

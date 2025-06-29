const { LDAP, SEARCH_SCOPES, TLS_CHECK } = require('cjsldap');
const User_schema = require('../../user/user_schema');
const config = require('#config');
const fs = require('fs');

async function valid_netid(netid) {
    if (!(/^[a-zA-Z0-9]+$/.test(netid)))return false;
    if ((await User_schema.findOne({ _id: netid })) !== null) return true;
    return (await getinfo_from_netid(netid)) !== null;
}

async function getinfo_from_netid(netid) {
    const client = new LDAP({ uri: config.ldap.uri });
    const bind = await client.bind({
        dn: config.ldap.bind_dn ,
        password: fs.readFileSync(config.ldap.password_file, 'utf8')
    });

    const search_req = await client.search({
        filter: `uid=${netid}`,
        scope: SEARCH_SCOPES[config.ldap.scope],
        base: config.ldap.base,
        attributes: ["dn","sn","givenName","uid"]
    });

    const search = search_req.toObject();
    const close = await client.close();
    const ldap_dn_string = `uid=${netid},${config.ldap.base}`;
    if ( search[ldap_dn_string] === undefined)
        return null;

    const usr_obj_to_return = {};

    for(const attribute in search[ldap_dn_string] ){
        // all of the stuff we get from ldap are single elements
        // if we deal with stuff with multiple values (like roles), then have to upgrade
        usr_obj_to_return[attribute] = search[ldap_dn_string][attribute][0]; 
    }

    return usr_obj_to_return;
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

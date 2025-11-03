const { Client } = require('ldapts');
const User_schema = require('../../user/user_schema');
const config = require('#config');
const fs = require('fs');
const { traceLogger, _baseLogger } = require('#logger');

async function valid_netid(netid) {
    if (!(/^[a-zA-Z0-9]+$/.test(netid)))return false;
    if ((await User_schema.findOne({ _id: netid })) !== null) return true;
    return (await getinfo_from_netid(netid)) !== null;
}

async function getInfoFromNetID(netid) {
    const client = new Client({ url: config.ldap.uri });
    await client.bind(
	config.ldap.bind_dn,
	fs.readFileSync(config.ldap.password_file, 'utf8')
    );
    console.log("created client");

    console.log("searching entries");
    const { entries, references } = await client.search(config.ldap.base, {
	scope: "sub",
	filter: `(uid=${netid})`,
	attributes: ["dn","sn","givenName","uid"]
    });

    await client.unbind();
    console.log("unbound client");
    const ldap_dn_string = `uid=${netid},${config.ldap.base}`;
    // if (entries[ldap_dn_string] === undefined)
    //     return null;

    const usr_obj_to_return = {};

    for(const attribute in entries[0].attributes){
        // all of the stuff we get from ldap are single elements
        // if we deal with stuff with multiple values (like roles), then have to upgrade
        // usr_obj_to_return[attribute] = search[ldap_dn_string][attribute][0]; 
	usr_obj_to_return[attribute.type] = attribute.values[0]; 
	console.log(attribute.values[0]);
    }

    return usr_obj_to_return;
}

module.exports = { valid_netid, getInfoFromNetID };

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

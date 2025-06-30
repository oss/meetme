const User_schema = require('../user/user_schema');
const { getinfo_from_netid } = require('../auth/util/LDAP_utils');

// type validation stuff
const primitive = Object.freeze({
    undefined: Symbol('undefined'),
    null: Symbol("null"),
    bool: Symbol('boolean'),
    number: Symbol('number'),
    bigint: Symbol('bigint'),
    string: Symbol('string'),
    symbol: Symbol('symbol'),
    function: Symbol('function'),
    object: Symbol('object')
});

function is_type(target, desired_type){

    // typeof null === 'object' bug
    if(target === null)
        return desired_type === primitive.null;

    return (primitive[typeof target] === desired_type);
}

function assert_type(target, desired_type){
    if ( !is_type(target,desired_type) )
        throw new Error(`Invalid type; got ${typeof target}, expected ${desired_type.description}`);
}


// netid validation stuff
const check_levels = {
    string: Symbol(),
    database: Symbol(),
    ldap: Symbol()
}
const netid_regex = /^[0-9a-z]+$/;

async function validate_at_level(candidate,check_level){
    switch(check_level){

        case check_levels.string:
            return netid_regex.test(candidate);

        case check_levels.database:
            return await User_schema.exists({ _id: candidate });

        case check_levels.ldap:
            return await getinfo_from_netid(candidate) !== null;

        default: 
            throw new Error('Invalid check level')
    }
}

async function assert_at_level(candidate,check_level){
    if( await validate_at_level(candidate, check_level) ) return;
    
    switch(check_level){
        case check_levels.string:
            throw new Error(`netid ${candidate} is not alpha-numeric`);
        case check_levels.database:
            throw new Error(`netid ${candidate} not found in database`);
        case check_levels.ldap:
            throw new Error(`netid ${candidate} not found in ldap`);
        default: 
            throw new Error('Invalid check level')
    }
}

async function is_valid_netid(candidate){
    if ( ! await validate_at_level(candidate, check_levels.string)   ) return false;
    if (   await validate_at_level(candidate, check_levels.database) ) return true;
    return await validate_at_level(candidate, check_levels.ldap)
}

async function assert_valid_netid(candidate){
    if ( ! await validate_at_level(candidate, check_levels.string)   ) throw new Error(`netid ${candidate} is not alpha-numeric`);
    if (   await validate_at_level(candidate, check_levels.database) ) return;
    if (   await validate_at_level(candidate, check_levels.ldap)     ) throw new Error(`netid ${candidate} not found in ldap`);
}

module.exports = {
    type_check: {
        valid_primitives: primitive,
        validate: is_type,
        assert: assert_type        
    },
    netid_check: {
        scope: check_levels,
        validate_at_level: validate_at_level,
        assert_at_level: assert_at_level,
        validate: is_valid_netid,
        assert: assert_valid_netid
    }
};
const UserSchema = require('../user/user_schema');
const { getInfoFromNetID } = require('../auth/util/LDAP_utils');

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

function isType(target, desiredType){

    // typeof null === 'object' bug
    if(target === null)
        return desiredType === primitive.null;

    return (primitive[typeof target] === desiredType);
}

function assertType(target, desiredType){
    if ( !isType(target,desiredType) )
        throw new Error(`Invalid type; got ${typeof target}, expected ${desiredType.description}`);
}


// netid validation stuff
const checkLevels = {
    string: Symbol(),
    database: Symbol(),
    ldap: Symbol()
};
const netIDregex = /^[0-9a-z]+$/;

async function validateAtLevel(candidate,checkLevel){
    switch(checkLevel){

    case checkLevels.string:
        return netIDregex.test(candidate);

    case checkLevels.database:
        return await UserSchema.exists({ _id: candidate });

    case checkLevels.ldap:
        return await getInfoFromNetID(candidate) !== null;

    default: 
        throw new Error('Invalid check level');
    }
}

async function assertAtLevel(candidate,checkLevel){
    if( await validateAtLevel(candidate, checkLevel) ) return;
    
    switch(checkLevel){
    case checkLevels.string:
        throw new Error(`netid ${candidate} is not alpha-numeric`);
    case checkLevels.database:
        throw new Error(`netid ${candidate} not found in database`);
    case checkLevels.ldap:
        throw new Error(`netid ${candidate} not found in ldap`);
    default: 
        throw new Error('Invalid check level');
    }
}

async function isValidNetid(candidate){
    if ( ! await validateAtLevel(candidate, checkLevels.string)   ) return false;
    if (   await validateAtLevel(candidate, checkLevels.database) ) return true;
    return await validateAtLevel(candidate, checkLevels.ldap);
}

async function assertValidNetid(candidate){
    if ( ! await validateAtLevel(candidate, checkLevels.string)   ) throw new Error(`netid ${candidate} is not alpha-numeric`);
    if (   await validateAtLevel(candidate, checkLevels.database) ) return;
    if (   await validateAtLevel(candidate, checkLevels.ldap)     ) throw new Error(`netid ${candidate} not found in ldap`);
}

module.exports = {
    typeCheck: {
        validPrimitives: primitive,
        validate: isType,
        assert: assertType
    },
    netidCheck: {
        scope: checkLevels,
        validateAtLevel: validateAtLevel,
        assertAtLevel: assertAtLevel,
        validate: isValidNetid,
        assert: assertValidNetid
    }
};
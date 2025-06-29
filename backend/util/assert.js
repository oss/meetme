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

const netid_regex = /^[0-9a-z]+$/;
function is_valid_netid(candidate){
    return netid_regex.test(candidate);
}

function assert_valid_netid(candidate){
    if( !is_valid_netid(candidate) )
        throw new Error(`Invalid netid; ${candidate} is not alpha-numeric`);
}


module.exports = {
    type_check: {
        valid_primitives: primitive,
        validate: is_type,
        assert: assert_type        
    },
    netid_check: {
        validate: is_valid_netid,
        assert: assert_valid_netid
    }
};
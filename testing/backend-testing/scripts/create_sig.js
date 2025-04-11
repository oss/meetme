Keygrip = require("keygrip")

new_keygrip_session=new Keygrip(['secret1',"secret2"],'sha512')
//session=eyJwYXNzcG9ydCI6eyJ1c2VyIjp7InVpZCI6Im5ldGlkMSIsImZpcnN0TmFtZSI6IkZpcnN0MSIsImxhc3ROYW1lIjoiTGFzdDEifX0sInRpbWUiOjE3MDY5Mzk2M30=
console.log(new_keygrip_session.sign(process.argv[2]))
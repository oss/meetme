BROWSERSLIST_IGNORE_OLD_DATA=1 mongosh --norc --quiet --eval 'db.createCollection("calendar_main")' meetme
BROWSERSLIST_IGNORE_OLD_DATA=1 mongosh --norc --quiet --eval 'db.createCollection("calendar_meta")' meetme
BROWSERSLIST_IGNORE_OLD_DATA=1 mongosh --norc --quiet --eval 'db.createCollection("users")' meetme
BROWSERSLIST_IGNORE_OLD_DATA=1 mongosh --norc --quiet --eval 'db.createCollection("organizations")' meetme
BROWSERSLIST_IGNORE_OLD_DATA=1 mongosh --norc --quiet --eval 'db.createCollection("google_state")' meetme
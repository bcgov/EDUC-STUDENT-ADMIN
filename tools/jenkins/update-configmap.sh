envValue=$1
APP_NAME=$2
PEN_NAMESPACE=$3
COMMON_NAMESPACE=$4
EDX_NAMESPACE=$5
APP_NAME_UPPER=${APP_NAME^^}

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
SOAM_KC=soam-$envValue.apps.silver.devops.gov.bc.ca
siteMinderLogoutUrl=""
if [ "$envValue" != "prod" ]; then
  siteMinderLogoutUrl="https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
else
  siteMinderLogoutUrl="https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
fi
NATS_CLUSTER=educ_nats_cluster
NATS_URL="nats://nats.${COMMON_NAMESPACE}-${envValue}.svc.cluster.local:4222"
SOAM_KC_LOAD_USER_ADMIN=$(oc -n $COMMON_NAMESPACE-$envValue -o json get secret sso-admin-${envValue} | sed -n 's/.*"username": "\(.*\)"/\1/p' | base64 --decode)
SOAM_KC_LOAD_USER_PASS=$(oc -n $COMMON_NAMESPACE-$envValue -o json get secret sso-admin-${envValue} | sed -n 's/.*"password": "\(.*\)",/\1/p' | base64 --decode)
SPLUNK_TOKEN=$(oc -n $PEN_NAMESPACE-$envValue -o json get configmaps ${APP_NAME}-${envValue}-setup-config | sed -n "s/.*\"SPLUNK_TOKEN_${APP_NAME_UPPER}\": \"\(.*\)\"/\1/p")
SERVER_FRONTEND="student-admin-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca"

echo Fetching SOAM token
TKN=$(curl -s \
  -d "client_id=admin-cli" \
  -d "username=$SOAM_KC_LOAD_USER_ADMIN" \
  -d "password=$SOAM_KC_LOAD_USER_PASS" \
  -d "grant_type=password" \
  "https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/protocol/openid-connect/token" | jq -r '.access_token')

echo
echo Creating STUDENT_ADMIN role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_ADMIN\",\"description\" : \"Allows access to staff site\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating STUDENT_ADMIN_READ_ONLY role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_ADMIN_READ_ONLY\",\"description\" : \"Allows read access to staff site\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating STUDENT_SEARCH_ADMIN role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_SEARCH_ADMIN\",\"description\" : \"Allows staff to search students\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

  echo
echo Creating STUDENT_SEARCH_READ_ONLY role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_SEARCH_READ_ONLY\",\"description\" : \"Allows staff to search students without being able to perform actions on students\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating STUDENT_ADMIN_ADMINISTRATOR role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_ADMIN_ADMINISTRATOR\",\"description\" : \"Allows staff administration\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"


echo
echo Creating STUDENT_PROFILE_ADMIN role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_PROFILE_ADMIN\",\"description\" : \"Allows access to staff site as Admin for UMP \",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating STUDENT_PROFILE_READ_ONLY role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_PROFILE_READ_ONLY\",\"description\" : \"Allows read access to staff site read only for UMP\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating PEN_REQUEST_BATCH_ADMIN role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"PEN_REQUEST_BATCH_ADMIN\",\"description\" : \"Allows access to PEN Request Batches\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating NOMINAL_ROLL role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"NOMINAL_ROLL\",\"description\" : \"Allows access to Nominal Roll\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating NOMINAL_ROLL_EDIT role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"NOMINAL_ROLL_EDIT\",\"description\" : \"Allows access to edit Nominal Roll errors\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating NOMINAL_ROLL_READ_ONLY role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"NOMINAL_ROLL_READ_ONLY\",\"description\" : \"Allows access to view Nominal Roll\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"


echo
echo Creating STUDENT_ANALYTICS_STUDENT_PROFILE role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_ANALYTICS_STUDENT_PROFILE\",\"description\" : \"Allows access to GMP and UMP Analytics\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating STUDENT_ANALYTICS_BATCH role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"STUDENT_ANALYTICS_BATCH\",\"description\" : \"Allows access to Pen Request Batch Analytics\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating SECURE_EXCHANGE role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"SECURE_EXCHANGE\",\"description\" : \"Allows access to Pen Secure Exchange Messaging\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating PEN_TEAM_ROLE role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"PEN_TEAM_ROLE\",\"description\" : \"PEN team role for Secure Messaging\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Creating EDX_ADMIN role
curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  -d "{\"name\" : \"EDX_ADMIN\",\"description\" : \"Allows access to EDX administration\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo
echo Retrieving client ID for student-admin-soam
studentAdminClientID=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq '.[] | select(.clientId=="student-admin-soam")' | jq -r '.id')

echo
echo Retrieving client secret for student-admin-soam
studentAdminClientSecret=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$studentAdminClientID/client-secret" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.value')

echo
echo Removing student-admin-soam if exists
curl -sX DELETE "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$studentAdminClientID" \
  -H "Authorization: Bearer $TKN"

if [[ "$studentAdminClientSecret" != "" && ("$envValue" = "tools" || "$envValue" = "dev") ]]; then
  echo
  echo Creating client student-admin-soam with secret
  curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TKN" \
    -d "{ \"clientId\" : \"student-admin-soam\",\"secret\" : \"$studentAdminClientSecret\", \"name\" : \"Student Admin SOAM\", \"description\" : \"Student admin user which logs into SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"http://localhost*\", \"https://$SERVER_FRONTEND/api/auth/callback\",\"https://$SERVER_FRONTEND/logout\",\"https://$SERVER_FRONTEND/session-expired\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"IDIR Username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_username\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_username\", \"jsonType.label\" : \"String\" } },{ \"name\" : \"IDIR GUID\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_guid\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_guid\", \"jsonType.label\" : \"String\" } }, { \"name\" : \"Display Name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"display_name\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"display_name\", \"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"SEND_PEN_REQUEST_EMAIL\", \"WRITE_PEN_REQUEST\", \"profile\", \"roles\", \"email\", \"READ_PEN_REQUEST\", \"READ_PEN_REQUEST_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"WRITE_DIGITALID\", \"READ_DIGITALID\", \"WRITE_STUDENT\", \"READ_STUDENT\", \"READ_STUDENT_CODES\", \"READ_DIGITALID_CODETABLE\", \"READ_DOCUMENT\", \"READ_DOCUMENT_TYPES\", \"WRITE_DOCUMENT\", \"READ_STUDENT_PROFILE\", \"WRITE_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_STUDENT_PROFILE_CODES\", \"SEND_STUDENT_PROFILE_EMAIL\",\"PEN_REQUEST_UNLINK_SAGA\",\"PEN_REQUEST_REJECT_SAGA\",\"READ_SECURE_EXCHANGE_DOCUMENT_REQUIREMENTS\", \"PEN_REQUEST_RETURN_SAGA\",\"PEN_REQUEST_COMPLETE_SAGA\",\"STUDENT_PROFILE_COMPLETE_SAGA\",\"STUDENT_PROFILE_REJECT_SAGA\",\"STUDENT_PROFILE_RETURN_SAGA\", \"READ_PEN_REQUEST_BATCH\", \"READ_PEN_MATCH\", \"WRITE_PEN_REQUEST_BATCH\", \"STUDENT_PROFILE_READ_SAGA\", \"GET_NEXT_PEN_NUMBER\", \"VALIDATE_STUDENT_DEMOGRAPHICS\",\"PEN_REQUEST_BATCH_NEW_PEN_SAGA\",\"PEN_REQUEST_BATCH_USER_MATCH_SAGA\",\"PEN_REQUEST_BATCH_READ_SAGA\", \"READ_VALIDATION_CODES\", \"READ_STUDENT_HISTORY\", \"READ_NICKNAMES\", \"READ_SCHOOL\", \"READ_PEN_TRAX\", \"READ_SLD_STUDENT\",\"WRITE_POSSIBLE_MATCH\",\"DELETE_POSSIBLE_MATCH\",\"READ_POSSIBLE_MATCH\",\"READ_STUDENT_MERGE\" ,\"WRITE_STUDENT_MERGE\",\"READ_STUDENT_MERGE_CODES\",\"STUDENT_MERGE_COMPLETE_SAGA\",\"STUDENT_DEMERGE_COMPLETE_SAGA\",\"PEN_SERVICES_READ_SAGA\",\"READ_PEN_REQUEST_BATCH_BLOB\",\"STUDENT_SPLIT_PEN_SAGA\", \"PEN_REQUEST_BATCH_ARCHIVE_SAGA\", \"PEN_REQUEST_BATCH_REPOST_SAGA\", \"READ_PEN_COORDINATOR\", \"WRITE_PEN_COORDINATOR\", \"READ_PEN_MACRO\", \"WRITE_PEN_MACRO\", \"MACRO_READ_SAGA\",\"READ_PEN_REQUEST_STATS\", \"READ_STUDENT_PROFILE_STATS\", \"STUDENT_MOVE_SLD_SAGA\", \"NOMINAL_ROLL_READ_STUDENT\", \"NOMINAL_ROLL_WRITE_STUDENT\", \"NOMINAL_ROLL_DELETE_STUDENT\", \"NOMINAL_ROLL_UPLOAD_FILE\", \"NOMINAL_ROLL_VALIDATE\", \"NOMINAL_ROLL_POST_DATA_SAGA\", \"NOMINAL_ROLL_READ_SAGA\", \"READ_FED_PROV_CODE\", \"WRITE_FED_PROV_CODE\", \"NOMINAL_ROLL_CREATE_FED_PROV\", \"READ_SECURE_EXCHANGE\", \"WRITE_SECURE_EXCHANGE\", \"READ_SECURE_EXCHANGE_DOCUMENT\", \"WRITE_SECURE_EXCHANGE_DOCUMENT\", \"DELETE_SECURE_EXCHANGE_DOCUMENT\", \"READ_SECURE_EXCHANGE_CODES\", \"READ_SECURE_EXCHANGE_DOCUMENT_TYPES\", \"READ_SECURE_EXCHANGE_STATUSES\", \"READ_MINISTRY_TEAMS\", \"READ_EDX_USER_SCHOOLS\", \"DELETE_SECURE_EXCHANGE\", \"READ_EDX_USERS\", \"READ_PRIMARY_ACTIVATION_CODE\", \"WRITE_EDX_USER_SCHOOL\", \"WRITE_PRIMARY_ACTIVATION_CODE\", \"SCHOOL_USER_ACTIVATION_INVITE_SAGA\"], \"optionalClientScopes\" : [ \"address\", \"phone\" ], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true } }"
else
  echo
  echo Creating client student-admin-soam without secret
  curl -sX POST "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TKN" \
    -d "{ \"clientId\" : \"student-admin-soam\", \"name\" : \"Student Admin SOAM\", \"description\" : \"Student admin user which logs into SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"https://$SERVER_FRONTEND/api/auth/callback\",\"https://$SERVER_FRONTEND/logout\",\"https://$SERVER_FRONTEND/session-expired\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"IDIR Username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_username\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_username\", \"jsonType.label\" : \"String\" } },{ \"name\" : \"IDIR GUID\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_guid\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_guid\", \"jsonType.label\" : \"String\" } }, { \"name\" : \"Display Name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"display_name\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"display_name\", \"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"SEND_PEN_REQUEST_EMAIL\", \"WRITE_PEN_REQUEST\", \"profile\", \"roles\", \"email\", \"READ_PEN_REQUEST\", \"READ_PEN_REQUEST_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"WRITE_DIGITALID\", \"READ_DIGITALID\", \"WRITE_STUDENT\", \"READ_STUDENT\", \"READ_STUDENT_CODES\", \"READ_DIGITALID_CODETABLE\", \"READ_DOCUMENT\", \"READ_DOCUMENT_TYPES\", \"WRITE_DOCUMENT\", \"READ_STUDENT_PROFILE\", \"WRITE_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_STUDENT_PROFILE_CODES\", \"SEND_STUDENT_PROFILE_EMAIL\",\"PEN_REQUEST_UNLINK_SAGA\",\"PEN_REQUEST_REJECT_SAGA\",\"PEN_REQUEST_RETURN_SAGA\",\"PEN_REQUEST_COMPLETE_SAGA\",\"STUDENT_PROFILE_COMPLETE_SAGA\",\"READ_SECURE_EXCHANGE_DOCUMENT_REQUIREMENTS\",\"STUDENT_PROFILE_REJECT_SAGA\",\"STUDENT_PROFILE_RETURN_SAGA\", \"READ_PEN_REQUEST_BATCH\", \"READ_PEN_MATCH\", \"WRITE_PEN_REQUEST_BATCH\", \"STUDENT_PROFILE_READ_SAGA\", \"GET_NEXT_PEN_NUMBER\", \"VALIDATE_STUDENT_DEMOGRAPHICS\",\"PEN_REQUEST_BATCH_NEW_PEN_SAGA\",\"PEN_REQUEST_BATCH_USER_MATCH_SAGA\",\"PEN_REQUEST_BATCH_READ_SAGA\", \"READ_VALIDATION_CODES\", \"READ_STUDENT_HISTORY\", \"READ_NICKNAMES\", \"READ_SCHOOL\", \"READ_PEN_TRAX\", \"READ_SLD_STUDENT\",\"WRITE_POSSIBLE_MATCH\",\"DELETE_POSSIBLE_MATCH\",\"READ_POSSIBLE_MATCH\",\"READ_STUDENT_MERGE\" ,\"WRITE_STUDENT_MERGE\",\"READ_STUDENT_MERGE_CODES\",\"STUDENT_MERGE_COMPLETE_SAGA\",\"STUDENT_DEMERGE_COMPLETE_SAGA\",\"PEN_SERVICES_READ_SAGA\",\"READ_PEN_REQUEST_BATCH_BLOB\",\"STUDENT_SPLIT_PEN_SAGA\", \"PEN_REQUEST_BATCH_ARCHIVE_SAGA\", \"PEN_REQUEST_BATCH_REPOST_SAGA\", \"READ_PEN_COORDINATOR\", \"WRITE_PEN_COORDINATOR\", \"READ_PEN_MACRO\", \"WRITE_PEN_MACRO\", \"MACRO_READ_SAGA\",\"READ_PEN_REQUEST_STATS\", \"READ_STUDENT_PROFILE_STATS\", \"STUDENT_MOVE_SLD_SAGA\", \"NOMINAL_ROLL_READ_STUDENT\", \"NOMINAL_ROLL_WRITE_STUDENT\", \"NOMINAL_ROLL_DELETE_STUDENT\", \"NOMINAL_ROLL_UPLOAD_FILE\", \"NOMINAL_ROLL_VALIDATE\", \"NOMINAL_ROLL_POST_DATA_SAGA\", \"NOMINAL_ROLL_READ_SAGA\", \"READ_FED_PROV_CODE\", \"WRITE_FED_PROV_CODE\", \"NOMINAL_ROLL_CREATE_FED_PROV\", \"READ_SECURE_EXCHANGE\", \"WRITE_SECURE_EXCHANGE\", \"READ_SECURE_EXCHANGE_DOCUMENT\", \"WRITE_SECURE_EXCHANGE_DOCUMENT\", \"DELETE_SECURE_EXCHANGE_DOCUMENT\", \"READ_SECURE_EXCHANGE_CODES\", \"READ_SECURE_EXCHANGE_DOCUMENT_TYPES\", \"READ_SECURE_EXCHANGE_STATUSES\", \"READ_MINISTRY_TEAMS\", \"READ_EDX_USER_SCHOOLS\", \"DELETE_SECURE_EXCHANGE\", \"READ_EDX_USERS\", \"READ_PRIMARY_ACTIVATION_CODE\", \"WRITE_PRIMARY_ACTIVATION_CODE\", \"WRITE_EDX_USER_SCHOOL\", \"SCHOOL_USER_ACTIVATION_INVITE_SAGA\"], \"optionalClientScopes\" : [ \"address\", \"phone\" ], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true } }"
fi

echo Fetching public key from SOAM
fullKey=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.keys | .[] | select(has("publicKey")) | .publicKey')

soamFullPublicKey="-----BEGIN PUBLIC KEY----- $fullKey -----END PUBLIC KEY-----"
newline=$'\n'
formattedPublicKey="${soamFullPublicKey:0:26}${newline}${soamFullPublicKey:27:64}${newline}${soamFullPublicKey:91:64}${newline}${soamFullPublicKey:155:64}${newline}${soamFullPublicKey:219:64}${newline}${soamFullPublicKey:283:64}${newline}${soamFullPublicKey:347:64}${newline}${soamFullPublicKey:411:9}${newline}${soamFullPublicKey:420}"

###########################################################
#Setup for student-admin-backend-config-map
###########################################################
echo
echo Retrieving client ID for student-admin-soam
studentAdminClientID=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq '.[] | select(.clientId=="student-admin-soam")' | jq -r '.id')

echo
echo Retrieving client secret for student-admin-soam
studentAdminClientSecret=$(curl -sX GET "https://$SOAM_KC/auth/admin/realms/$SOAM_KC_REALM_ID/clients/$studentAdminClientID/client-secret" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TKN" \
  | jq -r '.value')


echo Generating private and public keys
ssh-keygen -b 4096 -t rsa -f tempStudentAdminBackendkey -q -N ""
UI_PRIVATE_KEY_VAL="$(cat tempStudentAdminBackendkey)"
UI_PUBLIC_KEY_VAL="$(ssh-keygen -f tempStudentAdminBackendkey -e -m pem)"
echo Removing key files
rm tempStudentAdminBackendkey
rm tempStudentAdminBackendkey.pub

sessionMaxAge="1800000"
tokenExpiresIn="30m"
if [ "$envValue" == "test" ]; then
  sessionMaxAge="3600000"
  tokenExpiresIn="60m"
fi

bannerEnvironment=""
bannerColor=""
SCHEDULER_CRON_DOC_TYPE_MIGRATION=""
ENABLE_PRR_STUDENT_DEMOGRAPHICS="true"
BACKEND_ROOT=$APP_NAME-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca

if [ "$envValue" = "dev" ]; then
  bannerEnvironment="DEV"
  bannerColor="#8d28d7"
  SCHEDULER_CRON_DOC_TYPE_MIGRATION="0 0 0 * * *"
elif [ "$envValue" = "test" ]; then
  bannerEnvironment="TEST"
  bannerColor="#58fe01"
  SCHEDULER_CRON_DOC_TYPE_MIGRATION="0 0 0 * * *"
else
  SCHEDULER_CRON_DOC_TYPE_MIGRATION="0 0 0 17 9 *"
fi

echo Creating config map $APP_NAME-backend-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-backend-config-map --from-literal=TZ=$TZVALUE --from-literal=UI_PRIVATE_KEY="$UI_PRIVATE_KEY_VAL" --from-literal=SITEMINDER_LOGOUT_ENDPOINT="$siteMinderLogoutUrl" --from-literal=UI_PUBLIC_KEY="$UI_PUBLIC_KEY_VAL" --from-literal=ID=$APP_NAME-soam --from-literal=SECRET=$studentAdminClientSecret --from-literal=SERVER_FRONTEND=https://$SERVER_FRONTEND --from-literal=ISSUER=STUDENT_ADMIN_APPLICATION --from-literal=SOAM_PUBLIC_KEY="$formattedPublicKey" --from-literal=PEN_REQUEST_EMAIL_API_URL="http://student-profile-email-api-master.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/gmp" --from-literal=PEN_REQUEST_API_URL="http://pen-request-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/pen-request" --from-literal=DISCOVERY=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/.well-known/openid-configuration --from-literal=KC_DOMAIN=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID --from-literal=PEN_DEMOGRAPHICS_URL="http://pen-demographics-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080" --from-literal=DIGITAL_ID_URL="http://digitalid-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/digital-id" --from-literal=STUDENT_API_URL="http://student-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/student" --from-literal=LOG_LEVEL=info --from-literal=IDIR_IDP_HINT=keycloak_bcdevexchange_idir --from-literal=REDIS_HOST=redis --from-literal=REDIS_PORT=6379 --from-literal=STUDENT_PROFILE_API_URL="http://student-profile-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/student-profile" --from-literal=SCHOOL_API_URL="http://school-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1" --from-literal=STUDENT_PROFILE_EMAIL_API_URL="http://student-profile-email-api-master.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/ump" --from-literal=PROFILE_REQUEST_SAGA_API_URL="http://student-profile-saga-api-master.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/student-profile-saga" --from-literal=NATS_URL="$NATS_URL" --from-literal=NATS_CLUSTER="$NATS_CLUSTER" --from-literal=UMP_ROLES="STUDENT_PROFILE_ADMIN,STUDENT_PROFILE_READ_ONLY" --from-literal=GMP_ROLES="STUDENT_ADMIN,STUDENT_ADMIN_READ_ONLY" --from-literal=STUDENT_SEARCH_ADMIN="STUDENT_SEARCH_ADMIN" --from-literal=STUDENT_SEARCH_ROLES="STUDENT_SEARCH_ADMIN,STUDENT_SEARCH_READ_ONLY" --from-literal=STUDENT_ADMIN_ADMINISTRATOR="STUDENT_ADMIN_ADMINISTRATOR" --from-literal=UMP_ROLE_ADMIN="STUDENT_PROFILE_ADMIN" --from-literal=GMP_ROLE_ADMIN="STUDENT_ADMIN" --from-literal=PEN_REQUEST_BATCH_ADMIN="PEN_REQUEST_BATCH_ADMIN" --from-literal=EDX_ADMIN="EDX_ADMIN" --from-literal=PEN_REQUEST_BATCH_API_URL="http://pen-reg-batch-api-master.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1" --from-literal=PEN_MATCH_API_URL="http://pen-match-api-master.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/pen-match" --from-literal=SESSION_MAX_AGE=$sessionMaxAge --from-literal=TOKEN_EXPIRES_IN=$tokenExpiresIn --from-literal=SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS="0/30 * * * * *" --from-literal=MIN_TIME_BEFORE_SAGA_IS_STALE_IN_SECONDS=10 --from-literal=PEN_SERVICES_API_URL="http://pen-services-api-master.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/pen-services" --from-literal=PEN_TRAX_API_URL="http://pen-trax-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1" --from-literal=SLD_API_URL="http://sld-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1" --from-literal=QUEUE_GROUP_NAME="student-admin-node-queue-group" --from-literal=STAN_ENABLED="true" --from-literal=NODE_ENV="openshift" --from-literal=SCHEDULER_CRON_DOC_TYPE_MIGRATION="$SCHEDULER_CRON_DOC_TYPE_MIGRATION" --from-literal=ENABLE_PRR_STUDENT_DEMOGRAPHICS="$ENABLE_PRR_STUDENT_DEMOGRAPHICS" --from-literal=NOMINAL_ROLL="NOMINAL_ROLL_EDIT" --from-literal=MACRO_API_URL="http://macro-api-master.$COMMON_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/macro" --from-literal=NOMINAL_ROLL_API_URL="http://pen-nominal-roll-api-main.$PEN_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/nominal-roll" --from-literal=STUDENT_ANALYTICS_STUDENT_PROFILE="STUDENT_ANALYTICS_STUDENT_PROFILE" --from-literal=STUDENT_ANALYTICS_BATCH="STUDENT_ANALYTICS_BATCH" --from-literal=NOMINAL_ROLL_ROLES="NOMINAL_ROLL,NOMINAL_ROLL_EDIT" --from-literal=EDX_API_URL="http://edx-api-master.$EDX_NAMESPACE-$envValue.svc.cluster.local:8080/api/v1/edx" --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-backend-$SOAM_KC_REALM_ID application
oc -n $PEN_NAMESPACE-$envValue set env --from=configmap/$APP_NAME-backend-config-map dc/$APP_NAME-backend-$SOAM_KC_REALM_ID
###########################################################
#Setup for student-admin-frontend-config-map
###########################################################
vueIdleTimeout="1800000"
if [ "$envValue" == "test" ]; then
  vueIdleTimeout="3600000"
fi

regConfigStaff="var studentAdminConfig = (function() {
  return {
    \"VUE_APP_IDLE_TIMEOUT_IN_MILLIS\" : $vueIdleTimeout,
    \"BANNER_ENVIRONMENT\" : \"$bannerEnvironment\",
    \"BANNER_COLOR\" : \"$bannerColor\",
    \"WEB_SOCKET_URL\":\"wss://$SERVER_FRONTEND/api/socket\"
  };
})();"

echo Creating config map $APP_NAME-frontend-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-frontend-config-map --from-literal=TZ=$TZVALUE --from-literal=HOST_ROUTE=$BACKEND_ROOT --from-literal=BACKEND_ROOT=https://$BACKEND_ROOT --from-literal=config.js="$regConfigStaff" --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-frontend-$SOAM_KC_REALM_ID application
oc -n $PEN_NAMESPACE-$envValue set env --from=configmap/$APP_NAME-frontend-config-map dc/$APP_NAME-frontend-$SOAM_KC_REALM_ID

###########################################################
#Setup for student-admin-flb-sc-config-map
###########################################################
SPLUNK_URL="gww.splunk.educ.gov.bc.ca"
FLB_CONFIG="[SERVICE]
   Flush        1
   Daemon       Off
   Log_Level    debug
   HTTP_Server   On
   HTTP_Listen   0.0.0.0
   Parsers_File parsers.conf
[INPUT]
   Name   tail
   Path   /mnt/log/*
   Exclude_Path *.gz,*.zip
   Parser docker
   Mem_Buf_Limit 20MB
   Buffer_Chunk_Size 5MB
   Buffer_Max_Size 5MB
[FILTER]
   Name record_modifier
   Match *
   Record hostname \${HOSTNAME}
[OUTPUT]
   Name   stdout
   Match  *
[OUTPUT]
   Name  splunk
   Match *
   Host  $SPLUNK_URL
   Port  443
   TLS         On
   TLS.Verify  Off
   Message_Key $APP_NAME
   Splunk_Token $SPLUNK_TOKEN
"
PARSER_CONFIG="
[PARSER]
    Name        docker
    Format      json
"
echo Creating config map $APP_NAME-flb-sc-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-flb-sc-config-map --from-literal=fluent-bit.conf="$FLB_CONFIG" --from-literal=parsers.conf="$PARSER_CONFIG" --dry-run -o yaml | oc apply -f -

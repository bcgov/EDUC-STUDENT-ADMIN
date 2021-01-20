envValue=$1
APP_NAME=$2
PEN_NAMESPACE=$3
COMMON_NAMESPACE=$4
APP_NAME_UPPER=${APP_NAME^^}

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
KCADM_FILE_BIN_FOLDER="/tmp/keycloak-9.0.3/bin"
SOAM_KC=soam-$envValue.apps.silver.devops.gov.bc.ca
siteMinderLogoutUrl=""
if [ "$envValue" != "prod" ]
then
  siteMinderLogoutUrl="https://logontest7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
else
  siteMinderLogoutUrl="https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl="
fi
NATS_CLUSTER=educ_nats_cluster
NATS_URL="nats://nats.${COMMON_NAMESPACE}-${envValue}.svc.cluster.local:4222"
oc project $COMMON_NAMESPACE-$envValue
SOAM_KC_LOAD_USER_ADMIN=$(oc -o json get secret sso-admin-${envValue} | sed -n 's/.*"username": "\(.*\)"/\1/p' | base64 --decode)
SOAM_KC_LOAD_USER_PASS=$(oc -o json get secret sso-admin-${envValue} | sed -n 's/.*"password": "\(.*\)",/\1/p' | base64 --decode)
oc project $PEN_NAMESPACE-$envValue

$KCADM_FILE_BIN_FOLDER/kcadm.sh config credentials --server https://$SOAM_KC/auth --realm $SOAM_KC_REALM_ID --user $SOAM_KC_LOAD_USER_ADMIN --password $SOAM_KC_LOAD_USER_PASS

echo Creating STUDENT_ADMIN role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"STUDENT_ADMIN\",\"description\" : \"Allows access to staff site\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo Creating STUDENT_ADMIN_READ_ONLY role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"STUDENT_ADMIN_READ_ONLY\",\"description\" : \"Allows read access to staff site\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo Creating STUDENT_SEARCH_ADMIN role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"STUDENT_SEARCH_ADMIN\",\"description\" : \"Allows staff to search students\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo Creating STUDENT_PROFILE_ADMIN role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"STUDENT_PROFILE_ADMIN\",\"description\" : \"Allows access to staff site as Admin for UMP \",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo Creating STUDENT_PROFILE_READ_ONLY role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"STUDENT_PROFILE_READ_ONLY\",\"description\" : \"Allows read access to staff site read only for UMP\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

echo Creating PEN_REQUEST_BATCH_ADMIN role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"PEN_REQUEST_BATCH_ADMIN\",\"description\" : \"Allows access to PEN Request Batches\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

getStudentAdminClientID(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients -r $SOAM_KC_REALM_ID --fields 'id,clientId' | grep -B2 '"clientId" : "student-admin-soam"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}

getStudentAdminClientSecret(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients/$studentAdminClientID/client-secret -r $SOAM_KC_REALM_ID | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}

echo Fetching client ID for $APP_NAME-soam client
studentAdminClientID=$(getStudentAdminClientID)

echo Fetching client secret for $APP_NAME-soam client
studentAdminClientSecret=$(getStudentAdminClientSecret)

SERVER_FRONTEND="student-admin-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca"
if [ "$envValue" = "tools" ]
then
  SERVER_FRONTEND="student-admin-$PEN_NAMESPACE-dev.apps.silver.devops.gov.bc.ca"
elif [ "$envValue" = "dev" ]
then
  SERVER_FRONTEND="student-admin-$PEN_NAMESPACE-test.apps.silver.devops.gov.bc.ca"
elif [ "$envValue" = "test" ]
then
  SERVER_FRONTEND="student-admin-$PEN_NAMESPACE-uat.apps.silver.devops.gov.bc.ca"
fi

echo Removing Student Admin client if exists
$KCADM_FILE_BIN_FOLDER/kcadm.sh delete clients/$studentAdminClientID -r $SOAM_KC_REALM_ID

if [ "$studentAdminClientSecret" != "" ] && [ "$envValue" = "tools" ]
then
  echo Creating student-admin-soam Keycloak client with secret
  $KCADM_FILE_BIN_FOLDER/kcadm.sh create clients -r $SOAM_KC_REALM_ID --body "{ \"clientId\" : \"student-admin-soam\", \"name\" : \"Student Admin SOAM\", \"description\" : \"Student admin user which logs into SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"http://localhost*\", \"https://$SERVER_FRONTEND/api/auth/callback\",\"https://$SERVER_FRONTEND/logout\",\"https://$SERVER_FRONTEND/session-expired\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"IDIR Username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_username\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_username\", \"jsonType.label\" : \"String\" } }, { \"name\" : \"Display Name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"display_name\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"display_name\", \"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"SEND_PEN_REQUEST_EMAIL\", \"WRITE_PEN_REQUEST\", \"profile\", \"roles\", \"email\", \"READ_PEN_REQUEST\", \"READ_PEN_REQUEST_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"WRITE_DIGITALID\", \"READ_DIGITALID\", \"WRITE_STUDENT\", \"READ_STUDENT\", \"READ_STUDENT_CODES\", \"READ_DIGITALID_CODETABLE\", \"READ_DOCUMENT\", \"READ_PEN_REQ_MACRO\", \"READ_DOCUMENT_TYPES\", \"WRITE_DOCUMENT\", \"READ_STUDENT_PROFILE\", \"WRITE_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_STUDENT_PROFILE_CODES\", \"READ_STUDENT_PROFILE_MACRO\", \"SEND_STUDENT_PROFILE_EMAIL\",\"PEN_REQUEST_UNLINK_SAGA\",\"PEN_REQUEST_REJECT_SAGA\",\"PEN_REQUEST_RETURN_SAGA\",\"PEN_REQUEST_COMPLETE_SAGA\",\"STUDENT_PROFILE_COMPLETE_SAGA\",\"STUDENT_PROFILE_REJECT_SAGA\",\"STUDENT_PROFILE_RETURN_SAGA\", \"READ_PEN_REQUEST_BATCH\", \"READ_PEN_MATCH\", \"WRITE_PEN_REQUEST_BATCH\", \"STUDENT_PROFILE_READ_SAGA\", \"GET_NEXT_PEN_NUMBER\", \"DELETE_STUDENT\", \"READ_PEN_REQUEST_BATCH_MACRO\",\"VALIDATE_STUDENT_DEMOGRAPHICS\",\"PEN_REQUEST_BATCH_NEW_PEN_SAGA\",\"PEN_REQUEST_BATCH_USER_MATCH_SAGA\",\"PEN_REQUEST_BATCH_READ_SAGA\", \"READ_VALIDATION_CODES\", \"READ_STUDENT_HISTORY\", \"READ_NICKNAMES\", \"READ_SCHOOL\", \"READ_PEN_TRAX\", \"READ_SLD_STUDENT\",\"WRITE_POSSIBLE_MATCH\",\"DELETE_POSSIBLE_MATCH\",\"READ_POSSIBLE_MATCH\",\"READ_STUDENT_MERGE\" ,\"WRITE_STUDENT_MERGE\",\"READ_STUDENT_MERGE_CODES\"], \"optionalClientScopes\" : [ \"address\", \"phone\" ], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true } }"
else
echo Creating student-admin-soam Keycloak client without secret
  $KCADM_FILE_BIN_FOLDER/kcadm.sh create clients -r $SOAM_KC_REALM_ID --body "{ \"clientId\" : \"student-admin-soam\", \"name\" : \"Student Admin SOAM\", \"description\" : \"Student admin user which logs into SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"https://$SERVER_FRONTEND/api/auth/callback\",\"https://$SERVER_FRONTEND/logout\",\"https://$SERVER_FRONTEND/session-expired\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"IDIR Username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_username\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_username\", \"jsonType.label\" : \"String\" } }, { \"name\" : \"Display Name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"display_name\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"display_name\", \"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"SEND_PEN_REQUEST_EMAIL\", \"WRITE_PEN_REQUEST\", \"profile\", \"roles\", \"email\", \"READ_PEN_REQUEST\", \"READ_PEN_REQUEST_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"WRITE_DIGITALID\", \"READ_DIGITALID\", \"WRITE_STUDENT\", \"READ_STUDENT\", \"READ_STUDENT_CODES\", \"READ_DIGITALID_CODETABLE\", \"READ_DOCUMENT\", \"READ_PEN_REQ_MACRO\", \"READ_DOCUMENT_TYPES\", \"WRITE_DOCUMENT\", \"READ_STUDENT_PROFILE\", \"WRITE_STUDENT_PROFILE\", \"READ_DOCUMENT_STUDENT_PROFILE\", \"WRITE_DOCUMENT_STUDENT_PROFILE\", \"READ_DOCUMENT_TYPES_STUDENT_PROFILE\", \"READ_STUDENT_PROFILE_STATUSES\", \"READ_STUDENT_PROFILE_CODES\", \"READ_STUDENT_PROFILE_MACRO\", \"SEND_STUDENT_PROFILE_EMAIL\",\"PEN_REQUEST_UNLINK_SAGA\",\"PEN_REQUEST_REJECT_SAGA\",\"PEN_REQUEST_RETURN_SAGA\",\"PEN_REQUEST_COMPLETE_SAGA\",\"STUDENT_PROFILE_COMPLETE_SAGA\",\"STUDENT_PROFILE_REJECT_SAGA\",\"STUDENT_PROFILE_RETURN_SAGA\", \"READ_PEN_REQUEST_BATCH\", \"READ_PEN_MATCH\", \"WRITE_PEN_REQUEST_BATCH\", \"STUDENT_PROFILE_READ_SAGA\", \"GET_NEXT_PEN_NUMBER\", \"DELETE_STUDENT\", \"READ_PEN_REQUEST_BATCH_MACRO\",\"VALIDATE_STUDENT_DEMOGRAPHICS\",\"PEN_REQUEST_BATCH_NEW_PEN_SAGA\",\"PEN_REQUEST_BATCH_USER_MATCH_SAGA\",\"PEN_REQUEST_BATCH_READ_SAGA\", \"READ_VALIDATION_CODES\", \"READ_STUDENT_HISTORY\", \"READ_NICKNAMES\", \"READ_SCHOOL\", \"READ_PEN_TRAX\", \"READ_SLD_STUDENT\",\"WRITE_POSSIBLE_MATCH\",\"DELETE_POSSIBLE_MATCH\",\"READ_POSSIBLE_MATCH\",\"READ_STUDENT_MERGE\" ,\"WRITE_STUDENT_MERGE\",\"READ_STUDENT_MERGE_CODES\"], \"optionalClientScopes\" : [ \"address\", \"phone\" ], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true } }"
fi


getPublicKey(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get keys -r $SOAM_KC_REALM_ID | grep -Po 'publicKey" : "\K([^"]*)'
}

echo Fetching public key from SOAM
soamFullPublicKey="-----BEGIN PUBLIC KEY----- $(getPublicKey) -----END PUBLIC KEY-----"
newline=$'\n'
formattedPublicKey="${soamFullPublicKey:0:26}${newline}${soamFullPublicKey:27:64}${newline}${soamFullPublicKey:91:64}${newline}${soamFullPublicKey:155:64}${newline}${soamFullPublicKey:219:64}${newline}${soamFullPublicKey:283:64}${newline}${soamFullPublicKey:347:64}${newline}${soamFullPublicKey:411:9}${newline}${soamFullPublicKey:420}"

###########################################################
#Setup for student-admin-backend-config-map
###########################################################
getStudentAdminClientID(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients -r $SOAM_KC_REALM_ID --fields 'id,clientId' | grep -B2 '"clientId" : "student-admin-soam"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}

getOfflineAccessID(){
  offlineAccessScopeID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get client-scopes --fields 'id,name' | grep -B2 '"name" : "offline_access"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}

echo
echo Fetching client ID for $APP_NAME-soam client
studentAdminClientID=$(getStudentAdminClientID)
echo Fetching client secret for $APP_NAME-soam client
studentAdminClientSecret=$(getStudentAdminClientSecret)
echo
echo getting scope id for offline access.
offlineAccessID=$(getOfflineAccessID)

$KCADM_FILE_BIN_FOLDER/kcadm.sh update clients/$studentAdminClientID/default-client-scopes/$offlineAccessID

echo Generating private and public keys
ssh-keygen -b 4096 -t rsa -f tempStudentAdminBackendkey -q -N ""
UI_PRIVATE_KEY_VAL="$(cat tempStudentAdminBackendkey)"
UI_PUBLIC_KEY_VAL="$(ssh-keygen -f tempStudentAdminBackendkey -e -m pem)"
echo Removing key files
rm tempStudentAdminBackendkey
rm tempStudentAdminBackendkey.pub

sessionMaxAge="1800000"
tokenExpiresIn="30m"
if [ "$envValue" == "test" ]
then
  sessionMaxAge="3600000"
  tokenExpiresIn="60m"
fi

if [ "$envValue" = "tools" ]
then
  BACKEND_ROOT=$APP_NAME-$PEN_NAMESPACE-dev.apps.silver.devops.gov.bc.ca
elif [ "$envValue" = "dev" ]
then
  BACKEND_ROOT=$APP_NAME-$PEN_NAMESPACE-test.apps.silver.devops.gov.bc.ca
elif [ "$envValue" = "test" ]
then
  BACKEND_ROOT=$APP_NAME-$PEN_NAMESPACE-uat.apps.silver.devops.gov.bc.ca
else
  BACKEND_ROOT=$APP_NAME-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca
fi

echo Creating config map $APP_NAME-backend-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-backend-config-map --from-literal=TZ=$TZVALUE --from-literal=UI_PRIVATE_KEY="$UI_PRIVATE_KEY_VAL"  --from-literal=SITEMINDER_LOGOUT_ENDPOINT="$siteMinderLogoutUrl" --from-literal=UI_PUBLIC_KEY="$UI_PUBLIC_KEY_VAL" --from-literal=ID=$APP_NAME-soam --from-literal=SECRET=$studentAdminClientSecret --from-literal=SERVER_FRONTEND=https://$SERVER_FRONTEND --from-literal=ISSUER=STUDENT_ADMIN_APPLICATION --from-literal=SOAM_PUBLIC_KEY="$formattedPublicKey" --from-literal=PEN_REQUEST_EMAIL_API_URL=https://student-profile-email-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/gmp --from-literal=PEN_REQUEST_API_URL=https://pen-request-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=DISCOVERY=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/.well-known/openid-configuration --from-literal=KC_DOMAIN=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID --from-literal=PEN_DEMOGRAPHICS_URL=https://pen-demographics-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=DIGITAL_ID_URL=https://digitalid-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=STUDENT_API_URL="https://student-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1/student" --from-literal=LOG_LEVEL=info --from-literal=REDIS_HOST=redis --from-literal=REDIS_PORT=6379 --from-literal=STUDENT_PROFILE_API_URL=https://student-profile-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=SCHOOL_API_URL=https://school-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1 --from-literal=STUDENT_PROFILE_EMAIL_API_URL=https://student-profile-email-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/ump --from-literal=PROFILE_REQUEST_SAGA_API_URL=https://student-profile-saga-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca --from-literal=NATS_URL="$NATS_URL" --from-literal=NATS_CLUSTER="$NATS_CLUSTER" --from-literal=UMP_ROLES="STUDENT_PROFILE_ADMIN,STUDENT_PROFILE_READ_ONLY" --from-literal=GMP_ROLES="STUDENT_ADMIN,STUDENT_ADMIN_READ_ONLY" --from-literal=STUDENT_SEARCH_ADMIN="STUDENT_SEARCH_ADMIN" --from-literal=UMP_ROLE_ADMIN="STUDENT_PROFILE_ADMIN" --from-literal=GMP_ROLE_ADMIN="STUDENT_ADMIN" --from-literal=PEN_REQUEST_BATCH_ADMIN="PEN_REQUEST_BATCH_ADMIN" --from-literal=PEN_REQUEST_BATCH_API_URL=https://pen-reg-batch-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1 --from-literal=PEN_MATCH_API_URL=https://pen-match-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1/pen-match --from-literal=SESSION_MAX_AGE=$sessionMaxAge --from-literal=TOKEN_EXPIRES_IN=$tokenExpiresIn --from-literal=SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS="0/30 * * * * *" --from-literal=MIN_TIME_BEFORE_SAGA_IS_STALE_IN_SECONDS=10 --from-literal=PEN_SERVICES_API_URL="https://pen-services-api-$PEN_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1/pen-services" --from-literal=PEN_TRAX_API_URL=https://pen-trax-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1 --from-literal=SLD_API_URL=https://sld-api-$COMMON_NAMESPACE-$envValue.apps.silver.devops.gov.bc.ca/api/v1 --from-literal=QUEUE_GROUP_NAME="student-admin-node-queue-group" --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-backend-$SOAM_KC_REALM_ID application
oc set env --from=configmap/$APP_NAME-backend-config-map dc/$APP_NAME-backend-$SOAM_KC_REALM_ID
###########################################################
#Setup for student-admin-frontend-config-map
###########################################################
vueIdleTimeout="1800000"
if [ "$envValue" == "test" ]
then
  vueIdleTimeout="3600000"
fi

regConfigStaff="var studentAdminConfig = (function() {
  return {
    \"VUE_APP_IDLE_TIMEOUT_IN_MILLIS\" : $vueIdleTimeout,
    \"WEB_SOCKET_URL\":\"wss://$SERVER_FRONTEND/api/socket\"
  };
})();"

echo Creating config map $APP_NAME-frontend-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-frontend-config-map --from-literal=TZ=$TZVALUE --from-literal=HOST_ROUTE=$BACKEND_ROOT  --from-literal=BACKEND_ROOT=https://$BACKEND_ROOT --from-literal=config.js="$regConfigStaff"  --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-frontend-$SOAM_KC_REALM_ID application
oc set env --from=configmap/$APP_NAME-frontend-config-map dc/$APP_NAME-frontend-$SOAM_KC_REALM_ID

###########################################################
#Setup for student-admin-flb-sc-config-map
###########################################################

SPLUNK_TOKEN=$(oc -o json get configmaps ${APP_NAME}-${envValue}-setup-config | sed -n "s/.*\"SPLUNK_TOKEN_${APP_NAME_UPPER}\": \"\(.*\)\"/\1/p")

SPLUNK_URL="gww.splunk.educ.gov.bc.ca"
FLB_CONFIG="[SERVICE]
   Flush        1
   Daemon       Off
   Log_Level    debug
   HTTP_Server   On
   HTTP_Listen   0.0.0.0
   HTTP_Port     2020
[INPUT]
   Name   tail
   Path   /mnt/log/*
   Mem_Buf_Limit 20MB
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

echo Creating config map $APP_NAME-flb-sc-config-map
oc create -n $PEN_NAMESPACE-$envValue configmap $APP_NAME-flb-sc-config-map --from-literal=fluent-bit.conf="$FLB_CONFIG"  --dry-run -o yaml | oc apply -f -

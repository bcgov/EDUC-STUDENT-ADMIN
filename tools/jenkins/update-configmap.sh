envValue=$1
APP_NAME=$2
OPENSHIFT_NAMESPACE=$3

TZVALUE="America/Vancouver"
SOAM_KC_REALM_ID="master"
KCADM_FILE_BIN_FOLDER="/var/lib/jenkins/jobs/${OPENSHIFT_NAMESPACE}-tools/keycloak-9.0.3/bin"
SOAM_KC=$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca

oc project $OPENSHIFT_NAMESPACE-$envValue
SOAM_KC_LOAD_USER_ADMIN=$(oc -o json get secret sso-admin-${envValue} | sed -n 's/.*"username": "\(.*\)"/\1/p' | base64 --decode)
SOAM_KC_LOAD_USER_PASS=$(oc -o json get secret sso-admin-${envValue} | sed -n 's/.*"password": "\(.*\)",/\1/p' | base64 --decode)
oc project $OPENSHIFT_NAMESPACE-tools

$KCADM_FILE_BIN_FOLDER/kcadm.sh config credentials --server https://$SOAM_KC/auth --realm $SOAM_KC_REALM_ID --user $SOAM_KC_LOAD_USER_ADMIN

echo Creating STUDENT_ADMIN role
$KCADM_FILE_BIN_FOLDER/kcadm.sh create roles -r $SOAM_KC_REALM_ID --body "{\"name\" : \"STUDENT_ADMIN\",\"description\" : \"Allows access to staff site\",\"composite\" : false,\"clientRole\" : false,\"containerId\" : \"$SOAM_KC_REALM_ID\"}"

#SEND_PEN_REQUEST_EMAIL
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"PEN Request send email scope\",\"id\": \"SEND_PEN_REQUEST_EMAIL\",\"name\": \"SEND_PEN_REQUEST_EMAIL\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_PEN_REQUEST
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"Read scope for PEN request\",\"id\": \"READ_PEN_REQUEST\",\"name\": \"READ_PEN_REQUEST\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#WRITE_PEN_REQUEST
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"Write scope for PEN request\",\"id\": \"WRITE_PEN_REQUEST\",\"name\": \"WRITE_PEN_REQUEST\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_DIGITALID
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"Read scope for digital ID\",\"id\": \"READ_DIGITALID\",\"name\": \"READ_DIGITALID\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#WRITE_DIGITALID
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"Write scope for digital ID\",\"id\": \"WRITE_DIGITALID\",\"name\": \"WRITE_DIGITALID\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_STUDENT
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"Read scope for student\",\"id\": \"READ_STUDENT\",\"name\": \"READ_STUDENT\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#WRITE_STUDENT
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"Write scope for student\",\"id\": \"WRITE_STUDENT\",\"name\": \"WRITE_STUDENT\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_PEN_REQUEST_STATUSES
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"READ_PEN_REQUEST_STATUSES\",\"name\": \"READ_PEN_REQUEST_STATUSES\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_PEN_DEMOGRAPHICS
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"READ_PEN_DEMOGRAPHICS\",\"name\": \"READ_PEN_DEMOGRAPHICS\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_STUDENT_CODES
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"READ_STUDENT_CODES\",\"name\": \"READ_STUDENT_CODES\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_DIGITALID_CODETABLE
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"READ_DIGITALID_CODETABLE\",\"name\": \"READ_DIGITALID_CODETABLE\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_DOCUMENT
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"READ_DOCUMENT\",\"name\": \"READ_DOCUMENT\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_PEN_REQ_MACRO
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM read pen request macro scope\",\"id\": \"READ_PEN_REQ_MACRO\",\"name\": \"READ_PEN_REQ_MACRO\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#WRITE_PEN_REQ_MACRO
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM write pen request macro scope\",\"id\": \"WRITE_PEN_REQ_MACRO\",\"name\": \"WRITE_PEN_REQ_MACRO\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#READ_DOCUMENT_TYPES
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"READ_DOCUMENT_TYPES\",\"name\": \"READ_DOCUMENT_TYPES\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"
#WRITE_DOCUMENT
$KCADM_FILE_BIN_FOLDER/kcadm.sh create client-scopes -r $SOAM_KC_REALM_ID --body "{\"description\": \"SOAM send email scope\",\"id\": \"WRITE_DOCUMENT\",\"name\": \"WRITE_DOCUMENT\",\"protocol\": \"openid-connect\",\"attributes\" : {\"include.in.token.scope\" : \"true\",\"display.on.consent.screen\" : \"false\"}}"


echo Creating student-admin-soam Keycloak client
$KCADM_FILE_BIN_FOLDER/kcadm.sh create clients -r $SOAM_KC_REALM_ID --body "{ \"clientId\" : \"student-admin-soam\", \"name\" : \"Student Admin SOAM\", \"description\" : \"Student admin user which logs into SOAM\", \"surrogateAuthRequired\" : false, \"enabled\" : true, \"clientAuthenticatorType\" : \"client-secret\", \"redirectUris\" : [ \"https://student-admin-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca/api/auth/callback\",\"https://student-admin-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca/logout\",\"https://student-admin-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca/session-expired\" ], \"webOrigins\" : [ ], \"notBefore\" : 0, \"bearerOnly\" : false, \"consentRequired\" : false, \"standardFlowEnabled\" : true, \"implicitFlowEnabled\" : false, \"directAccessGrantsEnabled\" : false, \"serviceAccountsEnabled\" : true, \"publicClient\" : false, \"frontchannelLogout\" : false, \"protocol\" : \"openid-connect\", \"attributes\" : { \"saml.assertion.signature\" : \"false\", \"saml.multivalued.roles\" : \"false\", \"saml.force.post.binding\" : \"false\", \"saml.encrypt\" : \"false\", \"saml.server.signature\" : \"false\", \"saml.server.signature.keyinfo.ext\" : \"false\", \"exclude.session.state.from.auth.response\" : \"false\", \"saml_force_name_id_format\" : \"false\", \"saml.client.signature\" : \"false\", \"tls.client.certificate.bound.access.tokens\" : \"false\", \"saml.authnstatement\" : \"false\", \"display.on.consent.screen\" : \"false\", \"saml.onetimeuse.condition\" : \"false\" }, \"authenticationFlowBindingOverrides\" : { }, \"fullScopeAllowed\" : true, \"nodeReRegistrationTimeout\" : -1, \"protocolMappers\" : [ { \"name\" : \"IDIR Username\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"idir_username\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"idir_username\", \"jsonType.label\" : \"String\" } }, { \"name\" : \"Display Name\", \"protocol\" : \"openid-connect\", \"protocolMapper\" : \"oidc-usermodel-attribute-mapper\", \"consentRequired\" : false, \"config\" : { \"userinfo.token.claim\" : \"true\", \"user.attribute\" : \"display_name\", \"id.token.claim\" : \"true\", \"access.token.claim\" : \"true\", \"claim.name\" : \"display_name\", \"jsonType.label\" : \"String\" } } ], \"defaultClientScopes\" : [ \"web-origins\", \"role_list\", \"SEND_PEN_REQUEST_EMAIL\", \"WRITE_PEN_REQUEST\", \"profile\", \"roles\", \"email\", \"READ_PEN_REQUEST\", \"READ_PEN_REQUEST_STATUSES\", \"READ_PEN_DEMOGRAPHICS\", \"WRITE_DIGITALID\", \"READ_DIGITALID\", \"WRITE_STUDENT\", \"READ_STUDENT\", \"READ_STUDENT_CODES\", \"READ_DIGITALID_CODETABLE\", \"READ_DOCUMENT\", \"READ_PEN_REQ_MACRO\", \"READ_DOCUMENT_TYPES\", \"WRITE_DOCUMENT\"], \"optionalClientScopes\" : [ \"address\", \"phone\", \"offline_access\" ], \"access\" : { \"view\" : true, \"configure\" : true, \"manage\" : true } }"


###########################################################
#Setup for student-admin-backend-config-map
###########################################################
getStudentAdminClientID(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients -r $SOAM_KC_REALM_ID --fields 'id,clientId' | grep -B2 '"clientId" : "soam-api-service"' | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}
getStudentAdminClientSecret(){
    executorID= $KCADM_FILE_BIN_FOLDER/kcadm.sh get clients/$studentAdminClientID/client-secret -r $SOAM_KC_REALM_ID | grep -Po "(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}"
}
echo
echo Fetching client ID for $APP_NAME-soam client
studentAdminClientID=$(getStudentAdminClientID)
echo Fetching client secret for $APP_NAME-soam client
studentAdminClientSecret=$(getStudentAdminClientSecret)
echo
echo Generating private and public keys
ssh-keygen -b 4096 -t rsa -f tempStudentAdminBackendkey -q -N ""
UI_PRIVATE_KEY_VAL="$(cat tempStudentAdminBackendkey)"
UI_PUBLIC_KEY_VAL="$(ssh-keygen -f tempStudentAdminBackendkey -e -m pem)"
echo Removing key files
rm tempStudentAdminBackendkey
rm tempStudentAdminBackendkey.pub

echo Creating config map $APP_NAME-backend-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-backend-config-map --from-literal=TZ=$TZVALUE --from-literal=UI_PRIVATE_KEY="$UI_PRIVATE_KEY_VAL"  --from-literal=SITEMINDER_LOGOUT_ENDPOINT="$siteMinderLogoutUrl" --from-literal=UI_PUBLIC_KEY="$UI_PUBLIC_KEY_VAL" --from-literal=ID=$APP_NAME-soam --from-literal=SECRET=$studentAdminClientSecret --from-literal=SERVER_FRONTEND=https://$APP_NAME-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=ISSUER=STUDENT_ADMIN_APPLICATION --from-literal=SOAM_PUBLIC_KEY="$formattedPublicKey" --from-literal=PEN_REQUEST_EMAIL_API_URL=https://pen-request-email-api-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=PEN_REQUEST_API_URL=https://pen-request-api-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=DISCOVERY=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID/.well-known/openid-configuration --from-literal=KC_DOMAIN=https://$SOAM_KC/auth/realms/$SOAM_KC_REALM_ID --from-literal=PEN_DEMOGRAPHICS_URL=https://pen-demographics-api-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=DIGITAL_ID_URL=https://digitalid-api-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=STUDENT_API_URL=https://student-api-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=LOG_LEVEL=info --from-literal=REDIS_HOST=redis --from-literal=REDIS_PORT=6379 --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-backend-$SOAM_KC_REALM_ID application
oc set env --from=configmap/$APP_NAME-backend-config-map dc/$APP_NAME-backend-$SOAM_KC_REALM_ID
oc set env --from=secret/redis dc/$APP_NAME-backend-$SOAM_KC_REALM_ID
###########################################################
#Setup for student-admin-frontend-config-map
###########################################################
regConfigStaff="var config = (function() {
  return {
    \"VUE_APP_IDLE_TIMEOUT_IN_MILLIS\" : \"1800000\"
  };
})();"
echo Creating config map $APP_NAME-frontend-config-map
oc create -n $OPENSHIFT_NAMESPACE-$envValue configmap $APP_NAME-frontend-config-map --from-literal=TZ=$TZVALUE --from-literal=HOST_ROUTE=$APP_NAME-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca  --from-literal=BACKEND_ROOT=https://$APP_NAME-$OPENSHIFT_NAMESPACE-$envValue.pathfinder.gov.bc.ca --from-literal=config.js="$regConfigStaff"  --dry-run -o yaml | oc apply -f -
echo
echo Setting environment variables for $APP_NAME-frontend-$SOAM_KC_REALM_ID application
oc set env --from=configmap/$APP_NAME-frontend-config-map dc/$APP_NAME-frontend-$SOAM_KC_REALM_ID
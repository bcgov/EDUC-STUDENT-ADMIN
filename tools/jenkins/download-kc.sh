namespace=$1

if [ ! -f /var/lib/jenkins/jobs/$namespace-tools/keycloak-9.0.3.zip ]
then
    echo 'Downloading and unzipping keycloak setup files...'
    wget -P /var/lib/jenkins/jobs/$namespace-tools -nc https://downloads.jboss.org/keycloak/9.0.3/keycloak-9.0.3.zip
    cd /var/lib/jenkins/jobs/$namespace-tools
    unzip keycloak-9.0.3.zip
fi
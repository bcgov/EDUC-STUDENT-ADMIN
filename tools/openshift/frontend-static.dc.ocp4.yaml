---
apiVersion: v1
kind: Template
labels:
  template: "${REPO_NAME}-template"
metadata:
  name: "${REPO_NAME}-frontend-dc"
  creationTimestamp:
objects:
- apiVersion: v1
  kind: DeploymentConfig
  metadata:
    annotations:
      openshift.io/generated-by: OpenShiftNewApp
    creationTimestamp:
    labels:
      app: "${APP_NAME}-${JOB_NAME}"
    name: "${APP_NAME}-frontend-${JOB_NAME}"
  spec:
    replicas: ${{MIN_REPLICAS}}
    selector:
      app: "${APP_NAME}-${JOB_NAME}"
      deploymentconfig: "${APP_NAME}-frontend-${JOB_NAME}"
    strategy:
      resources: {}
      type: Rolling
    template:
      metadata:
        annotations:
          openshift.io/generated-by: OpenShiftNewApp
        creationTimestamp:
        labels:
          app: "${APP_NAME}-${JOB_NAME}"
          deploymentconfig: "${APP_NAME}-frontend-${JOB_NAME}"
      spec:
        containers:
        - image: image-registry.openshift-image-registry.svc:5000/${NAMESPACE}/${REPO_NAME}-frontend-static:${TAG}
          imagePullPolicy: Always
          volumeMounts:
          - name: tls-certs
            mountPath: "/etc/tls-certs"
            readOnly: true
          - name: config-env
            mountPath: "/var/www/html/js/config"
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: "/"
              port: 2015
              scheme: HTTP
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          name: "${APP_NAME}-frontend-${JOB_NAME}"
          ports:
          - containerPort: 2015
            protocol: TCP
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: "/"
              port: 2015
              scheme: HTTP
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          resources:
            requests:
              cpu: "${MIN_CPU}"
              memory: "${MIN_MEM}"
            limits:
              cpu: "${MAX_CPU}"
              memory: "${MAX_MEM}"
        volumes:
        - name: tls-certs
          secret:
            secretName: "${APP_NAME}-frontend-cert"
        - name: config-env
          configMap:
            name: ${APP_NAME}-frontend-config-map
    test: false
    triggers:
    - type: ConfigChange
- apiVersion: v1
  kind: Service
  metadata:
    annotations:
      openshift.io/generated-by: OpenShiftNewApp
      service.alpha.openshift.io/serving-cert-secret-name: "${APP_NAME}-frontend-cert"
    creationTimestamp:
    labels:
      app: "${APP_NAME}-${JOB_NAME}"
    name: "${APP_NAME}-frontend-${JOB_NAME}"
  spec:
    ports:
    - name: 2015-tcp
      port: 2015
      protocol: TCP
      targetPort: 2015
    selector:
      app: "${APP_NAME}-${JOB_NAME}"
      deploymentconfig: "${APP_NAME}-frontend-${JOB_NAME}"
- apiVersion: v1
  kind: Route
  metadata:
    annotations:
      openshift.io/host.generated: 'true'
    labels:
      app: "${APP_NAME}-${JOB_NAME}"
    name: "${APP_NAME}-frontend-${JOB_NAME}"
  spec:
    host: "${HOST_ROUTE}"
    port:
      targetPort: 2015-tcp
    tls:
      insecureEdgeTerminationPolicy: Redirect
      termination: edge
    to:
      kind: Service
      name: "${APP_NAME}-frontend-${JOB_NAME}"
      weight: 100
    wildcardPolicy: None
- apiVersion: autoscaling/v2beta1
  kind: HorizontalPodAutoscaler
  metadata:
    name: "${APP_NAME}-frontend-${JOB_NAME}-cpu-autoscaler"
  spec:
    scaleTargetRef:
      apiVersion: apps.openshift.io/v1
      kind: DeploymentConfig
      name: "${APP_NAME}-frontend-${JOB_NAME}"
      subresource: scale
    minReplicas: ${{MIN_REPLICAS}}
    maxReplicas: ${{MAX_REPLICAS}}
    metrics:
      - type: Resource
        resource:
          name: cpu
          targetAverageUtilization: 90
parameters:
- name: REPO_NAME
  description: Application repository name
  required: true
- name: JOB_NAME
  description: Job identifier (i.e. 'pr-5' OR 'master')
  required: true
- name: NAMESPACE
  description: Target namespace reference (i.e. 'k8vopl-dev')
  required: true
- name: APP_NAME
  description: Application name
  required: true
- name: HOST_ROUTE
  description: The host the route will use to expose service outside cluster
  required: true
- name: TAG
  description: The identifying tag for this specific deployment
  required: true
- name: MIN_REPLICAS
  description: The minimum amount of replicas
  required: true
- name: MAX_REPLICAS
  description: The maximum amount of replicas
  required: true
- name: MIN_CPU
  description: The minimum amount of cpu
  required: true
- name: MAX_CPU
  description: The maximum amount of cpu
  required: true
- name: MIN_MEM
  description: The minimum amount of memory
  required: true
- name: MAX_MEM
  description: The maximum amount of memory
  required: true

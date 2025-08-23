{{/*
Expand the name of the chart.
*/}}
{{- define "brainbox.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "brainbox.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "brainbox.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "brainbox.labels" -}}
helm.sh/chart: {{ include "brainbox.chart" . }}
{{ include "brainbox.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "brainbox.selectorLabels" -}}
app.kubernetes.io/name: {{ include "brainbox.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "brainbox.serviceAccountName" -}}
{{- if .Values.brainbox.serviceAccount.create }}
{{- default (include "brainbox.fullname" .) .Values.brainbox.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.brainbox.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the PostgreSQL hostname
*/}}
{{- define "brainbox.postgresql.hostname" -}}
{{- printf "%s-postgresql" .Release.Name -}}
{{- end }}

{{/*
Return the Redis hostname
*/}}
{{- define "brainbox.redis.hostname" -}}
{{- printf "%s-redis-primary" .Release.Name -}}
{{- end }}

{{/*
Return the MinIO hostname
*/}}
{{- define "brainbox.minio.hostname" -}}
{{- printf "%s-minio" .Release.Name -}}
{{- end }}

{{/*
Helper to get value from secret key reference or direct value
Usage: {{ include "brainbox.getValueOrSecret" (dict "key" "theKey" "value" .Values.path.to.value) }}
*/}}
{{- define "brainbox.getValueOrSecret" -}}
{{- $value := .value -}}
{{- if and $value.existingSecret $value.secretKey -}}
valueFrom:
  secretKeyRef:
    name: {{ $value.existingSecret }}
    key: {{ $value.secretKey }}
{{- else if hasKey $value "value" -}}
value: {{ $value.value | quote }}
{{- end -}}
{{- end }}

{{/*
Helper to get required value from secret key reference or direct value
Usage: {{ include "brainbox.getRequiredValueOrSecret" (dict "key" "theKey" "value" .Values.path.to.value) }}
*/}}
{{- define "brainbox.getRequiredValueOrSecret" -}}
{{- $value := .value -}}
{{- if and $value.existingSecret $value.secretKey -}}
valueFrom:
  secretKeyRef:
    name: {{ $value.existingSecret }}
    key: {{ $value.secretKey }}
{{- else if hasKey $value "value" -}}
value: {{ $value.value | quote }}
{{- else -}}
{{ fail (printf "A value or a secret reference for key '%s' is required." .key) }}
{{- end -}}
{{- end }}

{{/*
Brainbox Server Environment Variables
*/}}
{{- define "brainbox.serverEnvVars" -}}
# ───────────────────────────────────────────────────────────────
# General Node/Server Config
# ───────────────────────────────────────────────────────────────
- name: NODE_ENV
  value: {{ .Values.brainbox.config.NODE_ENV | quote }}
- name: PORT
  value: {{ .Values.brainbox.service.port | quote }}
- name: SERVER_NAME
  value: {{ .Values.brainbox.config.SERVER_NAME | quote }}
- name: SERVER_AVATAR
  value: {{ .Values.brainbox.config.SERVER_AVATAR | quote }}
- name: SERVER_MODE
  value: {{ .Values.brainbox.config.SERVER_MODE | quote }}

# ───────────────────────────────────────────────────────────────
# Logging Configuration
# ───────────────────────────────────────────────────────────────
- name: LOGGING_LEVEL
  value: {{ .Values.brainbox.config.LOGGING_LEVEL | quote }}

# ───────────────────────────────────────────────────────────────
# Account Configuration
# ───────────────────────────────────────────────────────────────
- name: ACCOUNT_VERIFICATION_TYPE
  value: {{ .Values.brainbox.config.ACCOUNT_VERIFICATION_TYPE | quote }}
- name: ACCOUNT_OTP_TIMEOUT
  value: {{ .Values.brainbox.config.ACCOUNT_OTP_TIMEOUT | quote }}
- name: ACCOUNT_ALLOW_GOOGLE_LOGIN
  value: {{ .Values.brainbox.config.ACCOUNT_ALLOW_GOOGLE_LOGIN | quote }}

# ───────────────────────────────────────────────────────────────
# Workspace Configuration
# ───────────────────────────────────────────────────────────────
- name: WORKSPACE_STORAGE_LIMIT
  value: {{ .Values.brainbox.config.WORKSPACE_STORAGE_LIMIT | quote }}
- name: WORKSPACE_MAX_FILE_SIZE
  value: {{ .Values.brainbox.config.WORKSPACE_MAX_FILE_SIZE | quote }}

# ───────────────────────────────────────────────────────────────
# User Configuration
# ───────────────────────────────────────────────────────────────
- name: USER_STORAGE_LIMIT
  value: {{ .Values.brainbox.config.USER_STORAGE_LIMIT | quote }}
- name: USER_MAX_FILE_SIZE
  value: {{ .Values.brainbox.config.USER_MAX_FILE_SIZE | quote }}

# ───────────────────────────────────────────────────────────────
# PostgreSQL Configuration
# ───────────────────────────────────────────────────────────────
- name: POSTGRES_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Release.Name }}-postgresql
      key: postgres-password
- name: POSTGRES_URL
  value: "postgres://{{ .Values.postgresql.auth.username }}:$(POSTGRES_PASSWORD)@{{ include "brainbox.postgresql.hostname" . }}:5432/{{ .Values.postgresql.auth.database }}"

# ───────────────────────────────────────────────────────────────
# Redis/Valkey Configuration
# ───────────────────────────────────────────────────────────────
- name: REDIS_PASSWORD
  {{- if .Values.redis.auth.existingSecret }}
  {{- include "brainbox.getRequiredValueOrSecret" (dict
        "key" "redis.auth.password"
        "value" (dict
          "value"        .Values.redis.auth.password
          "existingSecret" .Values.redis.auth.existingSecret
          "secretKey"    .Values.redis.auth.secretKeys.redisPasswordKey )) | nindent 2 }}
  {{- else }}
  valueFrom:
    secretKeyRef:
      name: {{ .Release.Name }}-redis
      key: {{ .Values.redis.auth.secretKeys.redisPasswordKey }}
  {{- end }}
- name: REDIS_URL
  value: "redis://:$(REDIS_PASSWORD)@{{ include "brainbox.redis.hostname" . }}:6379/{{ .Values.brainbox.config.REDIS_DB }}"
- name: REDIS_DB
  value: {{ .Values.brainbox.config.REDIS_DB | quote }}
- name: REDIS_JOBS_QUEUE_NAME
  value: {{ .Values.brainbox.config.REDIS_JOBS_QUEUE_NAME | quote }}
- name: REDIS_JOBS_QUEUE_PREFIX
  value: {{ .Values.brainbox.config.REDIS_JOBS_QUEUE_PREFIX | quote }}
- name: REDIS_TUS_LOCK_PREFIX
  value: {{ .Values.brainbox.config.REDIS_TUS_LOCK_PREFIX | quote }}
- name: REDIS_TUS_KV_PREFIX
  value: {{ .Values.brainbox.config.REDIS_TUS_KV_PREFIX | quote }}
- name: REDIS_EVENTS_CHANNEL
  value: {{ .Values.brainbox.config.REDIS_EVENTS_CHANNEL | quote }}

# ───────────────────────────────────────────────────────────────
# S3 Configuration for Storage
# ───────────────────────────────────────────────────────────────
- name: STORAGE_S3_ENDPOINT
  value: "http://{{ include "brainbox.minio.hostname" . }}:9000"
- name: STORAGE_S3_ACCESS_KEY
  {{- if .Values.minio.auth.existingSecret }}
  {{- include "brainbox.getRequiredValueOrSecret" (dict "key" "minio.auth.rootUser" "value" (dict "value" .Values.minio.auth.rootUser "existingSecret" .Values.minio.auth.existingSecret "secretKey" .Values.minio.auth.rootUserKey )) | nindent 2 }}
  {{- else }}
  valueFrom:
    secretKeyRef:
      name: {{ .Release.Name }}-minio
      key: {{ .Values.minio.auth.rootUserKey }}
  {{- end }}
- name: STORAGE_S3_SECRET_KEY
  {{- if .Values.minio.auth.existingSecret }}
  {{- include "brainbox.getRequiredValueOrSecret" (dict "key" "minio.auth.rootPassword" "value" (dict "value" .Values.minio.auth.rootPassword "existingSecret" .Values.minio.auth.existingSecret "secretKey" .Values.minio.auth.rootPasswordKey )) | nindent 2 }}
  {{- else }}
  valueFrom:
    secretKeyRef:
      name: {{ .Release.Name }}-minio
      key: {{ .Values.minio.auth.rootPasswordKey }}
  {{- end }}
- name: STORAGE_S3_BUCKET
  value: "brainbox"
- name: STORAGE_S3_REGION
  value: "us-east-1"
- name: STORAGE_S3_FORCE_PATH_STYLE
  value: "true"

# ───────────────────────────────────────────────────────────────
# SMTP configuration
# ───────────────────────────────────────────────────────────────
- name: SMTP_ENABLED
  value: {{ .Values.brainbox.config.SMTP_ENABLED | quote }}
{{- if eq .Values.brainbox.config.SMTP_ENABLED "true" }}
- name: SMTP_HOST
  value: {{ required "brainbox.config.SMTP_HOST must be set when SMTP_ENABLED is true" .Values.brainbox.config.SMTP_HOST | quote }}
- name: SMTP_PORT
  value: {{ required "brainbox.config.SMTP_PORT must be set when SMTP_ENABLED is true" .Values.brainbox.config.SMTP_PORT | quote }}
- name: SMTP_USER
  value: {{ .Values.brainbox.config.SMTP_USER | quote }}
- name: SMTP_PASSWORD
  value: {{ .Values.brainbox.config.SMTP_PASSWORD | quote }}
- name: SMTP_EMAIL_FROM
  value: {{ required "brainbox.config.SMTP_EMAIL_FROM must be set when SMTP_ENABLED is true" .Values.brainbox.config.SMTP_EMAIL_FROM | quote }}
- name: SMTP_EMAIL_FROM_NAME
  value: {{ .Values.brainbox.config.SMTP_EMAIL_FROM_NAME | quote }}
{{- end }}
{{- end }}

BLUE         := $(shell printf "\033[34m")
YELLOW       := $(shell printf "\033[33m")
RED          := $(shell printf "\033[31m")
GREEN        := $(shell printf "\033[32m")
CNone        := $(shell printf "\033[0m")

INFO    = echo ${TIME} ${BLUE}[ .. ]${CNone}
WARN    = echo ${TIME} ${YELLOW}[WARN]${CNone}
ERR     = echo ${TIME} ${RED}[FAIL]${CNone}
OK      = echo ${TIME} ${GREEN}[ OK ]${CNone}
FAIL    = (echo ${TIME} ${RED}[FAIL]${CNone} && false)

CHARTS_REPO := oci://$(ARTIFACT_REG)/external-secrets-inc-registry/internal/charts
ARTIFACT_REG:=us-central1-docker.pkg.dev

helm.login:
	gcloud auth print-access-token | helm registry login -u oauth2accesstoken \
		--password-stdin https://$(ARTIFACT_REG)

.PHONY: helm.push
helm.push: helm.login ## Push helm chart to the repository
	@helm package deploy/charts/web-ui
	helm push *.tgz $(CHARTS_REPO)

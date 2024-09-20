SHELL := /usr/bin/env bash -o pipefail
.SHELLFLAGS = -ec

# Colors
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
ARTIFACT_REG:=us-central1-docker.pkg.dev
CHARTS_REPO := oci://$(ARTIFACT_REG)/external-secrets-inc-registry/internal/charts

help:
	@echo -e "${GREEN}Usage:${Cnone}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}  make %-15s${Cnone} %s\n", $$1, $$2}'

.PHONY: pre-commit
setup: ## Install pre-commit in .git/hooks/commit-msg
	pre-commit install --hook-type commit-msg
	pre-commit install

.PHONY: install
install: ## Run npm install
	npm i

.PHONY: dev
dev: install ## Run npm run dev
	npm run dev

.PHONY: build
build: install ## Run npm run build
	npm run build

.PHONY: helm.login
helm.login:
	gcloud auth print-access-token | helm registry login -u oauth2accesstoken \
		--password-stdin https://$(ARTIFACT_REG)

.PHONY: helm.push
helm.push: helm.login ## Push helm chart to the repository
	@helm package deploy/charts/web-ui
	helm push *.tgz $(CHARTS_REPO)

SHELL := /usr/bin/env bash -o pipefail
.SHELLFLAGS = -ec

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

help:
	@echo -e "${GREEN}Usage:${NC}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}  make %-15s${NC} %s\n", $$1, $$2}'

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
